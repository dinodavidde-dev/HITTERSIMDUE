import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Printer,
  FileDown,
  Download,
  Search,
  Filter,
  CheckSquare,
  Square,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { AnyParticipant, ParticipantCategory, getParticipantPersonalPageUrl } from '../../utils/qrCodeUtils';
import {
  LabelSizeOption,
  LabelOrientation,
  ThermalDpi,
  ThermalLabelConfig,
  BatchThermalItem,
  renderThermalLabelToCanvas,
  generateMultiPagePdfForThermalRoll,
  printBatchThermalRoll,
  getThermalLabelJpgBlob,
  getLabelPixelDimensions,
  getPersonDisplayDetails,
} from '../../utils/thermalLabelGenerator';
import { getTeamCodeName } from '../../utils/teamUtils';

export const RegiaBatchLabelPrintView: React.FC = () => {
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
  } = useCourse();

  const isEn = language === 'en';

  // Label media configuration
  const [labelSize, setLabelSize] = useState<LabelSizeOption>('50x80');
  const [orientation, setOrientation] = useState<LabelOrientation>('portrait');
  const [dpi, setDpi] = useState<ThermalDpi>(300);

  // Filters & selection
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | ParticipantCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Preview roll carousel state
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isRenderingPreview, setIsRenderingPreview] = useState<boolean>(false);

  // Generation status state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationAction, setGenerationAction] = useState<'pdf' | 'print' | 'jpg' | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number; currentName: string }>({
    current: 0,
    total: 0,
    currentName: '',
  });

  // Consolidate all figures into structured directory items
  const allFigures = useMemo<BatchThermalItem[]>(() => {
    const list: BatchThermalItem[] = [];

    // 1. Discenti
    (discenti || []).forEach((d) => {
      const matchedTeam = teams.find((t) => t.id === d.teamId);
      list.push({
        person: d,
        category: 'discenti',
        teamName: matchedTeam ? getTeamCodeName(matchedTeam) : undefined,
      });
    });

    // 2. Faculty
    (faculty || []).forEach((f) => {
      const matchedTeam = teams.find((t) => t.id === f.assignedTeamId);
      list.push({
        person: f,
        category: 'faculty',
        teamName: matchedTeam ? getTeamCodeName(matchedTeam) : undefined,
      });
    });

    // 3. Technicians
    (technicians || []).forEach((t) => {
      list.push({ person: t, category: 'tecnici' });
    });

    // 4. Actors
    (actors || []).forEach((a) => {
      list.push({ person: a, category: 'attori' });
    });

    // 5. Makeup Artists
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

  // Initial selection: select first 60 discenti by default on mount
  useEffect(() => {
    if (selectedIds.size === 0 && discenti && discenti.length > 0) {
      const defaultSet = new Set<string>();
      discenti.slice(0, 60).forEach((d) => defaultSet.add(d.id));
      setSelectedIds(defaultSet);
    }
  }, [discenti]);

  // Filtered list based on role category and text query
  const filteredFigures = useMemo(() => {
    return allFigures.filter((item) => {
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
  }, [allFigures, activeCategoryFilter, searchQuery]);

  // List of selected figures maintaining original order
  const selectedFigures = useMemo(() => {
    return allFigures.filter((item) => selectedIds.has(item.person.id));
  }, [allFigures, selectedIds]);

  // Clamp preview index
  useEffect(() => {
    if (previewIndex >= selectedFigures.length) {
      setPreviewIndex(Math.max(0, selectedFigures.length - 1));
    }
  }, [selectedFigures.length, previewIndex]);

  // Current item being previewed
  const currentPreviewItem = selectedFigures[previewIndex] || selectedFigures[0] || null;

  // Render preview canvas
  useEffect(() => {
    if (!currentPreviewItem) {
      setPreviewDataUrl('');
      return;
    }

    let isMounted = true;
    setIsRenderingPreview(true);

    const config: ThermalLabelConfig = {
      size: labelSize,
      orientation,
      dpi,
      includeHeader: true,
      includeFooter: true,
    };

    renderThermalLabelToCanvas(
      currentPreviewItem.person,
      currentPreviewItem.category,
      config,
      currentPreviewItem.teamName
    )
      .then((canvas) => {
        if (!isMounted) return;
        setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.98));
        setIsRenderingPreview(false);
      })
      .catch((err) => {
        console.error('Failed to render preview canvas:', err);
        if (isMounted) setIsRenderingPreview(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPreviewItem, labelSize, orientation, dpi]);

  // Selection toggle helpers
  const togglePersonSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredFigures.forEach((f) => next.add(f.person.id));
      return next;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredFigures.forEach((f) => next.delete(f.person.id));
      return next;
    });
  };

  const selectGroupDiscenti = (group: 'ALPHA' | 'BRAVO' | 'CHARLIE' | 'DELTA') => {
    let teamMin = 1;
    let teamMax = 3;
    if (group === 'BRAVO') {
      teamMin = 4;
      teamMax = 6;
    } else if (group === 'CHARLIE') {
      teamMin = 7;
      teamMax = 9;
    } else if (group === 'DELTA') {
      teamMin = 10;
      teamMax = 12;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      (discenti || []).forEach((d) => {
        if (d.teamId >= teamMin && d.teamId <= teamMax) {
          next.add(d.id);
        }
      });
      return next;
    });
  };

  const selectCategoryExclusive = (cat: ParticipantCategory) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allFigures.forEach((f) => {
        if (f.category === cat) next.add(f.person.id);
      });
      return next;
    });
  };

  // Dimensions math
  const { widthMm, heightMm, width: pixelWidth, height: pixelHeight } = getLabelPixelDimensions(
    labelSize,
    orientation,
    dpi
  );

  // 1. Export Multi-page PDF
  const handleExportPdf = async () => {
    if (selectedFigures.length === 0) return;
    setIsGenerating(true);
    setGenerationAction('pdf');
    setProgress({ current: 0, total: selectedFigures.length, currentName: 'Inizializzazione...' });

    try {
      const doc = await generateMultiPagePdfForThermalRoll(
        selectedFigures,
        { size: labelSize, orientation, dpi },
        (current, total, name) => {
          setProgress({ current, total, currentName: name });
        }
      );

      const filename = `ETICHETTE_TERMICHE_BATCH_${selectedFigures.length}PAGINE_${labelSize}mm.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Failed to generate multi-page PDF:', e);
      alert('Errore durante la creazione del PDF multipagina: ' + (e as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationAction(null);
    }
  };

  // 2. Direct Thermal Roll Browser Print
  const handlePrintRoll = async () => {
    if (selectedFigures.length === 0) return;
    setIsGenerating(true);
    setGenerationAction('print');
    setProgress({ current: 0, total: selectedFigures.length, currentName: 'Preparazione layout termico...' });

    try {
      const canvases: { canvas: HTMLCanvasElement; name: string }[] = [];
      const config: ThermalLabelConfig = {
        size: labelSize,
        orientation,
        dpi,
        includeHeader: true,
        includeFooter: true,
      };

      for (let i = 0; i < selectedFigures.length; i++) {
        const item = selectedFigures[i];
        const name = item.person.name || 'Operatore';
        setProgress({ current: i + 1, total: selectedFigures.length, currentName: name });

        const canvas = await renderThermalLabelToCanvas(
          item.person,
          item.category,
          config,
          item.teamName
        );
        canvases.push({ canvas, name });
      }

      printBatchThermalRoll(canvases, labelSize, orientation);
    } catch (e) {
      console.error('Failed to spool thermal roll print:', e);
      alert('Errore durante la preparazione del documento di stampa: ' + (e as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationAction(null);
    }
  };

  // 3. Batch JPG Bundle Download
  const handleDownloadJpgBundle = async () => {
    if (selectedFigures.length === 0) return;
    setIsGenerating(true);
    setGenerationAction('jpg');
    setProgress({ current: 0, total: selectedFigures.length, currentName: 'Preparazione immagini JPG...' });

    try {
      const config: ThermalLabelConfig = {
        size: labelSize,
        orientation,
        dpi,
      };

      for (let i = 0; i < selectedFigures.length; i++) {
        const item = selectedFigures[i];
        const name = item.person.name || 'Operatore';
        setProgress({ current: i + 1, total: selectedFigures.length, currentName: name });

        const blob = await getThermalLabelJpgBlob(
          item.person,
          item.category,
          config,
          item.teamName
        );

        const badgeCode = (item.person as any).badgeCode || item.person.id || 'PASS';
        const cleanName = (item.person.name || 'operatore').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${String(i + 1).padStart(3, '0')}_${badgeCode}_${cleanName}_${labelSize}mm.jpg`;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        // Small breather between downloads to not choke browser download manager
        await new Promise((res) => setTimeout(res, 180));
      }
    } catch (e) {
      console.error('Failed to download JPG bundle:', e);
      alert('Errore durante il download del bundle JPG: ' + (e as Error).message);
    } finally {
      setIsGenerating(false);
      setGenerationAction(null);
    }
  };

  const isAllFilteredSelected =
    filteredFigures.length > 0 &&
    filteredFigures.every((f) => selectedIds.has(f.person.id));

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-neutral-950 border border-neutral-800 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-pink-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
              <Printer className="w-3.5 h-3.5" />
              {isEn ? 'THERMAL ROLL BATCH PRINT' : 'STAMPA BATCH ROTOLO TERMICO'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {labelSize} mm • {orientation.toUpperCase()} • {dpi} DPI
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
            {isEn ? 'Batch Label Print Console' : 'Centrale Stampa Etichette Termoadesive'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
            {isEn
              ? 'Select multiple course figures and generate a single paginated document configured for continuous thermal rolls with 1 label per page, multi-page PDF, or JPG bundle.'
              : 'Seleziona le figure del corso e genera un unico documento impaginato ottimizzato per rotolo termico continuo con 1 etichetta per pagina, PDF multipagina o bundle di immagini JPG.'}
          </p>
        </div>

        {/* Global Action Stats */}
        <div className="flex items-center gap-3 shrink-0 bg-neutral-900 border border-neutral-800 p-2.5">
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">
              {isEn ? 'SELECTED LABELS' : 'ETICHETTE SELEZIONATE'}
            </span>
            <span className="text-2xl font-black text-pink-400 font-mono tabular-nums leading-none">
              {selectedFigures.length}
            </span>
            <span className="text-[10px] text-neutral-400 block font-mono">
              / {allFigures.length} {isEn ? 'total' : 'totali'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls & Preview (Left 5 cols) vs Roster Table (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Media Config, Output Controls & Paginated Preview */}
        <div className="lg:col-span-5 space-y-4">
          {/* Format Settings Card */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {isEn ? 'Label Media & Density' : 'Formato Supporto & Risoluzione'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {widthMm}×{heightMm} mm ({pixelWidth}×{pixelHeight} px)
              </span>
            </div>

            {/* Dimension Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-neutral-300 uppercase block">
                {isEn ? 'Physical Size' : 'Dimensione Etichetta'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLabelSize('50x80');
                    setOrientation('portrait');
                  }}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                    labelSize === '50x80'
                      ? 'bg-pink-600 text-white border-pink-400 shadow-md ring-1 ring-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="font-mono text-sm font-black">50 × 80 mm</span>
                  <span className="text-[10px] opacity-80">{isEn ? 'Standard Uniform/Vest' : 'Standard Divisa / Pettorina'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLabelSize('40x30');
                    setOrientation('landscape');
                  }}
                  className={`px-3 py-2 text-xs font-black uppercase tracking-wider border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                    labelSize === '40x30'
                      ? 'bg-pink-600 text-white border-pink-400 shadow-md ring-1 ring-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="font-mono text-sm font-black">40 × 30 mm</span>
                  <span className="text-[10px] opacity-80">{isEn ? 'Compact Helmet/Equipment' : 'Compatto Elmetto / Materiale'}</span>
                </button>
              </div>

              {/* Quick Hardware Profile: Labelnize PM240 */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLabelSize('40x30');
                    setOrientation('landscape');
                    setDpi(203);
                  }}
                  className={`w-full py-2 px-3 text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer ${
                    labelSize === '40x30' && orientation === 'landscape' && dpi === 203
                      ? 'bg-cyan-950 text-cyan-200 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-cyan-500/50 hover:text-white'
                  }`}
                  title={isEn ? 'Activate Labelnize PM240 calibrated profile (40x30mm, 203 DPI, 1.5mm margins)' : 'Attiva profilo calibrato per stampante Labelnize PM240 (40x30mm, 203 DPI, margini 1.5mm)'}
                >
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold">PROFILO LABELNIZE PM240</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-950 text-cyan-300 border border-cyan-800">
                    {labelSize === '40x30' && orientation === 'landscape' && dpi === 203
                      ? '✓ ATTIVO (40×30 / 203 DPI)'
                      : '40×30 mm • 203 DPI'}
                  </span>
                </button>

                {labelSize === '40x30' && orientation === 'landscape' && dpi === 203 && (
                  <div className="mt-2 p-3 bg-neutral-900/90 border border-cyan-500/60 text-neutral-300 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                      <span className="text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CALIBRAZIONE PM240 ATTIVA (USB PC)</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">320 × 240 px • 8 dpmm</span>
                    </div>
                    <div className="text-[11px] space-y-1 text-neutral-300 font-sans">
                      <p>• <strong>Formato rotolo</strong>: 40 mm × 30 mm (4×3 cm) con avanzamento orizzontale.</p>
                      <p>• <strong>Margini anti-ritaglio</strong>: 1.5 mm di sicurezza applicati automaticamente per evitare tagli meccanici ai bordi.</p>
                      <p>• <strong>Driver USB PC</strong>: Nel driver Windows/Mac impostare carta <em>40×30 mm</em>, scala <em>100%</em> e margini <em>Nessuno (0 mm)</em>.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Orientation & DPI */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                  {isEn ? 'Orientation' : 'Orientamento'}
                </label>
                <div className="flex border border-neutral-800 bg-neutral-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase transition-all ${
                      orientation === 'portrait' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Verticale
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase transition-all ${
                      orientation === 'landscape' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Orizzontale
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">
                  {isEn ? 'Thermal Density' : 'Densità Testina'}
                </label>
                <div className="flex border border-neutral-800 bg-neutral-900 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDpi(300)}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase transition-all ${
                      dpi === 300 ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    300 DPI
                  </button>
                  <button
                    type="button"
                    onClick={() => setDpi(203)}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase transition-all ${
                      dpi === 203 ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    203 DPI
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Action Strip */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {isEn ? 'Batch Export & Print' : 'Esecuzione Stampa & Esportazione'}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                {selectedFigures.length} {isEn ? 'ready' : 'pronte'}
              </span>
            </div>

            {/* Progress indicator */}
            {isGenerating && (
              <div className="p-3 bg-neutral-900 border border-pink-500/50 space-y-2 animate-pulse">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-pink-300 font-bold uppercase flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {generationAction === 'pdf' && (isEn ? 'Compiling PDF document...' : 'Compilazione PDF multipagina...')}
                    {generationAction === 'print' && (isEn ? 'Preparing thermal roll print...' : 'Spooling rotolo termico...')}
                    {generationAction === 'jpg' && (isEn ? 'Generating JPG images...' : 'Generazione immagini JPG...')}
                  </span>
                  <span className="text-neutral-400 font-bold tabular-nums">
                    {progress.current} / {progress.total}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-2 overflow-hidden">
                  <div
                    className="bg-pink-500 h-full transition-all duration-150"
                    style={{
                      width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-mono truncate">
                  {isEn ? 'Processing' : 'Elaborazione'}: {progress.currentName}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Primary 1: Direct Thermal Roll Print */}
              <button
                type="button"
                disabled={isGenerating || selectedFigures.length === 0}
                onClick={handlePrintRoll}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-not-allowed"
                title={isEn ? 'Send batch document directly to thermal printer' : 'Invia documento batch direttamente alla stampante termica'}
              >
                <Printer className="w-4 h-4" />
                <span>{isEn ? 'Print Continuous Thermal Roll' : 'Stampa Rotolo Termico Continuo'}</span>
              </button>

              {/* Primary 2: Multi-Page PDF Download */}
              <button
                type="button"
                disabled={isGenerating || selectedFigures.length === 0}
                onClick={handleExportPdf}
                className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 text-emerald-400 border border-emerald-600 hover:border-emerald-500 disabled:opacity-50 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed"
                title={isEn ? 'Download a single multi-page PDF formatted to exact roll dimensions' : 'Scarica un unico PDF multipagina con dimensioni esatte per rotolo'}
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>{isEn ? 'Download Multi-Page PDF' : 'Scarica PDF Multipagina (Rotolo)'}</span>
              </button>

              {/* Primary 3: Batch JPG Image Bundle */}
              <button
                type="button"
                disabled={isGenerating || selectedFigures.length === 0}
                onClick={handleDownloadJpgBundle}
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-700 hover:border-neutral-600 disabled:opacity-50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                title={isEn ? 'Download individual high-res JPG labels for external thermal software' : 'Scarica singole immagini JPG per software di stampa esterni (es. Zebra, Brother)'}
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>{isEn ? 'Download JPG Image Bundle' : 'Scarica Bundle Singoli JPG'}</span>
              </button>
            </div>

            <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1">
              <p>• {isEn ? 'Continuous thermal roll: 1 label per page with strict page-break.' : 'Rotolo continuo: 1 etichetta per pagina con salto pagina automatico.'}</p>
              <p>• {isEn ? 'Each QR points to the participant live personal scenario page.' : 'Ogni QR rimanda alla pagina personale dello scenario del discente/tutor.'}</p>
            </div>
          </div>

          {/* Paginated Live Roll Preview */}
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  {isEn ? 'Continuous Roll Preview' : 'Anteprima Rotolo Pagina per Pagina'}
                </h3>
              </div>
              {selectedFigures.length > 0 && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-300">
                  <span className="text-pink-400 font-bold">{previewIndex + 1}</span>
                  <span className="text-neutral-500">/</span>
                  <span>{selectedFigures.length}</span>
                </div>
              )}
            </div>

            {selectedFigures.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs border border-dashed border-neutral-800">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                {isEn
                  ? 'No participants selected. Choose at least one figure from the list on the right.'
                  : 'Nessun partecipante selezionato. Scegli almeno una figura dalla lista a destra.'}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Roll Navigation Toolbar */}
                <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-1.5">
                  <button
                    type="button"
                    disabled={previewIndex <= 0}
                    onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1 text-neutral-300 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
                    title={isEn ? 'Previous label page' : 'Pagina etichetta precedente'}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center min-w-0 px-2">
                    <span className="text-xs font-mono font-bold text-white block truncate">
                      {currentPreviewItem
                        ? ((currentPreviewItem.person as any).badgeCode || currentPreviewItem.person.id) +
                          ' • ' +
                          currentPreviewItem.person.name
                        : ''}
                    </span>
                    <span className="text-[10px] text-pink-400 font-mono uppercase block">
                      {currentPreviewItem ? currentPreviewItem.category : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={previewIndex >= selectedFigures.length - 1}
                    onClick={() => setPreviewIndex((prev) => Math.min(selectedFigures.length - 1, prev + 1))}
                    className="p-1 text-neutral-300 hover:text-white disabled:text-neutral-600 disabled:cursor-not-allowed transition-colors"
                    title={isEn ? 'Next label page' : 'Pagina etichetta successiva'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Canvas Display Viewport */}
                <div className="bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-center min-h-[300px] overflow-hidden">
                  {isRenderingPreview ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-400 text-xs font-mono">
                      <RefreshCw className="w-5 h-5 animate-spin text-pink-500" />
                      <span>{isEn ? 'Rendering thermal label...' : 'Rendering etichetta...'}</span>
                    </div>
                  ) : previewDataUrl ? (
                    <div className="shadow-2xl border border-black bg-white p-0">
                      <img
                        src={previewDataUrl}
                        alt="Preview Etichetta"
                        className="max-h-[340px] max-w-full object-contain block image-rendering-pixelated"
                      />
                    </div>
                  ) : (
                    <span className="text-neutral-500 text-xs">{isEn ? 'Preview unavailable' : 'Anteprima non disponibile'}</span>
                  )}
                </div>

                {/* Target URL Quick Inspection */}
                {currentPreviewItem && (
                  <div className="p-2 bg-neutral-900 border border-neutral-850 text-[10px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>{isEn ? 'QR TARGET DESTINATION' : 'DESTINAZIONE LINK QR'}</span>
                      <a
                        href={getParticipantPersonalPageUrl(currentPreviewItem.person, currentPreviewItem.category)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-400 hover:underline flex items-center gap-0.5"
                      >
                        <span>{isEn ? 'Test Link' : 'Testa Link'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-neutral-300 break-all truncate">
                      {getParticipantPersonalPageUrl(currentPreviewItem.person, currentPreviewItem.category)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Participant Selection Grid & Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-neutral-950 border border-neutral-800 p-4 space-y-3 shadow-md">
            {/* Category Filter Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-pink-400" />
                  {isEn ? 'Filter by Role' : 'Filtro per Categoria & Ruolo'}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {filteredFigures.length} {isEn ? 'figures displayed' : 'figure mostrate'}
                </span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-black uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'ALL'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  {isEn ? 'All' : 'Tutti'} ({allFigures.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('discenti')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'discenti'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Discenti ({discenti?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('faculty')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'faculty'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Faculty ({faculty?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('tecnici')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'tecnici'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Tecnici ({technicians?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('attori')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'attori'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Attori ({actors?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('truccatori')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'truccatori'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Trucco ({makeupArtists?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('direttori')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'direttori'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Direzione ({directors?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('regia')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'regia'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Regia ({regiaStaff?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('ospiti')}
                  className={`px-2.5 py-1 text-xs font-bold uppercase whitespace-nowrap shrink-0 border transition-all ${
                    activeCategoryFilter === 'ospiti'
                      ? 'bg-pink-600 text-white border-pink-400'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                  }`}
                >
                  Ospiti ({guests?.length || 0})
                </button>
              </div>
            </div>

            {/* Quick Macro-Group & Selection Presets */}
            <div className="space-y-1.5 pt-1 border-t border-neutral-850">
              <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                {isEn ? 'Quick Selection Presets' : 'Selezioni Rapide per Gruppo & Ruolo'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => selectGroupDiscenti('ALPHA')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-cyan-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + GRUPPO ALPHA (01–15)
                </button>
                <button
                  type="button"
                  onClick={() => selectGroupDiscenti('BRAVO')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + GRUPPO BRAVO (16–30)
                </button>
                <button
                  type="button"
                  onClick={() => selectGroupDiscenti('CHARLIE')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border border-emerald-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + GRUPPO CHARLIE (31–45)
                </button>
                <button
                  type="button"
                  onClick={() => selectGroupDiscenti('DELTA')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-purple-300 border border-purple-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + GRUPPO DELTA (46–60)
                </button>
                <button
                  type="button"
                  onClick={() => selectCategoryExclusive('faculty')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-yellow-300 border border-yellow-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + TUTTI TUTOR (FAC)
                </button>
                <button
                  type="button"
                  onClick={() => selectCategoryExclusive('tecnici')}
                  className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-pink-300 border border-pink-800/60 text-[11px] font-mono font-bold uppercase transition-colors"
                >
                  + TUTTI TECNICI (TECH)
                </button>
              </div>
            </div>

            {/* Live Search and Select All Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-neutral-850">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search matricola, name, role...' : 'Cerca matricola (es. DISC-01), nome, ruolo...'}
                  className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={isAllFilteredSelected ? deselectAllFiltered : selectAllFiltered}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isAllFilteredSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-pink-400" />
                      <span>{isEn ? 'Deselect Filtered' : 'Deseleziona Mostrati'}</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isEn ? 'Select Filtered' : 'Seleziona Mostrati'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 text-xs font-bold uppercase transition-colors"
                  title={isEn ? 'Clear all selections' : 'Azzera tutte le selezioni'}
                >
                  {isEn ? 'Clear All' : 'Azzera'}
                </button>
              </div>
            </div>

            {/* Participant Table */}
            <div className="border border-neutral-800 max-h-[500px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead className="bg-neutral-900 text-[10px] uppercase font-bold text-neutral-400 sticky top-0 border-b border-neutral-800 z-10">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">Sel.</th>
                    <th className="py-2 px-3 w-28">Matricola</th>
                    <th className="py-2 px-3">Nome / Ruolo</th>
                    <th className="py-2 px-3">Categoria / Squadra</th>
                    <th className="py-2 px-3 w-20 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-xs font-mono">
                  {filteredFigures.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-neutral-500 font-sans">
                        {isEn ? 'No figures match the search criteria.' : 'Nessuna figura corrisponde ai criteri di ricerca.'}
                      </td>
                    </tr>
                  ) : (
                    filteredFigures.map((item) => {
                      const id = item.person.id;
                      const isSelected = selectedIds.has(id);
                      const display = getPersonDisplayDetails(item.person, item.category, item.teamName);

                      return (
                        <tr
                          key={id}
                          onClick={() => togglePersonSelection(id)}
                          className={`transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-pink-950/30 hover:bg-pink-950/50 text-white'
                              : 'bg-neutral-950 hover:bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => togglePersonSelection(id)}
                              className="text-pink-400 hover:text-pink-300 p-0.5 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 fill-pink-600 text-white" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-600 hover:text-neutral-400" />
                              )}
                            </button>
                          </td>

                          {/* Matricola Code */}
                          <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 text-[11px] font-mono border ${
                                isSelected
                                  ? 'bg-pink-600 text-white border-pink-400'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                              }`}
                            >
                              {display.badgeCode}
                            </span>
                          </td>

                          {/* Name & Role */}
                          <td className="py-2 px-3 min-w-0">
                            <div className="font-bold text-white truncate font-sans text-xs sm:text-sm">
                              {display.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate font-sans">
                              {display.roleTitle}
                            </div>
                          </td>

                          {/* Category & Squadra */}
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="text-[10px] uppercase font-bold text-pink-400 block font-mono">
                              {display.categoryLabel}
                            </span>
                            <span className="text-[10px] text-neutral-400 truncate block font-sans">
                              {display.subDetails || '—'}
                            </span>
                          </td>

                          {/* Preview Selector */}
                          <td className="py-2 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isSelected) {
                                  togglePersonSelection(id);
                                }
                                const targetIdx = selectedFigures.findIndex((f) => f.person.id === id);
                                if (targetIdx >= 0) setPreviewIndex(targetIdx);
                              }}
                              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 text-[10px] font-bold uppercase transition-colors"
                              title={isEn ? 'Preview this label' : 'Visualizza anteprima'}
                            >
                              Anteprima
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Counter Strip */}
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-1">
              <span>
                {isEn ? 'Total selected in batch document' : 'Totale selezionati nel documento'}:{' '}
                <strong className="text-pink-400 tabular-nums">{selectedFigures.length}</strong>
              </span>
              <span>
                {labelSize} mm ({orientation})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
