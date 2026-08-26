import React, { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  ChecklistItemStatus,
  EquipmentCategory,
  StationPreSessionChecklist,
  TechEquipmentChecklistItem,
} from '../types';
import {
  EQUIPMENT_CATEGORY_CONFIG,
  INITIAL_STATION_CHECKLISTS,
} from '../data/initialChecklists';
import {
  AlertOctagon,
  AlertTriangle,
  BatteryCharging,
  Check,
  CheckCircle2,
  Clock,
  Droplet,
  Edit3,
  Flame,
  Layers,
  MessageSquare,
  Package,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { CourseMessengerModal } from './messaging/CourseMessengerModal';
import { ReadyWithCriticalityModal } from './messaging/ReadyWithCriticalityModal';

interface TechSessionChecklistProps {
  initialStationId?: string;
  onClose?: () => void;
  compactMode?: boolean;
}

const STORAGE_KEY = 'trauma_sim_station_checklists';

export const TechSessionChecklist: React.FC<TechSessionChecklistProps> = ({
  initialStationId,
}) => {
  const {
    language,
    activeDay,
    technicians,
    selectedTechnicianId,
    sendCourseMessage,
    updateTechChecklist,
  } = useCourse();

  const isEn = language === 'en';

  // Load checklists from localStorage or fallback to INITIAL_STATION_CHECKLISTS
  const [stationChecklists, setStationChecklists] = useState<StationPreSessionChecklist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to load station checklists from storage', e);
      }
    }
    return INITIAL_STATION_CHECKLISTS;
  });

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stationChecklists));
      } catch (e) {
        console.warn('Failed to save station checklists', e);
      }
    }
  }, [stationChecklists]);

  // Current active technician
  const currentTech =
    technicians.find((t) => t.id === selectedTechnicianId) ||
    technicians[0] || {
      id: 'tech-1',
      name: 'Silvia Rossi',
      specialty: 'Moulage & Protesi',
      phone: '+39 333 1234567',
    };

  // State filters
  const [selectedStationId, setSelectedStationId] = useState<string>(
    initialStationId || stationChecklists[0]?.stationId || 'POST_01'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'PENDING' | 'CRITICAL_MISSING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isMessengerOpen, setIsMessengerOpen] = useState<boolean>(false);
  const [isCriticalityModalOpen, setIsCriticalityModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  const [newItemData, setNewItemData] = useState<{
    name: string;
    category: EquipmentCategory;
    description: string;
    requiredQuantity: string;
    isMandatory: boolean;
  }>({
    name: '',
    category: 'VIE_AEREE',
    description: '',
    requiredQuantity: '1 pezzo',
    isMandatory: true,
  });

  const activeStation =
    stationChecklists.find((s) => s.stationId === selectedStationId) ||
    stationChecklists[0];

  // Helper to calculate readiness
  const calculateStationReadiness = (items: TechEquipmentChecklistItem[]): number => {
    if (!items || items.length === 0) return 100;
    const readyCount = items.filter((i) => i.status === 'READY').length;
    return Math.round((readyCount / items.length) * 100);
  };

  // Toggle individual item status
  const handleToggleItemStatus = (stationId: string, itemId: string, newStatus: ChecklistItemStatus) => {
    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== stationId) return station;

        const updatedItems = station.items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        );

        const newScore = calculateStationReadiness(updatedItems);
        const isAllReady = updatedItems.every((i) => i.status === 'READY');

        return {
          ...station,
          items: updatedItems,
          readinessScore: newScore,
          isFullyCertified: isAllReady ? station.isFullyCertified : false,
        };
      })
    );
  };

  // Update item note
  const handleUpdateItemNote = (stationId: string, itemId: string, noteText: string) => {
    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== stationId) return station;
        return {
          ...station,
          items: station.items.map((item) =>
            item.id === itemId ? { ...item, notes: noteText } : item
          ),
        };
      })
    );
  };

  // Batch action: Mark all items as READY
  const handleBatchMarkAllReady = (stationId: string) => {
    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== stationId) return station;
        const updatedItems = station.items.map((item) => ({
          ...item,
          status: 'READY' as ChecklistItemStatus,
        }));
        return {
          ...station,
          items: updatedItems,
          readinessScore: 100,
        };
      })
    );
  };

  // Reset checklist for station
  const handleResetStationChecklist = (stationId: string) => {
    if (confirm('Reimpostare la checklist di questa postazione allo stato iniziale?')) {
      const original = INITIAL_STATION_CHECKLISTS.find((s) => s.stationId === stationId);
      if (original) {
        setStationChecklists((prev) =>
          prev.map((s) => (s.stationId === stationId ? { ...original } : s))
        );
      }
    }
  };

  // 1. TASTO PRONTO (LUCE VERDE 🟢) -> Invia segnale alla regia di Luce Verde al 100%
  const handleSendGreenLightSignal = (stationId: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Mark station as green light and all items as READY
    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== stationId) return station;
        const allReadyItems = station.items.map((it) => ({
          ...it,
          status: 'READY' as ChecklistItemStatus,
        }));
        return {
          ...station,
          items: allReadyItems,
          readinessScore: 100,
          isFullyCertified: true,
          certifiedBy: currentTech.name,
          certifiedAt: timeStr,
          signalStatus: 'GREEN_LIGHT',
          signalSentAt: timeStr,
          signalNotes: 'Postazione verificata e conforme al 100%. Via libera allo scenario.',
        };
      })
    );

    // Sync with patient techChecklist in CourseContext
    if (activeStation.patientId) {
      updateTechChecklist(
        activeStation.patientId,
        'preDone',
        true,
        `🟢 LUCE VERDE confermata da ${currentTech.name} alle ${timeStr}`
      );
    }

    // Send course message to Regia / Direction feed
    sendCourseMessage({
      senderId: currentTech.id,
      senderRole: 'tecnico',
      senderName: currentTech.name,
      senderStation: activeStation.stationName,
      type: 'info',
      subject: `🟢 LUCE VERDE: ${activeStation.stationName} - PRONTO AL 100%`,
      content: `La postazione ${activeStation.stationName} è stata verificata e convalidata con successo da ${currentTech.name} alle ${timeStr}. Tutti i presidi, manichini, circuiti di sangue e trucco sono pronti. Via libera per lo scenario.`,
    });

    setBannerFeedback(`🟢 Segnale LUCE VERDE inviato alla Regia alle ore ${timeStr}!`);
    setTimeout(() => setBannerFeedback(null), 6000);
  };

  // 2. TASTO PRONTO CON CRITICITÀ (LUCE GIALLA ⚠️) -> Confermato tramite modal
  const handleConfirmCriticalitySignal = (
    notes: string,
    severity: 'MODERATA' | 'ATTENZIONE',
    selectedTags: string[]
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Update station state with yellow warning
    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== activeStation.stationId) return station;
        return {
          ...station,
          isFullyCertified: true,
          certifiedBy: `${currentTech.name} (con riserva)`,
          certifiedAt: timeStr,
          signalStatus: 'YELLOW_WARNING',
          signalSentAt: timeStr,
          signalNotes: notes,
        };
      })
    );

    // Sync with patient techChecklist in CourseContext
    if (activeStation.patientId) {
      updateTechChecklist(
        activeStation.patientId,
        'preDone',
        true,
        `⚠️ OK CON CRITICITÀ (${timeStr}): ${notes}`
      );
    }

    // Send warning message to Regia & Direction
    sendCourseMessage({
      senderId: currentTech.id,
      senderRole: 'tecnico',
      senderName: currentTech.name,
      senderStation: activeStation.stationName,
      type: 'warning',
      subject: `⚠️ LUCE GIALLA: ${activeStation.stationName} - PRONTO CON CRITICITÀ`,
      content: `La postazione ${activeStation.stationName} è stata validata con SEGNALE DI OK CON CRITICITÀ [Livello: ${severity}] da ${currentTech.name} alle ${timeStr}.\n\nCriticità segnalate:\n${notes}\n\nLo scenario può procedere con le dovute riserve comunicate ai docenti/tutor.`,
    });

    setBannerFeedback(
      `⚠️ Segnale OK CON CRITICITÀ (Luce Gialla) trasmesso alla Regia alle ore ${timeStr}.`
    );
    setTimeout(() => setBannerFeedback(null), 7000);
  };

  // Add custom equipment item
  const handleAddNewItem = () => {
    if (!newItemData.name.trim()) return;

    const newItem: TechEquipmentChecklistItem = {
      id: `custom-item-${Date.now()}`,
      name: newItemData.name.trim(),
      category: newItemData.category,
      description: newItemData.description.trim() || 'Presidio aggiunto dal tecnico.',
      requiredQuantity: newItemData.requiredQuantity.trim() || '1 pezzo',
      status: 'PENDING',
      isMandatoryForGoLive: newItemData.isMandatory,
    };

    setStationChecklists((prev) =>
      prev.map((station) => {
        if (station.stationId !== selectedStationId) return station;
        const updated = [...station.items, newItem];
        return {
          ...station,
          items: updated,
          readinessScore: calculateStationReadiness(updated),
          isFullyCertified: false,
        };
      })
    );

    setIsAddItemModalOpen(false);
    setNewItemData({
      name: '',
      category: 'VIE_AEREE',
      description: '',
      requiredQuantity: '1 pezzo',
      isMandatory: true,
    });
  };

  // Filter items in active station
  const filteredItems = activeStation.items.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      return matchName || matchDesc || matchNotes;
    }
    return true;
  });

  const readyItemsCount = activeStation.items.filter((i) => i.status === 'READY').length;
  const missingItemsCount = activeStation.items.filter((i) => i.status === 'CRITICAL_MISSING').length;

  return (
    <div id="tech-session-checklist-container" className="space-y-4 sm:space-y-5">
      {/* Visual Feedback Banner */}
      {bannerFeedback && (
        <div className="bg-neutral-900 border-2 border-amber-400 p-3.5 flex items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-white">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>{bannerFeedback}</span>
          </div>
          <button
            onClick={() => setBannerFeedback(null)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sleek Header & Station Bar */}
      <div className="bg-neutral-950 border-2 border-orange-500 p-4 sm:p-5 shadow-xl space-y-4">
        {/* Title and stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-neutral-800 pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-orange-500 text-black text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Wrench className="w-3.5 h-3.5" />
                {isEn ? 'STATIONS CHECKLIST & COMMAND SIGNALS' : 'CHECKLIST POSTAZIONI & SEGNALI REGIA'}
              </span>
              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {stationChecklists.length} {isEn ? 'STATIONS' : 'POSTAZIONI'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              {isEn ? 'Rapid Equipment Verification & GO-LIVE Signal' : 'Verifica Rapida Presidi & Segnale al GO-LIVE'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                {isEn ? 'STATIONS STATUS' : 'STATO POSTAZIONI'}
              </span>
              <div className="text-sm font-mono font-black text-orange-400">
                {stationChecklists.filter((s) => s.isFullyCertified).length} / {stationChecklists.length} {isEn ? 'VALIDATED' : 'CONVALIDATE'}
              </div>
            </div>
          </div>
        </div>

        {/* Station Tabs Selector (Sleek Horizontal Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {stationChecklists.map((s) => {
            const isSelected = s.stationId === selectedStationId;
            const hasMissing = s.items.some((i) => i.status === 'CRITICAL_MISSING');
            const isGreen = s.signalStatus === 'GREEN_LIGHT' || (s.isFullyCertified && !s.signalStatus);
            const isYellow = s.signalStatus === 'YELLOW_WARNING';

            return (
              <button
                key={s.stationId}
                id={`tab-station-${s.stationId}`}
                onClick={() => setSelectedStationId(s.stationId)}
                className={`flex-shrink-0 px-3.5 py-2 text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <span className="text-xs font-mono font-black uppercase truncate max-w-[170px]">
                    {s.stationName.split('(')[0].trim()}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.2 uppercase ${
                      isGreen
                        ? 'bg-emerald-600 text-white'
                        : isYellow
                        ? 'bg-amber-500 text-black'
                        : hasMissing
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {isGreen ? (isEn ? '🟢 READY' : '🟢 PRONTO') : isYellow ? (isEn ? '⚠️ WARNING' : '⚠️ RISERVA') : hasMissing ? (isEn ? '🔴 MISSING' : '🔴 MANCANTE') : `${s.readinessScore}%`}
                  </span>
                </div>
                <div
                  className={`text-[10px] font-mono truncate max-w-[170px] ${
                    isSelected ? 'text-neutral-700' : 'text-neutral-500'
                  }`}
                >
                  {s.scenarioRef.split('-')[0].trim()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE STATION MAIN PANEL */}
      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-6 shadow-xl space-y-5">
        {/* Top Header of Active Station + THE TWO PROMINENT ACTION BUTTONS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-neutral-950 text-orange-400 border border-orange-500/50 text-[10px] font-mono font-black uppercase">
                {activeStation.stationId} • {activeStation.sessionPeriod.toUpperCase()}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {isEn ? 'Assigned Technician' : 'Tecnico Incaricato'}: <strong className="text-white">{activeStation.assignedTechName}</strong>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {activeStation.stationName}
            </h3>
            <p className="text-xs text-neutral-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>{activeStation.scenarioRef}</span>
            </p>
          </div>

          {/* TWO PRIMARY LIGHT BUTTONS (🟢 PRONTO / ⚠️ PRONTO CON CRITICITÀ) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* 1. BUTTON PRONTO (LUCE VERDE) */}
            <button
              id="btn-station-green-light"
              onClick={() => handleSendGreenLightSignal(activeStation.stationId)}
              className="flex-1 sm:flex-initial min-h-[46px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider border-2 border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/50 group"
              title={isEn ? 'Send Green Light signal to Command: station 100% ready' : 'Invia segnale di Luce Verde alla Regia: postazione 100% pronta'}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>{isEn ? 'READY (GREEN LIGHT 🟢)' : 'PRONTO (LUCE VERDE 🟢)'}</span>
            </button>

            {/* 2. BUTTON PRONTO CON CRITICITÀ (LUCE GIALLA) */}
            <button
              id="btn-station-yellow-light"
              onClick={() => setIsCriticalityModalOpen(true)}
              className="flex-1 sm:flex-initial min-h-[46px] px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black text-xs uppercase tracking-wider border-2 border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-900/50"
              title={isEn ? 'Open dialog to send Ready with Warnings signal to Command' : 'Apre finestra per inviare segnale di OK con criticità alla Regia'}
            >
              <AlertTriangle className="w-4 h-4 text-black" />
              <span>{isEn ? 'READY WITH WARNINGS ⚠️' : 'PRONTO CON CRITICITÀ ⚠️'}</span>
            </button>
          </div>
        </div>

        {/* ACTIVE SIGNAL STATUS CALLOUT (If already sent) */}
        {activeStation.signalStatus && (
          <div
            className={`p-3 border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
              activeStation.signalStatus === 'GREEN_LIGHT'
                ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                : 'bg-amber-950/70 border-amber-500 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-1.5 font-black text-black ${
                  activeStation.signalStatus === 'GREEN_LIGHT' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              >
                {activeStation.signalStatus === 'GREEN_LIGHT' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="font-black text-xs uppercase tracking-wider block">
                  {activeStation.signalStatus === 'GREEN_LIGHT'
                    ? (isEn ? 'SIGNAL SENT: 🟢 GREEN LIGHT (STATION 100% CONFIRMED)' : 'SEGNALE INVIATO: 🟢 LUCE VERDE (POSTAZIONE CONFERMATA AL 100%)')
                    : (isEn ? 'SIGNAL SENT: ⚠️ OK WITH WARNINGS (COMMAND NOTIFIED)' : 'SEGNALE INVIATO: ⚠️ OK CON CRITICITÀ (REGIA NOTIFICATA)')}
                </span>
                <p className="text-[11px] text-neutral-300 font-mono">
                  {isEn ? 'Transmitted at' : 'Trasmesso alle ore'} {activeStation.signalSentAt || activeStation.certifiedAt} • {activeStation.signalNotes || (isEn ? 'No additional notes' : 'Nessuna nota aggiuntiva')}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono uppercase bg-black/50 px-2 py-1 border border-neutral-700">
              {isEn ? 'Logged at Command' : 'Registrato in Regia'}
            </span>
          </div>
        )}

        {/* QUICK HARDWARE & PREP METRICS (Lean) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-950 p-3 border border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block truncate">{isEn ? 'MANNEQUIN BATTERY' : 'BATTERIA MANICHINO'}</span>
              <strong className="text-white font-mono">{activeStation.simulatedMannequinBatteryPct || 90}% (OK)</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block truncate">{isEn ? 'SYNTHETIC BLOOD' : 'SANGUE SINTETICO'}</span>
              <strong className="text-white font-mono">{activeStation.simulatedBloodReservoirMl || 800} ml</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block truncate">{isEn ? 'VALIDATED ITEMS' : 'PRESIDI CONVALIDATI'}</span>
              <strong className="text-white font-mono">{readyItemsCount} / {activeStation.items.length} ({activeStation.readinessScore}%)</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-neutral-400 block truncate">{isEn ? 'TECH NOTES' : 'NOTE TECNICHE'}</span>
              <span className="text-neutral-300 font-mono truncate block text-[11px]">{activeStation.stationNotes || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* STREAMLINED CHECKLIST CONTROLS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-neutral-950/70 p-2.5 border border-neutral-800">
          {/* Category Filter & Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              id="filter-checklist-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">{isEn ? `ALL EQUIPMENT (${activeStation.items.length})` : `TUTTI I PRESIDI (${activeStation.items.length})`}</option>
              {Object.entries(EQUIPMENT_CATEGORY_CONFIG).map(([key, conf]) => {
                const count = activeStation.items.filter((i) => i.category === key).length;
                return (
                  <option key={key} value={key}>
                    {conf.icon} {conf.label} ({count})
                  </option>
                );
              })}
            </select>

            {/* Quick Status Pill Filters */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-neutral-200 text-black border-white'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                }`}
              >
                {isEn ? 'All' : 'Tutti'}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('READY')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                  statusFilter === 'READY'
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-neutral-900 text-emerald-400 border-neutral-800'
                }`}
              >
                {isEn ? `Ready (${readyItemsCount})` : `Pronti (${readyItemsCount})`}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CRITICAL_MISSING')}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase border cursor-pointer ${
                  statusFilter === 'CRITICAL_MISSING'
                    ? 'bg-red-600 text-white border-red-400'
                    : 'bg-neutral-900 text-red-400 border-neutral-800'
                }`}
              >
                {isEn ? `Missing (${missingItemsCount})` : `Mancanti (${missingItemsCount})`}
              </button>
            </div>
          </div>

          {/* Quick Actions (Batch Ready + Search) */}
          <div className="flex items-center gap-2">
            <button
              id="btn-batch-all-ready"
              onClick={() => handleBatchMarkAllReady(activeStation.stationId)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 font-bold text-xs uppercase border border-neutral-700 cursor-pointer flex items-center gap-1 flex-shrink-0"
              title={isEn ? 'Mark all equipment for this station as ready with 1 click' : 'Segna tutti i presidi di questa postazione come pronti con 1 click'}
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'MARK ALL READY' : 'SEGNA TUTTI PRONTI'}</span>
            </button>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isEn ? 'Search...' : 'Cerca...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 pl-7 pr-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={() => setIsAddItemModalOpen(true)}
              className="p-1.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs cursor-pointer flex-shrink-0"
              title={isEn ? 'Add custom equipment' : 'Aggiungi presidio personalizzato'}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STREAMLINED CHECKLIST ITEMS LIST */}
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center bg-neutral-950 border border-neutral-800 space-y-1.5">
              <Package className="w-6 h-6 text-neutral-600 mx-auto" />
              <p className="text-xs font-bold text-neutral-400 uppercase">
                {isEn ? 'No equipment found for the selected filters' : 'Nessun presidio trovato per i filtri selezionati'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const catConfig =
                EQUIPMENT_CATEGORY_CONFIG[item.category] ||
                EQUIPMENT_CATEGORY_CONFIG.VIE_AEREE;

              return (
                <div
                  key={item.id}
                  id={`item-row-${item.id}`}
                  className={`p-3 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.status === 'READY'
                      ? 'bg-neutral-950/90 border-emerald-900/50 hover:border-emerald-700'
                      : item.status === 'CRITICAL_MISSING'
                      ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {/* Left: Item Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.2 border ${catConfig.badgeBg} ${catConfig.borderColor}`}
                      >
                        {catConfig.icon} {catConfig.label}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.2 border border-neutral-800">
                        {isEn ? 'Qty' : 'Q.tà'}: <strong className="text-neutral-200">{item.requiredQuantity}</strong>
                      </span>
                      {item.isMandatoryForGoLive && (
                        <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 bg-red-950 text-red-300 border border-red-800">
                          GO-LIVE
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{item.description}</p>

                    {/* Fast inline note edit */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Edit3 className="w-2.5 h-2.5 text-neutral-500 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder={isEn ? 'Technical note...' : 'Nota tecnica...'}
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateItemNote(activeStation.stationId, item.id, e.target.value)}
                        className="bg-transparent border-none text-[10px] text-neutral-300 font-mono focus:outline-hidden placeholder-neutral-600 w-full"
                      />
                    </div>
                  </div>

                  {/* Right: Rapid 1-Click Status Selector */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItemStatus(activeStation.stationId, item.id, 'READY')}
                      className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                        item.status === 'READY'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800 hover:text-emerald-400'
                      }`}
                      title={isEn ? 'Mark item as ready' : 'Segna presidio come pronto'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isEn ? 'READY' : 'PRONTO'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleItemStatus(activeStation.stationId, item.id, 'PENDING')}
                      className={`px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                        item.status === 'PENDING'
                          ? 'bg-neutral-700 text-white border-neutral-500'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                      }`}
                      title={isEn ? 'Item pending verification' : 'Presidio in fase di verifica'}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{isEn ? 'PENDING' : 'DA FARE'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleItemStatus(activeStation.stationId, item.id, 'CRITICAL_MISSING')}
                      className={`px-2.5 py-1.5 text-xs font-black uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-1 ${
                        item.status === 'CRITICAL_MISSING'
                          ? 'bg-red-600 text-white border-red-400 animate-pulse'
                          : 'bg-neutral-900 text-red-400/80 border-neutral-800 hover:bg-neutral-800 hover:text-red-400'
                      }`}
                      title={isEn ? 'Mark item as missing' : 'Segna presidio come mancante'}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{isEn ? 'MISSING' : 'MANCANTE'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs">
          <button
            onClick={() => handleResetStationChecklist(activeStation.stationId)}
            className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isEn ? 'Reset checklist status' : 'Reimposta stato checklist'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendGreenLightSignal(activeStation.stationId)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isEn ? 'CONFIRM GREEN LIGHT 🟢' : 'CONFERMA LUCE VERDE 🟢'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add New Equipment Item */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-neutral-900 border-2 border-orange-500 p-5 max-w-md w-full shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-orange-500" />
                <span>{isEn ? `ADD EQUIPMENT TO ${activeStation.stationId}` : `AGGIUNGI PRESIDIO A ${activeStation.stationId}`}</span>
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                  {isEn ? 'Equipment / Device Name *' : 'Nome Presidio / Dispositivo *'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. Ultrasound probe, Backup cric set...' : 'Es. Sonda ecografica, Set crico di riserva...'}
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    {isEn ? 'Category' : 'Categoria'}
                  </label>
                  <select
                    value={newItemData.category}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, category: e.target.value as EquipmentCategory })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 px-2.5 py-2 text-xs text-white focus:outline-hidden cursor-pointer"
                  >
                    {Object.entries(EQUIPMENT_CATEGORY_CONFIG).map(([key, conf]) => (
                      <option key={key} value={key}>
                        {conf.icon} {conf.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                    {isEn ? 'Quantity' : 'Quantità'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. 2 pcs' : 'Es. 2 pezzi'}
                    value={newItemData.requiredQuantity}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, requiredQuantity: e.target.value })
                    }
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                  {isEn ? 'Description & Instructions' : 'Descrizione & Istruzioni'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isEn ? 'Setup notes...' : 'Note allestimento...'}
                  value={newItemData.description}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, description: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2.5 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-3.5 py-1.5 bg-neutral-800 text-neutral-300 text-xs font-bold uppercase hover:bg-neutral-700"
              >
                {isEn ? 'Cancel' : 'Annulla'}
              </button>
              <button
                type="button"
                onClick={handleAddNewItem}
                className="px-3.5 py-1.5 bg-orange-500 text-black text-xs font-black uppercase hover:bg-orange-400 cursor-pointer"
              >
                {isEn ? 'Save Equipment' : 'Salva Presidio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ready With Criticality (Luce Gialla ⚠️) */}
      <ReadyWithCriticalityModal
        isOpen={isCriticalityModalOpen}
        onClose={() => setIsCriticalityModalOpen(false)}
        stationName={activeStation.stationName}
        scenarioRef={activeStation.scenarioRef}
        techName={currentTech.name}
        onConfirm={handleConfirmCriticalitySignal}
      />

      {/* Course Messenger Modal for General Communication */}
      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        defaultSubject="Segnalazione Tecnica / Allestimento"
        defaultStation={activeStation.stationName}
      />
    </div>
  );
};
