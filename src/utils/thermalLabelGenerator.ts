import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { AnyParticipant, ParticipantCategory, getParticipantPersonalPageUrl, computeParticipantDataHash } from './qrCodeUtils';
import { Team } from '../types';
import { getTeamCodeName } from './teamUtils';

export interface BatchThermalItem {
  person: AnyParticipant;
  category: ParticipantCategory;
  teamName?: string;
}

export type LabelSizeOption = '40x30' | '50x30' | '50x25' | '60x40' | '50x80' | 'custom';
export type LabelOrientation = 'portrait' | 'landscape';
export type ThermalDpi = 203 | 300;
export type ThermalPrinterModel = 'generic' | 'pm240';
export type ThermalLabelLayout = 'horizontal_split' | 'vertical_stack' | 'vertical_badge_50x80';

export interface LabelPresetInfo {
  id: LabelSizeOption;
  label: string;
  widthMm: number;
  heightMm: number;
  description: string;
  recommendedFor: string;
}

export const STANDARD_LABEL_PRESETS: LabelPresetInfo[] = [
  {
    id: '40x30',
    label: '40 × 30 mm',
    widthMm: 40,
    heightMm: 30,
    description: 'Standard portatile (Labelnize PM240, Typonos, Niimbot)',
    recommendedFor: 'Tasca mimetica / Cartellino rapido',
  },
  {
    id: '50x30',
    label: '50 × 30 mm',
    widthMm: 50,
    heightMm: 30,
    description: 'Standard ospedaliero & trauma badge',
    recommendedFor: 'Badge operatore / Bracciale triage',
  },
  {
    id: '50x25',
    label: '50 × 25 mm',
    widthMm: 50,
    heightMm: 25,
    description: 'Slim tattico compatto',
    recommendedFor: 'Fettuccia uniforme / Casco / Strumentario',
  },
  {
    id: '60x40',
    label: '60 × 40 mm',
    widthMm: 60,
    heightMm: 40,
    description: 'Formato grande ad alta visibilità',
    recommendedFor: 'Cartella clinica shock room / Zaino trauma',
  },
  {
    id: '50x80',
    label: '50 × 80 mm',
    widthMm: 50,
    heightMm: 80,
    description: 'Badge esteso verticale con intestazione completa',
    recommendedFor: 'Pass collo / Identificativo completo',
  },
  {
    id: 'custom',
    label: 'Personalizzato',
    widthMm: 40,
    heightMm: 30,
    description: 'Dimensioni personalizzate in millimetri',
    recommendedFor: 'Misure su misura',
  },
];

export interface ThermalLabelConfig {
  size: LabelSizeOption;
  orientation: LabelOrientation;
  dpi: ThermalDpi;
  printerModel?: ThermalPrinterModel;
  includeHeader?: boolean;
  includeFooter?: boolean;
  customWidthMm?: number;
  customHeightMm?: number;
  rotated90?: boolean;
}

export const DEFAULT_THERMAL_CONFIG: ThermalLabelConfig = {
  size: '40x30',
  orientation: 'landscape',
  dpi: 300,
  printerModel: 'generic',
  includeHeader: true,
  includeFooter: true,
};

/**
 * Dedicated Hardware Profile for the portable Labelnize PM240 (and Typonos PM240) direct thermal printer:
 * - Direct thermal 203 DPI (8 dots/mm)
 * - 40mm x 30mm continuous or gap die-cut adhesive label roll (4cm x 3cm)
 * - Horizontal landscape feeding matching the 2-inch printhead
 * - 1.0mm strict perimeter margin preventing cutoff while maximizing usable surface
 */
export const LABELNIZE_PM240_CONFIG: ThermalLabelConfig = {
  size: '40x30',
  orientation: 'landscape',
  dpi: 203,
  printerModel: 'pm240',
  includeHeader: true,
  includeFooter: true,
};

/**
 * Evaluates whether layout should be horizontal split (QR left, text right)
 * or vertical stack based on the aspect ratio of the label in millimeters.
 */
export function determineLabelLayout(
  widthMm: number,
  heightMm: number,
  size?: LabelSizeOption
): ThermalLabelLayout {
  if (size === '50x80' && heightMm > widthMm) {
    return 'vertical_badge_50x80';
  }
  const ratio = widthMm / heightMm;
  if (ratio >= 1.25) {
    return 'horizontal_split';
  }
  return 'vertical_stack';
}

/**
 * Calculates pixel dimensions given width and height in millimeters and DPI.
 * Standard thermal density:
 * - 203 DPI = 8.00 dots/mm
 * - 300 DPI = 11.811 dots/mm
 */
export function getLabelPixelDimensions(
  size: LabelSizeOption,
  orientation: LabelOrientation,
  dpi: ThermalDpi,
  customWidthMm?: number,
  customHeightMm?: number
): { width: number; height: number; widthMm: number; heightMm: number; rawWidthMm: number; rawHeightMm: number } {
  const dotsPerMm = dpi === 300 ? 11.811 : 8.0;

  let rawW = 40;
  let rawH = 30;

  switch (size) {
    case '40x30':
      rawW = 40;
      rawH = 30;
      break;
    case '50x30':
      rawW = 50;
      rawH = 30;
      break;
    case '50x25':
      rawW = 50;
      rawH = 25;
      break;
    case '60x40':
      rawW = 60;
      rawH = 40;
      break;
    case '50x80':
      rawW = 50;
      rawH = 80;
      break;
    case 'custom':
      rawW = Math.max(15, Math.min(200, customWidthMm || 40));
      rawH = Math.max(15, Math.min(200, customHeightMm || 30));
      break;
    default:
      rawW = 40;
      rawH = 30;
  }

  let widthMm: number;
  let heightMm: number;

  if (orientation === 'landscape') {
    widthMm = Math.max(rawW, rawH);
    heightMm = Math.min(rawW, rawH);
  } else {
    widthMm = Math.min(rawW, rawH);
    heightMm = Math.max(rawW, rawH);
  }

  const width = Math.round(widthMm * dotsPerMm);
  const height = Math.round(heightMm * dotsPerMm);

  return { width, height, widthMm, heightMm, rawWidthMm: rawW, rawHeightMm: rawH };
}

