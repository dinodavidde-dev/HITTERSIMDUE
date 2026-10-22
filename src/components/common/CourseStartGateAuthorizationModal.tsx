import React, { useEffect, useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { useCourseAuthorization } from '../../hooks/useCourseAuthorization';
import {
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Volume2,
  Lock,
  DoorOpen,
  Award,
  X,
} from 'lucide-react';
import { playBroadcastSound } from '../../utils/audio';

export const CourseStartGateAuthorizationModal: React.FC = () => {
  const { language, courseStartSchedule } = useCourse();
  const {
    isGateExpiredAwaitingAuth,
    canAuthorize,
    isStartModalOpen,
    setIsStartModalOpen,
    authorizeCourseStart,
  } = useCourseAuthorization();

  const isEn = language === 'en';
  const [hasVerifiedReadiness, setHasVerifiedReadiness] = useState<boolean>(false);
  const [hasPlayedChime, setHasPlayedChime] = useState<boolean>(false);

  // Play attention chime when modal is triggered
  useEffect(() => {
    if (isGateExpiredAwaitingAuth && canAuthorize && isStartModalOpen && !hasPlayedChime) {
      try {
        playBroadcastSound('warning');
        setHasPlayedChime(true);
      } catch (e) {}
    }
  }, [isGateExpiredAwaitingAuth, canAuthorize, isStartModalOpen, hasPlayedChime]);

  if (!isGateExpiredAwaitingAuth || !canAuthorize || !isStartModalOpen) {
    return null;
  }

  const handleAuthorize = () => {
    authorizeCourseStart();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-mono">
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-2xl w-full rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.4)] overflow-hidden space-y-0 text-neutral-100 relative">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-3 sm:p-4 text-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest block opacity-90">
                {isEn ? 'COUNTDOWN EXPIRED • GATE PROTOCOL' : 'COUNTDOWN SCADUTO • APERTURA GATE'}
              </span>
              <h2 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-tight leading-none text-black">
                {isEn ? 'AUTHORIZE OFFICIAL COURSE START' : 'AUTORIZZAZIONE AVVIO UFFICIALE DEL CORSO'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 border border-emerald-400 text-emerald-300 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider animate-pulse shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>READY TO AUTHORIZE</span>
            </span>
            <span className="px-2.5 py-1 bg-black text-emerald-400 font-mono text-xs font-black rounded border border-emerald-400/80 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              00:00:00
            </span>
            <button
              type="button"
              onClick={() => setIsStartModalOpen(false)}
              className="p-1.5 bg-black/30 hover:bg-black/50 text-black hover:text-white rounded transition-colors cursor-pointer"
              title={isEn ? 'Minimize / review dashboard' : 'Riduci a icona / consulta dashboard'}
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* Main Notice Banner */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/70 rounded-lg text-amber-200 flex items-start gap-3">
            <Radio className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <strong className="text-sm font-black uppercase text-amber-300 block">
                {isEn ? 'AWAITING REGIA / DIRECTION AUTHORIZATION' : 'IN ATTESA DI AUTORIZZAZIONE DELLA REGIA / DIREZIONE'}
              </strong>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {isEn
                  ? 'The gate countdown has completed. The course timeline and stations remain locked in standby mode until you explicitly confirm the start signal. Upon confirmation, a 3-second synchronized acoustic alert will be broadcast to all student and faculty tablets.'
                  : 'Il countdown di apertura gate è terminato. Il cronoprogramma del corso e le aule rimangono bloccati in modalità Standby finché non confermi il via libera ufficiale. Alla conferma, verrà trasmesso il buzzer acustico sincronizzato di 3 secondi su tutti i tablet di allievi, tutor e tecnici.'}
              </p>
            </div>
          </div>

          {/* Readiness Verification Grid */}
          <div className="space-y-2">
            <span className="text-[10px] text-neutral-400 uppercase font-black tracking-wider block">
              {isEn ? 'Tactical Readiness Status' : 'Stato di Prontezza Stazioni & Squadre'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-neutral-300">Ambienti Tattici 1, 2, 3 (TCCC)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRONTO</span>
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-neutral-300">Box Shock Room 1, 2, 3 (ED)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRONTO</span>
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-neutral-300">Skill Workshop WS1 & WS2</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PRONTO</span>
                </span>
              </div>
              <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-between">
                <span className="text-neutral-300">60 Discenti • 12 Squadre Sincronizzate</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>COLLEGATI</span>
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-neutral-900/80 border border-neutral-700 rounded-lg cursor-pointer hover:border-amber-400 transition-colors">
            <input
              type="checkbox"
              id="confirm-readiness-checkbox"
              checked={hasVerifiedReadiness}
              onChange={(e) => setHasVerifiedReadiness(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-neutral-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
            />
            <span className="text-[11px] text-neutral-200 select-none">
              <strong className="text-white block uppercase">
                {isEn ? 'Verify Station Readiness' : 'Conferma Operativa Regia'}
              </strong>
              {isEn
                ? 'I confirm that all tutors, technicians, and simulated casualties are in position and ready for immediate engagement.'
                : 'Confermo che tutti i tutor (FAC-01 – FAC-12), tecnici e simulatori sono operativi e pronti all\'ingaggio immediato.'}
            </span>
          </label>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-3 sm:p-4 bg-neutral-900/90 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Data: {courseStartSchedule?.scheduledDate || 'Day 02'} • {courseStartSchedule?.scheduledTime || '08:30'}
            </span>
          </div>

          <button
            type="button"
            id="authorize-course-start-btn"
            onClick={handleAuthorize}
            disabled={!hasVerifiedReadiness}
            className={`w-full sm:w-auto px-5 py-2.5 font-mono font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              hasVerifiedReadiness
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:scale-[1.02]'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {isEn
                ? 'AUTHORIZE & BROADCAST COURSE START'
                : 'AUTORIZZA E TRASMETTI AVVIO CORSO (START)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
