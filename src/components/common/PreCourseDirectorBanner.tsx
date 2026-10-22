import React from 'react';
import { useCourse } from '../../context/CourseContext';
import { useCourseAuthorization } from '../../hooks/useCourseAuthorization';
import { Clock, Radio, Play, ShieldAlert, DoorOpen, PlusCircle } from 'lucide-react';
import { formatGateCountdown } from './PreCoursePublicCountdown';

interface PreCourseDirectorBannerProps {
  variant: 'regia' | 'direttore';
}

export const PreCourseDirectorBanner: React.FC<PreCourseDirectorBannerProps> = ({ variant }) => {
  const {
    isCourseStarted,
    courseStartSchedule,
    timeRemainingMs,
    language,
    startCourseImmediately,
    resetCourseScheduleToFuture,
    setCurrentTab,
  } = useCourse();

  const { setIsStartModalOpen } = useCourseAuthorization();

  const isEn = language === 'en';

  // If the course has been officially started by Regia, hide this banner completely
  const isPreCourse = !isCourseStarted || (courseStartSchedule?.isGateEnabled && timeRemainingMs > 0);
  if (!isPreCourse) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-neutral-950 to-red-950/90 border-2 border-amber-500 rounded-xl p-3.5 sm:p-4 shadow-2xl relative overflow-hidden font-mono animate-fadeIn">
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 relative z-10">
        {/* Left Info: Alert Notice */}
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-amber-500 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <Radio className="w-3.5 h-3.5" />
              <span>{isEn ? 'PRE-COURSE STANDBY' : 'STANDBY PRE-CORSO'}</span>
            </span>

            <span className="px-2 py-0.5 bg-neutral-900 border border-amber-500/50 text-amber-300 text-[10px] sm:text-[11px] font-bold rounded">
              {variant === 'regia'
                ? isEn
                  ? 'CONTROL ROOM • GATE PROTOCOL'
                  : 'CENTRALE REGIA • CONTROLLO GATE'
                : isEn
                ? 'SCIENTIFIC DIRECTION • MONITORING'
                : 'DIREZIONE SCIENTIFICA • MONITORAGGIO'}
            </span>
          </div>

          <h3 className="text-white font-black text-sm sm:text-base uppercase tracking-tight flex items-center gap-2 flex-wrap">
            <span>
              {timeRemainingMs <= 0
                ? (isEn
                  ? '⚠️ GATE OPEN (00:00) • REGIA AUTHORIZATION REQUIRED TO START'
                  : '⚠️ GATE APERTO (00:00) • AUTORIZZAZIONE REGIA RICHIESTA PER AVVIARE')
                : isEn
                ? 'AWAITING OFFICIAL COURSE START • COUNTDOWN ACTIVE'
                : 'ATTESA AVVIO CORSO DA PARTE DELLA REGIA • COUNTDOWN INIZIO ATTIVO'}
            </span>
          </h3>

          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {timeRemainingMs <= 0 ? (
              isEn ? (
                <>
                  Countdown has reached zero. The course does not start automatically: <strong className="text-emerald-400">Regia must authorize the official start</strong> to release views and synchronize timelines.
                </>
              ) : (
                <>
                  Il countdown è giunto a zero. Il corso non parte automaticamente: <strong className="text-emerald-400">la Regia deve autorizzare l&apos;avvio ufficiale</strong> per sbloccare le visuali e sincronizzare la timeline.
                </>
              )
            ) : isEn ? (
              <>
                Target: <strong className="text-amber-300 font-mono">{courseStartSchedule?.scheduledDate}</strong> at{' '}
                <strong className="text-amber-300 font-mono">{courseStartSchedule?.scheduledTime || '08:30'}</strong>.
                Participants scanning their personal QR view <em>only their profile and public countdown</em> until started.
              </>
            ) : (
              <>
                Data prevista: <strong className="text-amber-300 font-mono">{courseStartSchedule?.scheduledDate}</strong> ore{' '}
                <strong className="text-amber-300 font-mono">{courseStartSchedule?.scheduledTime || '08:30'}</strong>.
                I discenti, faculty e tecnici che scansionano il proprio QR visualizzano <em>esclusivamente l&apos;anagrafica personale e il countdown</em> (mentre gli ospiti visualizzano la visuale pubblica).
              </>
            )}
          </p>
        </div>

        {/* Center/Right: Live Big Countdown & Launch Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-shrink-0">
          {/* Live Timer Box */}
          <div
            onClick={() => {
              if (timeRemainingMs <= 0) {
                setIsStartModalOpen(true);
              }
            }}
            className={`px-3.5 py-2.5 rounded-lg text-center shadow-inner min-w-[190px] transition-all relative overflow-hidden ${
              timeRemainingMs <= 0
                ? 'bg-neutral-900/95 border-2 border-emerald-400 ring-4 ring-emerald-500/25 shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-pulse cursor-pointer'
                : 'bg-neutral-900/90 border-2 border-amber-500/80'
            }`}
            title={timeRemainingMs <= 0 ? (isEn ? 'Click to open Start Course Authorization' : 'Clicca per aprire il modale di autorizzazione avvio') : undefined}
          >
            <span className="text-[9px] sm:text-[10px] uppercase text-neutral-400 font-bold block flex items-center justify-center gap-1.5 mb-0.5">
              <Clock className={`w-3.5 h-3.5 ${timeRemainingMs <= 0 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
              <span>
                {timeRemainingMs <= 0
                  ? (isEn ? 'GATE COUNTDOWN' : 'COUNTDOWN GATE')
                  : (isEn ? 'START COUNTDOWN' : 'COUNTDOWN AVVIO')}
              </span>
            </span>

            <div
              className={`text-2xl sm:text-3xl font-mono font-black tracking-wider ${
                timeRemainingMs <= 0
                  ? 'text-emerald-400 animate-pulse drop-shadow-[0_0_10px_rgba(52,211,153,0.65)]'
                  : 'text-amber-400'
              }`}
            >
              {timeRemainingMs <= 0 ? '00:00:00' : formatGateCountdown(timeRemainingMs, isEn)}
            </div>

            {/* Subtle 'READY TO AUTHORIZE' Label when countdown reaches 00:00:00 */}
            {timeRemainingMs <= 0 && (
              <div className="mt-1.5 inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/70 shadow-sm animate-pulse">
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-emerald-300 uppercase">
                  READY TO AUTHORIZE
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          {variant === 'regia' ? (
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <button
                type="button"
                onClick={() => {
                  if (timeRemainingMs <= 0) {
                    setIsStartModalOpen(true);
                  } else {
                    startCourseImmediately();
                  }
                }}
                className={`w-full py-2 px-3 text-black font-black text-xs uppercase tracking-wider rounded shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  timeRemainingMs <= 0
                    ? 'bg-emerald-400 hover:bg-emerald-300 border-white ring-2 ring-emerald-400 animate-bounce'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400'
                }`}
                title={isEn ? 'Authorize and start course now' : 'Autorizza e avvia il corso adesso'}
              >
                <DoorOpen className="w-4 h-4 text-black" />
                <span>{timeRemainingMs <= 0 ? (isEn ? 'AUTHORIZE START NOW' : 'AUTORIZZA AVVIO ORA') : (isEn ? 'START COURSE NOW' : 'AVVIA CORSO ADESSO')}</span>
              </button>

              <button
                type="button"
                onClick={() => resetCourseScheduleToFuture(30)}
                className="w-full py-1 px-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-bold text-[10px] uppercase rounded border border-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title={isEn ? 'Set countdown to +30 minutes from now' : 'Imposta countdown a +30 minuti da adesso'}
              >
                <PlusCircle className="w-3 h-3 text-amber-400" />
                <span>{isEn ? '+30 MIN EXTENSION' : '+30 MIN PROROGA'}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 min-w-[160px]">
              <button
                type="button"
                onClick={() => setCurrentTab('regia')}
                className="w-full py-2 px-3 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider rounded shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-pink-400"
              >
                <Radio className="w-4 h-4" />
                <span>{isEn ? 'GO TO REGIA DESK' : 'VAI IN REGIA'}</span>
              </button>
              <span className="text-[10px] text-neutral-400 text-center font-mono">
                {isEn ? 'Central launch by Regia' : 'Avvio gestito dalla Regia'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
