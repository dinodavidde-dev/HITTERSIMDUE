import React, { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import {
  Clock,
  Lock,
  Sparkles,
  User,
  ShieldCheck,
  QrCode,
  Calendar,
  MapPin,
  Flame,
  Activity,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Radio,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { QRScannerModal } from './QRScannerModal';
import { FacultyAuthModal } from './FacultyAuthModal';
import { UserRole } from '../types';
import { translateRoleOrSpecialty } from '../i18n/medicalTerms';

export const CoursePreStartCountdown: React.FC = () => {
  const {
    language,
    userRole,
    setUserRole,
    courseStartSchedule,
    timeRemainingMs,
    isCourseStarted,
    discenti,
    teams,
    selectedDiscenteId,
    setSelectedDiscenteId,
    facultyAuthSession,
  } = useCourse();

  const isEn = language === 'en';
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isFacultyAuthModalOpen, setIsFacultyAuthModalOpen] = useState(false);

  // Split remaining time into days, hours, minutes, seconds
  const totalSeconds = Math.floor(timeRemainingMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Active Discente Profile if role is discente
  const currentDiscente = discenti.find((d) => d.id === selectedDiscenteId) || (userRole === 'discente' ? discenti[0] : null);
  const assignedTeam = currentDiscente ? teams.find((t) => t.id === currentDiscente.teamId) : null;

  // Format Date from isoTimestamp / scheduledDate
  const formatScheduledDate = () => {
    try {
      const d = new Date(courseStartSchedule.isoTimestamp || `${courseStartSchedule.scheduledDate}T${courseStartSchedule.scheduledTime}:00`);
      if (isNaN(d.getTime())) {
        return isEn
          ? `${courseStartSchedule.scheduledDate} at ${courseStartSchedule.scheduledTime}`
          : `${courseStartSchedule.scheduledDate} ore ${courseStartSchedule.scheduledTime}`;
      }
      return d.toLocaleDateString(isEn ? 'en-US' : 'it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return `${courseStartSchedule.scheduledDate}`;
    }
  };

  const handleFacultyAuthSuccess = (role: UserRole) => {
    setUserRole(role);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-6 px-4 sm:px-6">
      <div className="w-full max-w-4xl space-y-8 text-center">
        
        {/* Top Operational Status Chip */}
        <div className="flex items-center justify-center w-full">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-neutral-900 border-2 border-orange-500/80 text-orange-400 text-xs sm:text-sm font-mono font-black tracking-wider uppercase shadow-xl animate-pulse">
            <Radio className="w-4 h-4 text-orange-500 animate-spin" />
            <span>{isEn ? 'OFFICIAL STANDBY • COUNTDOWN ACTIVE' : 'STANDBY UFFICIALE • CONTO ALLA ROVESCIA ATTIVO'}</span>
          </div>
        </div>

        {/* Master Course Heading */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-neutral-400 font-mono text-xs uppercase tracking-widest">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>{isEn ? 'ADVANCED MEDICO-SURGICAL SIMULATION CENTER' : 'CENTRO DI SIMULAZIONE MEDICO-CHIRURGICA AVANZATA'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none font-sans">
            TRAUMA SIMULATION <span className="text-orange-500">MASTER</span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            {isEn
              ? 'Advanced Major Polytrauma Patient Management • Operational Sessions Day 02 & Day 03'
              : 'Gestione Avanzata del Paziente Politraumatizzato Maggiore • Sessioni Operative Day 02 & Day 03'}
          </p>
        </div>

        {/* Major Countdown Digital Tiles */}
        <div className="bg-neutral-900/90 border-4 border-neutral-800 p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Ambient Grid Lines Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 text-xs font-mono text-neutral-400 uppercase">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Clock className="w-4 h-4" />
                {isEn ? 'TIME REMAINING UNTIL OPENING' : 'TEMPO RIMANENTE ALL\'APERTURA'}
              </span>
              <span className="bg-neutral-950 px-2 py-0.5 border border-neutral-800 text-neutral-300 font-mono">
                {isEn ? 'AUTOMATIC TIMED GATE' : 'GATE TEMPORIZZATO AUTOMATICO'}
              </span>
            </div>

            {/* Countdown Flip Boxes */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
              {/* Days */}
              <div className="bg-neutral-950 border-2 border-neutral-700 p-3 sm:p-6 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-6xl md:text-7xl font-mono font-black text-white tracking-tight">
                  {String(days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest mt-1">
                  {isEn ? 'DAYS' : 'GIORNI'}
                </span>
              </div>

              {/* Hours */}
              <div className="bg-neutral-950 border-2 border-neutral-700 p-3 sm:p-6 flex flex-col items-center justify-center">
                <span className="text-3xl sm:text-6xl md:text-7xl font-mono font-black text-white tracking-tight">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest mt-1">
                  {isEn ? 'HOURS' : 'ORE'}
                </span>
              </div>

              {/* Minutes */}
              <div className="bg-neutral-950 border-2 border-orange-500/60 p-3 sm:p-6 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                <span className="text-3xl sm:text-6xl md:text-7xl font-mono font-black text-orange-400 tracking-tight">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-orange-400 uppercase tracking-widest mt-1">
                  {isEn ? 'MINUTES' : 'MINUTI'}
                </span>
              </div>

              {/* Seconds */}
              <div className="bg-neutral-950 border-2 border-red-500/80 p-3 sm:p-6 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <span className="text-3xl sm:text-6xl md:text-7xl font-mono font-black text-red-500 tracking-tight animate-pulse">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 uppercase tracking-widest mt-1">
                  {isEn ? 'SECONDS' : 'SECONDI'}
                </span>
              </div>
            </div>

            {/* Scheduled Start Meta Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left text-xs font-mono">
              <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <div className="text-neutral-500 text-[10px] uppercase font-bold">{isEn ? 'SCHEDULED DATE' : 'DATA PROGRAMMATA'}</div>
                  <div className="text-neutral-200 font-bold capitalize">{formatScheduledDate()}</div>
                </div>
              </div>
              <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <div>
                  <div className="text-neutral-500 text-[10px] uppercase font-bold">{isEn ? 'OFFICIAL START TIME' : 'ORARIO INIZIO UFFICIALE'}</div>
                  <div className="text-neutral-200 font-bold">{isEn ? `${courseStartSchedule.scheduledTime} (Local Time)` : `Ore ${courseStartSchedule.scheduledTime} (Ora Locale)`}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Participant Card or Public Standby Banner */}
        {userRole === 'discente' && currentDiscente ? (
          <div className="bg-neutral-900 border-2 border-emerald-500/60 p-5 text-left shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEn ? 'PARTICIPANT IDENTIFICATION COMPLETED' : 'IDENTIFICAZIONE DISCENTE COMPLETATA'}</span>
              </div>
              <span className="font-mono text-xs font-black text-white bg-neutral-950 px-2.5 py-1 border border-neutral-700">
                {currentDiscente.badgeCode || `DISC-${currentDiscente.id}`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase">{currentDiscente.name}</h3>
                <p className="text-xs text-neutral-300 font-mono">
                  {isEn ? 'Assigned Role: ' : 'Ruolo Assegnato: '}
                  <strong className="text-orange-400">{translateRoleOrSpecialty(currentDiscente.role, language)}</strong>
                  {assignedTeam && (
                    <> • {assignedTeam.name} ({isEn ? 'Group' : 'Gruppo'} {assignedTeam.groupId})</>
                  )}
                </p>
              </div>

              <button
                id="change-discente-countdown-btn"
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                {isEn ? 'Change / Scan Badge' : 'Cambia / Scannerizza Badge'}
              </button>
            </div>

            <div className="bg-neutral-950/90 border border-neutral-800 p-3 text-xs text-neutral-400 leading-relaxed font-mono">
              ℹ️ {isEn
                ? `Your terminal is verified and ready. The activity plan, simulated patient clinical chart, and scenario rotation will automatically unlock at ${courseStartSchedule.scheduledTime}.`
                : `Il tuo terminale è pronto e verificato. Il piano delle attività, la scheda clinica del paziente simulato e la rotazione scenari si sbloccheranno automaticamente allo scoccare delle ${courseStartSchedule.scheduledTime}.`}
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900 border-2 border-neutral-800 p-5 text-left shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-neutral-400 font-mono text-xs font-bold uppercase">
                <Users className="w-4 h-4 text-orange-400" />
                <span>{isEn ? 'FIELD PARTICIPANTS ACCESS' : 'ACCESSO PARTECIPANTI SUL CAMPO'}</span>
              </div>
              <p className="text-xs text-neutral-300 font-mono">
                {isEn
                  ? 'Are you a participant with an individual QR badge? Scan it or enter your code to identify your workstation in advance.'
                  : 'Sei un discente con badge QR individuale? Scannerizzalo o inserisci il tuo codice per identificare la tua postazione in anticipo.'}
              </p>
            </div>

            <button
              id="scan-badge-countdown-btn"
              type="button"
              onClick={() => setIsQRModalOpen(true)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 flex-shrink-0 transition-colors shadow-md cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              {isEn ? 'IDENTIFY PARTICIPANT BADGE' : 'IDENTIFICA BADGE DISCENTE'}
            </button>
          </div>
        )}

        {/* Faculty / Director Login Trigger in Footer for authorized personnel */}
        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-mono">
          <span>{isEn ? 'COMMAND & REAL-TIME SYNC SYSTEM • VER 2026.8' : 'SISTEMA REGIA E SINCRONIZZAZIONE DIRETTA • VER 2026.8'}</span>

          <button
            id="staff-bypass-countdown-btn"
            type="button"
            onClick={() => {
              setIsFacultyAuthModalOpen(true);
            }}
            className="text-neutral-400 hover:text-orange-400 underline flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {isEn ? 'Restricted Access: Faculty, Techs & Direction' : 'Accesso Riservato Docenti, Tecnici & Direzione'}
          </button>
        </div>

      </div>

      {/* QR Scanner Modal for Instant Discente Identification */}
      <QRScannerModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />

      {/* Staff Authentication Modal */}
      <FacultyAuthModal
        isOpen={isFacultyAuthModalOpen}
        onClose={() => setIsFacultyAuthModalOpen(false)}
        targetRolePending="direttore"
        onSuccess={handleFacultyAuthSuccess}
      />
    </div>
  );
};