/**
 * Extracts friendly role, department, and group descriptions for thermal labels.
 */
export function getPersonDisplayDetails(person: AnyParticipant, category: ParticipantCategory, teamName?: string): {
  badgeCode: string;
  name: string;
  roleTitle: string;
  subDetails: string;
  categoryLabel: string;
} {
  const badgeCode = (person as any).badgeCode || person.id || 'PASS';
  const name = person.name || 'Operatore';

  let roleTitle = (person as any).role || (person as any).title || '';
  let subDetails = '';
  let categoryLabel = category.toUpperCase();

  if (category === 'discenti' || category === 'discente') {
    categoryLabel = 'DISCENTE';
    const teamId = (person as any).teamId || 1;
    const group = teamId <= 3 ? 'ALPHA' : teamId <= 6 ? 'BRAVO' : teamId <= 9 ? 'CHARLIE' : 'DELTA';
    const isTL = (person as any).id === `disc-${(teamId - 1) * 5 + 1}` || ((person as any).role || '').toLowerCase().includes('leader');
    roleTitle = isTL ? `TEAM LEADER • SQ. ${teamId}` : `OPERATORE • SQ. ${teamId}`;
    subDetails = `GRUPPO ${group} • SQUADRA ${teamId}`;
  } else if (category === 'faculty') {
    categoryLabel = 'FACULTY TUTOR';
    const teamId = (person as any).assignedTeamId;
    roleTitle = (person as any).specialty || (person as any).role || 'Tutor Didattico Trauma';
    subDetails = teamId ? `TUTOR DEDICATO • SQUADRA ${teamId}` : 'FACULTY CORPO DOCENTE';
  } else if (category === 'tecnici') {
    categoryLabel = 'TEAM TECNICO';
    roleTitle = (person as any).role || 'Tecnico di Simulazione';
    subDetails = (person as any).station || 'PRESIDIO SCENARI & REGIA';
  } else if (category === 'attori') {
    categoryLabel = 'PAZIENTE SIMULATO';
    const status = (person as any).physicalStatus || 'INTERO';
    roleTitle = `ATTORE SIMULATO [${status}]`;
    subDetails = `SLOT ATT-${String((person as any).slotNumber || 1).padStart(2, '0')} • MOULAGE TATTICO`;
  } else if (category === 'truccatori') {
    categoryLabel = 'TRUCCO & MOULAGE';
    roleTitle = (person as any).specialty || (person as any).role || 'Specialista Moulage';
    subDetails = (person as any).station || 'POSTAZIONE TRUCCO SCENICA';
  } else if (category === 'direttori') {
    categoryLabel = 'DIREZIONE SCIENTIFICA';
    roleTitle = (person as any).title || (person as any).role || 'Direttore di Corso';
    subDetails = (person as any).organization || 'TRAUMA SIMULATION BOARD';
  } else if (category === 'regia') {
    categoryLabel = 'CENTRALE DI REGIA';
    roleTitle = (person as any).role || 'Operatore Regia Master';
    subDetails = 'COORDINAMENTO & TELEMETRIA';
  } else if (category === 'ospiti') {
    categoryLabel = 'OSPITE / OSSERVATORE';
    roleTitle = (person as any).title || 'Visiting Delegate';
    subDetails = (person as any).organization || 'NATO / MINISTERO DIFESA';
  }

  if (teamName && !subDetails.includes(teamName)) {
    subDetails = `${subDetails} (${teamName})`.trim();
  }

  return { badgeCode, name, roleTitle, subDetails, categoryLabel };
}

/**
 * Automatically adjusts font size down until text fits within maxWidth,
 * preventing clipping or awkward truncation on compact thermal labels.
 */
export function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  baseFontSize: number,
  minFontSize: number,
  fontFamily: string = 'sans-serif',
  fontWeight: string = 'bold',
  align: CanvasTextAlign = 'left'
): number {
  ctx.save();
  ctx.textAlign = align;
  ctx.fillStyle = '#000000';
  let fontSize = Math.round(baseFontSize);
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && fontSize > Math.round(minFontSize)) {
    fontSize -= 1;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  let finalText = text;
  if (ctx.measureText(finalText).width > maxWidth) {
    while (finalText.length > 3 && ctx.measureText(finalText + '…').width > maxWidth) {
      finalText = finalText.slice(0, -1);
    }
    finalText += '…';
  }
  ctx.fillText(finalText, x, y);
  ctx.restore();
  return fontSize;
}

