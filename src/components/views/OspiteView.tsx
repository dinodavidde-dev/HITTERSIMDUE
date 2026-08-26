import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  Award,
  Building,
  Clock,
  ExternalLink,
  Eye,
  HeartPulse,
  Info,
  MapPin,
  MessageSquare,
  QrCode,
  Radio,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { CourseMessengerModal } from '../messaging/CourseMessengerModal';
import { LanguageSwitcher } from '../LanguageSwitcher';

type OspiteSubTab = 'field' | 'my_pass' | 'programma';

export const OspiteView: React.FC = () => {
  const {
    activeDay,
    currentSlot,
    timerSeconds,
    isTimerRunning,
    guests,
    selectedGuestId,
    setSelectedGuestId,
    teams,
    simulatorPatients,
    suspensionInfo,
    language,
    t,
  } = useCourse();

  const isEn = language === 'en';
  const [activeSubTab, setActiveSubTab] = useState<OspiteSubTab>('field');
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);

  const currentGuest = guests.find((g) => g.id === selectedGuestId) || guests[0] || {
    id: 'guest-1',
    name: 'Ospite Istituzionale',
    organization: 'Delegazione Sanitaria',
    title: 'Osservatore Ufficiale',
    badgeCode: 'OSP-01',
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Card */}
      <div className="bg-neutral-950 border-2 border-cyan-500/80 p-3 sm:p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-cyan-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Eye className="w-3.5 h-3.5" />
              {isEn ? 'GUEST & DELEGATION PORTAL' : 'PORTALE OSPITI & DELEGAZIONI'}
            </span>
            <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
              DAY 0{activeDay} • {currentSlot.period.toUpperCase()}
            </span>
            {suspensionInfo.isSuspended && (
              <span className="bg-red-600 text-white font-black text-[11px] px-2 py-0.5 animate-pulse">
                {isEn ? 'COURSE SUSPENDED' : 'CORSO SOSPESO'}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-tight">
            {isEn ? 'Welcome,' : 'Benvenuto,'} {currentGuest.name}
          </h2>
          <p className="text-xs text-cyan-200/90 font-medium">
            {currentGuest.title || (isEn ? 'Observer' : 'Osservatore')} • {currentGuest.organization || (isEn ? 'Guest Delegation' : 'Delegazione Ospiti')}
          </p>
        </div>

        {/* Quick Actions & Guest Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <LanguageSwitcher variant="badge" />

          {/* Guest selector */}
          {guests.length > 1 && (
            <select
              value={selectedGuestId || currentGuest.id}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              className="bg-neutral-900 border border-cyan-700 text-cyan-200 text-xs font-bold px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
            >
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.organization})
                </option>
              ))}
            </select>
          )}

          <button
            id="guest-send-message-btn"
            onClick={() => setIsMessengerOpen(true)}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider border border-black transition-all cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Send className="w-3 h-3" />
            <span>{isEn ? 'SEND NOTE TO CONTROL' : 'INVIA NOTA A REGIA'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          id="guest-tab-field-btn"
          onClick={() => setActiveSubTab('field')}
          className={`flex-1 min-w-[140px] py-1.5 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeSubTab === 'field'
              ? 'bg-cyan-500 text-black border-cyan-500 shadow-xs'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{isEn ? 'ACTIVE FIELD / ROTATION' : 'MODULO ATTIVO / CAMPO'}</span>
        </button>

        <button
          id="guest-tab-pass-btn"
          onClick={() => setActiveSubTab('my_pass')}
          className={`flex-1 min-w-[140px] py-1.5 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeSubTab === 'my_pass'
              ? 'bg-cyan-500 text-black border-cyan-500 shadow-xs'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isEn ? 'MY BADGE PASS' : 'IL MIO BADGE PASS'}</span>
        </button>

        <button
          id="guest-tab-program-btn"
          onClick={() => setActiveSubTab('programma')}
          className={`flex-1 min-w-[140px] py-1.5 px-3 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeSubTab === 'programma'
              ? 'bg-cyan-500 text-black border-cyan-500 shadow-xs'
              : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>{isEn ? 'TOUR & SIM STRUCTURE' : 'PERCORSO VISITA & SCENARI'}</span>
        </button>
      </div>

      {/* SUBTAB 1: FIELD OPERATIONS */}
      {activeSubTab === 'field' && (
        <div className="space-y-6">
          {/* Active Phase & Timer Card */}
          <div className="bg-neutral-900 border-2 border-neutral-800 p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest font-mono">
                  {isEn ? 'LIVE FIELD ACTIVE PHASE' : 'FASE ATTIVA IN DIRETTA SUL CAMPO'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  {currentSlot.title}
                </h3>
                <p className="text-xs text-neutral-300 font-semibold">
                  {currentSlot.description}
                </p>
              </div>

              <div className="bg-neutral-950 border-2 border-cyan-500/60 px-5 py-3 text-center flex-shrink-0">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                  {isEn ? 'PHASE COUNTDOWN' : 'COUNTDOWN FASE'}
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">
                  {formatTimer(timerSeconds)}
                </span>
                <div className="text-[10px] font-bold text-neutral-400 mt-0.5">
                  {isTimerRunning ? (isEn ? '🟢 RUNNING' : '🟢 IN ESECUZIONE') : (isEn ? '⏸️ PAUSED' : '⏸️ IN PAUSA')}
                </div>
              </div>
            </div>

            {/* Rotations overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {['A', 'B', 'C', 'D'].map((grp) => {
                const grpTeams = teams.filter((t) => t.groupId === grp);
                return (
                  <div key={grp} className="bg-neutral-950 p-3.5 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                      <span className="font-black text-xs text-cyan-400 uppercase">
                        {isEn ? `GROUP ${grp}` : `GRUPPO ${grp}`}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {grpTeams.length} {isEn ? 'Teams' : 'Squadre'}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {grpTeams.map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-neutral-300">
                          <span className="font-bold">{t.name}</span>
                          <span className="font-mono text-[11px] text-neutral-400">{t.color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MY PASS */}
      {activeSubTab === 'my_pass' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 p-6 shadow-xl max-w-md mx-auto space-y-4">
          <div className="text-center space-y-1 border-b border-neutral-800 pb-4">
            <span className="px-2.5 py-0.5 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest">
              {isEn ? 'GUEST ACCREDITATION BADGE' : 'BADGE ACCREDITAMENTO OSPITE'}
            </span>
            <h3 className="text-xl font-black text-white uppercase">{currentGuest.name}</h3>
            <p className="text-xs text-cyan-300 font-semibold">{currentGuest.organization}</p>
          </div>

          <div className="flex justify-center py-2">
            <QRCodeDisplay
              value={`https://trauma-sim.med/guest?id=${currentGuest.id}&badge=${currentGuest.badgeCode || 'OSP-01'}`}
              size={180}
            />
          </div>

          <div className="bg-neutral-950 p-3 border border-neutral-800 text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">{isEn ? 'BADGE CODE:' : 'CODICE BADGE:'}</span>
              <span className="text-white font-bold">{currentGuest.badgeCode || 'OSP-01'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{isEn ? 'TITLE:' : 'TITOLO:'}</span>
              <span className="text-cyan-300 font-bold">{currentGuest.title || (isEn ? 'Observer' : 'Osservatore')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{isEn ? 'ZONE ACCESS:' : 'ACCESSO ZONE:'}</span>
              <span className="text-emerald-400 font-bold">{isEn ? 'ALL AREAS & DEBRIEFING' : 'TUTTE LE AREE & DEBRIEFING'}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PROGRAMMA */}
      {activeSubTab === 'programma' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 p-6 shadow-xl space-y-4">
          <h3 className="font-black text-xl text-white uppercase flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <span>{isEn ? 'VISIT ROUTE AND SIMULATION STRUCTURE' : 'PERCORSO DI VISITA E STRUTTURA DELLE SIMULAZIONI'}</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {isEn
              ? 'The advanced course consists of simultaneous rotations across 4 high-fidelity trauma scenarios featuring pre-hospital TCCC, structured SBAR handoff, and hospital-based resuscitation/damage control surgery (ED / Shock Room).'
              : 'Il corso avanzato si articola in rotazioni simultanee su 4 scenari ad alta fedeltà con gestione extra-ospedaliera TCCC, passaggio di consegne SBAR e rianimazione/chirurgia di controllo del danno intra-ospedaliera (ED / Shock Room).'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="font-black text-sm text-orange-400 uppercase">
                {isEn ? '1. Pre-Hospital Area (TCCC)' : '1. Area Extra-Ospedaliera (TCCC)'}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isEn
                  ? 'Care Under Fire simulation, massive hemorrhage control with tourniquets, hemostatic dressings, and airway management in hostile terrain.'
                  : 'Simulazione sotto minaccia (Care Under Fire), controllo emorragie massive con Tourniquet, medicazioni emostatiche e gestione vie aeree in ambiente impervio.'}
              </p>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-2">
              <h4 className="font-black text-sm text-cyan-400 uppercase">
                {isEn ? '2. Shock Room & Damage Control' : '2. Shock Room & Damage Control'}
              </h4>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {isEn
                  ? 'Advanced resuscitation intake, eFAST ultrasound, thoracostomy, REBOA placement, and massive transfusion protocol activation.'
                  : 'Presa in carico avanzata, ecografia FAST, toracostomia, posizionamento REBOA e attivazione protocolli di trasfusione massiva.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messenger Modal */}
      <CourseMessengerModal
        isOpen={isMessengerOpen}
        onClose={() => setIsMessengerOpen(false)}
        defaultSubject={isEn ? 'Guest Note / Feedback' : 'Nota Ospite / Feedback'}
        defaultStation={currentGuest.organization || (isEn ? 'Guest Delegation' : 'Delegazione Ospiti')}
      />
    </div>
  );
};
