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
    faculty,
    technicians,
    guests,
    teams,
    selectedDiscenteId,
    selectedFacultyId,
    selectedTechnicianId,
    selectedGuestId,
    facultyAuthSession,
    isBeeping,
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

  // Active Profile determination for QR access
  const currentDiscente = discenti.find((d) => d.id === selectedDiscenteId) || (userRole === 'discente' ? discenti[0] : null);
  const currentFaculty = faculty.find((f) => f.id === selectedFacultyId) || (userRole === 'faculty' ? faculty[0] : null);
  const currentTechnician = technicians.find((t) => t.id === selectedTechnicianId) || (userRole === 'tecnico' ? technicians[0] : null);
  const currentGuest = guests.find((g) => g.id === selectedGuestId) || (userRole === 'ospite' ? guests[0] : null);

  let activeProfileName = '';
  let activeProfileRole = '';
  let activeProfileBadge = '';
  let activeProfileDetails = '';
  let profileTypeLabel = '';

  if (userRole === 'discente' && currentDiscente) {
    activeProfileName = currentDiscente.name;
    activeProfileRole = translateRoleOrSpecialty(currentDiscente.role, language);
    activeProfileBadge = currentDiscente.badgeCode || `DISC-${currentDiscente.id}`;
    const assignedTeam = teams.find((t) => t.id === currentDiscente.teamId);
    activeProfileDetails = assignedTeam ? `${assignedTeam.name} (${isEn ? 'Group' : 'Gruppo'} ${assignedTeam.groupId})` : '';
    profileTypeLabel = isEn ? 'PARTICIPANT PROFILE ASSOCIATED' : 'PROFILO PARTECIPANTE ASSOCIATO';
  } else if (userRole === 'faculty' && currentFaculty) {
    activeProfileName = currentFaculty.name;
    activeProfileRole = currentFaculty.specialty || currentFaculty.title || 'Faculty Tutor';
    activeProfileBadge = currentFaculty.badgeCode || `FAC-${currentFaculty.id}`;
    profileTypeLabel = isEn ? 'FACULTY TUTOR PROFILE ASSOCIATED' : 'PROFILO FACULTY TUTOR ASSOCIATO';
  } else if (userRole === 'tecnico' && currentTechnician) {
    activeProfileName = currentTechnician.name;
    activeProfileRole = currentTechnician.specialty || 'Tecnico / Logistica';
    activeProfileBadge = currentTechnician.badgeCode || `TECH-${currentTechnician.id}`;
    profileTypeLabel = isEn ? 'TECHNICIAN PROFILE ASSOCIATED' : 'PROFILO TECNICO ASSOCIATO';
  } else if (userRole === 'ospite' && currentGuest) {
    activeProfileName = currentGuest.name;
    activeProfileRole = currentGuest.title || currentGuest.organization || 'Ospite / Osservatore';
    activeProfileBadge = currentGuest.badgeCode || `GUEST-${currentGuest.id}`;
    profileTypeLabel = isEn ? 'GUEST PROFILE ASSOCIATED' : 'PROFILO OSPITE ASSOCIATO';
  }

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
            <span>{isEn ? 'INTUBATI EM' : 'INTUBATI EM'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none font-sans">
              <span className="text-orange-500">H.I.T.T.E.R </span>
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            {isEn
              ? 'High Intensive Trauma Trainig Emergency Response • Operational Sessions Day 02 & Day 03'
              : 'High Intensive Trauma Trainig Emergency Response • Sessioni Operative Day 02 & Day 03'}
          </p>
        </div>

        {/* Major Countdown Digital Tiles */}
        <div className="space-y-4">
        {/* Lunch Break Gate Closed Banner */}
        {courseStartSchedule.gateMode === 'lunch' && (
          <div className="bg-amber-950/95 border-2 border-amber-500 p-5 text-left shadow-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-black uppercase tracking-wider">
              <Lock className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>{isEn ? 'GATE CLOSED • LUNCH BREAK' : 'GATE CHIUSO DURANTE LA PAUSA PRANZO'}</span>
            </div>
            <p className="text-white text-sm sm:text-base font-bold font-sans">
              {isEn
                ? 'The course gate is closed for lunch break. Schedule: 12:00 - 13:00 | Location: Simulation Center Restaurant / Canteen.'
                : 'Il gate del corso è chiuso durante la pausa pranzo. Orario: 12:00 - 13:00 | Luogo: Ristorante Centro Simulazione / Mensa.'}
            </p>
          </div>
        )}

        {/* Night Scenario Gate Closed Banner */}
        {courseStartSchedule.gateMode === 'night' && (
          <div className="bg-purple-950/95 border-2 border-purple-500 p-5 text-left shadow-2xl space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-mono text-xs font-black uppercase tracking-wider">
              <Lock className="w-5 h-5 text-purple-400 animate-pulse" />
              <span>{isEn ? 'GATE CLOSED • NIGHT SCENARIO STANDBY' : 'GATE CHIUSO • STANDBY SCENARIO NOTTURNO'}</span>
            </div>
            <p className="text-white text-sm sm:text-base font-bold font-sans">
              {isEn
                ? 'The gate is in standby for the night scenario session. Opening Time: 20:30 | Location: Night Tactical Area.'
                : 'Il gate è in standby per la sessione di scenario notturno. Orario Apertura: 20:30 | Luogo: Area Tattica Notturna.'}
            </p>
          </div>
        )}

        {/* Paused Countdown Banner */}
        {courseStartSchedule.isGatePaused && (
          <div className="bg-neutral-900 border-2 border-orange-500 p-4 text-left shadow-2xl flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-400 animate-spin flex-shrink-0" />
            <div>
              <div className="text-orange-400 font-mono text-xs font-bold uppercase">
                {isEn ? 'COUNTDOWN PAUSED BY DIRECTOR' : 'CONTO ALLA ROVESCIA IN PAUSA DALLA DIREZIONE'}
              </div>
              <p className="text-neutral-200 text-xs">
                {isEn ? 'Timer is temporarily paused. Reopening countdown will resume shortly.' : 'Il timer è temporaneamente in pausa. Il conto alla rovescia riprenderà a breve.'}
              </p>
            </div>
          </div>
        )}

        {/* 30-Minute Assembly Notice Banner */}
        {courseStartSchedule.isGateEnabled && !courseStartSchedule.isGatePaused && totalSeconds <= 1800 && totalSeconds > 0 && (
          <div className="bg-amber-950/90 border-2 border-amber-500 p-5 text-left shadow-2xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-black uppercase tracking-wider">
              <Users className={`w-5 h-5 text-amber-400 transition-all duration-300 ${isBeeping ? 'animate-ping scale-125 filter drop-shadow-[0_0_12px_rgba(245,158,11,1)]' : 'animate-pulse'}`} />
              <span>{isEn ? '⚠️ 30-MINUTE ASSEMBLY NOTICE' : '⚠️ AVVISO DI RADUNO (-30 MINUTI)'}</span>
            </div>
            <p className="text-white text-sm sm:text-base font-bold font-sans">
              {isEn
                ? 'The course gate is opening in 30 minutes. All participants are kindly invited to gather with their assigned team and Faculty Tutor.'
                : 'Mancano 30 minuti all\'apertura del gate. Si invitano tutti i partecipanti a riunirsi alla propria squadra e al proprio Faculty Tutor.'}
            </p>
          </div>
        )}

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
        </div>

        {/* Profile Details Card (when accessed via QR) */}
        {activeProfileName && (
          <div className="bg-neutral-900 border-2 border-emerald-500/60 p-5 text-left shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-black uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>{profileTypeLabel}</span>
              </div>
              <span className="font-mono text-xs font-black text-white bg-neutral-950 px-2.5 py-1 border border-neutral-700">
                {activeProfileBadge}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white uppercase">{activeProfileName}</h3>
              <p className="text-xs text-neutral-300 font-mono">
                {isEn ? 'Assigned Role: ' : 'Ruolo Assegnato: '}
                <strong className="text-orange-400">{activeProfileRole}</strong>
                {activeProfileDetails && (
                  <> • {activeProfileDetails}</>
                )}
              </p>
            </div>

            <div className="bg-neutral-950/90 border border-neutral-800 p-3 text-xs text-neutral-400 leading-relaxed font-mono">
              ℹ️ {isEn
                ? `Your terminal is verified and ready. The activity plan, simulated patient clinical chart, and scenario rotation will automatically unlock at ${courseStartSchedule.scheduledTime}.`
                : `Il tuo terminale è pronto e verificato. Il piano delle attività, la scheda clinica del paziente simulato e la rotazione scenari si sbloccheranno automaticamente allo scoccare delle ${courseStartSchedule.scheduledTime}.`}
            </div>
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
