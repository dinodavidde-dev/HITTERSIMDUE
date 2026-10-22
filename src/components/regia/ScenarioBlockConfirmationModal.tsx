import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Play,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  Radio,
  MapPin,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { getMacroBlockInfo, getMacroBlockStationAllocations } from '../../utils/macroBlockHelper';
import { GroupType } from '../../types';

export const ScenarioBlockConfirmationModal: React.FC = () => {
  const {
    currentSlot,
    isMacroBlockAwaitingAuth,
    isScenarioBlockConfirmationModalOpen,
    setIsScenarioBlockConfirmationModalOpen,
    authorizeScenarioBlockStart,
    userRole,
    openedByRole,
    language,
    teams,
    faculty,
    technicians,
  } = useCourse();

  const isEn = language === 'en';
  const isAdmin =
    userRole === 'regia' ||
    userRole === 'direttore' ||
    userRole === 'master' ||
    openedByRole === 'regia' ||
    openedByRole === 'direttore' ||
    openedByRole === 'master';

  const [hasCheckedStations, setHasCheckedStations] = useState<boolean>(false);

  const blockInfo = getMacroBlockInfo(currentSlot);

  if (!isMacroBlockAwaitingAuth || !isAdmin || !blockInfo.isMacroBlock || !isScenarioBlockConfirmationModalOpen) {
    return null;
  }

  const stationAllocations = getMacroBlockStationAllocations(currentSlot);

  const handleConfirmStart = () => {
    const badge = userRole === 'master' ? 'MASTER-01' : userRole === 'direttore' ? 'DIR-01' : 'REGIA-01';
    authorizeScenarioBlockStart(currentSlot.id, badge);
  };

  const GROUP_COLORS: Record<GroupType, { border: string; bg: string; text: string; badge: string }> = {
    A: { border: 'border-red-500', bg: 'bg-red-950/40', text: 'text-red-400', badge: 'bg-red-600' },
    B: { border: 'border-blue-500', bg: 'bg-blue-950/40', text: 'text-blue-400', badge: 'bg-blue-600' },
    C: { border: 'border-emerald-500', bg: 'bg-emerald-950/40', text: 'text-emerald-400', badge: 'bg-emerald-600' },
    D: { border: 'border-yellow-500', bg: 'bg-yellow-950/40', text: 'text-yellow-400', badge: 'bg-yellow-600' },
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-mono">
      <div className="bg-neutral-950 border-3 border-orange-500 max-w-3xl w-full rounded-xl shadow-[0_0_50px_rgba(249,115,22,0.4)] overflow-hidden space-y-0 text-neutral-100 relative">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 p-3 sm:p-4 text-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest block opacity-90">
                {isEn ? `ROTATIONAL BLOCK ${blockInfo.blockNumber}/4 • TIMELINE LOCKED` : `BLOCCO ROTAZIONALE ${blockInfo.blockNumber}/4 • TIMELINE BLOCCATA`}
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight leading-none text-black">
                {currentSlot.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-black text-orange-400 font-mono text-xs font-black rounded border border-black/40">
              {currentSlot.timeRange}
            </span>
            <button
              type="button"
              onClick={() => setIsScenarioBlockConfirmationModalOpen(false)}
              className="p-1.5 bg-black/30 hover:bg-black/50 text-black hover:text-white rounded transition-colors cursor-pointer"
              title={isEn ? 'Minimize / review dashboard' : 'Riduci a icona / consulta dashboard'}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Standby Alert Banner */}
          <div className="p-3.5 bg-orange-950/40 border border-orange-500/70 rounded-lg text-orange-200 flex items-start gap-3">
            <Radio className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <strong className="text-sm font-black uppercase text-orange-300 block">
                {isEn ? 'TIMELINE LOCKED IN ACTIVE STANDBY (T0)' : 'TIMELINE BLOCCATA IN STANDBY ATTIVO (T0)'}
              </strong>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {isEn
                  ? 'All 4 training room stations are on standby. Teams are in position with assigned roles and briefing visible, but the phase timer will not begin until Regia gives the official start confirmation.'
                  : 'Tutte le 4 stazioni addestrative sono congelate a T0. Le squadre sono posizionate con ruoli e briefing visibili sui tablet, ma il timer non scorrerà finché la Regia non autorizza l\'avvio ufficiale.'}
              </p>
            </div>
          </div>

          {/* 4 Group Stations Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 uppercase font-black tracking-wider">
                {isEn ? 'Parallel 4-Group Station Allocations' : 'Allocazione 4 Macro-Gruppi in Parallelo (90 min)'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">
                {isEn ? 'Handover SBAR strictly at minute :30' : 'Handover SBAR tassativo al minuto :30'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {stationAllocations.map((alloc) => {
                const color = GROUP_COLORS[alloc.group];
                return (
                  <div
                    key={alloc.group}
                    className={`p-3 bg-neutral-900 border-2 ${color.border} rounded-lg space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-xs text-white ${color.badge}`}>
                          {alloc.group}
                        </span>
                        <span className="font-black text-xs text-white uppercase tracking-tight">
                          GRUPPO {alloc.group}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span className="truncate max-w-[140px]">{alloc.location}</span>
                      </span>
                    </div>

                    <div className="text-[11px] space-y-0.5">
                      <div className="font-bold text-neutral-200">
                        {alloc.activityTitle}
                      </div>
                      <div className="text-neutral-400 text-[10px] truncate">
                        {alloc.activitySubtitle}
                      </div>
                    </div>

                    {alloc.patientIds && alloc.patientIds.length > 0 && (
                      <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-500">Pazienti Dedicati:</span>
                        <span className="text-amber-300 font-bold">
                          Pz {alloc.patientIds.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-neutral-900/80 border border-neutral-700 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
            <input
              type="checkbox"
              id="confirm-stations-ready-checkbox"
              checked={hasCheckedStations}
              onChange={(e) => setHasCheckedStations(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-400 cursor-pointer"
            />
            <span className="text-[11px] text-neutral-200 select-none">
              <strong className="text-white block uppercase">
                {isEn ? 'Verify Station Readiness' : 'Verifica Postazioni e Audio/Video Pronti'}
              </strong>
              {isEn
                ? 'I confirm that tutors, technicians, and simulated casualties are in place and audio/video channels are verified.'
                : 'Confermo che i tutor delle 4 stazioni sono pronti, i manichini sono resettati e l\'audio/video è sincronizzato.'}
            </span>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Fase: {currentSlot.timeRange} (Durata: {currentSlot.durationMinutes}m)</span>
          </div>

          <button
            type="button"
            id="authorize-scenario-block-btn"
            onClick={handleConfirmStart}
            disabled={!hasCheckedStations}
            className={`w-full sm:w-auto px-5 py-2.5 font-mono font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              hasCheckedStations
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-black border-orange-300 shadow-[0_0_25px_rgba(249,115,22,0.5)] transform hover:scale-[1.02]'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isEn
                ? `CONFIRM & START BLOCK ${blockInfo.blockNumber} (START TIMERS)`
                : `CONFERMA & AVVIA BLOCCO SCENARIO ${blockInfo.blockNumber} (START TIMER)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
