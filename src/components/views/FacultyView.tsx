import React, { useState } from 'react';
import {
  Award,
  Clock,
  User,
  Compass,
  Activity,
  Lock,
} from 'lucide-react';
import { GroupType } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { INITIAL_TIMELINE_SLOTS } from '../../data/initialData';
import { DaySelectorToggle } from '../DaySelectorToggle';
import { FacultyScenariValutazioniModal } from '../faculty/FacultyScenariValutazioniModal';
import { OperatorUnlockModal } from '../common/OperatorUnlockModal';

export const FacultyView: React.FC = () => {
  const {
    activeDay,
    activeSlotIndex,
    timerSeconds,
    isTimerRunning,
    faculty,
    discenti,
    selectedFacultyId,
    setSelectedFacultyId,
    teams,
    simulatorPatients,
    evaluations,
    canSelectOperator,
  } = useCourse();

  // Modal state
  const [showScenariValutazioniModal, setShowScenariValutazioniModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const currentFaculty = faculty.find((f) => f.id === selectedFacultyId) || faculty[0] || {
    id: 'fac-1',
    name: 'Dr. Marco Rossi',
    title: 'Medico di Anestesia e Rianimazione',
    specialty: 'Trauma Team Leader',
    nationality: 'Italiana',
    assignedTeamId: 1,
    organization: 'Ospedale Policlinico Universitario',
    badgeCode: 'FAC-01',
    phone: '+39 333 1234567',
  };

  const assignedTeam = teams.find((t) => t.id === currentFaculty.assignedTeamId);
  const facultyGroup: GroupType = assignedTeam ? assignedTeam.groupId : (currentFaculty.assignedTeamId <= 3 ? 'A' : currentFaculty.assignedTeamId <= 6 ? 'B' : currentFaculty.assignedTeamId <= 9 ? 'C' : 'D');
  const assignedTeamDiscenti = discenti.filter((d) => d.teamId === currentFaculty.assignedTeamId);

  const dayMasterSlots = INITIAL_TIMELINE_SLOTS.filter((s) => s.day === activeDay);

  // Personalized Individual Faculty Timeline based on facultyInvolved or assigned group
  const personalizedTimeline = dayMasterSlots.map((slot) => {
    let matchedActivity: any = null;
    let matchedGroup: GroupType | null = null;
    
    if (slot.groupActivities) {
      for (const [gKey, gAct] of Object.entries(slot.groupActivities)) {
        const act: any = gAct;
        const involvesFaculty = act.facultyInvolved && act.facultyInvolved.some((f: string) => 
          f.toUpperCase() === currentFaculty.badgeCode.toUpperCase() || 
          f.toLowerCase() === currentFaculty.id.toLowerCase()
        );
        if (involvesFaculty || gKey === facultyGroup) {
          matchedActivity = act;
          matchedGroup = gKey as GroupType;
          if (involvesFaculty) break;
        }
      }
    }
    return {
      slot,
      activity: matchedActivity,
      group: matchedGroup || facultyGroup,
    };
  }).filter((item) => item.activity !== null);

  const filteredTimeline = personalizedTimeline.filter(({ slot }) => {
    const sIdx = dayMasterSlots.findIndex((s) => s.id === slot.id);
    return sIdx >= activeSlotIndex;
  });

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto px-4 font-mono">
      {/* Header Banner - Faculty View & Selector */}
      <div className="bg-neutral-900 border-2 border-amber-500/60 p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 bg-amber-600 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 rounded">
            <Award className="w-4 h-4" /> VISUALE FACULTY PERSONALIZZATA
          </span>

          <DaySelectorToggle variant="public" />

          <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 font-mono text-xs border border-neutral-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" /> DAY 0{activeDay}
          </span>
          <span className="px-2 py-0.5 bg-neutral-950 text-amber-400 border border-neutral-800 font-mono text-xs flex items-center gap-1.5">
            <Clock className={`w-3 h-3 ${isTimerRunning ? 'text-amber-400 animate-spin' : 'text-neutral-400'}`} /> T-Fase: {formatTimer(timerSeconds)}
          </span>
        </div>

        {/* Faculty Selector - visible ONLY when opened by Regia or Direttore */}
        {canSelectOperator ? (
          <div className="flex items-center gap-2 flex-wrap bg-amber-950/40 p-1.5 border border-amber-700/50 rounded">
            <span className="text-xs font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Faculty:
            </span>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="bg-neutral-950 text-amber-300 font-mono text-xs border border-amber-700/60 px-3 py-1.5 rounded focus:outline-none focus:border-amber-400 max-w-xs cursor-pointer font-bold"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.badgeCode || 'FAC'} • {f.name} (Sq. {f.assignedTeamId})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-neutral-950 text-amber-300 font-mono text-xs border border-amber-800/80 rounded flex items-center gap-1.5 shadow-inner">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] uppercase tracking-wider text-amber-400/80">Tutor Assegnato:</span>
              <strong className="text-white">{currentFaculty.badgeCode || 'FAC'} • {currentFaculty.name}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              title="Sblocca Selettore (Regia / Direzione)"
              className="p-1 text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* PERSONALIZED FACULTY CARDS (Intestazione & Squadra) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Intestazione Personale Faculty & Scenari Button */}
        <div className="bg-neutral-950 border-2 border-amber-500/80 p-5 rounded shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-amber-600 text-black font-mono font-black text-xs px-3 py-1 rounded-bl">
            {currentFaculty.badgeCode || 'FAC-01'}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest">
              <User className="w-4 h-4" /> Profilo Faculty / Tutor
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight break-words">
                {currentFaculty.name}
              </h2>
              <p className="text-amber-300 font-medium text-xs sm:text-sm pt-0.5 break-words">
                {currentFaculty.title || 'Docente / Tutor Clinico'}
              </p>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-neutral-800 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-neutral-300">
              <div>
                <span className="block text-[10px] text-neutral-400 uppercase">Nazionalità:</span>
                <strong className="text-white truncate block">{currentFaculty.nationality || 'Italiana'}</strong>
              </div>
              <div className="truncate">
                <span className="block text-[10px] text-neutral-400 uppercase">Affiliazione:</span>
                <strong className="text-white truncate block" title={currentFaculty.organization || currentFaculty.affiliation}>{currentFaculty.organization || currentFaculty.affiliation || 'Ospedale'}</strong>
              </div>
            </div>

            {/* Scenari & Valutazioni Button inside Box 1 */}
            <button
              type="button"
              onClick={() => setShowScenariValutazioniModal(true)}
              className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4 text-black animate-pulse" /> 📋 Scenari & Valutazioni
            </button>
          </div>
        </div>

        {/* Box 2: Assegnazione Squadra & Anagrafica */}
        <div className="bg-neutral-950 border-2 border-orange-500/80 p-5 rounded shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-orange-600 text-black font-mono font-black text-xs px-3 py-1 rounded-bl">
            GRUPPO {facultyGroup} • SQ. {currentFaculty.assignedTeamId}
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-mono uppercase tracking-widest">
              <Compass className="w-4 h-4" /> Specifiche Gruppo & Squadra Assegnata
            </div>
            <div className="bg-neutral-900 p-3 border border-neutral-800 grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Macro-Gruppo:</span>
                <strong className="text-white text-xs sm:text-sm">GRUPPO {facultyGroup}</strong>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px] uppercase">Squadra Specifica:</span>
                <strong className="text-amber-400 text-xs sm:text-sm">Squadra {currentFaculty.assignedTeamId}</strong>
              </div>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Anagrafica Discenti Squadra {currentFaculty.assignedTeamId} (1:1):</span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
              {assignedTeamDiscenti.length > 0 ? (
                assignedTeamDiscenti.map((d, idx) => (
                  <div key={d.id} className="flex items-center justify-between text-[11px] font-mono bg-neutral-900 px-2 py-1 border border-neutral-800 gap-2">
                    <span className="text-white font-bold truncate">{d.badgeCode || `DISC-0${idx+1}`} • {d.name}</span>
                    <span className="text-orange-300 font-semibold flex-shrink-0">{d.role || (idx === 0 ? 'Team Leader' : 'Operatore')}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 font-mono">Nessun discente associato alla squadra.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE INDIVIDUALE FACULTY */}
      <div className="bg-neutral-900 border-2 border-amber-500/80 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-neutral-800 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
              TIMELINE INDIVIDUALE FACULTY • {currentFaculty.badgeCode} ({currentFaculty.name}) • DAY 0{activeDay}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-amber-400" /> Programma Operativo Giornaliero Tutor & Squadra {currentFaculty.assignedTeamId}
            </h3>
          </div>
          <span className="px-3 py-1 bg-amber-950 border border-amber-600 text-xs font-mono text-amber-300">
            {filteredTimeline.length} Attività Rimanenti
          </span>
        </div>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
          {filteredTimeline.map(({ slot, activity, group }) => {
            const isCurrentSlot = slot.id === dayMasterSlots[activeSlotIndex]?.id;
            const actType = activity.activityType || '';
            const isScenario = actType.includes('scenario') || activity.title?.toLowerCase().includes('tccc') || activity.title?.toLowerCase().includes('shock room');
            const isWorkshop = actType.includes('workshop') || activity.title?.toLowerCase().includes('workshop') || activity.title?.toLowerCase().includes('skills');
            const isDebrief = actType.includes('debriefing') || activity.title?.toLowerCase().includes('debriefing');

            return (
              <div
                key={slot.id}
                className={`p-4 border rounded font-mono text-xs transition-all ${
                  isCurrentSlot
                    ? 'bg-amber-950/90 border-amber-400 ring-2 ring-amber-400/60 shadow-xl'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-amber-300 font-bold">
                      🕒 {slot.timeRange}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isScenario ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                      isWorkshop ? 'bg-cyan-950 text-cyan-300 border border-cyan-600' :
                      isDebrief ? 'bg-purple-950 text-purple-300 border border-purple-600' :
                      'bg-neutral-900 text-neutral-300 border-neutral-700'
                    }`}>
                      {slot.title}
                    </span>
                  </div>
                  {isCurrentSlot && (
                    <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black animate-pulse uppercase">
                      ⚡ FASE ATTIVA IN CORSO
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase block">Attività / Modulo:</span>
                    <strong className="text-white text-sm block">{activity.title}</strong>
                    <span className="text-neutral-300 text-xs block">{activity.subtitle}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase block">Ubicazione / Postazione:</span>
                    <strong className="text-amber-400 text-sm flex items-center gap-1">
                      📍 {activity.location}
                    </strong>
                    {activity.patientIds && activity.patientIds.length > 0 && (
                      <span className="text-cyan-300 text-[11px] block pt-0.5">Pazienti ID: #{activity.patientIds.join(', #')}</span>
                    )}
                  </div>
                  <div className="text-right sm:text-left">
                    <span className="text-neutral-400 text-[10px] uppercase block">Coinvolgimento 1:1:</span>
                    <span className="text-orange-300 font-bold block">Gruppo {group} (Sq. {currentFaculty.assignedTeamId})</span>
                    <span className="text-neutral-400 text-[11px] block">{currentFaculty.badgeCode} • {currentFaculty.name}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faculty Scenari & Valutazioni Modal */}
      <FacultyScenariValutazioniModal
        isOpen={showScenariValutazioniModal}
        onClose={() => setShowScenariValutazioniModal(false)}
        currentFaculty={currentFaculty}
        simulatorPatients={simulatorPatients}
        evaluations={evaluations}
      />

      {/* REGIA/DIREZIONE OPERATOR UNLOCK MODAL */}
      <OperatorUnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        roleLabel="Faculty / Tutor"
      />
    </div>
  );
};
