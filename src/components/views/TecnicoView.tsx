import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplet,
  Layers,
  MapPin,
  MessageSquare,
  PackageCheck,
  QrCode,
  Radio,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { BroadcastModal } from '../BroadcastModal';
import { CourseMessengerModal } from '../messaging/CourseMessengerModal';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { TechSessionChecklist } from '../TechSessionChecklist';
import { GroupActivitySlot, GroupType, Technician, TimelineSlot } from '../../types';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { LanguageSwitcher } from '../LanguageSwitcher';

type TecnicoSubTab = 'checklist_presidi' | 'schedule_prep' | 'my_roster' | 'my_messages';

function formatMinutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const TecnicoView: React.FC = () => {
  const {
    language,
    t,
    activeDay,
    setActiveDay,
    simulatorPatients,
    technicians,
    selectedTechnicianId,
    setSelectedTechnicianId,
    currentSlot,
    timerSeconds,
    isTimerRunning,
    courseMessages,
    userRole,
    suspensionInfo,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSubTab, setActiveSubTab] = useState<TecnicoSubTab>('checklist_presidi');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(activeDay);

  // Active Technician Profile
  const currentTechnician: Technician =
    technicians.find((t) => t.id === selectedTechnicianId) ||
    technicians[0] || {
      id: 'tech-1',
      name: 'Silvia Rossi',
      assignedStations: ['Postazione 1', 'Moulage Lab'],
      specialty: 'Moulage & Protesi',
      nationality: 'IT',
      phone: '+39 340 000000',
      badgeCode: 'TEC-01',
    };

  const filteredPatients = simulatorPatients.filter((p) => p.day === activeDay);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Messages sent by technicians
  const myMessages = courseMessages.filter(
    (m) => m.senderId === currentTechnician.id || m.senderRole === 'tecnico'
  );

  // Filter slots for current selected day to show 30-min advance prep schedule
  const daySlots = INITIAL_TIMELINE_SLOTS.filter((s: TimelineSlot) => s.day === selectedDayTab);

  // Calculate advance preparation time (30 minutes prior to slot start)
  const currentSlotPrepStart = currentSlot.startMinutes ? Math.max(0, currentSlot.startMinutes - 30) : 510;
  const currentSlotGoLive = currentSlot.startMinutes || 540;

  return (
    <div className="space-y-4 pb-12">
      {/* SIMPLIFIED TECHNICIAN HEADER */}
      <div className="bg-neutral-950 border-2 border-orange-500/80 p-3 sm:p-4 shadow-xl space-y-2.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Wrench className="w-3 h-3" />
                {isEn ? 'TECHNICAL SUPPORT & MOULAGE HUB' : 'PORTALE REGIA TECNICA & MOULAGE'}
              </span>
              <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
                DAY 0{activeDay} • {filteredPatients.length} {isEn ? 'STATIONS' : 'POSTAZIONI'}
              </span>
              {suspensionInfo.isSuspended && (
                <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 animate-pulse flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3" />
                  {isEn ? 'COURSE SUSPENDED' : 'CORSO SOSPESO'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight truncate">
                {currentTechnician.name}
              </h2>
              <span className="text-xs font-mono bg-neutral-900 text-orange-400 px-2 py-0.5 border border-orange-500/40">
                {currentTechnician.badgeCode || 'TEC-01'}
              </span>
            </div>

            <div className="text-xs text-neutral-300 font-medium flex items-center gap-2 flex-wrap">
              <span>{isEn ? 'Specialty' : 'Specialità'}: <strong className="text-orange-400">{currentTechnician.specialty}</strong></span>
              <span className="text-neutral-600">•</span>
              <span>{isEn ? 'Stations' : 'Postazioni'}: <strong className="text-white">{currentTechnician.assignedStations?.join(', ') || (isEn ? 'All Shock Rooms' : 'Tutte le Shock Room')}</strong></span>
            </div>
          </div>

          {/* Quick Actions & Technician Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <LanguageSwitcher variant="badge" />

            {technicians.length > 1 && (
              <select
                id="tech-selector-dropdown"
                value={selectedTechnicianId || currentTechnician.id}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="bg-neutral-900 border border-orange-600 text-orange-200 text-xs font-bold px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                aria-label={isEn ? 'Select Technician Profile' : 'Seleziona Profilo Tecnico'}
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty})
                  </option>
                ))}
              </select>
            )}

            <button
              id="tech-send-msg-btn"
              onClick={() => setIsMessengerOpen(true)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-orange-400 hover:text-orange-300 font-black text-xs uppercase tracking-wider border border-orange-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={isEn ? 'Send report to Director & Faculty' : 'Invia comunicazione diretta alla Regia e Direzione'}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? 'REPORT TO DIRECTOR' : 'SEGNALA ALLA REGIA'}</span>
            </button>

            {userRole === 'direttore' && (
              <button
                id="tech-broadcast-btn"
                onClick={() => setIsBroadcastModalOpen(true)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase border border-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>BROADCAST</span>
              </button>
            )}
          </div>
        </div>

        {/* 30-MINUTE ADVANCE PREPARATION BANNER (T-30 MIN ALERT) */}
        <div className="bg-neutral-900 border border-orange-500/60 p-2.5 sm:p-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2.5 shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-orange-500 text-black font-black flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest font-mono text-orange-400">
                  {isEn ? 'OPERATIONAL RULE: 30-MINUTE ADVANCE SETUP' : 'REGOLA OPERATIVA: ALLESTIMENTO CON 30 MINUTI DI ANTICIPO'}
                </span>
                <span className="text-[9px] bg-orange-950 text-orange-300 border border-orange-700 px-1.5 py-0.2 font-mono font-bold">
                  T-30m GATE
                </span>
              </div>
              <p className="text-xs text-neutral-200 font-medium">
                {isEn 
                  ? 'Each station must be pre-set and verified 30 minutes before scenario kickoff for faculty briefing and Green Light 🟢 or Yellow Light ⚠️ dispatch.' 
                  : "Ogni postazione deve essere allestita e verificata 30 minuti prima dell'inizio dello scenario per consentire il briefing istruttori e l'invio della Luce Verde 🟢 o Luce Gialla ⚠️."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-neutral-950 px-3 py-1.5 border border-neutral-800 flex-shrink-0">
            <div className="text-right">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                {isEn ? 'SETUP' : 'ALLESTIMENTO'}: {formatMinutesToHHMM(currentSlotPrepStart)}
              </span>
              <span className="text-xs font-mono font-black text-orange-400">
                GO-LIVE: {formatMinutesToHHMM(currentSlotGoLive)}
              </span>
            </div>
            <div className="text-right border-l border-neutral-800 pl-2.5">
              <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold block">
                {isEn ? 'PHASE TIMER' : 'TIMER FASE'}
              </span>
              <span className="text-sm font-mono font-black text-white">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STREAMLINED SUB-MENU TABS */}
      <nav aria-label={isEn ? 'Technician Menu' : 'Menu Sezioni Tecnico'} className="bg-neutral-950 border border-neutral-800 p-1 sm:p-1.5 shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5">
          {/* Tab 1: Checklist & Segnali Regia */}
          <button
            id="tech-tab-checklist-btn"
            onClick={() => setActiveSubTab('checklist_presidi')}
            className={`min-h-[38px] p-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              activeSubTab === 'checklist_presidi'
                ? 'bg-orange-500 text-black border-orange-300 font-black shadow-md'
                : 'bg-neutral-900 text-orange-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-orange-500/60'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${activeSubTab === 'checklist_presidi' ? 'text-black' : 'text-orange-400'}`} />
            <div className="truncate text-left sm:text-center">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'CHECKLIST & STATUS SIGNALS' : 'CHECKLIST & SEGNALI REGIA'}
              </span>
            </div>
          </button>

          {/* Tab 2: Orario & Anticipo T-30m */}
          <button
            id="tech-tab-schedule-btn"
            onClick={() => setActiveSubTab('schedule_prep')}
            className={`min-h-[38px] p-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              activeSubTab === 'schedule_prep'
                ? 'bg-orange-500 text-black border-orange-300 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${activeSubTab === 'schedule_prep' ? 'text-black' : 'text-cyan-400'}`} />
            <div className="truncate text-left sm:text-center">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'T-30m SCENARIO TIMELINE' : 'TIMELINE T-30m SCENARI'}
              </span>
            </div>
          </button>

          {/* Tab 3: Roster Tecnici & Postazioni */}
          <button
            id="tech-tab-roster-btn"
            onClick={() => setActiveSubTab('my_roster')}
            className={`min-h-[38px] p-2 text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              activeSubTab === 'my_roster'
                ? 'bg-orange-500 text-black border-orange-300 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <Users className={`w-3.5 h-3.5 flex-shrink-0 ${activeSubTab === 'my_roster' ? 'text-black' : 'text-emerald-400'}`} />
            <div className="truncate text-left sm:text-center">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'TECH TEAM & ROSTER' : 'TEAM TECNICO & ROSTER'}
              </span>
            </div>
          </button>

          {/* Tab 4: Segnalazioni Trasmessa alla Regia */}
          <button
            id="tech-tab-messages-btn"
            onClick={() => setActiveSubTab('my_messages')}
            className={`min-h-[44px] p-2.5 text-center transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              activeSubTab === 'my_messages'
                ? 'bg-orange-500 text-black border-orange-300 font-black shadow-lg'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-850 hover:border-neutral-700'
            }`}
          >
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeSubTab === 'my_messages' ? 'text-black' : 'text-amber-400'}`} />
            <div className="truncate text-left sm:text-center">
              <span className="font-black text-xs uppercase tracking-wider block truncate">
                {isEn ? 'DIRECTOR LOG' : 'MESSAGGI REGIA'}
              </span>
              <span className={`text-[10px] hidden sm:block truncate ${activeSubTab === 'my_messages' ? 'text-neutral-950 font-bold' : 'text-neutral-500'}`}>
                {myMessages.length} {isEn ? 'Sent Logs' : 'Notifiche Trasmessi'}
              </span>
            </div>
          </button>
        </div>
      </nav>

      {/* SUBTAB 1: CHECKLIST & SEGNALI REGIA (STREAMLINED) */}
      {activeSubTab === 'checklist_presidi' && (
        <TechSessionChecklist />
      )}

      {/* SUBTAB 2: ORARIO CON 30 MINUTI DI ANTICIPO SUGLI SCENARI */}
      {activeSubTab === 'schedule_prep' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-6 shadow-xl space-y-5">
          {/* Day selection */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  {isEn ? 'Technical Prep Schedule (T-30m Window)' : 'Cronoprogramma Allestimento Tecnico (Finestra T-30m)'}
                </h3>
              </div>
              <p className="text-xs text-neutral-300 mt-0.5">
                {isEn 
                  ? 'Advance 30-minute operational planning for simulators, prostheses and fluids prep before learner team arrivals.'
                  : "Pianificazione operativa con indicazione anticipata di 30 minuti per l'allestimento dei simulatori, protesi e fluidi prima dell'ingresso delle squadre."}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[2, 3].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDayTab(d as any)}
                  className={`px-3 py-1.5 text-xs font-mono font-black uppercase border cursor-pointer ${
                    selectedDayTab === d
                      ? 'bg-orange-500 text-black border-orange-300 font-bold shadow-md'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {isEn ? `DAY 0${d}` : `GIORNO 0${d}`}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule List with 30-min Advance milestones */}
          <div className="space-y-3">
            {daySlots.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950 border border-neutral-800 text-neutral-400 text-xs">
                {isEn ? 'No timeline slots for selected day.' : 'Nessuno slot temporale per il giorno selezionato.'}
              </div>
            ) : (
              daySlots.map((slot, index) => {
                const prepStartMin = Math.max(0, (slot.startMinutes || 540) - 30);
                const goLiveMin = slot.startMinutes || 540;
                const isCurrent = slot.id === currentSlot.id;

                return (
                  <div
                    key={slot.id || index}
                    className={`p-4 border-2 transition-all space-y-3 ${
                      isCurrent
                        ? 'bg-neutral-950 border-orange-500 shadow-xl ring-1 ring-orange-500/50'
                        : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                      {/* Times */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 30-Min Advance Prep Time Badge */}
                        <div className="bg-orange-950/90 text-orange-200 border border-orange-500/80 px-2.5 py-1 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm">
                          <Wrench className="w-3.5 h-3.5 text-orange-400" />
                          <span>{isEn ? 'PREP T-30m' : 'ALLESTIMENTO T-30m'}: <strong>{formatMinutesToHHMM(prepStartMin)}</strong></span>
                        </div>

                        {/* Go-Live Scenario Time */}
                        <div className="bg-emerald-950/90 text-emerald-200 border border-emerald-500/80 px-2.5 py-1 text-xs font-mono font-black flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isEn ? 'GO-LIVE SCENARIO' : 'GO-LIVE SCENARIO'}: <strong>{formatMinutesToHHMM(goLiveMin)} ({slot.timeRange})</strong></span>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] font-black uppercase tracking-wider animate-pulse">
                            {isEn ? 'LIVE NOW' : 'IN CORSO'}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400 uppercase bg-neutral-900 px-2 py-0.5 border border-neutral-800">
                        {slot.period.toUpperCase()} • {isEn ? 'DURATION' : 'DURATA'}: {slot.durationMinutes || 30} MIN
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">
                        {slot.title}
                      </h4>
                      <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                        {slot.description}
                      </p>
                    </div>

                    {/* Group scenario references */}
                    {slot.groupActivities && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-neutral-900">
                        {Object.entries(slot.groupActivities).map(([grp, activity]) => {
                          const act = activity as GroupActivitySlot;
                          return (
                            <div
                              key={grp}
                              className="bg-neutral-900/90 p-2 border border-neutral-800 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-black text-orange-400 font-mono">{isEn ? 'GROUP' : 'GRUPPO'} {grp}</span>
                                <span className="text-[9px] font-mono text-neutral-400 uppercase">
                                  {act.activityType}
                                </span>
                              </div>
                              <div className="font-bold text-white truncate">{act.title}</div>
                              <div className="text-[10px] text-neutral-400 font-mono truncate">{act.location}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: TEAM TECNICO & ROSTER */}
      {activeSubTab === 'my_roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Technician Badge Card */}
          <div className="bg-neutral-900 border-2 border-orange-500 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest font-mono">
                {isEn ? 'ACCREDITATION BADGE' : 'BADGE ACCREDITAMENTO'}
              </span>
              <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 uppercase">
                {isEn ? 'ACTIVE' : 'ATTIVO'}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-white uppercase">{currentTechnician.name}</h3>
              <p className="text-xs text-neutral-300 font-semibold">{currentTechnician.specialty}</p>
              <p className="text-xs text-neutral-400 font-mono">{isEn ? 'Contact' : 'Contatto'}: {currentTechnician.phone}</p>
            </div>

            <div className="flex justify-center pt-2 pb-2">
              <QRCodeDisplay
                value={`https://trauma-sim.med/technician?id=${currentTechnician.id}&badge=${currentTechnician.badgeCode || 'TEC-01'}`}
                size={140}
              />
            </div>

            <div className="bg-neutral-950 p-2.5 border border-neutral-800 text-[11px] font-mono text-center text-neutral-300">
              {isEn ? 'BADGE CODE' : 'CODICE BADGE'}: <strong>{currentTechnician.badgeCode || 'TEC-01'}</strong>
            </div>
          </div>

          {/* All Technicians Directory */}
          <div className="lg:col-span-2 bg-neutral-900 border-2 border-neutral-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest font-mono">
                  {isEn ? 'COURSE TECHNICAL STAFF' : 'STAFF TECNICO DEL CORSO'}
                </span>
                <h3 className="text-lg font-black text-white uppercase">
                  {technicians.length} {isEn ? 'Technicians & Moulage Specialists' : 'Tecnici & Specialisti Moulage'}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {technicians.map((t) => (
                <div
                  key={t.id}
                  className="bg-neutral-950 p-3.5 border border-neutral-800 flex items-start justify-between gap-3 hover:border-orange-500/60 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <h4 className="text-xs font-black text-white uppercase truncate">{t.name}</h4>
                    </div>
                    <p className="text-[11px] text-neutral-300">{t.specialty}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {isEn ? 'Stations' : 'Postazioni'}: {t.assignedStations?.join(', ') || (isEn ? 'All' : 'Tutte')}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <QRCodeDisplay
                      value={`https://trauma-sim.med/technician?id=${t.id}&badge=${t.badgeCode || 'TEC-01'}`}
                      size={40}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: LOG SEGNALAZIONI REGIA */}
      {activeSubTab === 'my_messages' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h3 className="font-black text-lg text-white uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                <span>{isEn ? 'DIRECTOR LOGS & ACKNOWLEDGMENTS' : 'SEGNALAZIONI & RISCONTRI DELLA REGIA'}</span>
              </h3>
              <p className="text-xs text-neutral-300">
                {isEn 
                  ? 'Complete history of Green Light, Yellow Light, and supply requests sent to Course Command.'
                  : 'Log completo dei segnali di Luce Verde, Luce Gialla e richieste di materiale trasmesse alla Direzione.'}
              </p>
            </div>

            <button
              onClick={() => setIsMessengerOpen(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isEn ? 'NEW REPORT' : 'NUOVA SEGNALAZIONE'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {myMessages.length === 0 ? (
              <div className="p-8 text-center bg-neutral-950 border border-neutral-800 space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-bold text-neutral-400 uppercase">
                  {isEn ? 'No reports logged at this time' : 'Nessuna segnalazione registrata al momento'}
                </p>
              </div>
            ) : (
              myMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 border space-y-1.5 ${
                    m.type === 'warning'
                      ? 'bg-amber-950/20 border-amber-500/50'
                      : m.type === 'emergency'
                      ? 'bg-red-950/30 border-red-500'
                      : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400 font-bold">{m.timestamp}</span>
                      <span className="font-bold text-xs text-white uppercase">{m.subject}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 ${
                        m.status === 'acknowledged'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-orange-950 text-orange-300 border border-orange-800'
                      }`}
                    >
                      {m.status === 'acknowledged' 
                        ? (isEn ? `ACKNOWLEDGED BY: ${m.acknowledgedBy}` : `PRESO IN CARICO DA: ${m.acknowledgedBy}`)
                        : (isEn ? 'SENT TO COMMAND' : 'INVIATO IN REGIA')}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 font-medium whitespace-pre-line">{m.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        defaultSubject={isEn ? 'Technical Request / Moulage Consumables' : 'Richiesta Tecnica / Materiali Moulage'}
        defaultStation={currentTechnician.assignedStations?.[0] || (isEn ? 'Tech Lab' : 'Lab Tecnico')}
      />

      {/* Broadcast Modal (Reserved for Director) */}
      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
};
