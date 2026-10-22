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

export type LabelSizeOption = '50x80' | '40x30';
export type LabelOrientation = 'portrait' | 'landscape';
export type ThermalDpi = 203 | 300;
export type ThermalPrinterModel = 'generic' | 'pm240';

export interface ThermalLabelConfig {
  size: LabelSizeOption; // '50x80' | '40x30'
  orientation: LabelOrientation; // 'portrait' | 'landscape'
  dpi: ThermalDpi; // 203 | 300
  printerModel?: ThermalPrinterModel; // 'generic' | 'pm240'
  includeHeader?: boolean;
  includeFooter?: boolean;
}

export const DEFAULT_THERMAL_CONFIG: ThermalLabelConfig = {
  size: '50x80',
  orientation: 'portrait',
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
 * - 1.5mm anti-clipping margin preventing physical edge cutoff
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
 * Calculates pixel dimensions given width and height in millimeters and DPI.
 * Standard thermal density:
 * - 203 DPI = 8.00 dots/mm
 * - 300 DPI = 11.811 dots/mm
 */
export function getLabelPixelDimensions(
  size: LabelSizeOption,
  orientation: LabelOrientation,
  dpi: ThermalDpi
): { width: number; height: number; widthMm: number; heightMm: number } {
  const dotsPerMm = dpi === 300 ? 11.811 : 8.0;

  let widthMm: number;
  let heightMm: number;

  if (size === '50x80') {
    if (orientation === 'portrait') {
      widthMm = 50;
      heightMm = 80;
    } else {
      widthMm = 80;
      heightMm = 50;
    }
  } else {
    // 40x30
    if (orientation === 'landscape') {
      widthMm = 40;
      heightMm = 30;
    } else {
      widthMm = 30;
      heightMm = 40;
    }
  }

  const width = Math.round(widthMm * dotsPerMm);
  const height = Math.round(heightMm * dotsPerMm);

  return { width, height, widthMm, heightMm };
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
  const { width, height, widthMm, heightMm } = getLabelPixelDimensions(
    mergedConfig.size,
    mergedConfig.orientation,
    mergedConfig.dpi
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
  const scale = width / (mergedConfig.size === '50x80' ? (mergedConfig.orientation === 'portrait' ? 591 : 945) : (mergedConfig.orientation === 'landscape' ? 472 : 354));

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

  // Draw outer border frame (gives clean margin on adhesive peel)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));

  // Anti-clipping safety margin:
  // For 40x30 mm (4cm x 3cm) or Labelnize PM240, apply 1.5mm safe physical edge margin
  // (12px at 203 DPI, 18px at 300 DPI) to prevent clipping by thermal printhead dead-zone or paper drift.
  const isPm240Profile = mergedConfig.printerModel === 'pm240' || (mergedConfig.size === '40x30' && mergedConfig.dpi === 203);
  const inset = mergedConfig.size === '40x30'
    ? Math.max(12, Math.round((isPm240Profile ? 15 : 12) * scale))
    : Math.round(8 * scale);

  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

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

  } else if (mergedConfig.size === '40x30' && mergedConfig.orientation === 'landscape') {
    // =========================================================================
    // LAYOUT: 40mm x 30mm LANDSCAPE (Standard Horizontal Thermal Sticker)
    // =========================================================================
    // 40x30 is compact: 2-column layout with vertical divider
    const colSplitX = Math.round(width * 0.53);

    // Vertical dividing hairline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    ctx.beginPath();
    ctx.moveTo(colSplitX, inset + Math.round(4 * scale));
    ctx.lineTo(colSplitX, height - inset - Math.round(4 * scale));
    ctx.stroke();

    // -------------------------------------------------------------------------
    // LEFT COLUMN: Identification & Roster Metadata
    // -------------------------------------------------------------------------
    const leftX = inset + Math.round(8 * scale);
    const colWidth = colSplitX - leftX - Math.round(8 * scale);
    let leftY = inset + Math.round(6 * scale);

    // 1. Header Banner
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `900 ${Math.max(10, Math.round(13 * scale))}px sans-serif`;
    ctx.fillText('HITTER • EM', leftX, leftY + Math.max(10, Math.round(12 * scale)));

    // Category tag right-aligned against the divider
    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.max(8, Math.round(9 * scale))}px monospace`;
    ctx.fillText(display.categoryLabel, leftX + colWidth, leftY + Math.max(10, Math.round(12 * scale)));

    // Hairline divider below header
    leftY += Math.max(14, Math.round(18 * scale));
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(leftX + colWidth, leftY);
    ctx.stroke();
    leftY += Math.max(4, Math.round(6 * scale));

    // 2. High-Contrast Inverted Badge Code Block
    const badgeBoxH = Math.max(28, Math.round(42 * scale));
    ctx.fillStyle = '#000000';
    ctx.fillRect(leftX, leftY, colWidth, badgeBoxH);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.max(17, Math.round(26 * scale))}px monospace`;
    ctx.fillText(display.badgeCode, leftX + colWidth / 2, leftY + Math.round(badgeBoxH * 0.72));
    leftY += badgeBoxH + Math.max(6, Math.round(9 * scale));

    // 3. Full Participant Name (Auto-scaled to prevent truncation)
    drawFittedText(
      ctx,
      display.name.toUpperCase(),
      leftX,
      leftY + Math.max(12, Math.round(15 * scale)),
      colWidth,
      Math.max(13, Math.round(18 * scale)),
      10,
      'sans-serif',
      '900',
      'left'
    );
    leftY += Math.max(17, Math.round(22 * scale));

    // 4. Role Title
    drawFittedText(
      ctx,
      display.roleTitle.toUpperCase(),
      leftX,
      leftY + Math.max(9, Math.round(12 * scale)),
      colWidth,
      Math.max(10, Math.round(13 * scale)),
      8,
      'sans-serif',
      'bold',
      'left'
    );
    leftY += Math.max(14, Math.round(17 * scale));

    // 5. Squadra & SubDetails
    drawFittedText(
      ctx,
      display.subDetails.toUpperCase(),
      leftX,
      leftY + Math.max(8, Math.round(10 * scale)),
      colWidth,
      Math.max(9, Math.round(11 * scale)),
      7,
      'monospace',
      '600',
      'left'
    );

    // -------------------------------------------------------------------------
    // RIGHT COLUMN: Prominent Scannable QR Code & Caption
    // -------------------------------------------------------------------------
    const rightAvailW = width - colSplitX - inset;
    const rightAvailH = height - inset * 2;
    const footerSpace = Math.round(34 * scale);
    const qrSize = Math.min(rightAvailW - Math.round(16 * scale), rightAvailH - footerSpace);
    const qrX = colSplitX + (rightAvailW - qrSize) / 2;
    const qrY = inset + Math.max(0, (rightAvailH - footerSpace - qrSize) / 2);

    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Right Column Micro Footer
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(10 * scale)}px sans-serif`;
    ctx.fillText('PAGINA PERSONALE', qrX + qrSize / 2, qrY + qrSize + Math.round(14 * scale));
    ctx.font = `bold ${Math.round(8 * scale)}px monospace`;
    ctx.fillText(`REF: #${dataHash}`, qrX + qrSize / 2, qrY + qrSize + Math.round(26 * scale));

  } else {
    // =========================================================================
    // LAYOUT: 30mm x 40mm PORTRAIT (Vertical Compact Sticker)
    // =========================================================================
    const contentW = width - inset * 2 - Math.round(12 * scale);
    const centerX = width / 2;
    let curY = inset + Math.round(8 * scale);

    // 1. Header Row
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(14 * scale)}px sans-serif`;
    ctx.fillText('HITTER • INTUBATI EM', centerX, curY + Math.round(13 * scale));
    curY += Math.round(18 * scale);

    ctx.font = `bold ${Math.round(9 * scale)}px monospace`;
    ctx.fillText('CORSO EMERGENZE TATTICHE', centerX, curY + Math.round(9 * scale));
    curY += Math.round(14 * scale);

    // Divider line
    ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
    ctx.beginPath();
    ctx.moveTo(inset + Math.round(8 * scale), curY);
    ctx.lineTo(width - inset - Math.round(8 * scale), curY);
    ctx.stroke();
    curY += Math.round(8 * scale);

    // 2. High-Contrast Badge Code Block
    const bHeight = Math.round(42 * scale);
    const bWidth = contentW;
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - bWidth / 2, curY, bWidth, bHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(28 * scale)}px monospace`;
    ctx.fillText(display.badgeCode, centerX, curY + Math.round(30 * scale));
    curY += bHeight + Math.round(10 * scale);

    // 3. Full Participant Name (Auto-scaled)
    drawFittedText(
      ctx,
      display.name.toUpperCase(),
      centerX,
      curY + Math.round(17 * scale),
      contentW,
      19 * scale,
      12 * scale,
      'sans-serif',
      '900',
      'center'
    );
    curY += Math.round(24 * scale);

    // 4. Role Title & Squadra
    drawFittedText(
      ctx,
      display.roleTitle.toUpperCase(),
      centerX,
      curY + Math.round(11 * scale),
      contentW,
      12 * scale,
      9 * scale,
      'sans-serif',
      'bold',
      'center'
    );
    curY += Math.round(16 * scale);

    drawFittedText(
      ctx,
      display.subDetails.toUpperCase(),
      centerX,
      curY + Math.round(10 * scale),
      contentW,
      10 * scale,
      8 * scale,
      'monospace',
      '600',
      'center'
    );
    curY += Math.round(16 * scale);

    // Divider line before QR
    ctx.beginPath();
    ctx.moveTo(inset + Math.round(12 * scale), curY);
    ctx.lineTo(width - inset - Math.round(12 * scale), curY);
    ctx.stroke();
    curY += Math.round(8 * scale);

    // 5. Scannable QR Code
    const remainingH = height - curY - inset - Math.round(24 * scale);
    const qrDim = Math.min(contentW - Math.round(16 * scale), remainingH);
    const qX = (width - qrDim) / 2;
    const qY = curY + Math.max(0, (remainingH - qrDim) / 2);

    ctx.drawImage(qrImage, qX, qY, qrDim, qrDim);

    // Micro Footer
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.round(8 * scale)}px monospace`;
    ctx.fillText(`REF: #${dataHash} • TERMO ADESIVO`, centerX, height - inset - Math.round(6 * scale));
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
 * Opens browser print dialog specifically styled for thermal label printers.
 */