/**
 * Dynamic thermal sticker drawing routine:
 * - 1.0mm strict perimeter margin (inset = 1.0 * dotsPerMm)
 * - Automatically adapts layout to 'horizontal_split' (aspect ratio >= 1.25)
 *   or 'vertical_stack' (aspect ratio < 1.25).
 * - For horizontal split (40x30, 50x30, 50x25, 60x40, etc.):
 *   QR code on the LEFT (square filling available height ~heightMm - 2mm),
 *   vertical dividing line,
 *   Matricola (badge code) in high-contrast solid black block on the right,
 *   Large Name auto-fitted with zero clipping,
 *   Micro-subline with role/team/ref hash.
 * - For vertical stack:
 *   Top: Matricola badge + Name
 *   Divider line
 *   Centered QR code filling remaining space
 *   Micro-subline.
 */
export function drawDynamicThermalSticker(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dotsPerMm: number,
  scale: number,
  display: ReturnType<typeof getPersonDisplayDetails>,
  qrImage: HTMLImageElement,
  dataHash: string,
  layout: ThermalLabelLayout = 'horizontal_split'
) {
  // 1.0mm strict perimeter margins (reducing dead zones and maximizing usable sticker surface)
  const marginMm = 1.0;
  const inset = Math.max(4, Math.round(marginMm * dotsPerMm));

  // Outer safety hairline border (1mm inset)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1, Math.round(1 * scale));
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

  const availW = w - inset * 2;
  const availH = h - inset * 2;

  if (layout === 'horizontal_split') {
    // -------------------------------------------------------------------------
    // HORIZONTAL SPLIT: QR ON LEFT, NAME & MATRICOLA ON RIGHT
    // -------------------------------------------------------------------------
    const qrPadding = Math.round(0.4 * dotsPerMm);
    const qrSize = Math.max(12, availH - qrPadding * 2);
    const qrX = inset + qrPadding;
    const qrY = inset + qrPadding;

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Vertical dividing hairline
    const dividerX = qrX + qrSize + Math.round(1.0 * dotsPerMm);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.beginPath();
    ctx.moveTo(dividerX, inset + Math.round(0.8 * dotsPerMm));
    ctx.lineTo(dividerX, h - inset - Math.round(0.8 * dotsPerMm));
    ctx.stroke();

    // RIGHT SIDE: Matricola, Name, Micro Details
    const rightX = dividerX + Math.round(1.2 * dotsPerMm);
    const rightW = w - rightX - inset - Math.round(0.5 * dotsPerMm);

    // 1. High-Contrast Bold Matricola (Badge Code) Box
    const badgeH = Math.min(Math.round(availH * 0.32), Math.round(9.5 * dotsPerMm));
    const badgeY = inset + Math.round(1.0 * dotsPerMm);

    ctx.fillStyle = '#000000';
    ctx.fillRect(rightX, badgeY, rightW, badgeH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const badgeFontPt = Math.max(11, Math.round(badgeH * 0.68));
    ctx.font = `900 ${badgeFontPt}px monospace`;
    ctx.fillText(display.badgeCode, rightX + rightW / 2, badgeY + Math.round(badgeH * 0.72));

    // 2. Large Prominent Participant Name (Fitted to available width)
    const nameY = badgeY + badgeH + Math.round(2.0 * dotsPerMm);
    const availNameH = h - inset - nameY - Math.round(3.0 * dotsPerMm);

    const baseNameFont = Math.max(13, Math.round(availNameH * 0.58));
    drawFittedText(
      ctx,
      display.name.toUpperCase(),
      rightX,
      nameY + Math.round(availNameH * 0.52),
      rightW,
      baseNameFont,
      Math.max(9, Math.round(10 * scale)),
      'sans-serif',
      '900',
      'left'
    );

    // 3. Micro Sub-line (Role / Team / Hash) at bottom
    const microY = h - inset - Math.round(1.0 * dotsPerMm);
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.max(7, Math.round(8 * scale))}px monospace`;
    const subText = display.roleTitle ? display.roleTitle.slice(0, 24) : `REF: #${dataHash}`;
    ctx.fillText(subText.toUpperCase(), rightX, microY);

  } else {
    // -------------------------------------------------------------------------
    // VERTICAL STACK: TOP TEXT, BOTTOM / CENTER QR
    // -------------------------------------------------------------------------
    const centerX = w / 2;
    let curY = inset + Math.round(1.0 * dotsPerMm);

    // 1. High-contrast Badge Bar
    const badgeH = Math.min(Math.round(availH * 0.16), Math.round(7.5 * dotsPerMm));
    ctx.fillStyle = '#000000';
    ctx.fillRect(inset + Math.round(1 * dotsPerMm), curY, availW - Math.round(2 * dotsPerMm), badgeH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const badgeFontPt = Math.max(10, Math.round(badgeH * 0.7));
    ctx.font = `900 ${badgeFontPt}px monospace`;
    ctx.fillText(display.badgeCode, centerX, curY + Math.round(badgeH * 0.72));
    curY += badgeH + Math.round(1.5 * dotsPerMm);

    // 2. Name
    drawFittedText(
      ctx,
      display.name.toUpperCase(),
      centerX,
      curY + Math.round(11 * scale),
      availW - Math.round(2 * dotsPerMm),
      Math.max(12, Math.round(15 * scale)),
      Math.max(8, Math.round(9 * scale)),
      'sans-serif',
      '900',
      'center'
    );
    curY += Math.round(14 * scale);

    // Divider
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.beginPath();
    ctx.moveTo(inset + Math.round(2 * dotsPerMm), curY);
    ctx.lineTo(w - inset - Math.round(2 * dotsPerMm), curY);
    ctx.stroke();
    curY += Math.round(1.5 * dotsPerMm);

    // 3. Centered QR Code filling remaining vertical space
    const remainingH = h - inset - curY - Math.round(4 * dotsPerMm);
    const qrDim = Math.min(availW - Math.round(2 * dotsPerMm), remainingH);
    const qX = (w - qrDim) / 2;
    const qY = curY + Math.max(0, (remainingH - qrDim) / 2);

    ctx.drawImage(qrImage, qX, qY, qrDim, qrDim);

    // Micro footer
    const microY = h - inset - Math.round(0.8 * dotsPerMm);
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.max(6.5, Math.round(7.5 * scale))}px monospace`;
    ctx.fillText(display.roleTitle ? display.roleTitle.slice(0, 20).toUpperCase() : `REF: #${dataHash}`, centerX, microY);
  }
}

