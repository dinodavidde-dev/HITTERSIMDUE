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
  LABELNIZE_PM240_CONFIG,
} from '../../utils/thermalLabelGenerator';
import { getTeamCodeName } from '../../utils/teamUtils';

interface ThermalLabelGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPerson?: AnyParticipant | null;
  initialCategory?: ParticipantCategory;
}

export const ThermalLabelGeneratorModal: React.FC<ThermalLabelGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialPerson,
  initialCategory = 'discenti',
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
  const [labelSize, setLabelSize] = useState<LabelSizeOption>('50x80');
  const [orientation, setOrientation] = useState<LabelOrientation>('portrait');
  const [dpi, setDpi] = useState<ThermalDpi>(300);

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

  // Render canvas whenever person or config changes
  useEffect(() => {
    if (!isOpen || !selectedPerson) return;

    let isMounted = true;
    setIsRendering(true);

    const config: ThermalLabelConfig = {
      size: labelSize,
      orientation,
      dpi,
      printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
      includeHeader: true,
      includeFooter: true,
    };

    renderThermalLabelToCanvas(selectedPerson, selectedCategory, config, currentTeamName)
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
  }, [isOpen, selectedPerson, selectedCategory, labelSize, orientation, dpi, currentTeamName]);

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
    dpi
  );

  // Single download handler
  const handleDownloadSingle = async () => {
    if (!selectedPerson) return;
    try {
      await downloadThermalLabelJpg(
        selectedPerson,
        selectedCategory,
        {
          size: labelSize,
          orientation,
          dpi,
          printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
        },
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
        {
          size: labelSize,
          orientation,
          dpi,
          printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
        },
        currentTeamName
      );
    } catch (e) {
      console.error('Error downloading 1:1 PDF label:', e);
    }
  };

  // Direct print handler
  const handlePrint = () => {
    if (!previewCanvas) return;
    printThermalLabel(previewCanvas, labelSize, orientation);
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
        {
          size: labelSize,
          orientation,
          dpi,
          printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
        },
        (current, total, name) => {
          setBatchProgress({ current, total, currentName: name });
        }
      );

      const sizeStr = `${labelSize}mm`;
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
          {
            size: labelSize,
            orientation,
            dpi,
            printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
          },
          item.teamName
        );
        canvases.push({ canvas, name: item.person.name });
      }

      printBatchThermalRoll(canvases, labelSize, orientation);
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
          {
            size: labelSize,
            orientation,
            dpi,
            printerModel: labelSize === '40x30' && dpi === 203 ? 'pm240' : 'generic',
          },
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
                  <span>{isEn ? 'LABEL DIMENSIONS & SETTINGS' : 'DIMENSIONI & RISOLUZIONE ETICHETTA'}</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">
                  {pixelWidth} × {pixelHeight} px ({widthMm} × {heightMm} mm)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Size Choice: 50x80 vs 40x30 */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {isEn ? 'Label Size:' : 'Formato Adesivo:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setLabelSize('50x80');
                        setOrientation('portrait');
                      }}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        labelSize === '50x80'
                          ? 'bg-amber-500 text-black shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      50 × 80 mm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLabelSize('40x30');
                        setOrientation('landscape');
                      }}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        labelSize === '40x30'
                          ? 'bg-amber-500 text-black shadow'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      40 × 30 mm
                    </button>
                  </div>
                </div>

                {/* 2. Orientation */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {isEn ? 'Orientation:' : 'Orientamento:'}
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 rounded border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        orientation === 'portrait'
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isEn ? 'Vert.' : 'Verticale'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`px-2 py-1.5 text-xs font-black uppercase rounded transition-all cursor-pointer ${
                        orientation === 'landscape'
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isEn ? 'Horiz.' : 'Orizzontale'}
                    </button>
                  </div>
                </div>

                {/* 3. Thermal Print Density (DPI) */}
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
              </div>

              {/* Quick Hardware Profile: Labelnize PM240 */}
              <div className="pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => {
                    setLabelSize('40x30');
                    setOrientation('landscape');
                    setDpi(203);
                  }}
                  className={`w-full py-1.5 px-3 text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer rounded ${
                    labelSize === '40x30' && orientation === 'landscape' && dpi === 203
                      ? 'bg-amber-950/80 text-amber-200 border-amber-400 ring-1 ring-amber-400/50 shadow'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-amber-500/50 hover:text-white'
                  }`}
                  title={isEn ? 'Activate Labelnize PM240 calibrated profile (40x30mm, 203 DPI, 1.5mm margins)' : 'Attiva profilo calibrato per stampante Labelnize PM240 (40x30mm, 203 DPI, margini 1.5mm)'}
                >
                  <div className="flex items-center gap-2">
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono font-bold">PROFILO LABELNIZE PM240</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 text-amber-300 border border-amber-800 rounded">
                    {labelSize === '40x30' && orientation === 'landscape' && dpi === 203
                      ? '✓ ATTIVO (40×30 / 203 DPI)'
                      : '40×30 mm • 203 DPI'}
                  </span>
                </button>

                {labelSize === '40x30' && (
                  <div className="mt-2 p-2.5 bg-neutral-900/90 border border-amber-500/40 text-neutral-300 space-y-1.5 text-xs font-mono rounded">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RAPPORTO 1:1 CALIBRATO 40 × 30 MM</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold">PDF VETTORIALE 1:1 ATTIVO</span>
                    </div>
                    <div className="text-[11px] space-y-0.5 text-neutral-300 font-sans">
                      <p>• <strong>Geometria PDF 1:1</strong>: Pagina PDF bloccata a <strong>40.0 × 30.0 mm</strong> esatti con direttiva <code>/PrintScaling None</code> per impedire il rimpicciolimento automatico del visualizzatore.</p>
                      <p>• <strong>Risoluzione</strong>: {pixelWidth} × {pixelHeight} px ({dpi} DPI • 1.5mm margine anti-ritaglio).</p>
                      <p>• <strong>Driver Stampante</strong>: Selezionare formato <em>40×30 mm</em>, scala <em>100% (Effettiva)</em>, margini <em>Nessuno (0 mm)</em>.</p>
                    </div>
                  </div>
                )}
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
              <span className="text-[10px] text-neutral-400 font-mono">
                {widthMm} × {heightMm} mm
              </span>
            </div>

            {/* Canvas Preview Area with pure white background simulator */}
            <div className="flex-1 w-full flex flex-col items-center justify-center py-2 min-h-[300px]">
              {isRendering ? (
                <div className="flex flex-col items-center gap-2 text-neutral-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="text-xs">{isEn ? 'Rendering label...' : 'Rendering etichetta...'}</span>
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
                    {pixelWidth} × {pixelHeight} px • {dpi} DPI • JPG Monocromatico
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
                      ? `DOWNLOAD PDF 1:1 CALIBRATED (${labelSize} MM)`
                      : `SCARICA PDF 1:1 CALIBRATO (${labelSize} MM)`}
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