export function printThermalLabel(
  canvas: HTMLCanvasElement,
  size: LabelSizeOption,
  orientation?: LabelOrientation
): void {
  const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Popup bloccato dal browser. Abilita i popup per visualizzare la stampa.');
    return;
  }

  const derivedOrientation: LabelOrientation =
    orientation || (canvas.width >= canvas.height ? 'landscape' : 'portrait');
  const { widthMm, heightMm } = getLabelPixelDimensions(size, derivedOrientation, 300);

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stampa Etichetta Termoadesiva HITTER</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            overflow: hidden;
          }
          img {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            display: block;
            image-rendering: pixelated;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print();window.close();" />
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
    mergedConfig.dpi
  );

  const orientation = mergedConfig.orientation === 'portrait' ? 'portrait' : 'landscape';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm],
    compress: true,
  });

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
    doc.addImage(imgData, 'JPEG', 0, 0, widthMm, heightMm, undefined, 'FAST');
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
  orientation: LabelOrientation
): void {
  const { widthMm, heightMm } = getLabelPixelDimensions(size, orientation, 300);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Popup bloccato dal browser. Abilita i popup per visualizzare la stampa del rotolo.');
    return;
  }

  const pagesHtml = canvases
    .map(({ canvas, name }) => {
      const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
      return `
        <div class="label-page">
          <img class="label-img" src="${dataUrl}" alt="${name}" />
        </div>
      `;
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Stampa Rotolo Termico (${canvases.length} Etichette)</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #FFFFFF;
          }
          .label-page {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          .label-img {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            display: block;
            image-rendering: pixelated;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