/**
 * Renders the high-contrast 40mm x 30mm layout (backward compatibility wrapper):
 * - 1mm strict margin (padding: 1mm)
 * - Large QR code on the LEFT (~28mm square)
 * - Nome and Matricola on the RIGHT for maximum legibility
 */
export function draw40x30HorizontalStickerContent(
  ctx: CanvasRenderingContext2D,
  w: number, // 40mm in pixels
  h: number, // 30mm in pixels
  dotsPerMm: number,
  scale: number,
  display: ReturnType<typeof getPersonDisplayDetails>,
  qrImage: HTMLImageElement,
  dataHash: string
) {
  drawDynamicThermalSticker(ctx, w, h, dotsPerMm, scale, display, qrImage, dataHash, 'horizontal_split');
}

/**
 * Renders a pixel-perfect, thermal-optimized monochrome label onto an HTML5 Canvas.
 * Configured specifically for 50x80mm and 40x30mm thermal adhesive label media.
 */
export async function renderThermalLabelToCanvas(
  person: AnyParticipant,
  category: ParticipantCategory,
  config: Partial<ThermalLabelConfig> = {},
  teamName?: string,
  customBaseUrl?: string
): Promise<HTMLCanvasElement> {
  const mergedConfig: ThermalLabelConfig = { ...DEFAULT_THERMAL_CONFIG, ...config };
  const dotsPerMm = mergedConfig.dpi === 300 ? 11.811 : 8.0;
  const { width, height, widthMm, heightMm } = getLabelPixelDimensions(
    mergedConfig.size,
    mergedConfig.orientation,
    mergedConfig.dpi,
    mergedConfig.customWidthMm,
    mergedConfig.customHeightMm
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  // Solid pure white background (crucial for thermal labels)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // High quality / crisp text rendering
  ctx.imageSmoothingEnabled = false;

  // Scale factor relative to 300 DPI
  const scale = dotsPerMm / 11.811;

  const display = getPersonDisplayDetails(person, category, teamName);
  const targetUrl = getParticipantPersonalPageUrl(person, category, customBaseUrl);
  const dataHash = computeParticipantDataHash(person, category);

  // Generate crisp QR code data URL
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: Math.min(width, height),
  });

  const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = qrDataUrl;
  });

  // For 50x80 badge layout: use standard 10-12px padding
  const inset = Math.max(10, Math.round(12 * scale));
  if (mergedConfig.size === '50x80') {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  }

  if (mergedConfig.size === '50x80' && mergedConfig.orientation === 'portrait') {
    // =========================================================================
    // LAYOUT: 50mm x 80mm VERTICAL BADGE (Standard Thermal Adhesive Label)
    // =========================================================================
    let currentY = inset + Math.round(14 * scale);

    // 1. Header Banner
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(20 * scale)}px sans-serif`;
    ctx.fillText('HITTER • INTUBATI EM', width / 2, currentY + Math.round(18 * scale));
    currentY += Math.round(24 * scale);

    ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
    ctx.fillText('CORSO AVANZATO EMERGENZE TATTICHE', width / 2, currentY + Math.round(11 * scale));
    currentY += Math.round(18 * scale);

    // Divider Line
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    ctx.beginPath();
    ctx.moveTo(inset + 10 * scale, currentY);
    ctx.lineTo(width - inset - 10 * scale, currentY);
    ctx.stroke();
    currentY += Math.round(12 * scale);

    // 2. High-Contrast Inverted Badge Code Pill (Black block, pure white text)
    const badgeBoxHeight = Math.round(48 * scale);
    const badgeBoxWidth = width - inset * 2 - Math.round(20 * scale);
    const badgeBoxX = (width - badgeBoxWidth) / 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(badgeBoxX, currentY, badgeBoxWidth, badgeBoxHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(30 * scale)}px monospace`;
    ctx.fillText(display.badgeCode, width / 2, currentY + Math.round(34 * scale));
    currentY += badgeBoxHeight + Math.round(14 * scale);

    // 3. Participant Full Name
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(26 * scale)}px sans-serif`;
    // Truncate name if exceptionally long
    let printName = display.name.toUpperCase();
    if (ctx.measureText(printName).width > width - inset * 2 - 20) {
      ctx.font = `900 ${Math.round(21 * scale)}px sans-serif`;
    }
    ctx.fillText(printName, width / 2, currentY + Math.round(22 * scale));
    currentY += Math.round(32 * scale);

    // 4. Role Title & Sub-Details
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillText(display.roleTitle.toUpperCase(), width / 2, currentY + Math.round(14 * scale));
    currentY += Math.round(22 * scale);

    ctx.font = `600 ${Math.round(12 * scale)}px monospace`;
    ctx.fillText(display.subDetails.toUpperCase(), width / 2, currentY + Math.round(12 * scale));
    currentY += Math.round(20 * scale);

    // Divider Line above QR Code
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.beginPath();
    ctx.moveTo(inset + 20 * scale, currentY);
    ctx.lineTo(width - inset - 20 * scale, currentY);
    ctx.stroke();
    currentY += Math.round(14 * scale);

    // 5. Scannable QR Code
    // Available remaining height before footer
    const footerHeight = Math.round(52 * scale);
    const availableQrSpace = height - currentY - footerHeight - inset;
    const qrSize = Math.min(width - inset * 2 - Math.round(36 * scale), availableQrSpace);
    const qrX = (width - qrSize) / 2;
    const qrY = currentY + Math.max(0, (availableQrSpace - qrSize) / 2);

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // 6. Thermal Footer
    const footerY = height - inset - Math.round(16 * scale);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(12 * scale)}px sans-serif`;
    ctx.fillText('SCANSIONA PER ACCESSO DIRETTO', width / 2, footerY - Math.round(14 * scale));

    ctx.font = `bold ${Math.round(10 * scale)}px monospace`;
    ctx.fillText(`REF: #${dataHash} • TERMO ADESIVO`, width / 2, footerY);

  } else if (mergedConfig.size === '50x80' && mergedConfig.orientation === 'landscape') {
    // =========================================================================
    // LAYOUT: 80mm x 50mm LANDSCAPE (Horizontal 2-Column Adhesive Label)
    // =========================================================================
    const colSplitX = Math.round(width * 0.58);

    // Left Column: Text & Badges
    let leftY = inset + Math.round(16 * scale);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `900 ${Math.round(20 * scale)}px sans-serif`;
    ctx.fillText('HITTER • INTUBATI EM', inset + Math.round(16 * scale), leftY + Math.round(18 * scale));
    leftY += Math.round(28 * scale);

    // Inverted Badge Pill
    const badgeW = colSplitX - inset - Math.round(24 * scale);
    const badgeH = Math.round(44 * scale);
    ctx.fillStyle = '#000000';
    ctx.fillRect(inset + Math.round(14 * scale), leftY, badgeW, badgeH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(28 * scale)}px monospace`;
    ctx.fillText(display.badgeCode, inset + Math.round(14 * scale) + badgeW / 2, leftY + Math.round(32 * scale));
    leftY += badgeH + Math.round(16 * scale);

    // Full Name
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `900 ${Math.round(24 * scale)}px sans-serif`;
    ctx.fillText(display.name.toUpperCase(), inset + Math.round(16 * scale), leftY + Math.round(22 * scale));
    leftY += Math.round(32 * scale);

    // Role & Sub-details
    ctx.font = `bold ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillText(display.roleTitle.toUpperCase(), inset + Math.round(16 * scale), leftY + Math.round(14 * scale));
    leftY += Math.round(22 * scale);

    ctx.font = `600 ${Math.round(12 * scale)}px monospace`;
    ctx.fillText(display.subDetails.toUpperCase(), inset + Math.round(16 * scale), leftY + Math.round(12 * scale));

    // Right Column: Big QR Code
    const qrMargin = Math.round(16 * scale);
    const qrSize = height - inset * 2 - qrMargin * 2 - Math.round(24 * scale);
    const qrX = colSplitX + (width - colSplitX - inset - qrSize) / 2;
    const qrY = inset + qrMargin;

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Right Column Micro Footer
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(10 * scale)}px monospace`;
    ctx.fillText('SCANSIONA PAGINA', qrX + qrSize / 2, qrY + qrSize + Math.round(14 * scale));
    ctx.fillText(`REF: #${dataHash}`, qrX + qrSize / 2, qrY + qrSize + Math.round(26 * scale));

  } else if (
    mergedConfig.rotated90 ||
    (mergedConfig.orientation === 'portrait' && mergedConfig.size !== '50x80')
  ) {
    // =========================================================================
    // ROTATED 90° CLOCKWISE FOR VERTICAL ROLL FEED PRINTERS
    // =========================================================================
    ctx.save();
    // Move to top-right and rotate 90 degrees clockwise
    ctx.translate(width, 0);
    ctx.rotate(Math.PI / 2);
    // In rotated coordinate system: width parameter = canvas height, height parameter = canvas width
    const rotatedLayout = determineLabelLayout(heightMm, widthMm, mergedConfig.size);
    drawDynamicThermalSticker(
      ctx,
      height,
      width,
      dotsPerMm,
      scale,
      display,
      qrImage,
      dataHash,
      rotatedLayout
    );
    ctx.restore();

  } else {
    // =========================================================================
    // DYNAMIC MONOCHROME THERMAL STICKER (40x30, 50x30, 50x25, 60x40, Custom)
    // 1.0mm Perimeter Margins, Automatic Layout Adaptation
    // =========================================================================
    const dynamicLayout = determineLabelLayout(widthMm, heightMm, mergedConfig.size);
    drawDynamicThermalSticker(
      ctx,
      width,
      height,
      dotsPerMm,
      scale,
      display,
      qrImage,
      dataHash,
      dynamicLayout
    );
  }

  return canvas;
}

