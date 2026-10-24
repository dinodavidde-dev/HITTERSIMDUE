import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  RotateCw,
  Users,
  Eye,
  Sliders,
  FileDown,
  Info,
  FileText,
  Cloud,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { AnyParticipant, ParticipantCategory, getParticipantPersonalPageUrl } from '../../utils/qrCodeUtils';
import {
  LabelSizeOption,
  LabelOrientation,
  ThermalDpi,
  ThermalPrinterModel,
  ThermalLabelConfig,
  renderThermalLabelToCanvas,
  downloadThermalLabelJpg,
  downloadSinglePdf1to1,
  generateMultiPagePdfForThermalRoll,
  printBatchThermalRoll,
  getThermalLabelJpgBlob,
  printThermalLabel,
  getLabelPixelDimensions,
  getPersonDisplayDetails,
  determineLabelLayout,
  STANDARD_LABEL_PRESETS,
  LABELNIZE_PM240_CONFIG,
} from '../../utils/thermalLabelGenerator';
import { getTeamCodeName } from '../../utils/teamUtils';
import { PrintLabelContainer } from './PrintLabelContainer';

interface ThermalLabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPerson?: AnyParticipant | null;
  initialCategory?: ParticipantCategory;
  initialSize?: LabelSizeOption;
}

export const ThermalLabelGeneratorModal: React.FC<ThermalLabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialPerson,
  initialCategory = 'discenti',
  initialSize = '40x30',
}) => {
  const {
    discenti,
    faculty,
    technicians,
    actors,
    makeupArtists,
    directors,
    regiaStaff,
    guests,
    teams,
    language,
    isFirebaseCloudConnected,
  } = useCourse();

  const isEn = language === 'en';

  // Config state
  const [labelSize, setLabelSize] = useState<LabelSizeOption>(initialSize);
  const [customWidthMm, setCustomWidthMm] = useState<number>(40);
  const [customHeightMm, setCustomHeightMm] = useState<number>(30);
  const [orientation, setOrientation] = useState<LabelOrientation>('landscape');
  const [dpi, setDpi] = useState<ThermalDpi>(300);
  const [rotated90, setRotated90] = useState<boolean>(false);

  // Filter & Selected person state
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | ParticipantCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<AnyParticipant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ParticipantCategory>(initialCategory);

  // Preview state
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [previewMode40x30, setPreviewMode40x30] = useState<'standard' | 'rotated_90'>('standard');

  // Batch progress state
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentName: string }>({
    current: 0,
    total: 0,
    currentName: '',
  });

  // Consolidate all course figures into a single unified directory
  const allCourseFigures = useMemo(() => {
    const list: { person: AnyParticipant; category: ParticipantCategory; teamName?: string }[] = [];

    // 1. Discenti (70)
    (discenti || []).forEach((d) => {
      const matchedTeam = teams.find((t) => t.id === d.teamId);
      list.push({
        person: d,
        category: 'discenti',
        teamName: matchedTeam ? getTeamCodeName(matchedTeam) : undefined,
      });
    });

    // 2. Faculty (12)
    (faculty || []).forEach((f) => {
      const matchedTeam = teams.find((t) => t.id === f.assignedTeamId);
      list.push({
        person: f,
        category: 'faculty',
        teamName: matchedTeam ? getTeamCodeName(matchedTeam) : undefined,
      });
    });

    // 3. Technicians (12)
    (technicians || []).forEach((t) => {
      list.push({ person: t, category: 'tecnici' });
    });

    // 4. Actors (8)
    (actors || []).forEach((a) => {
      list.push({ person: a, category: 'attori' });
    });

    // 5. Makeup Artists (8)
    (makeupArtists || []).forEach((m) => {
      list.push({ person: m, category: 'truccatori' });
    });

    // 6. Directors
    (directors || []).forEach((d) => {
      list.push({ person: d, category: 'direttori' });
    });

    // 7. Regia Staff
    (regiaStaff || []).forEach((r) => {
      list.push({ person: r, category: 'regia' });
    });

    // 8. Guests
    (guests || []).forEach((g) => {
      list.push({ person: g, category: 'ospiti' });
    });

    return list;
  }, [discenti, faculty, technicians, actors, makeupArtists, directors, regiaStaff, guests, teams]);

  // Set initial selected person on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialPerson) {
        setSelectedPerson(initialPerson);
        setSelectedCategory(initialCategory);
      } else if (!selectedPerson && allCourseFigures.length > 0) {
        setSelectedPerson(allCourseFigures[0].person);
        setSelectedCategory(allCourseFigures[0].category);
      }
    }
  }, [isOpen, initialPerson, initialCategory, allCourseFigures]);

  // Keep selectedPerson synced in real time if its data is updated in Firestore or local storage
  useEffect(() => {
    if (isOpen && selectedPerson) {
      const latest = allCourseFigures.find((f) => f.person.id === selectedPerson.id);
      if (latest && latest.person !== selectedPerson) {
        setSelectedPerson(latest.person);
        setSelectedCategory(latest.category);
      }
    }
  }, [isOpen, allCourseFigures, selectedPerson]);

  // Filtered figures based on category tab & search query
  const filteredFigures = useMemo(() => {
    return allCourseFigures.filter((item) => {
      if (activeCategoryFilter !== 'ALL' && item.category !== activeCategoryFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const badge = ((item.person as any).badgeCode || item.person.id || '').toLowerCase();
      const name = (item.person.name || '').toLowerCase();
      const role = ((item.person as any).role || (item.person as any).title || '').toLowerCase();
      const sub = (item.teamName || '').toLowerCase();

      return badge.includes(q) || name.includes(q) || role.includes(q) || sub.includes(q);
    });
  }, [allCourseFigures, activeCategoryFilter, searchQuery]);

  // Team name for current selected person
  const currentTeamName = useMemo(() => {
    if (!selectedPerson) return undefined;
    const teamId = (selectedPerson as any).teamId || (selectedPerson as any).assignedTeamId;
    if (!teamId) return undefined;
    const matched = teams.find((t) => t.id === teamId);
    return matched ? getTeamCodeName(matched) : undefined;
  }, [selectedPerson, teams]);

  // Active thermal config reflecting all selected settings
  const activeConfig: Partial<ThermalLabelConfig> = {
    size: labelSize,
    orientation,
    dpi,
    customWidthMm,
    customHeightMm,
    rotated90: labelSize === '40x30' ? previewMode40x30 === 'rotated_90' : rotated90,
    printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
    includeHeader: true,
    includeFooter: true,
  };

  // Render canvas whenever person or config changes
  useEffect(() => {
    if (!isOpen || !selectedPerson) return;

    let isMounted = true;
    setIsRendering(true);

    renderThermalLabelToCanvas(selectedPerson, selectedCategory, activeConfig, currentTeamName)
      .then((canvas) => {
        if (!isMounted) return;
        setPreviewCanvas(canvas);
        setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.98));
        setIsRendering(false);
      })
      .catch((err) => {
        console.error('Failed to render thermal label canvas:', err);
        if (isMounted) setIsRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    selectedPerson,
    selectedCategory,
    labelSize,
    customWidthMm,
    customHeightMm,
    orientation,
    dpi,
    rotated90,
    previewMode40x30,
    currentTeamName,
  ]);

  if (!isOpen) return null;

  const currentDisplay = selectedPerson
    ? getPersonDisplayDetails(selectedPerson, selectedCategory, currentTeamName)
    : null;
  const currentPersonalUrl = selectedPerson
    ? getParticipantPersonalPageUrl(selectedPerson, selectedCategory)
    : '';

  const { width: pixelWidth, height: pixelHeight, widthMm, heightMm } = getLabelPixelDimensions(
    labelSize,
    orientation,
    dpi,
    customWidthMm,
    customHeightMm
  );
  const detectedLayout = determineLabelLayout(widthMm, heightMm, labelSize);

  // Single download handler
  const handleDownloadSingle = async () => {
    if (!selectedPerson) return;
    try {
      await downloadThermalLabelJpg(
        selectedPerson,
        selectedCategory,
        activeConfig,
        currentTeamName
      );
    } catch (e) {
      console.error('Error downloading label:', e);
    }
  };

  // 1:1 Millimeter PDF download for selected person
  const handleDownloadSinglePdf = async () => {
    if (!selectedPerson) return;
    try {
      await downloadSinglePdf1to1(
        selectedPerson,
        selectedCategory,
        activeConfig,
        currentTeamName
      );
    } catch (e) {
      console.error('Error downloading 1:1 PDF label:', e);
    }
  };

  // Direct print handler
  const handlePrint = () => {
    if (!previewCanvas) return;
    printThermalLabel(
      previewCanvas,
      labelSize,
      orientation,
      selectedPerson || undefined,
      selectedCategory,
      currentTeamName,
      customWidthMm,
      customHeightMm,
      labelSize === '40x30' ? previewMode40x30 === 'rotated_90' : rotated90
    );
  };

  // Batch 1:1 Multi-page PDF download handler (all filtered figures)
  const handleDownloadBatchPdf = async (itemsToExport: typeof filteredFigures) => {
    if (itemsToExport.length === 0 || isBatchExporting) return;

    setIsBatchExporting(true);
    setBatchProgress({ current: 0, total: itemsToExport.length, currentName: '' });

    try {
      const batchItems = itemsToExport.map((item) => ({
        person: item.person,
        category: item.category,
        teamName: item.teamName,
      }));

      const doc = await generateMultiPagePdfForThermalRoll(
        batchItems,
        activeConfig,
        (current, total, name) => {
          setBatchProgress({ current, total, currentName: name });
        }
      );

      const sizeStr = labelSize === 'custom' ? `${widthMm}x${heightMm}mm` : `${labelSize}mm`;
      doc.save(`ROTOLO_ETICHETTE_1a1_${itemsToExport.length}_FIGURE_${sizeStr}.pdf`);
    } catch (e) {
      console.error('Batch PDF export error:', e);
    } finally {
      setIsBatchExporting(false);
    }
  };

  // Batch direct browser spool print
  const handlePrintBatchRoll = async (itemsToExport: typeof filteredFigures) => {
    if (itemsToExport.length === 0 || isBatchExporting) return;

    setIsBatchExporting(true);
    setBatchProgress({ current: 0, total: itemsToExport.length, currentName: '' });

    try {
      const canvases: { canvas: HTMLCanvasElement; name: string }[] = [];
      for (let i = 0; i < itemsToExport.length; i++) {
        const item = itemsToExport[i];
        setBatchProgress({
          current: i + 1,
          total: itemsToExport.length,
          currentName: `${(item.person as any).badgeCode || ''} • ${item.person.name}`,
        });

        const canvas = await renderThermalLabelToCanvas(
          item.person,
          item.category,
          activeConfig,
          item.teamName
        );
        canvases.push({ canvas, name: item.person.name });
      }

      printBatchThermalRoll(canvases, labelSize, orientation, customWidthMm, customHeightMm);
    } catch (e) {
      console.error('Batch print roll error:', e);
    } finally {
      setIsBatchExporting(false);
    }
  };

  // Batch download handler (individual JPGs)
  const handleDownloadBatch = async (itemsToExport: typeof filteredFigures) => {
    if (itemsToExport.length === 0 || isBatchExporting) return;

    setIsBatchExporting(true);
    setBatchProgress({ current: 0, total: itemsToExport.length, currentName: '' });

    try {
      for (let i = 0; i < itemsToExport.length; i++) {
        const item = itemsToExport[i];
        setBatchProgress({
          current: i + 1,
          total: itemsToExport.length,
          currentName: `${(item.person as any).badgeCode || ''} • ${item.person.name}`,
        });

        await downloadThermalLabelJpg(
          item.person,
          item.category,
          activeConfig,
          item.teamName
        );

        // Small pause between downloads to prevent browser download flood block
        await new Promise((r) => setTimeout(r, 200));
      }
    } catch (e) {
      console.error('Batch export error:', e);
    } finally {
      setIsBatchExporting(false);
    }
  };

  // Copy personal page URL
  const handleCopyUrl = () => {
    if (!currentPersonalUrl) return;
    navigator.clipboard.writeText(currentPersonalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-amber-500 rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden font-mono text-neutral-100">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-neutral-950 border-b-2 border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-black flex items-center justify-center font-black shrink-0 shadow-md">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-white truncate">
                  {isEn ? 'THERMAL ADHESIVE QR LABEL GENERATOR' : 'GENERATORE ETICHETTE TERMOADESIVE QR'}
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase rounded">
                  JPG 50×80 / 40×30 MM
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase rounded border ${
                  isFirebaseCloudConnected
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}>
                  <Cloud className={`w-3 h-3 ${isFirebaseCloudConnected ? 'text-emerald-400 animate-pulse' : 'text-neutral-400'}`} />
                  {isFirebaseCloudConnected ? 'CLOUD FIRESTORE: LIVE SYNC' : 'OFFLINE: PERSISTENZA ATTIVA'}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans truncate">
                {isEn
                  ? 'High-contrast monochrome JPG export calibrated for thermal adhesive printers (all course figures with personal redirect)'
                  : 'Export JPG monocromatico ad alta densità per stampanti termiche adesive (tutte le figure del corso con redirect alla visuale personale)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Controls & Figure List / Right Live Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-3.5 sm:p-5">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: CONFIGURATION & FIGURES SELECTION (Cols 1-7)             */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            {/* Format & Sizing Toolbar */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-3.5 rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{isEn ? 'LABEL MEDIA FORMAT & SETTINGS' : 'FORMATO ETICHETTA & RISOLUZIONE'}</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">
                  {pixelWidth} × {pixelHeight} px ({widthMm} × {heightMm} mm)
                </span>
              </div>

              {/* Standard Format Presets Grid */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-400 block flex items-center justify-between">
                  <span>{isEn ? 'Select Standard Media Format:' : 'Seleziona Formato Standard Adesivo:'}</span>
                  <span className="text-amber-400/90 text-[9px] font-mono">1:1 CALIBRATO (1MM MARGINI)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {STANDARD_LABEL_PRESETS.map((preset) => {
                    const isSelected = labelSize === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setLabelSize(preset.id);
                          if (preset.id === '50x80') {
                            setOrientation('portrait');
                          } else if (preset.id !== 'custom') {
                            setOrientation('landscape');
                          }
                        }}
                        className={`p-2 text-left rounded border transition-all cursor-pointer flex flex-col justify-between min-h-[48px] ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md ring-1 ring-amber-400/60'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-xs font-black tracking-tight">{preset.label}</span>
                          {isSelected && <span className="text-[9px] font-black uppercase">✓ ATTIVO</span>}
                        </div>
                        <span className={`text-[9px] truncate block ${isSelected ? 'text-black/80 font-bold' : 'text-neutral-400'}`}>
                          {preset.recommendedFor}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Dimensions Input Row (shown when 'custom' is selected) */}
              {labelSize === 'custom' && (
                <div className="p-2.5 bg-neutral-900/90 border border-amber-500/50 rounded space-y-2">
                  <span className="text-[10px] font-bold uppercase text-amber-300 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-amber-400" />
                    <span>DIMENSIONI PERSONALIZZATE (MILLIMETRI)</span>
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-mono block">Larghezza (mm):</label>
                      <input
                        type="number"
                        min={15}
                        max={150}
                        value={customWidthMm}
                        onChange={(e) => setCustomWidthMm(Math.max(15, Math.min(150, Number(e.target.value) || 40)))}
                        className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-2.5 py-1.5 rounded focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-neutral-400 font-mono block">Altezza (mm):</label>
                      <input
                        type="number"
                        min={15}
                        max={150}
                        value={customHeightMm}
                        onChange={(e) => setCustomHeightMm(Math.max(15, Math.min(150, Number(e.target.value) || 30)))}
                        className="w-full bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-2.5 py-1.5 rounded focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Orientation, DPI, and Layout Detection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Orientation */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {isEn ? 'Orientation:' : 'Orientamento:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        orientation === 'landscape'
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isEn ? 'Horiz.' : 'Orizzontale'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        orientation === 'portrait'
                          ? 'bg-amber-500 text-black font-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isEn ? 'Vert.' : 'Verticale'}
                    </button>
                  </div>
                </div>

                {/* 2. Thermal Print Density (DPI) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {isEn ? 'Thermal DPI:' : 'Densità DPI:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setDpi(300)}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        dpi === 300
                          ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      300 DPI
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpi(203)}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        dpi === 203
                          ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      203 DPI
                    </button>
                  </div>
                </div>

                {/* 3. 90° Clockwise Rotation Toggle (for vertical roll feeds) */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {isEn ? 'Roll Feed Rotation:' : 'Rotazione Rotolo:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !rotated90;
                      setRotated90(next);
                      setPreviewMode40x30(next ? 'rotated_90' : 'standard');
                    }}
                    className={`w-full py-1.5 px-2 text-xs font-black uppercase rounded border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      rotated90 || (labelSize === '40x30' && previewMode40x30 === 'rotated_90')
                        ? 'bg-amber-950 text-amber-300 border-amber-400 shadow-sm'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                    title="Ruota l'etichetta di 90° a destra per adattarla all'avanzamento verticale sui rotoli da stampante termica"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{rotated90 || (labelSize === '40x30' && previewMode40x30 === 'rotated_90') ? '90° ATTIVA' : '0° STANDARD'}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Layout & Margins Status Card */}
              <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1 flex-wrap gap-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {detectedLayout === 'horizontal_split'
                        ? 'LAYOUT ORIZZONTALE (QR SX • NOME E MATRICOLA DX)'
                        : detectedLayout === 'vertical_badge_50x80'
                        ? 'BADGE VERTICALE ESTESO (50×80 MM)'
                        : 'LAYOUT VERTICALE COMPATTO (QR CENTRATO IN BASSO)'}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">1MM MARGINI STRICT</span>
                </div>
                <div className="text-[11px] space-y-0.5 text-neutral-300 font-sans">
                  <p>• <strong>Adattamento Automatico</strong>: Rapporto W/H = <strong>{(widthMm / heightMm).toFixed(2)}</strong>. {detectedLayout === 'horizontal_split' ? 'QR Code a sinistra massimizzato e Nome/Matricola ben leggibili a destra.' : 'Disposizione impilata verticale ottimizzata per etichette strette/quadrate.'}</p>
                  <p>• <strong>Margini di Stampa</strong>: 1.0mm perimetrale (zero sprechi di spazio, nessun taglio meccanico).</p>
                  <p>• <strong>Driver Stampante Termica</strong>: Selezionare formato <em>{widthMm} × {heightMm} mm</em> (o <em>{heightMm} × {widthMm} mm</em> con rotazione 90°), scala <em>100% (Effettiva)</em>, margini <em>0 mm</em>.</p>
                </div>
              </div>

              {/* Quick Profile Button: Labelnize PM240 */}
              <div className="pt-1 border-t border-neutral-850 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLabelSize('40x30');
                    setOrientation('landscape');
                    setDpi(203);
                    setRotated90(false);
                    setPreviewMode40x30('standard');
                  }}
                  className={`py-1 px-2.5 text-[11px] font-black uppercase tracking-wider border rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                    labelSize === '40x30' && orientation === 'landscape' && dpi === 203
                      ? 'bg-amber-950/90 text-amber-200 border-amber-400'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Printer className="w-3 h-3 text-amber-400" />
                  <span>PROFILO RAPIDO PM240 (40×30 / 203 DPI)</span>
                </button>

                <span className="text-[10px] text-neutral-400 font-mono">
                  {widthMm} × {heightMm} mm • {dpi} DPI
                </span>
              </div>
            </div>

            {/* Figures Selection & Filter Bar */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-3.5 rounded-lg space-y-3 flex-1 flex flex-col shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-neutral-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'SELECT FIGURE FOR LABEL' : 'SELEZIONA FIGURA DEL CORSO'}</span>
                  <span className="text-neutral-500 font-normal">({filteredFigures.length}/{allCourseFigures.length})</span>
                </span>

                {/* Search Bar */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Filter badge, name...' : 'Filtra matricola, nome...'}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white font-mono text-xs pl-8 pr-2.5 py-1.5 rounded focus:outline-none focus:border-amber-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'ALL'
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {isEn ? 'ALL' : 'TUTTI'} ({allCourseFigures.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('discenti')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'discenti'
                      ? 'bg-cyan-500 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  DISCENTI ({discenti.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('faculty')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'faculty'
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  FACULTY ({faculty.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('tecnici')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'tecnici'
                      ? 'bg-orange-500 text-black font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  TECNICI ({technicians.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('attori')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'attori'
                      ? 'bg-purple-500 text-white font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  ATTORI ({actors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('truccatori')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'truccatori'
                      ? 'bg-pink-500 text-white font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  TRUCCO ({makeupArtists.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('direttori')}
                  className={`px-2.5 py-1 rounded font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    activeCategoryFilter === 'direttori'
                      ? 'bg-red-500 text-white font-black'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  DIRETTORI ({directors.length})
                </button>
              </div>

              {/* Scrollable Figures List */}
              <div className="overflow-y-auto max-h-56 sm:max-h-64 border border-neutral-800 rounded bg-neutral-900/60 divide-y divide-neutral-800/80">
                {filteredFigures.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500 font-sans">
                    {isEn ? 'No participant found matching query.' : 'Nessuna figura trovata con i filtri attuali.'}
                  </div>
                ) : (
                  filteredFigures.map((item) => {
                    const isSelected = selectedPerson?.id === item.person.id;
                    const badge = (item.person as any).badgeCode || item.person.id;
                    const role = (item.person as any).role || (item.person as any).title || '';
                    return (
                      <button
                        key={`${item.category}-${item.person.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedPerson(item.person);
                          setSelectedCategory(item.category);
                        }}
                        className={`w-full text-left p-2 sm:px-3 sm:py-2 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/80 border-l-4 border-amber-400 text-white'
                            : 'hover:bg-neutral-800/70 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                            isSelected ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-amber-300'
                          }`}>
                            {badge}
                          </span>
                          <div className="min-w-0">
                            <strong className="text-xs font-bold truncate block">{item.person.name}</strong>
                            <span className="text-[10px] text-neutral-400 truncate block">
                              {role} {item.teamName ? `• ${item.teamName}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-bold text-neutral-500 shrink-0">
                          {item.category}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Batch Export Action Bar */}
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-xs font-sans text-neutral-400 text-center sm:text-left">
                {isBatchExporting ? (
                  <div className="space-y-1">
                    <span className="text-amber-400 font-mono font-bold block animate-pulse">
                      ⚡ {isEn ? 'Processing labels:' : 'Elaborazione etichette:'} {batchProgress.current} / {batchProgress.total}
                    </span>
                    <span className="text-[11px] text-neutral-300 font-mono block truncate max-w-xs">
                      {batchProgress.currentName}
                    </span>
                  </div>
                ) : (
                  <span>
                    {isEn ? 'Batch export ready for' : 'Export rotolo pronto per'}{' '}
                    <strong className="text-white font-mono">{filteredFigures.length}</strong> {isEn ? 'figures' : 'figure'}.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* 1. Multi-page PDF 1:1 Roll */}
                <button
                  type="button"
                  disabled={isBatchExporting || filteredFigures.length === 0}
                  onClick={() => handleDownloadBatchPdf(filteredFigures)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded border border-emerald-400/50 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  title="Scarica PDF multipagina a misura esatta 1:1 (calibrato senza ridimensionamento)"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  <span>{isEn ? `PDF ROLL 1:1 (${filteredFigures.length})` : `PDF ROTOLO 1:1 (${filteredFigures.length})`}</span>
                </button>

                {/* 2. Direct Browser Roll Spool */}
                <button
                  type="button"
                  disabled={isBatchExporting || filteredFigures.length === 0}
                  onClick={() => handlePrintBatchRoll(filteredFigures)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-bold text-xs uppercase tracking-wider rounded border border-neutral-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Invia tutte le etichette al dialogo di stampa del browser"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? 'PRINT ROLL' : 'STAMPA ROTOLO'}</span>
                </button>

                {/* 3. Individual JPGs */}
                <button
                  type="button"
                  disabled={isBatchExporting || filteredFigures.length === 0}
                  onClick={() => handleDownloadBatch(filteredFigures)}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-[11px] uppercase tracking-wider rounded border border-neutral-800 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Scarica tutti i file JPG singoli"
                >
                  <FileDown className="w-3 h-3 text-neutral-400" />
                  <span>JPG</span>
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: HIGH-CONTRAST LIVE THERMAL PREVIEW (Cols 8-12)          */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 p-4 rounded-lg flex flex-col items-center justify-between space-y-4 shadow-xl">
            <div className="w-full flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black uppercase text-amber-300">
                  {isEn ? 'REAL-TIME THERMAL PREVIEW' : 'ANTEPRIMA TERMICA REAL-TIME'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {labelSize === '40x30' && (
                  <div className="flex items-center bg-neutral-900 rounded p-0.5 border border-neutral-700">
                    <button
                      type="button"
                      onClick={() => setPreviewMode40x30('standard')}
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-colors cursor-pointer ${
                        previewMode40x30 === 'standard'
                          ? 'bg-amber-500 text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isEn ? 'Flat 40x30' : 'Orizzontale'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode40x30('rotated_90')}
                      className={`px-2 py-0.5 text-[9px] font-black uppercase rounded transition-colors cursor-pointer flex items-center gap-1 ${
                        previewMode40x30 === 'rotated_90'
                          ? 'bg-amber-500 text-black'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="Anteprima con classe .print-label-container ruotata di 90° a destra"
                    >
                      <RotateCw className="w-2.5 h-2.5" />
                      <span>{isEn ? 'Rotated 90°' : 'Rotata 90°'}</span>
                    </button>
                  </div>
                )}
                <span className="text-[10px] text-neutral-400 font-mono">
                  {widthMm} × {heightMm} mm
                </span>
              </div>
            </div>

            {/* Canvas Preview Area with pure white background simulator */}
            <div className="flex-1 w-full flex flex-col items-center justify-center py-2 min-h-[300px]">
              {isRendering ? (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs">{isEn ? 'Rendering label...' : 'Rendering etichetta...'}</span>
                </div>
              ) : (rotated90 || (labelSize === '40x30' && previewMode40x30 === 'rotated_90')) && selectedPerson ? (
                <div className="relative group p-4 bg-neutral-800/80 rounded-lg shadow-inner max-w-full flex flex-col items-center">
                  <div className="bg-white p-3 rounded shadow-2xl border border-neutral-300 flex items-center justify-center min-w-[200px] min-h-[260px] overflow-hidden">
                    <div className="print-label-page" style={{ transform: 'scale(1.8)', transformOrigin: 'center center' }}>
                      <PrintLabelContainer
                        person={selectedPerson}
                        category={selectedCategory}
                        teamName={currentTeamName}
                        rotated={true}
                        widthMm={widthMm}
                        heightMm={heightMm}
                        size={labelSize}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 mt-2 block text-center font-bold">
                    ✓ .print-label-container • Rotazione 90° Destra ({widthMm}×{heightMm} mm)
                  </span>
                </div>
              ) : previewDataUrl ? (
                <div className="relative group p-2 bg-neutral-800/80 rounded-lg shadow-inner max-w-full flex flex-col items-center">
                  {/* Visual sticker shadow simulating adhesive thermal label peel */}
                  <div className="bg-white p-1 rounded shadow-2xl border border-neutral-300">
                    <img
                      src={previewDataUrl}
                      alt="Anteprima Etichetta Termica"
                      style={{
                        maxHeight: orientation === 'portrait' ? '380px' : '260px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        imageRendering: 'pixelated',
                      }}
                      className="block mx-auto rounded-xs"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-2 block text-center">
                    {pixelWidth} × {pixelHeight} px • {dpi} DPI • 1mm Margini • Monocromatico
                  </span>
                </div>
              ) : (
                <div className="text-neutral-500 text-xs">
                  {isEn ? 'Select a figure to preview' : 'Seleziona una figura per visualizzare'}
                </div>
              )}
            </div>

            {/* Target Personal Page URL & Direct Link */}
            <div className="w-full bg-neutral-900 border border-neutral-800 p-2.5 rounded text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-neutral-400 uppercase">
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span>{isEn ? 'Redirect Personal Page:' : 'Redirect Pagina Personale:'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? (isEn ? 'Copied' : 'Copiato') : (isEn ? 'Copy' : 'Copia')}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-cyan-300 truncate select-all bg-neutral-950 p-1.5 rounded border border-neutral-800">
                {currentPersonalUrl || '---'}
              </div>
            </div>

            {/* Action Buttons for currently selected figure */}
            <div className="w-full space-y-2 pt-1">
              {/* Primary 1:1 PDF Download - Solves scaling/shrink bug completely */}
              <button
                type="button"
                disabled={!selectedPerson || isRendering}
                onClick={handleDownloadSinglePdf}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-300 disabled:opacity-50"
                title="Scarica PDF a misura geometrica esatta 1:1 (elimina i rimpicciolimenti del browser)"
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <div className="flex flex-col items-center">
                  <span>
                    {isEn
                      ? `DOWNLOAD PDF 1:1 CALIBRATED (${labelSize === 'custom' ? `${widthMm}x${heightMm}` : labelSize} MM)`
                      : `SCARICA PDF 1:1 CALIBRATO (${labelSize === 'custom' ? `${widthMm}x${heightMm}` : labelSize} MM)`}
                  </span>
                  <span className="text-[9px] font-sans font-bold normal-case text-emerald-950 opacity-90">
                    {isEn ? 'Exact millimeters • Zero scaling distortion' : 'Dimensione millimetrica esatta • Nessun rimpicciolimento'}
                  </span>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Direct Zero-Margin Print */}
                <button
                  type="button"
                  disabled={!previewCanvas || isRendering}
                  onClick={handlePrint}
                  className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] uppercase tracking-wider rounded-lg border border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 shadow"
                  title="Apre la finestra di stampa con margini forzati a 0mm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isEn ? 'DIRECT PRINT (0mm)' : 'STAMPA DIRETTA (0mm)'}</span>
                </button>

                {/* JPG Download */}
                <button
                  type="button"
                  disabled={!selectedPerson || isRendering}
                  onClick={handleDownloadSingle}
                  className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-[11px] uppercase tracking-wider rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Scarica file JPG ad alta risoluzione"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{isEn ? 'DOWNLOAD JPG' : 'SCARICA JPG'}</span>
                </button>
              </div>

              {/* Thermal Printer Driver Guidance Box */}
              <div className="p-2.5 bg-neutral-900/90 border border-neutral-800 rounded text-[11px] font-sans text-neutral-300 space-y-1">
                <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 text-[10px] uppercase">
                  <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{isEn ? 'THERMAL PRINTER CALIBRATION (PM240 / LABEL):' : 'GUIDA CALIBRAZIONE STAMPANTE (PM240 / TERMICHE):'}</span>
                </div>
                <ul className="list-disc list-inside text-[10px] text-neutral-400 space-y-0.5">
                  <li>Formato carta nel driver: <strong>{widthMm} × {heightMm} mm</strong></li>
                  <li>Nel dialogo di stampa browser: <strong>Margini: Nessuno (0 mm)</strong> e <strong>Scala: 100%</strong></li>
                  <li>Se il browser rimpicciolisce comunque: usa il pulsante <strong>PDF 1:1 CALIBRATO</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
