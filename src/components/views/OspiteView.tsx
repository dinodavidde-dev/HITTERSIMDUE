import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Wrench,
  Info,
  AlertTriangle,
  Activity,
  Layers,
} from 'lucide-react';
import { Guest, GroupType, CourseDay } from '../../types';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';
import { getGroupPhaseDetails } from '../../utils/groupPhaseDetails';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';

export const OspiteView: React.FC = () => {
  const {
    guests,
    selectedGuestId,
    setSelectedGuestId,
    canSelectOperator,
    activeDay,
    setActiveDay,
    activeSlotIndex,
    setActiveSlotIndex,
    filteredSlots,
    currentSlot,
    faculty,
    simulatorPatients,
    technicians,
    language,
    timerSeconds,
  } = useCourse();

  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showVademecum, setShowVademecum] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | GroupType>('ALL');

  const isEn = language === 'en';

  const currentGuest: Guest =
    guests.find((g) => g.id === selectedGuestId) ||
    guests[0] || {
      id: 'guest-1',
      name: 'Ospite / VIP',
      title: 'Osservatore Ufficiale',
      organization: 'Ente / Organizzazione',
      nationality: 'Italia',
      assignedDays: [2, 3],
      phone: '+39 000 000000',
      email: 'ospite@example.com',
      badgeCode: 'GUEST-01',
    };

  // Find designated escort faculty member
  const escortFacultyMember = useMemo(() => {
    if (!currentGuest.escortFaculty) return null;
    return (
      faculty.find(
        (f) =>
          f.name.toLowerCase().includes(currentGuest.escortFaculty!.toLowerCase()) ||
          f.badgeCode === currentGuest.escortFaculty ||
          f.id === currentGuest.escortFaculty
      ) || null
    );
  }, [currentGuest.escortFaculty, faculty]);

  // Slots for the active day
  const daySlots = filteredSlots;

  const currentSlotInDayIndex = useMemo(() => {
    if (!currentSlot) return 0;
    const idx = daySlots.findIndex((s) => s.id === currentSlot.id);
    return idx !== -1 ? idx : 0;
  }, [daySlots, currentSlot]);

  // Slot Navigation Handlers
  const handleSelectDay = (day: CourseDay) => {
    setActiveDay(day);
    const firstIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.day === day);
    if (firstIdx !== -1) {
      setActiveSlotIndex(firstIdx);
    }
  };

  const handlePrevSlot = () => {
    if (currentSlotInDayIndex > 0) {
      const prevSlotId = daySlots[currentSlotInDayIndex - 1].id;
      const targetIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === prevSlotId);
      if (targetIdx !== -1) setActiveSlotIndex(targetIdx);
    }
  };

  const handleNextSlot = () => {
    if (currentSlotInDayIndex < daySlots.length - 1) {
      const nextSlotId = daySlots[currentSlotInDayIndex + 1].id;
      const targetIdx = INITIAL_TIMELINE_SLOTS.findIndex((s) => s.id === nextSlotId);
      if (targetIdx !== -1) setActiveSlotIndex(targetIdx);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Distinct Group Styling
  const groupColors: Record<GroupType, { border: string; badge: string; text: string; bg: string; dot: string }> = {
    A: { border: 'border-cyan-500/80', badge: 'bg-cyan-500 text-black', text: 'text-cyan-400', bg: 'bg-cyan-950/20', dot: 'bg-cyan-400' },
    B: { border: 'border-amber-500/80', badge: 'bg-amber-500 text-black', text: 'text-amber-400', bg: 'bg-amber-950/20', dot: 'bg-amber-400' },
    C: { border: 'border-emerald-500/80', badge: 'bg-emerald-500 text-black', text: 'text-emerald-400', bg: 'bg-emerald-950/20', dot: 'bg-emerald-400' },
    D: { border: 'border-purple-500/80', badge: 'bg-purple-500 text-white', text: 'text-purple-400', bg: 'bg-purple-950/20', dot: 'bg-purple-400' },
  };

  const groupsToDisplay: GroupType[] =
    selectedGroupFilter === 'ALL' ? ['A', 'B', 'C', 'D'] : [selectedGroupFilter];

  return (
    <div className="space-y-4 pb-16 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Header Bar: Responsive across phone and desktop */}
      <div className="flex items-center justify-between gap-2 flex-wrap bg-neutral-900 border border-emerald-500/50 p-2.5 sm:p-3 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-sm">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isEn ? 'GUEST VIEW' : 'VISUALE OSPITI'}</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            DAY 0{activeDay}
          </span>
        </div>

        {/* Operator selection indicator */}
        <div className="flex items-center gap-2">
          {canSelectOperator ? (
            <div className="flex items-center gap-1.5 bg-neutral-950 px-2 py-1 border border-emerald-700/60 rounded">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">{isEn ? 'Guest:' : 'Ospite:'}</span>
              <select
                value={currentGuest.id}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {guests.map((g) => (
                  <option key={g.id} value={g.id} className="bg-neutral-900 text-white">
                    {g.badgeCode ? `[${g.badgeCode}] ` : ''}{g.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-neutral-950 text-emerald-300 font-mono text-xs border border-emerald-800 rounded flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <strong className="text-white text-xs">{currentGuest.badgeCode || 'GUEST'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockModal(true)}
                className="p-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 border border-neutral-800 rounded transition-colors cursor-pointer"
                title={isEn ? 'Unlock Selector (Control Room / Direction)' : 'Sblocca Selettore (Regia / Direzione)'}
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOP SECTION: ADAPTIVE 2-COLUMN ON DESKTOP, 1-COLUMN STACK ON SMARTPHONE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* 1. DIGITAL VIP OBSERVER BADGE & ESCORT TUTOR */}
        <div className="lg:col-span-6 bg-neutral-900 border-2 border-emerald-500/80 rounded-xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            {/* Badge Top Line */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-600/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center font-black rounded-lg shadow flex-shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-emerald-600 text-black font-mono font-black text-[10px] uppercase tracking-wider rounded">
                      {currentGuest.badgeCode || 'GUEST'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold bg-neutral-950 px-1.5 py-0.5 border border-emerald-850 rounded">
                      {currentGuest.nationality || (isEn ? 'International' : 'Internazionale')}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5 leading-snug">
                    {currentGuest.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* Title and Organization */}
            <div className="text-xs text-neutral-300 font-medium">
              <span className="text-emerald-400 font-bold">{currentGuest.title}</span>
              <span className="mx-1.5 text-neutral-500">•</span>
              <span className="text-neutral-200">{currentGuest.organization}</span>
            </div>

            {/* Designated Escort Faculty */}
            <div className="bg-neutral-950/90 border border-emerald-900/80 rounded-lg p-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block">{isEn ? 'Escort Tutor:' : 'Tutor Accompagnatore:'}</span>
                  <span className="font-bold text-white">
                    {currentGuest.escortFaculty || (isEn ? 'Hospital Coordination Faculty' : 'Faculty di Coordinamento Ospedale')}
                  </span>
                </div>
              </div>

              {escortFacultyMember?.phone && (
                <a
                  href={`tel:${escortFacultyMember.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded shadow transition-all"
                >
                  <Phone className="w-3 h-3" />
                  <span>{isEn ? 'Call' : 'Chiama'}</span>
                </a>
              )}
            </div>

            {/* Collapsible Section for Accreditation Details & Safety Guidelines */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowProfileDetails(!showProfileDetails)}
                className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 py-1 px-1 -ml-1 rounded hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <span>{showProfileDetails ? (isEn ? 'Hide accreditation sheet' : 'Nascondi scheda accreditamento') : (isEn ? 'Show accreditation details' : 'Mostra dettagli accreditamento')}</span>
                {showProfileDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setShowVademecum(!showVademecum)}
                className="text-xs text-neutral-300 hover:text-white font-bold flex items-center gap-1 py-1 px-2 bg-neutral-950 border border-neutral-800 rounded transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-orange-400" />
                <span>{isEn ? 'Guest Handbook' : 'Vademecum Ospite'}</span>
              </button>
            </div>

            {/* Expanded Details Drawer */}
            {showProfileDetails && (
              <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Assigned Days:' : 'Giorni Assegnati:'}</span>
                  <span className="font-bold text-white">
                    {currentGuest.assignedDays?.map((d) => `Day 0${d}`).join(', ') || 'Day 02 & Day 03'}
                  </span>
                </div>
                <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Institutional Email:' : 'Email Istituzionale:'}</span>
                  <span className="font-mono text-neutral-200 truncate block">{currentGuest.email || 'ospite@example.com'}</span>
                </div>
                {currentGuest.phone && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Phone:' : 'Telefono:'}</span>
                    <span className="font-mono text-neutral-200">{currentGuest.phone}</span>
                  </div>
                )}
                {currentGuest.notes && (
                  <div className="bg-neutral-950 p-2.5 border border-neutral-850 rounded">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase block">{isEn ? 'Guest Notes:' : 'Note Ospite:'}</span>
                    <span className="text-neutral-300 italic">{currentGuest.notes}</span>
                  </div>
                )}
              </div>
            )}

            {/* Vademecum & Safety Briefing Modal / Alert */}
            {showVademecum && (
              <div className="p-3 bg-neutral-950 border border-orange-500/70 rounded-lg space-y-2 text-xs text-neutral-200 shadow-inner">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                  <span className="font-black text-orange-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    {isEn ? 'Observer Code of Conduct & Safety' : 'Regole di Condotta & Sicurezza Osservatori'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVademecum(false)}
                    className="text-neutral-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    {isEn ? '✕ Close' : '✕ Chiudi'}
                  </button>
                </div>
                <ul className="space-y-1.5 text-[11px] text-neutral-300 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold">•</span>
                    <span>{isEn ? <><strong>Mandatory PPE:</strong> In the 3 Tactical Environments, always wear protective eyewear and visible accreditation badge.</> : <><strong>DPI Obbligatori:</strong> Nei 3 Ambienti Tattici indossare sempre occhiali protettivi e badge di riconoscimento visibile.</>}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold">•</span>
                    <span>{isEn ? <><strong>Shock Room Perimeter:</strong> Stay outside the yellow perimeter lines on the floor to allow rapid passage of stretchers.</> : <><strong>Perimetro Shock Room:</strong> Mantenersi all'esterno delle linee perimetrali gialle sul pavimento per consentire il transito rapido delle barelle.</>}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold">•</span>
                    <span>{isEn ? <><strong>Mandatory at :30 SBAR Handover:</strong> During the 5 minutes of clinical handover (:30-:35), maintain strict operational silence to allow structured communication by the Team Leader.</> : <><strong>Tassativo Ore :30 Handover SBAR:</strong> Durante i 5 minuti di consegna clinica (:30-:35) osservare il rigoroso silenzio per consentire la comunicazione strutturata del Team Leader.</>}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 2. TIMELINE & SLOT CONTROLLER */}
        <div className="lg:col-span-6 bg-neutral-900 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-lg space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Day Selector & Live Countdown */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-neutral-950 p-1 border border-neutral-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleSelectDay(2)}
                  className={`px-3 py-2 text-xs font-black font-mono rounded min-h-[44px] flex items-center gap-1 transition-colors cursor-pointer ${
                    activeDay === 2
                      ? 'bg-orange-500 text-black shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isEn ? 'DAY 2' : 'GIORNO 2'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDay(3)}
                  className={`px-3 py-2 text-xs font-black font-mono rounded min-h-[44px] flex items-center gap-1 transition-colors cursor-pointer ${
                    activeDay === 3
                      ? 'bg-orange-500 text-black shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isEn ? 'DAY 3' : 'GIORNO 3'}</span>
                </button>
              </div>

              {/* Timer/Live Badge */}
              <div className="flex items-center gap-2 bg-neutral-950 px-3 py-2 border border-neutral-800 rounded-lg min-h-[44px]">
                <Clock className="w-4 h-4 text-orange-400" />
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase text-neutral-400 block font-bold">Countdown:</span>
                  <span className="font-mono text-xs font-black text-white">
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Slot Details & Step-through navigation */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-orange-400 font-black uppercase">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span>{currentSlot?.timeRange || '08:30 - 08:45'}</span>
                </div>
                <span className="text-neutral-400 font-bold">
                  {isEn ? `Slot ${currentSlotInDayIndex + 1} of ${daySlots.length}` : `Slot ${currentSlotInDayIndex + 1} di ${daySlots.length}`}
                </span>
              </div>

              <h3 className="text-white font-black text-sm sm:text-base leading-snug uppercase tracking-tight">
                {currentSlot?.title || (isEn ? 'Clinical-Training Phase' : 'Fase Clinico-Addestrativa')}
              </h3>

              {/* Quick Navigation Buttons (Prev / Next) */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrevSlot}
                  disabled={currentSlotInDayIndex === 0}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 disabled:opacity-30 disabled:pointer-events-none text-neutral-200 border border-neutral-800 rounded font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-orange-400" />
                  <span>{isEn ? 'Previous' : 'Precedente'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextSlot}
                  disabled={currentSlotInDayIndex === daySlots.length - 1}
                  className="flex-1 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 disabled:opacity-30 disabled:pointer-events-none text-neutral-200 border border-neutral-800 rounded font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors cursor-pointer"
                >
                  <span>{isEn ? 'Next' : 'Successivo'}</span>
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. GROUP FILTER TABS (Adaptive horizontal scroll on mobile, flex-wrap on desktop) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>{isEn ? 'Filter Group on Stage:' : 'Filtra Gruppo in Scena:'}</span>
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            {selectedGroupFilter === 'ALL' ? (isEn ? 'Show All 4 Groups' : 'Mostra Tutti i 4 Gruppi') : (isEn ? `Focus Group ${selectedGroupFilter}` : `Focus Gruppo ${selectedGroupFilter}`)}
          </span>
        </div>

        {/* Touch Scroll Bar for Groups with min 44px height */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedGroupFilter('ALL')}
            className={`px-3 py-2 text-xs font-bold font-mono rounded min-h-[44px] whitespace-nowrap transition-all border cursor-pointer ${
              selectedGroupFilter === 'ALL'
                ? 'bg-neutral-100 text-neutral-950 font-black border-white shadow'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-850'
            }`}
          >
            {isEn ? 'ALL GROUPS (4)' : 'TUTTI I GRUPPI (4)'}
          </button>

          {(['A', 'B', 'C', 'D'] as GroupType[]).map((g) => {
            const isSelected = selectedGroupFilter === g;
            const col = groupColors[g];
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGroupFilter(g)}
                className={`px-3 py-2 text-xs font-bold font-mono rounded min-h-[44px] whitespace-nowrap flex items-center gap-1.5 transition-all border cursor-pointer ${
                  isSelected
                    ? `${col.badge} border-white shadow font-black`
                    : `bg-neutral-900 ${col.text} border-neutral-800 hover:bg-neutral-850`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span>{isEn ? 'GROUP' : 'GRUPPO'} {g}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ADAPTIVE GROUP CARDS: 1 COL ON MOBILE, 2 COLS ON TABLET, 4 COLS ON DESKTOP */}
      <div className={`grid gap-4 ${
        selectedGroupFilter === 'ALL'
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
          : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        {groupsToDisplay.map((g) => {
          const act = currentSlot?.groupActivities?.[g];
          if (!act) return null;

          const slotTitle = (currentSlot?.title || '').toLowerCase();
          const text = `${act.title} ${act.subtitle} ${act.location}`.toLowerCase();

          let style = {
            border: 'border-neutral-800',
            badge: 'bg-cyan-500 text-black',
            label: isEn ? 'CLINICAL ACTIVITY' : 'ATTIVITÀ CLINICA',
            isBlinking: false,
          };

          if (
            text.includes('preallerta') ||
            text.includes('pre-allerta') ||
            text.includes('pre allerta') ||
            text.includes('standby') ||
            text.includes('t -15') ||
            text.includes('vestizione')
          ) {
            style = {
              border: 'border-yellow-500/80',
              badge: 'bg-yellow-400 text-black',
              label: isEn ? 'STANDBY & PRE-ALERT' : 'STANDBY & PRE-ALLERTA',
              isBlinking: true,
            };
          } else if (
            act.activityType === 'workshop' ||
            text.includes('workshop') ||
            text.includes('ws1') ||
            text.includes('ws2')
          ) {
            style = {
              border: 'border-emerald-500/80',
              badge: 'bg-emerald-500 text-black',
              label: isEn ? 'CLINICAL WORKSHOP' : 'WORKSHOP CLINICO',
              isBlinking: false,
            };
          } else if (
            slotTitle.includes('handover') ||
            text.includes('handover') ||
            text.includes('sbar') ||
            act.activityType === 'scenario_extra' ||
            text.includes('scenario tccc') ||
            text.includes('abcde') ||
            text.includes('shock room')
          ) {
            style = {
              border: 'border-red-500/80',
              badge: 'bg-red-600 text-white',
              label: 'SCENARIO LIVE',
              isBlinking: true,
            };
          } else if (text.includes('pausa') || text.includes('ristoro')) {
            style = {
              border: 'border-cyan-500/80',
              badge: 'bg-cyan-400 text-black',
              label: isEn ? 'BREAK & REFRESHMENT' : 'PAUSA & RISTORO',
              isBlinking: false,
            };
          } else if (text.includes('debriefing') || text.includes('revisione')) {
            style = {
              border: 'border-purple-500/80',
              badge: 'bg-purple-600 text-white',
              label: 'DEBRIEFING',
              isBlinking: false,
            };
          }

          const squadNumbers =
            g === 'A' ? [1, 2, 3] : g === 'B' ? [4, 5, 6] : g === 'C' ? [7, 8, 9] : [10, 11, 12];

          const phaseDetails = getGroupPhaseDetails(
            g,
            act,
            currentSlot,
            activeDay,
            simulatorPatients,
            technicians,
            language
          );

          return (
            <div
              key={g}
              className={`bg-neutral-900 border-2 rounded-xl p-4 space-y-3.5 shadow-xl transition-all flex flex-col justify-between ${style.border}`}
            >
              <div className="space-y-3">
                {/* Card Header: Group and Live Status */}
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded ${groupColors[g].badge}`}>
                      {isEn ? 'GROUP' : 'GRUPPO'} {g}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-300">
                      {g === 'A' ? 'DISC 01-15' : g === 'B' ? 'DISC 16-30' : g === 'C' ? 'DISC 31-45' : 'DISC 46-60'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider rounded border border-neutral-700 ${
                    style.isBlinking ? 'bg-red-950 text-red-200 animate-pulse' : 'bg-neutral-950 text-neutral-300'
                  }`}>
                    {style.label}
                  </span>
                </div>

                {/* Activity Title, Subtitle & Location Box */}
                <div className="space-y-1.5">
                  <h4 className="text-white font-black text-base sm:text-lg leading-snug">
                    {act.title}
                  </h4>
                  <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                    {act.subtitle}
                  </p>

                  {/* Location Badge (High visibility for observer navigation) */}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-orange-400 font-bold w-full">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{isEn ? 'Location:' : 'Sede:'} <strong>{act.location}</strong></span>
                  </div>
                </div>

                {/* Squadre & Faculty Details */}
                <div className="bg-neutral-950/80 border border-neutral-850 rounded-lg p-2.5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                    {isEn ? 'Teams & Assigned Tutors (1:1 Ratio):' : 'Squadre & Tutor Assegnati (Rapporto 1:1):'}
                  </span>
                  <div className="space-y-1">
                    {squadNumbers.map((sqNum) => {
                      const facMatch = faculty.find((f) => f.assignedTeamId === sqNum) || faculty[sqNum - 1];
                      const facName = facMatch ? facMatch.name : `Faculty Sq ${sqNum}`;
                      const facCode = facMatch?.badgeCode || `FAC-${sqNum < 10 ? '0' + sqNum : sqNum}`;
                      return (
                        <div
                          key={sqNum}
                          className="flex items-center justify-between bg-neutral-900/90 px-2.5 py-1.5 border border-neutral-800 rounded text-xs"
                        >
                          <span className="text-orange-400 font-mono font-black text-[11px]">
                            {isEn ? 'Team' : 'Squadra'} {sqNum}
                          </span>
                          <div className="text-right">
                            <span className="font-semibold text-white truncate inline-block max-w-[170px]">
                              {facName}
                            </span>
                            <span className="text-neutral-400 font-mono text-[10px] ml-1">
                              ({facCode})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dettagli Operativi della Fase per l'Ospite */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2.5">
                  {/* Timing Warning if applicable */}
                  {phaseDetails.protocolTimingNote && (
                    <div className="flex items-start gap-2 p-2 bg-yellow-950/60 border border-yellow-500/80 rounded text-yellow-200 text-xs shadow-inner">
                      <Clock className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black uppercase text-[10px] block text-yellow-400">
                          {isEn ? 'TIMING DIRECTIVE:' : 'DIRETTIVA TIMING:'}
                        </span>
                        <span className="text-[11px] leading-snug">{phaseDetails.protocolTimingNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Operational Summary */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                      {isEn ? 'What the group is performing:' : 'Cosa sta svolgendo il gruppo:'}
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      {phaseDetails.operationalDescription}
                    </p>
                  </div>

                  {/* Didactic Objectives (Compact bullet list) */}
                  <div className="space-y-1 pt-1 border-t border-neutral-850">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold flex items-center gap-1">
                      <Target className="w-3 h-3 text-orange-400" />
                      {isEn ? 'Station Objectives:' : 'Obiettivi di Postazione:'}
                    </span>
                    {phaseDetails.didacticObjectives.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-neutral-300 pl-0.5">
                        {phaseDetails.didacticObjectives.map((obj, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-orange-400 font-bold">•</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic">{isEn ? 'Briefing and general overview.' : 'Briefing e inquadramento generale.'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Presidio Tecnico di Postazione con Click-to-Call */}
              <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs mt-2">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Wrench className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span className="text-[10px] uppercase font-mono text-neutral-400">{isEn ? 'Technician:' : 'Tecnico:'}</span>
                  <span className="font-bold text-white text-[11px]">
                    {phaseDetails.technicianData.hasTech
                      ? `${phaseDetails.technicianData.techName} (${phaseDetails.technicianData.techBadge})`
                      : (isEn ? 'Control Room' : 'Presidio Regia')}
                  </span>
                </div>

                {phaseDetails.technicianData.hasTech && phaseDetails.technicianData.techPhone && (
                  <a
                    href={`tel:${phaseDetails.technicianData.techPhone}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-orange-300 border border-orange-700/60 rounded text-[10px] font-mono font-bold"
                    title={isEn ? 'Call Station Technician' : 'Chiama Tecnico di Postazione'}
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>{isEn ? 'Call' : 'Chiama'}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel={isEn ? 'Guest' : 'Ospite'}
      />
    </div>
  );
};