/**
 * Exports the rendered thermal label canvas as a high-quality JPG Blob.
 */
export async function getThermalLabelJpgBlob(
  person: AnyParticipant,
  category: ParticipantCategory,
  config: Partial<ThermalLabelConfig> = {},
  teamName?: string,
  customBaseUrl?: string
): Promise<Blob> {
  const canvas = await renderThermalLabelToCanvas(person, category, config, teamName, customBaseUrl);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate JPG blob from canvas'));
      },
      'image/jpeg',
      0.98 // High quality JPG for sharp thermal printing
    );
  });
}

/**
 * Downloads a single participant's label directly as a `.jpg` file.
 */
export async function downloadThermalLabelJpg(
  person: AnyParticipant,
  category: ParticipantCategory,
  config: Partial<ThermalLabelConfig> = {},
  teamName?: string,
  customBaseUrl?: string
): Promise<void> {
  const blob = await getThermalLabelJpgBlob(person, category, config, teamName, customBaseUrl);
  const badgeCode = (person as any).badgeCode || person.id || 'PASS';
  const cleanName = (person.name || 'operatore').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sizeName = config.size || '50x80';

  const filename = `ETICHETTA_${badgeCode}_${cleanName}_${sizeName}mm.jpg`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generates and triggers instant download of an exact 1:1 millimeter vector-sized PDF for a single label.
 * The PDF page geometry matches [widthMm, heightMm] perfectly, bypassing browser print scaling bugs
 * and eliminating cut-off borders or shrunk layouts.
 */
export async function downloadSinglePdf1to1(
  person: AnyParticipant,
  category: ParticipantCategory,
  config: Partial<ThermalLabelConfig> = {},
  teamName?: string,
  customBaseUrl?: string
): Promise<void> {
  const mergedConfig: ThermalLabelConfig = { ...DEFAULT_THERMAL_CONFIG, ...config };
  const { widthMm, heightMm } = getLabelPixelDimensions(
    mergedConfig.size,
    mergedConfig.orientation,
    mergedConfig.dpi,
    mergedConfig.customWidthMm,
    mergedConfig.customHeightMm
  );

  const orientation = mergedConfig.orientation === 'portrait' ? 'portrait' : 'landscape';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  // Lock PDF print scaling to 100% (No auto-shrink / fit-to-page distortion)
  doc.viewerPreferences({ PrintScaling: 'None' }, true);

  const canvas = await renderThermalLabelToCanvas(
    person,
    category,
    mergedConfig,
    teamName,
    customBaseUrl
  );
  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

  const badgeCode = (person as any).badgeCode || person.id || 'PASS';
  const cleanName = (person.name || 'operatore').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sizeName = mergedConfig.size === 'custom' ? `${widthMm}x${heightMm}` : mergedConfig.size;
  const filename = `ETICHETTA_1a1_${badgeCode}_${cleanName}_${sizeName}mm.pdf`;

  doc.save(filename);
}

/**
 * Opens browser print dialog specifically calibrated for thermal label printers (e.g. Labelnize PM240, 40x30 and 50x80).
 * Enforces strict zero margins (@page { margin: 0 !important; }), full-bleed dimensional layout,
 * and delayed print spooling to prevent Chrome auto-shrink and boundary clipping.
 */
export function printThermalLabel(
  canvas: HTMLCanvasElement,
  size: LabelSizeOption,
  orientation?: LabelOrientation,
  person?: AnyParticipant,
  category?: ParticipantCategory,
  teamName?: string,
  customWidthMm?: number,
  customHeightMm?: number,
  rotated90?: boolean
): void {
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup bloccato dal browser. Abilita i popup per visualizzare la stampa.');
    return;
  }

  const derivedOrientation: LabelOrientation =
    orientation || (canvas.width >= canvas.height ? 'landscape' : 'portrait');
  const { widthMm, heightMm } = getLabelPixelDimensions(
    size,
    derivedOrientation,
    300,
    customWidthMm,
    customHeightMm
  );

  const isRotated = rotated90 ?? (derivedOrientation === 'portrait' && size !== '50x80');
  const is40x30 = size === '40x30';
  const pageW = isRotated ? heightMm : widthMm;
  const pageH = isRotated ? widthMm : heightMm;

  win.document.write(`
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Stampa Etichetta Termoadesiva HITTER (${is40x30 ? '40x30 mm - Rotata 90°' : `${widthMm}x${heightMm} mm`})</title>
        <style>
          @page {
            size: ${pageW}mm ${pageH}mm;
            margin: 0mm !important;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print {
            html, body {
              width: ${pageW}mm !important;
              height: ${pageH}mm !important;
              margin: 0mm !important;
              padding: 0mm !important;
              overflow: hidden !important;
              background: #FFFFFF !important;
            }
            .screen-guide {
              display: none !important;
            }
            .print-label-page {
              width: ${pageW}mm !important;
              height: ${pageH}mm !important;
              margin: 0mm !important;
              padding: 0mm !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              background: #FFFFFF !important;
            }
            .print-label-container {
              width: 40mm !important;
              height: 30mm !important;
              box-sizing: border-box !important;
              padding: 1mm !important;
              margin: 0mm !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: flex-start !important;
              gap: 1.5mm !important;
              overflow: hidden !important;
              transform: rotate(90deg) !important;
              transform-origin: center center !important;
              border: 1px solid #000000 !important;
            }
            .print-label-qr {
              width: 28mm !important;
              height: 28mm !important;
              flex-shrink: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print-label-qr img {
              width: 100% !important;
              height: 100% !important;
              object-fit: contain !important;
              image-rendering: -webkit-optimize-contrast !important;
              image-rendering: crisp-edges !important;
            }
            .print-label-details {
              flex: 1 !important;
              height: 28mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: flex-start !important;
              overflow: hidden !important;
              padding-left: 0.5mm !important;
            }
            .print-label-badge {
              background-color: #000000 !important;
              color: #FFFFFF !important;
              font-family: monospace !important;
              font-weight: 900 !important;
              font-size: 11pt !important;
              line-height: 1.1 !important;
              padding: 1.2mm 2.2mm !important;
              border-radius: 0.8mm !important;
              white-space: nowrap !important;
            }
            .print-label-name {
              color: #000000 !important;
              font-family: sans-serif !important;
              font-weight: 900 !important;
              font-size: 10.5pt !important;
              line-height: 1.15 !important;
              text-transform: uppercase !important;
              margin-top: 1.8mm !important;
              word-break: break-word !important;
            }
            .print-label-sub {
              color: #333333 !important;
              font-family: monospace !important;
              font-size: 6.5pt !important;
              font-weight: 700 !important;
              margin-top: 1mm !important;
              text-transform: uppercase !important;
              white-space: nowrap !important;
            }
            .label-wrapper {
              width: ${widthMm}mm !important;
              height: ${heightMm}mm !important;
              margin: 0mm !important;
              padding: 0mm !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .label-img {
              width: 100% !important;
              height: 100% !important;
              display: block !important;
              object-fit: fill !important;
              margin: 0mm !important;
              padding: 0mm !important;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }
          @media screen {
            body {
              margin: 0;
              padding: 24px;
              background: #111827;
              color: #F3F4F6;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .screen-guide {
              background: #1F2937;
              border: 1px solid #374151;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 20px;
              max-width: 440px;
              font-size: 12px;
              line-height: 1.6;
              text-align: left;
            }
            .screen-guide strong {
              color: #F59E0B;
            }
            .print-label-page {
              background: #FFFFFF;
              border: 1px solid #6B7280;
              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
              width: ${pageW}mm;
              height: ${pageH}mm;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .print-label-container {
              width: 40mm;
              height: 30mm;
              box-sizing: border-box;
              padding: 1mm;
              background: #FFFFFF;
              color: #000000;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: flex-start;
              gap: 1.5mm;
              overflow: hidden;
              transform: rotate(90deg);
              transform-origin: center center;
              border: 1px solid #000000;
            }
            .label-wrapper {
              background: #FFFFFF;
              border: 1px solid #6B7280;
              box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              overflow: hidden;
            }
            .label-img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: fill;
            }
            .btn-reprint {
              margin-top: 16px;
              padding: 8px 16px;
              background: #F59E0B;
              color: #000000;
              font-weight: 800;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              text-transform: uppercase;
            }
            .btn-reprint:hover {
              background: #D97706;
            }
          }
        </style>
      </head>
      <body>
        <div class="screen-guide">
          <strong>ISTRUZIONI PERFEZIONAMENTO STAMPANTE TERMICA:</strong><br />
          • Formato carta nel driver: <strong>${pageW} × ${pageH} mm</strong><br />
          • Orientamento: <strong>Rotazione 90° a destra (landscape su rotolo)</strong><br />
          • Margini di stampa: <strong>Nessuno (0 mm)</strong> [1mm già incorporato]<br />
          • Disposizione: <strong>QR a sinistra, Nome/Matricola a destra</strong><br />
          • Scala: <strong>100% (Effettiva / Dimensione reale)</strong>
        </div>

        ${
          is40x30
            ? `
          <div class="print-label-page">
            <div class="print-label-container">
              <img class="label-img" src="${dataUrl}" alt="Etichetta Termica 40x30 Rotata" />
            </div>
          </div>
        `
            : `
          <div class="label-wrapper">
            <img class="label-img" src="${dataUrl}" alt="Etichetta Termica" />
          </div>
        `
        }

        <button class="btn-reprint screen-guide" onclick="window.print()">
          Riapri Dialogo Stampa
        </button>

        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 350);
          });
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

/**
 * Compiles a single multi-page PDF document containing all provided labels,
 * where each page matches the exact millimeter dimensions of the chosen thermal format.
 */
export async function generateMultiPagePdfForThermalRoll(
  items: BatchThermalItem[],
  config: Partial<ThermalLabelConfig> = {},
  onProgress?: (current: number, total: number, name: string) => void,
  customBaseUrl?: string
): Promise<jsPDF> {
  const mergedConfig: ThermalLabelConfig = { ...DEFAULT_THERMAL_CONFIG, ...config };
  const { widthMm, heightMm } = getLabelPixelDimensions(
    mergedConfig.size,
    mergedConfig.orientation,
    mergedConfig.dpi,
    mergedConfig.customWidthMm,
    mergedConfig.customHeightMm
  );

  const orientation = mergedConfig.orientation === 'portrait' ? 'portrait' : 'landscape';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

  // Lock PDF print scaling to 100% (No auto-shrink / fit-to-page distortion)
  doc.viewerPreferences({ PrintScaling: 'None' }, true);

  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const name = item.person.name || 'Operatore';
    if (onProgress) {
      onProgress(i + 1, total, name);
    }

    if (i > 0) {
      doc.addPage([widthMm, heightMm], orientation);
    }

    const canvas = await renderThermalLabelToCanvas(
      item.person,
      item.category,
      mergedConfig,
      item.teamName,
      customBaseUrl
    );
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  }

  return doc;
}

/**
 * Spools a continuous thermal roll print document in the browser,
 * outputting 1 label per page with strict @page geometry and page-break-after.
 */
export function printBatchThermalRoll(
  canvases: { canvas: HTMLCanvasElement; name: string }[],
  size: LabelSizeOption,
  orientation: LabelOrientation,
  customWidthMm?: number,
  customHeightMm?: number
): void {
  const { widthMm, heightMm } = getLabelPixelDimensions(size, orientation, 300, customWidthMm, customHeightMm);
  const isRotated = orientation === 'portrait' && size !== '50x80';
  const is40x30 = size === '40x30';
  const pageW = isRotated ? heightMm : widthMm;
  const pageH = isRotated ? widthMm : heightMm;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup bloccato dal browser. Abilita i popup per visualizzare la stampa del rotolo.');
    return;
  }

  const pagesHtml = canvases
    .map(({ canvas, name }) => {
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      if (is40x30) {
        return `
          <div class="print-label-page">
            <div class="print-label-container">
              <img class="label-img" src="${dataUrl}" alt="${name}" />
            </div>
          </div>
        `;
      }
      return `
        <div class="label-page">
          <img class="label-img" src="${dataUrl}" alt="${name}" />
        </div>
      `;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="it">
      <head>
        <meta charset="utf-8" />
        <title>Stampa Rotolo Termico (${canvases.length} Etichette - ${is40x30 ? '40x30 mm Rotata 90°' : `${widthMm}x${heightMm} mm`})</title>
        <style>
          @page {
            size: ${pageW}mm ${pageH}mm;
            margin: 0mm !important;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @media print {
            html, body {
              margin: 0mm !important;
              padding: 0mm !important;
              background: #FFFFFF !important;
            }
            .screen-guide {
              display: none !important;
            }
            .print-label-page {
              width: ${pageW}mm !important;
              height: ${pageH}mm !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin: 0mm !important;
              padding: 0mm !important;
              overflow: hidden !important;
              background: #FFFFFF !important;
            }
            .print-label-container {
              width: 40mm !important;
              height: 30mm !important;
              box-sizing: border-box !important;
              padding: 1mm !important;
              margin: 0mm !important;
              background: #FFFFFF !important;
              color: #000000 !important;
              display: flex !important;
              flex-direction: row !important;
              align-items: center !important;
              justify-content: flex-start !important;
              gap: 1.5mm !important;
              overflow: hidden !important;
              transform: rotate(90deg) !important;
              transform-origin: center center !important;
              border: 1px solid #000000 !important;
            }
            .label-page {
              width: ${widthMm}mm !important;
              height: ${heightMm}mm !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              margin: 0mm !important;
              padding: 0mm !important;
              overflow: hidden !important;
            }
            .label-img {
              width: 100% !important;
              height: 100% !important;
              object-fit: fill !important;
              display: block !important;
              margin: 0mm !important;
              padding: 0mm !important;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }
          @media screen {
            body {
              margin: 0;
              padding: 24px;
              background: #111827;
              color: #F3F4F6;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              display: flex;
              flex-direction: column;
              align-items: center;
              box-sizing: border-box;
            }
            .screen-guide {
              background: #1F2937;
              border: 1px solid #374151;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 24px;
              max-width: 440px;
              font-size: 12px;
              line-height: 1.6;
              text-align: left;
            }
            .screen-guide strong {
              color: #F59E0B;
            }
            .print-label-page {
              width: ${pageW}mm;
              height: ${pageH}mm;
              background: #FFFFFF;
              border: 1px solid #4B5563;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .print-label-container {
              width: 40mm;
              height: 30mm;
              box-sizing: border-box;
              padding: 1mm;
              background: #FFFFFF;
              color: #000000;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: flex-start;
              gap: 1.5mm;
              overflow: hidden;
              transform: rotate(90deg);
              transform-origin: center center;
              border: 1px solid #000000;
            }
            .label-page {
              width: ${widthMm}mm;
              height: ${heightMm}mm;
              background: #FFFFFF;
              border: 1px solid #4B5563;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              margin-bottom: 16px;
              overflow: hidden;
            }
            .label-img {
              width: 100%;
              height: 100%;
              display: block;
              object-fit: fill;
            }
            .btn-reprint {
              margin-top: 16px;
              padding: 8px 16px;
              background: #F59E0B;
              color: #000000;
              font-weight: 800;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              text-transform: uppercase;
            }
          }
        </style>
      </head>
      <body>
        <div class="screen-guide">
          <strong>ROTOLO TERMICO (${canvases.length} ETICHETTE):</strong><br />
          • Formato carta: <strong>${pageW} × ${pageH} mm</strong><br />
          • Orientamento: <strong>Rotazione 90° a destra (landscape su rotolo)</strong><br />
          • Margini: <strong>Nessuno (0 mm)</strong> [1mm incorporato]<br />
          • Disposizione: <strong>QR a sinistra, Nome/Matricola a destra</strong><br />
          • Scala: <strong>100% (Effettiva)</strong>
        </div>

        ${pagesHtml}

        <button class="btn-reprint screen-guide" onclick="window.print()">
          Riapri Dialogo Stampa
        </button>

        <script>
          window.addEventListener('load', function() {
            setTimeout(function() {
              window.print();
            }, 400);
          });
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
