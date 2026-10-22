import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  ActorPhysicalStatus,
  ClothingSize,
  CourseActor,
  CourseDay,
  MakeupArtist,
} from '../../types';
import { OPERATIONAL_BLOCKS_BY_DAY, getStationIndexForPatientId } from '../../data/protesiCatalog';
import {
  Sparkles,
  UserCheck,
  Users,
  AlertTriangle,
  Edit2,
  Plus,
  Trash2,
  Phone,
  Mail,
  Shirt,
  ShieldAlert,
  Link2,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import {
  ActorProgressStatusControl,
  ACTOR_PROGRESS_META,
} from './ActorProgressStatusControl';
import { ParticipantQRModal } from './ParticipantQRModal';
import { checkActorCriticality, getSimulatedCourseMinutes } from '../../utils/deephitterSync';

export interface AnagraficaTruccoPanelProps {
  forcedSection?: 'attori' | 'truccatori' | 'matrice';
  initialSection?: 'attori' | 'truccatori' | 'matrice';
}

export const AnagraficaTruccoPanel: React.FC<AnagraficaTruccoPanelProps> = ({
  forcedSection,
  initialSection = 'attori',
}) => {
  const {
    actors,
    updateActor,
    addActor,
    deleteActor,
    makeupArtists,
    updateMakeupArtist,
    addMakeupArtist,
    deleteMakeupArtist,
    linkActorToMakeupArtist,
    assignTruccoToPatient,
    rebalanceTruccoWorkload,
    updateActorProgressStatus,
    simulatorPatients,
    activeDay,
    currentSlot,
    timerSeconds,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const [internalTab, setInternalTab] = useState<'attori' | 'truccatori' | 'matrice'>(
    forcedSection || initialSection
  );
  const subTab = forcedSection || internalTab;
  const setSubTab = (next: 'attori' | 'truccatori' | 'matrice') => {
    setInternalTab(next);
  };
  const [statusFilter, setStatusFilter] = useState<'ALL' | ActorPhysicalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [matrixDay, setMatrixDay] = useState<CourseDay>(2);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Modals for Actor Edit/Create
  const [editingActor, setEditingActor] = useState<CourseActor | null>(null);
  const [isAddingActor, setIsAddingActor] = useState(false);
  const [newActorForm, setNewActorForm] = useState<Omit<CourseActor, 'id'>>({
    slotNumber: actors.length + 1,
    badgeCode: `ATT-${String(actors.length + 1).padStart(2, '0')}`,
    name: '',
    physicalStatus: 'INTERO',
    amputationDetails: 'Corpo intero — idoneo scenari politrauma ed estrazione tattica',
    clothingSize: 'M',
    makeupAllergies: 'Nessuna allergia nota',
    assignedMakeupArtistId: makeupArtists[0]?.id || 'truc-1',
    nationality: 'Italiana',
    phone: '+39 320 0000000',
    email: '',
    organization: 'Gruppo Figuranti Speciali Trauma',
    notes: '',
  });

  // Modals for Makeup Artist Edit/Create
  const [editingArtist, setEditingArtist] = useState<MakeupArtist | null>(null);
  const [selectedArtistForQr, setSelectedArtistForQr] = useState<MakeupArtist | null>(null);
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [newArtistForm, setNewArtistForm] = useState<Omit<MakeupArtist, 'id'>>({
    badgeCode: `TRUC-${String(makeupArtists.length + 1).padStart(2, '0')}`,
    name: '',
    role: 'Specialista Moulage & Protesi',
    specialty: 'Applicazione silicone, ferite balistiche e linee ematiche',
    nationality: 'Italiana',
    phone: '+39 340 0000000',
    email: '',
    organization: 'SFX Medical Moulage Lab',
    assignedStation: 'Lab Moulage Centrale',
    notes: '',
  });

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const sortedActors = useMemo(() => {
    return [...actors]
      .sort((a, b) => a.slotNumber - b.slotNumber)
      .filter((actor) => {
        if (statusFilter !== 'ALL' && actor.physicalStatus !== statusFilter) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          actor.name.toLowerCase().includes(q) ||
          actor.badgeCode.toLowerCase().includes(q) ||
          actor.amputationDetails.toLowerCase().includes(q) ||
          actor.makeupAllergies.toLowerCase().includes(q)
        );
      });
  }, [actors, statusFilter, searchQuery]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return makeupArtists;
    const q = searchQuery.toLowerCase();
    return makeupArtists.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.badgeCode.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.specialty.toLowerCase().includes(q)
    );
  }, [makeupArtists, searchQuery]);

  const amputatiCount = useMemo(
    () => actors.filter((a) => a.physicalStatus === 'AMPUTATO').length,
    [actors]
  );
  const interiCount = useMemo(
    () => actors.filter((a) => a.physicalStatus === 'INTERO').length,
    [actors]
  );

  const getMakeupArtistById = (id?: string) =>
    makeupArtists.find((m) => m.id === id) || makeupArtists[0];

  const getActorById = (id?: string) =>
    actors.find((a) => a.id === id) || actors[0];

  const getScenariosForActor = (actorId: string) =>
    simulatorPatients.filter((p) => p.assignedActorId === actorId);

  const getScenariosForArtist = (artistId: string) =>
    simulatorPatients.filter((p) => p.assignedMakeupArtistId === artistId);

  const isScenarioAmputationRequired = (lesioni: string[], moulage: string) => {
    const joined = `${lesioni.join(' ')} ${moulage}`.toLowerCase();
    return joined.includes('amputa') || joined.includes('moncone');
  };

  const handleSaveActorEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActor) return;
    updateActor(editingActor.id, editingActor);
    linkActorToMakeupArtist(editingActor.id, editingActor.assignedMakeupArtistId, true);
    setEditingActor(null);
    triggerToast(`Slot ${editingActor.badgeCode} (${editingActor.name}) aggiornato e sincronizzato.`);
  };

  const handleCreateActor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActorForm.name.trim()) return;
    addActor(newActorForm);
    setIsAddingActor(false);
    triggerToast(`Nuovo attore ${newActorForm.badgeCode} (${newActorForm.name}) inserito in anagrafica.`);
  };

  const handleSaveArtistEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist) return;
    updateMakeupArtist(editingArtist.id, editingArtist);
    setEditingArtist(null);
    triggerToast(`Truccatore ${editingArtist.badgeCode} (${editingArtist.name}) aggiornato.`);
  };

  const handleCreateArtist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtistForm.name.trim()) return;
    addMakeupArtist(newArtistForm);
    setIsAddingArtist(false);
    triggerToast(`Nuovo truccatore ${newArtistForm.badgeCode} (${newArtistForm.name}) aggiunto.`);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner Separato per Anagrafica Attori vs Anagrafica Truccatori vs Matrice */}
      <div
        className={`bg-neutral-900 border p-4 sm:p-5 space-y-4 ${
          subTab === 'attori'
            ? 'border-amber-500/60'
            : subTab === 'truccatori'
            ? 'border-pink-500/60'
            : 'border-cyan-500/60'
        }`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1">
            <div
              className={`flex items-center gap-2 text-xs ${
                subTab === 'attori'
                  ? 'text-amber-400'
                  : subTab === 'truccatori'
                  ? 'text-pink-400'
                  : 'text-cyan-400'
              }`}
            >
              {subTab === 'attori' ? (
                <Users className="w-4 h-4" />
              ) : subTab === 'truccatori' ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              <span className="font-bold uppercase tracking-wider">
                {subTab === 'attori'
                  ? isEn
                    ? 'DEDICATED ACTORS ROSTER • 8 PRINCIPAL SLOTS (ATT-01 – ATT-08)'
                    : 'SCHEDA DEDICATA ANAGRAFICA ATTORI • 8 SLOT PRINCIPALI (ATT-01 – ATT-08)'
                  : subTab === 'truccatori'
                  ? isEn
                    ? 'DEDICATED MAKEUP ARTISTS ROSTER • SFX & MOULAGE TEAM (TRUC-01 – TRUC-08)'
                    : 'SCHEDA DEDICATA ANAGRAFICA TRUCCATORI • TEAM MOULAGE & SFX (TRUC-01 – TRUC-08)'
                  : isEn
                  ? 'OPERATIONAL PAIRING MATRIX • MAKEUP ARTIST ↔ ACTOR PER SCENARIO'
                  : 'MATRICE OPERATIVA ASSOCIAZIONE TRUCCATORE ↔ ATTORE PER BLOCCO/SCENARIO'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {subTab === 'attori'
                ? isEn
                  ? 'Anagrafica Attori • 8 Principal Slots (Amputee vs Full-Body, Clothing Size & Allergies)'
                  : 'Anagrafica Attori • 8 Slot Principali (Stato Amputato / Intero, Taglia Vestiario e Allergie)'
                : subTab === 'truccatori'
                ? isEn
                  ? 'Anagrafica Truccatori • SFX Specialists, Prosthetics & Moulage Lab Team'
                  : 'Anagrafica Truccatori • Specialisti Moulage, Protesi Siliconiche e Linee Ematiche'
                : isEn
                ? 'Operational Association Matrix • Truccatore ↔ Attore across Blocks 1–4'
                : 'Matrice Operativa Associazioni • Truccatore ↔ Attore sui 4 Blocchi'}
            </h2>
            <p className="text-xs text-neutral-400 font-sans max-w-4xl">
              {subTab === 'attori'
                ? isEn
                  ? 'Standalone roster of the 8 principal actor slots specifying physical status (Amputee or Full-Body), anatomical details, clothing size, makeup allergies, 5-stage progress status and paired makeup artist.'
                  : 'Anagrafica separata e dedicata agli 8 slot principali figuranti (ATT-01 – ATT-08) con specifica dello stato fisico (Amputato o Intero), dettaglio anatomico, taglia vestiario, allergie trucco, stato avanzamento a 5 fasi e truccatore associato.'
                : subTab === 'truccatori'
                ? isEn
                  ? 'Standalone roster of the Makeup Artists (TRUC-01 – TRUC-08) with SFX specialization, assigned station, contacts and paired actors.'
                  : 'Anagrafica separata e dedicata ai Truccatori (TRUC-01 – TRUC-08) con ruolo, specializzazione protesica/SFX, postazione Lab Moulage, contatti e attori abbinati.'
                : isEn
                ? 'Configure and override the 1:1 Makeup Artist to Actor pairing for each individual block and scenario.'
                : 'Configura e personalizza l\'abbinamento Truccatore ↔ Attore per ogni singolo blocco operativo e paziente (#1–#24).'}
            </p>
          </div>

          {/* Summary KPI Counters tailored to the active section */}
          {subTab === 'attori' ? (
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-neutral-950 border border-amber-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  ATTORI AMPUTATI
                </span>
                <span className="text-lg font-black text-white tabular-nums">{amputatiCount}</span>
                <span className="text-[10px] text-neutral-400 block">Moncone Reale</span>
              </div>
              <div className="bg-neutral-950 border border-cyan-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                  ATTORI INTERI
                </span>
                <span className="text-lg font-black text-white tabular-nums">{interiCount}</span>
                <span className="text-[10px] text-neutral-400 block">Corpo Intero</span>
              </div>
              <div className="bg-neutral-950 border border-emerald-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  TOTALE SLOT
                </span>
                <span className="text-lg font-black text-white tabular-nums">{actors.length}</span>
                <span className="text-[10px] text-neutral-400 block">ATT-01..08</span>
              </div>
            </div>
          ) : subTab === 'truccatori' ? (
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-neutral-950 border border-pink-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-pink-400 uppercase font-bold block">
                  TRUCCATORI SFX
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  {makeupArtists.length}
                </span>
                <span className="text-[10px] text-neutral-400 block">TRUC-01..08</span>
              </div>
              <div className="bg-neutral-950 border border-amber-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  COPPIE ATTIVE
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  {actors.filter((a) => Boolean(a.assignedMakeupArtistId)).length}
                </span>
                <span className="text-[10px] text-neutral-400 block">1:1 con Attori</span>
              </div>
              <div className="bg-neutral-950 border border-cyan-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                  SCENARI COPERTI
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  {simulatorPatients.length}
                </span>
                <span className="text-[10px] text-neutral-400 block">Day 2 & Day 3</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 shrink-0">
              <div className="bg-neutral-950 border border-amber-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-amber-400 uppercase font-bold block">
                  SLOT ATTORI
                </span>
                <span className="text-lg font-black text-white tabular-nums">{actors.length}</span>
                <span className="text-[10px] text-neutral-400 block">
                  {amputatiCount} Amp · {interiCount} Int
                </span>
              </div>
              <div className="bg-neutral-950 border border-pink-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-pink-400 uppercase font-bold block">
                  TRUCCATORI
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  {makeupArtists.length}
                </span>
                <span className="text-[10px] text-neutral-400 block">Team Moulage</span>
              </div>
              <div className="bg-neutral-950 border border-cyan-500/50 px-3 py-2 text-center">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                  PAZIENTI
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  {simulatorPatients.length}
                </span>
                <span className="text-[10px] text-neutral-400 block">8 Blocchi Tot.</span>
              </div>
            </div>
          )}
        </div>

        {feedbackToast && (
          <div className="p-3 bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Navigation Sub-Tabs (shown only when not locked to a single forcedSection) + Search + Add Actions */}
        <div className="pt-3 border-t border-neutral-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {!forcedSection ? (
            <div className="flex flex-wrap gap-1.5 bg-neutral-950 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setSubTab('attori')}
                className={`px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  subTab === 'attori'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>1. Anagrafica Attori ({actors.length} Slot: Amputato / Intero)</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('truccatori')}
                className={`px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  subTab === 'truccatori'
                    ? 'bg-pink-600 text-white font-black'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. Anagrafica Truccatori ({makeupArtists.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTab('matrice')}
                className={`px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  subTab === 'matrice'
                    ? 'bg-cyan-500 text-black font-black'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>3. Matrice Associazioni Truccatore ↔ Attore</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-neutral-300 font-bold flex items-center gap-2">
              {subTab === 'attori' && (
                <span>
                  Elenco Ufficiale 8 Slot Principali Attori ({amputatiCount} Amputati · {interiCount}{' '}
                  Interi)
                </span>
              )}
              {subTab === 'truccatori' && (
                <span>
                  Elenco Ufficiale Anagrafica Truccatori & Specialisti Moulage ({makeupArtists.length}{' '}
                  Operatori)
                </span>
              )}
              {subTab === 'matrice' && (
                <span>
                  Matrice Operativa Abbinamento Truccatore ↔ Attore per Blocco e Scenario
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {subTab !== 'matrice' && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    subTab === 'attori'
                      ? 'Cerca attore, slot ATT-xx, arto, allergie...'
                      : 'Cerca truccatore, codice TRUC-xx, specialità...'
                  }
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-950 border border-neutral-700 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            )}

            {subTab === 'attori' && (
              <button
                type="button"
                onClick={() => {
                  setNewActorForm({
                    slotNumber: actors.length + 1,
                    badgeCode: `ATT-${String(actors.length + 1).padStart(2, '0')}`,
                    name: '',
                    physicalStatus: 'INTERO',
                    amputationDetails: 'Corpo intero — idoneo scenari politrauma',
                    clothingSize: 'M',
                    makeupAllergies: 'Nessuna allergia nota',
                    assignedMakeupArtistId: makeupArtists[0]?.id || 'truc-1',
                    nationality: 'Italiana',
                    phone: '+39 320 0000000',
                    email: '',
                    organization: 'Gruppo Figuranti Speciali Trauma',
                    notes: '',
                  });
                  setIsAddingActor(true);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuovo Slot Attore</span>
              </button>
            )}

            {subTab === 'truccatori' && (
              <button
                type="button"
                onClick={() => {
                  setNewArtistForm({
                    badgeCode: `TRUC-${String(makeupArtists.length + 1).padStart(2, '0')}`,
                    name: '',
                    role: 'Specialista Moulage & Protesi',
                    specialty: 'Protesi siliconiche e linee sangue pulsante',
                    nationality: 'Italiana',
                    phone: '+39 340 0000000',
                    email: '',
                    organization: 'SFX Medical Moulage Lab',
                    assignedStation: 'Lab Moulage',
                    notes: '',
                  });
                  setIsAddingArtist(true);
                }}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-xs font-black uppercase cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuovo Truccatore</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                rebalanceTruccoWorkload();
                setFeedbackToast(
                  `Carico ribilanciato in modo omogeneo: ${makeupArtists.length} Truccatori ↔ ${actors.length} Attori (rapporto 1:${(
                    actors.length / Math.max(1, makeupArtists.length)
                  ).toFixed(1)})`
                );
                setTimeout(() => setFeedbackToast(null), 4000);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-black uppercase cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              title="Ridistribuisce omogeneamente attori e scenari su tutti i truccatori attivi"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ribilancia Carico</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SUB-TAB 1: ANAGRAFICA ATTORI (8 SLOT PRINCIPALI: AMPUTATO / INTERO)
      ====================================================================== */}
      {subTab === 'attori' && (
        <div className="space-y-4">
          {/* Filter Bar Stato Fisico */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-neutral-400 font-bold">Filtra per Stato Fisico:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 text-xs font-bold cursor-pointer border ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-700 hover:border-neutral-500'
                }`}
              >
                Tutti gli Slot ({actors.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('AMPUTATO')}
                className={`px-3 py-1 text-xs font-bold cursor-pointer border ${
                  statusFilter === 'AMPUTATO'
                    ? 'bg-amber-500 text-black border-amber-400'
                    : 'bg-neutral-950 text-amber-300 border-amber-700/60 hover:border-amber-500'
                }`}
              >
                Amputato ({amputatiCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('INTERO')}
                className={`px-3 py-1 text-xs font-bold cursor-pointer border ${
                  statusFilter === 'INTERO'
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-neutral-950 text-cyan-300 border-cyan-700/60 hover:border-cyan-500'
                }`}
              >
                Intero ({interiCount})
              </button>
            </div>

            <div className="text-xs text-neutral-400 font-sans">
              Ogni slot attore ha un <strong className="text-pink-300">Truccatore Base Associato</strong> che viene proposto automaticamente nei blocchi operativi.
            </div>
          </div>

          {/* 8 Principal Actor Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {sortedActors.map((actor) => {
              const isAmputee = actor.physicalStatus === 'AMPUTATO';
              const pairedArtist = getMakeupArtistById(actor.assignedMakeupArtistId);
              const assignedScenarios = getScenariosForActor(actor.id);
              const hasAllergyWarning =
                actor.makeupAllergies &&
                !actor.makeupAllergies.toLowerCase().includes('nessuna allergia');

              const currentCourseMinutes = getSimulatedCourseMinutes(currentSlot, timerSeconds);
              const criticality = checkActorCriticality(
                actor.badgeCode,
                activeDay || 2,
                currentCourseMinutes,
                actor.progressStatus
              );
              const isCritical = criticality.isCritical;

              return (
                <div
                  key={actor.id}
                  className={`bg-neutral-950 border flex flex-col justify-between p-4 space-y-4 transition-colors ${
                    isCritical
                      ? 'border-2 border-red-500 ring-2 ring-red-500 bg-red-950/40 shadow-xl shadow-red-600/30 animate-pulse'
                      : isAmputee
                      ? 'border-amber-500/70 hover:border-amber-400'
                      : 'border-cyan-600/50 hover:border-cyan-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Critical Alert Warning in Actor Card */}
                    {isCritical && (
                      <div className="p-1.5 px-2 bg-red-950 border border-red-500 text-red-100 text-[10px] font-black flex items-center justify-between animate-pulse">
                        <span>⚠️ ALLERTA T0 &lt; 10m (IN PREP)</span>
                        <span className="tabular-nums font-mono text-white bg-red-600 px-1 py-0.2">
                          {criticality.timeToT0 > 0 ? `T -${criticality.timeToT0}m` : 'SCADUTO'}
                        </span>
                      </div>
                    )}

                    {/* Top Row: Slot # & Physical Status Toggle */}
                    <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                      <div>
                        <div className="text-[11px] text-neutral-400 font-bold tabular-nums">
                          SLOT PRINCIPALE #{String(actor.slotNumber).padStart(2, '0')} · {actor.badgeCode}
                        </div>
                        <h3 className="text-base font-black text-white mt-0.5">{actor.name}</h3>
                      </div>

                      {/* Quick Physical Status Toggle Button (AMPUTATO vs INTERO) */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus: ActorPhysicalStatus =
                            actor.physicalStatus === 'AMPUTATO' ? 'INTERO' : 'AMPUTATO';
                          updateActor(actor.id, { physicalStatus: nextStatus });
                          triggerToast(
                            `Stato fisico di ${actor.badgeCode} (${actor.name}) impostato su ${nextStatus}.`
                          );
                        }}
                        title="Clicca per commutare stato fisico Amputato / Intero"
                        className={`px-2.5 py-1 text-xs font-black uppercase border cursor-pointer shrink-0 ${
                          isAmputee
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-cyan-950 text-cyan-200 border-cyan-500'
                        }`}
                      >
                        {isAmputee ? 'AMPUTATO' : 'INTERO'}
                      </button>
                    </div>

                    {/* Anatomical Detail & Clothing Size */}
                    <div className="space-y-2 text-xs font-sans">
                      <div className="bg-neutral-900 border border-neutral-800 p-2.5 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                          {isAmputee
                            ? 'Dettaglio Anatomico Moncone / Arto:'
                            : 'Profilo Fisico & Idoneità Scenica:'}
                        </span>
                        <p
                          className={`font-semibold leading-snug ${
                            isAmputee ? 'text-amber-200' : 'text-neutral-200'
                          }`}
                        >
                          {actor.amputationDetails}
                        </p>
                      </div>

                      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 text-xs font-mono">
                        <span className="text-neutral-400 flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Taglia Vestiario:</span>
                        </span>
                        <div className="flex items-center gap-1">
                          {(['S', 'M', 'L', 'XL'] as ClothingSize[]).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateActor(actor.id, { clothingSize: sz })}
                              className={`px-1.5 py-0.5 text-[11px] font-bold cursor-pointer ${
                                actor.clothingSize === sz
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-neutral-950 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Makeup Allergies & Skin Notes */}
                      <div
                        className={`p-2.5 border text-xs ${
                          hasAllergyWarning
                            ? 'bg-red-950/30 border-red-600/60 text-red-200'
                            : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold mb-0.5">
                          <ShieldAlert
                            className={`w-3.5 h-3.5 ${
                              hasAllergyWarning ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          />
                          <span className={hasAllergyWarning ? 'text-red-300' : 'text-neutral-400'}>
                            Note Allergie Trucco:
                          </span>
                        </div>
                        <p className="text-[11px] leading-snug">{actor.makeupAllergies}</p>
                      </div>
                    </div>

                    {/* Direct Association: Truccatore Base Associato in Anagrafica Trucco */}
                    <div className="bg-pink-950/20 border border-pink-700/60 p-3 space-y-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-pink-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          <span>Truccatore Associato:</span>
                        </span>
                        <span className="text-pink-400 tabular-nums">
                          {pairedArtist?.badgeCode}
                        </span>
                      </label>

                      <select
                        value={actor.assignedMakeupArtistId}
                        onChange={(e) => {
                          const newArtistId = e.target.value;
                          const artistObj = getMakeupArtistById(newArtistId);
                          linkActorToMakeupArtist(actor.id, newArtistId, true);
                          triggerToast(
                            `Associato ${artistObj?.badgeCode} (${artistObj?.name}) a ${actor.badgeCode} (${actor.name}).`
                          );
                        }}
                        className="w-full bg-neutral-950 border border-pink-500/60 text-white text-xs p-2 font-mono focus:outline-none focus:border-pink-400"
                      >
                        {makeupArtists.map((artist) => (
                          <option key={artist.id} value={artist.id}>
                            {artist.badgeCode} • {artist.name} ({artist.role.split('&')[0].trim()})
                          </option>
                        ))}
                      </select>

                      {pairedArtist && (
                        <div className="text-[11px] text-neutral-300 font-sans">
                          Spec: <span className="text-pink-200">{pairedArtist.specialty}</span>
                        </div>
                      )}
                    </div>

                    {/* 5-Stage Actor Progress Status Control */}
                    <ActorProgressStatusControl
                      status={actor.progressStatus || 'STANDBY'}
                      updatedAt={actor.progressUpdatedAt}
                      updatedBy={actor.progressUpdatedBy}
                      isEn={isEn}
                      onSelectStatus={(nextStatus) => {
                        updateActorProgressStatus(actor.id, nextStatus, {
                          updatedBy: pairedArtist
                            ? `${pairedArtist.badgeCode} • ${pairedArtist.name}`
                            : undefined,
                        });
                        const meta = ACTOR_PROGRESS_META[nextStatus];
                        triggerToast(
                          nextStatus === 'PRONTO_T0'
                            ? `🟢 ${actor.badgeCode} (${actor.name}) impostato su PRONTO T0: Checklist Pre-Scenario sincronizzata e avviso inviato a Regia CH-3!`
                            : `Stato avanzamento di ${actor.badgeCode} (${actor.name}) aggiornato a: ${meta.labelIt}.`
                        );
                      }}
                    />

                    {/* Assigned Scenarios Summary */}
                    <div className="text-[11px] text-neutral-400 font-mono">
                      <span>Scenari assegnati ({assignedScenarios.length}): </span>
                      {assignedScenarios.length > 0 ? (
                        <span className="text-white font-bold">
                          {assignedScenarios.map((p) => `Pz #${p.id} (D${p.day})`).join(' · ')}
                        </span>
                      ) : (
                        <span className="text-neutral-500">Nessuno scenario assegnato</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Contacts & Edit Action */}
                  <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 tabular-nums flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      <span>{actor.phone}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingActor({ ...actor })}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Modifica</span>
                      </button>
                      {actors.length > 8 && (
                        <button
                          type="button"
                          onClick={() => deleteActor(actor.id)}
                          className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                          title="Elimina Slot Attore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 2: ANAGRAFICA TRUCCATORI (TRUC-01 - TRUC-08)
      ====================================================================== */}
      {subTab === 'truccatori' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredArtists.map((artist) => {
            const linkedActors = actors.filter((a) => a.assignedMakeupArtistId === artist.id);
            const artistScenarios = getScenariosForArtist(artist.id);

            return (
              <div
                key={artist.id}
                className="bg-neutral-950 border border-pink-500/50 hover:border-pink-400 p-4 flex flex-col justify-between space-y-4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2.5">
                    <div>
                      <div className="text-xs text-pink-400 font-bold tabular-nums">
                        {artist.badgeCode} · {artist.assignedStation || 'Lab Moulage'}
                      </div>
                      <h3 className="text-base font-black text-white mt-0.5">{artist.name}</h3>
                      <div className="text-xs text-neutral-300 font-sans">{artist.role}</div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 p-2.5 space-y-1 text-xs font-sans">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                      Specializzazione Protesica & SFX:
                    </span>
                    <p className="text-neutral-200 leading-snug">{artist.specialty}</p>
                  </div>

                  {/* Linked Actors in Anagrafica Trucco */}
                  <div className="bg-pink-950/20 border border-pink-700/50 p-3 space-y-2">
                    <div className="text-[10px] font-mono uppercase font-bold text-pink-300 flex items-center justify-between">
                      <span>Attori Associati ({linkedActors.length}):</span>
                      <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                    </div>

                    {linkedActors.length > 0 ? (
                      <div className="space-y-1.5">
                        {linkedActors.map((act) => (
                          <div
                            key={act.id}
                            className="bg-neutral-950 border border-neutral-800 p-2 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white">
                                {act.badgeCode} · {act.name}
                              </span>
                              <span className="block text-[10px] text-neutral-400">
                                Taglia {act.clothingSize} · {act.amputationDetails.split('—')[0]}
                              </span>
                            </div>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-black uppercase ${
                                act.physicalStatus === 'AMPUTATO'
                                  ? 'bg-amber-500 text-black'
                                  : 'bg-cyan-950 text-cyan-200 border border-cyan-600'
                              }`}
                            >
                              {act.physicalStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 font-sans">
                        Nessun attore associato di base. Seleziona uno slot qui sotto:
                      </div>
                    )}

                    {/* Quick Assign Actor to this Makeup Artist */}
                    <div className="pt-1">
                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const act = getActorById(e.target.value);
                          linkActorToMakeupArtist(e.target.value, artist.id, true);
                          triggerToast(
                            `Attore ${act?.badgeCode} (${act?.name}) associato a ${artist.badgeCode} (${artist.name}).`
                          );
                        }}
                        className="w-full bg-neutral-950 border border-neutral-700 text-neutral-300 text-[11px] p-1.5 font-mono focus:outline-none focus:border-pink-500"
                      >
                        <option value="">+ Associa uno Slot Attore a {artist.badgeCode}...</option>
                        {actors.map((a) => (
                          <option key={a.id} value={a.id}>
                            Slot #{a.slotNumber} ({a.badgeCode}) • {a.name} [{a.physicalStatus}]
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Assigned Scenarios */}
                  <div className="text-[11px] text-neutral-400 font-mono">
                    <span>Pazienti / Scenari seguiti ({artistScenarios.length}): </span>
                    <span className="text-white font-bold">
                      {artistScenarios.map((p) => `Pz #${p.id}`).join(' · ') || 'Nessuno'}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2.5 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 text-[11px] text-neutral-400 tabular-nums">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-500" />
                      <span>{artist.phone}</span>
                    </div>
                    {artist.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-neutral-500" />
                        <span className="truncate max-w-[150px]">{artist.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedArtistForQr(artist)}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-pink-300 border border-pink-700/60 text-xs font-bold cursor-pointer flex items-center gap-1"
                      title="Visualizza e Stampa QR Pass"
                    >
                      <QrCode className="w-3.5 h-3.5 text-pink-400" />
                      <span>QR Pass</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingArtist({ ...artist })}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Modifica</span>
                    </button>
                    {makeupArtists.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteMakeupArtist(artist.id)}
                        className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                        title="Elimina Truccatore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          SUB-TAB 3: MATRICE ASSOCIAZIONE TRUCCATORE ↔ ATTORE PER BLOCCO/SCENARIO
      ====================================================================== */}
      {subTab === 'matrice' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase">
                Matrice Operativa Truccatore ↔ Attore per Blocco & Scenario (Modificabile per Singolo Scenario)
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Seleziona l&apos;Attore (Slot 1–8) per pre-impostare automaticamente il suo Truccatore di riferimento, oppure personalizza il Truccatore per il singolo scenario.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 border border-neutral-800 shrink-0">
              {([2, 3] as CourseDay[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setMatrixDay(d)}
                  className={`px-3 py-1.5 text-xs font-black uppercase cursor-pointer ${
                    matrixDay === d
                      ? 'bg-pink-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Giorno 0{d} ({d === 2 ? 'Pz #1–#12' : 'Pz #13–#24'})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(OPERATIONAL_BLOCKS_BY_DAY[matrixDay] || []).map((blockMeta) => {
              const blockPatients = simulatorPatients.filter((p) =>
                blockMeta.patientIds.includes(p.id)
              );

              return (
                <div
                  key={`matrix-b-${blockMeta.day}-${blockMeta.blockNumber}`}
                  className="bg-neutral-950 border border-neutral-800 overflow-hidden"
                >
                  <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-pink-600 text-white text-xs font-black">
                        BLOCCO {blockMeta.blockNumber} (PREP: {blockMeta.truccoPrepWindow})
                      </span>
                      <span className="text-xs text-white font-bold">
                        {blockMeta.blockLabelIt}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 tabular-nums">
                      Ingaggio TCCC: {blockMeta.tcccWindow} · Handover: {blockMeta.handoverTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
                    {blockPatients.map((patient) => {
                      const stationIdx = getStationIndexForPatientId(patient.id);
                      const assignedActor = getActorById(patient.assignedActorId);
                      const assignedArtist = getMakeupArtistById(patient.assignedMakeupArtistId);
                      const requiresAmputee = isScenarioAmputationRequired(
                        patient.lesioni,
                        patient.moulageProtesi
                      );

                      // Check if the same actor is assigned twice in this block
                      const duplicateActorInBlock = blockPatients.some(
                        (other) =>
                          other.id !== patient.id &&
                          other.assignedActorId === patient.assignedActorId
                      );

                      return (
                        <div key={patient.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                            <div>
                              <span className="text-xs font-black text-pink-400">
                                PAZIENTE #{patient.id} · POSTAZIONE {stationIdx}
                              </span>
                              <div className="text-xs font-bold text-white">
                                {patient.scenarioCode}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                                requiresAmputee
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/60'
                                  : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                              }`}
                            >
                              {requiresAmputee ? 'Richiede Moncone/Amputato' : 'Scenario Corpo Intero'}
                            </span>
                          </div>

                          <div className="text-xs text-neutral-300 font-sans">
                            {patient.lesioni.join(' · ')}
                          </div>

                          {/* Actor Selector */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block">
                              Slot Attore Assegnato (1–8):
                            </label>
                            <select
                              value={patient.assignedActorId || 'actor-1'}
                              onChange={(e) => {
                                const nextActorId = e.target.value;
                                const nextActor = getActorById(nextActorId);
                                assignTruccoToPatient(
                                  patient.id,
                                  nextActorId,
                                  nextActor?.assignedMakeupArtistId
                                );
                                triggerToast(
                                  `Paziente #${patient.id}: assegnato ${nextActor?.badgeCode} (${nextActor?.name}) con truccatore base.`
                                );
                              }}
                              className="w-full bg-neutral-900 border border-neutral-700 text-white text-xs p-2 font-mono focus:outline-none focus:border-pink-500"
                            >
                              {actors.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.badgeCode} • {a.name} [{a.physicalStatus}] (Taglia {a.clothingSize})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Makeup Artist Selector */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 block">
                              Truccatore Assegnato (Override Blocco/Scenario):
                            </label>
                            <select
                              value={patient.assignedMakeupArtistId || 'truc-1'}
                              onChange={(e) => {
                                assignTruccoToPatient(
                                  patient.id,
                                  patient.assignedActorId || 'actor-1',
                                  e.target.value
                                );
                                const art = getMakeupArtistById(e.target.value);
                                triggerToast(
                                  `Paziente #${patient.id}: truccatore impostato su ${art?.badgeCode} (${art?.name}).`
                                );
                              }}
                              className="w-full bg-neutral-900 border border-pink-600/50 text-white text-xs p-2 font-mono focus:outline-none focus:border-pink-400"
                            >
                              {makeupArtists.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.badgeCode} • {m.name} ({m.role.split('&')[0].trim()})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Status & Warnings */}
                          {assignedActor && (
                            <div className="p-2.5 bg-neutral-900 border border-neutral-800 space-y-1 text-[11px] font-sans">
                              <div className="flex items-center justify-between font-mono">
                                <span
                                  className={`font-bold ${
                                    assignedActor.physicalStatus === 'AMPUTATO'
                                      ? 'text-amber-300'
                                      : 'text-cyan-300'
                                  }`}
                                >
                                  Stato: {assignedActor.physicalStatus} · Taglia {assignedActor.clothingSize}
                                </span>
                                <span className="text-pink-300 font-bold">
                                  {assignedArtist?.badgeCode}
                                </span>
                              </div>
                              <div className="text-neutral-400">{assignedActor.amputationDetails}</div>
                              <div className="text-neutral-300">
                                <strong className="text-neutral-400">Allergie:</strong>{' '}
                                {assignedActor.makeupAllergies}
                              </div>
                            </div>
                          )}

                          {/* 5-Stage Progress Status inside Matrix Scenario Cell */}
                          {assignedActor && (
                            <ActorProgressStatusControl
                              status={
                                patient.actorProgressStatus ||
                                assignedActor.progressStatus ||
                                'STANDBY'
                              }
                              updatedAt={
                                patient.actorProgressUpdatedAt || assignedActor.progressUpdatedAt
                              }
                              updatedBy={
                                patient.actorProgressUpdatedBy || assignedActor.progressUpdatedBy
                              }
                              isEn={isEn}
                              onSelectStatus={(nextStatus) => {
                                updateActorProgressStatus(assignedActor.id, nextStatus, {
                                  patientId: patient.id,
                                  updatedBy: assignedArtist
                                    ? `${assignedArtist.badgeCode} • ${assignedArtist.name}`
                                    : undefined,
                                });
                                const meta = ACTOR_PROGRESS_META[nextStatus];
                                triggerToast(
                                  nextStatus === 'PRONTO_T0'
                                    ? `🟢 Paziente #${patient.id} (${assignedActor.badgeCode}): PRONTO T0! Checklist validata e avviso inviato a Regia CH-3.`
                                    : `Paziente #${patient.id} (${assignedActor.badgeCode}): stato aggiornato a ${meta.labelIt}.`
                                );
                              }}
                            />
                          )}

                          {duplicateActorInBlock && (
                            <div className="p-2 bg-red-950/60 border border-red-500 text-red-200 text-[11px] flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              <span>
                                Attenzione: {assignedActor?.badgeCode} è assegnato a più postazioni contemporanee nello stesso blocco!
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT / ADD ACTOR
      ====================================================================== */}
      {(editingActor || isAddingActor) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-pink-500 max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white uppercase">
                {editingActor
                  ? `Modifica Slot Attore ${editingActor.badgeCode}`
                  : 'Aggiungi Nuovo Slot Attore'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingActor(null);
                  setIsAddingActor(false);
                }}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingActor ? handleSaveActorEdit : handleCreateActor}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Slot #</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={editingActor ? editingActor.slotNumber : newActorForm.slotNumber}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 1;
                      if (editingActor) setEditingActor({ ...editingActor, slotNumber: val });
                      else setNewActorForm({ ...newActorForm, slotNumber: val });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Codice Matricola</label>
                  <input
                    type="text"
                    required
                    value={editingActor ? editingActor.badgeCode : newActorForm.badgeCode}
                    onChange={(e) => {
                      if (editingActor)
                        setEditingActor({ ...editingActor, badgeCode: e.target.value });
                      else setNewActorForm({ ...newActorForm, badgeCode: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Stato Fisico</label>
                  <select
                    value={editingActor ? editingActor.physicalStatus : newActorForm.physicalStatus}
                    onChange={(e) => {
                      const st = e.target.value as ActorPhysicalStatus;
                      if (editingActor)
                        setEditingActor({ ...editingActor, physicalStatus: st });
                      else setNewActorForm({ ...newActorForm, physicalStatus: st });
                    }}
                    className="w-full bg-neutral-900 border border-amber-500 text-white p-2 font-bold"
                  >
                    <option value="AMPUTATO">AMPUTATO (Moncone Reale)</option>
                    <option value="INTERO">INTERO (Corpo Intero)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-neutral-400 block mb-1">Nome e Cognome Attore</label>
                  <input
                    type="text"
                    required
                    value={editingActor ? editingActor.name : newActorForm.name}
                    onChange={(e) => {
                      if (editingActor) setEditingActor({ ...editingActor, name: e.target.value });
                      else setNewActorForm({ ...newActorForm, name: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Taglia Vestiario</label>
                  <select
                    value={editingActor ? editingActor.clothingSize : newActorForm.clothingSize}
                    onChange={(e) => {
                      const sz = e.target.value as ClothingSize;
                      if (editingActor) setEditingActor({ ...editingActor, clothingSize: sz });
                      else setNewActorForm({ ...newActorForm, clothingSize: sz });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  >
                    <option value="S">Taglia S</option>
                    <option value="M">Taglia M</option>
                    <option value="L">Taglia L</option>
                    <option value="XL">Taglia XL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Dettaglio Anatomico (Arto/Lato se Amputato, o Idoneità Scenica se Intero)
                </label>
                <input
                  type="text"
                  required
                  value={
                    editingActor ? editingActor.amputationDetails : newActorForm.amputationDetails
                  }
                  onChange={(e) => {
                    if (editingActor)
                      setEditingActor({ ...editingActor, amputationDetails: e.target.value });
                    else setNewActorForm({ ...newActorForm, amputationDetails: e.target.value });
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 font-sans"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Note Allergie Trucco / Sensibilità Cutanee (Lattice, Mastice, Solventi)
                </label>
                <input
                  type="text"
                  value={editingActor ? editingActor.makeupAllergies : newActorForm.makeupAllergies}
                  onChange={(e) => {
                    if (editingActor)
                      setEditingActor({ ...editingActor, makeupAllergies: e.target.value });
                    else setNewActorForm({ ...newActorForm, makeupAllergies: e.target.value });
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 font-sans"
                />
              </div>

              <div>
                <label className="text-pink-300 font-bold block mb-1">
                  Truccatore Associato in Anagrafica Trucco
                </label>
                <select
                  value={
                    editingActor
                      ? editingActor.assignedMakeupArtistId
                      : newActorForm.assignedMakeupArtistId
                  }
                  onChange={(e) => {
                    if (editingActor)
                      setEditingActor({
                        ...editingActor,
                        assignedMakeupArtistId: e.target.value,
                      });
                    else
                      setNewActorForm({
                        ...newActorForm,
                        assignedMakeupArtistId: e.target.value,
                      });
                  }}
                  className="w-full bg-neutral-900 border border-pink-500 text-white p-2"
                >
                  {makeupArtists.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.badgeCode} • {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Telefono</label>
                  <input
                    type="text"
                    value={editingActor ? editingActor.phone : newActorForm.phone}
                    onChange={(e) => {
                      if (editingActor) setEditingActor({ ...editingActor, phone: e.target.value });
                      else setNewActorForm({ ...newActorForm, phone: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={editingActor ? editingActor.email || '' : newActorForm.email || ''}
                    onChange={(e) => {
                      if (editingActor) setEditingActor({ ...editingActor, email: e.target.value });
                      else setNewActorForm({ ...newActorForm, email: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingActor(null);
                    setIsAddingActor(false);
                  }}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
                >
                  Salva Slot Attore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDIT / ADD MAKEUP ARTIST
      ====================================================================== */}
      {(editingArtist || isAddingArtist) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-pink-500 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-black text-white uppercase">
                {editingArtist
                  ? `Modifica Truccatore ${editingArtist.badgeCode}`
                  : 'Aggiungi Nuovo Truccatore'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingArtist(null);
                  setIsAddingArtist(false);
                }}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingArtist ? handleSaveArtistEdit : handleCreateArtist}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Codice Matricola</label>
                  <input
                    type="text"
                    required
                    value={editingArtist ? editingArtist.badgeCode : newArtistForm.badgeCode}
                    onChange={(e) => {
                      if (editingArtist)
                        setEditingArtist({ ...editingArtist, badgeCode: e.target.value });
                      else setNewArtistForm({ ...newArtistForm, badgeCode: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-neutral-400 block mb-1">Nome e Cognome Truccatore</label>
                  <input
                    type="text"
                    required
                    value={editingArtist ? editingArtist.name : newArtistForm.name}
                    onChange={(e) => {
                      if (editingArtist)
                        setEditingArtist({ ...editingArtist, name: e.target.value });
                      else setNewArtistForm({ ...newArtistForm, name: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Qualifica / Ruolo nel Team Trucco</label>
                <input
                  type="text"
                  required
                  value={editingArtist ? editingArtist.role : newArtistForm.role}
                  onChange={(e) => {
                    if (editingArtist) setEditingArtist({ ...editingArtist, role: e.target.value });
                    else setNewArtistForm({ ...newArtistForm, role: e.target.value });
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 font-sans"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Specializzazione Protesica & Moulage</label>
                <input
                  type="text"
                  required
                  value={editingArtist ? editingArtist.specialty : newArtistForm.specialty}
                  onChange={(e) => {
                    if (editingArtist)
                      setEditingArtist({ ...editingArtist, specialty: e.target.value });
                    else setNewArtistForm({ ...newArtistForm, specialty: e.target.value });
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 text-white p-2 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Postazione / Area Lab</label>
                  <input
                    type="text"
                    value={
                      editingArtist
                        ? editingArtist.assignedStation || ''
                        : newArtistForm.assignedStation || ''
                    }
                    onChange={(e) => {
                      if (editingArtist)
                        setEditingArtist({ ...editingArtist, assignedStation: e.target.value });
                      else setNewArtistForm({ ...newArtistForm, assignedStation: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Telefono</label>
                  <input
                    type="text"
                    value={editingArtist ? editingArtist.phone : newArtistForm.phone}
                    onChange={(e) => {
                      if (editingArtist)
                        setEditingArtist({ ...editingArtist, phone: e.target.value });
                      else setNewArtistForm({ ...newArtistForm, phone: e.target.value });
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 text-white p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingArtist(null);
                    setIsAddingArtist(false);
                  }}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold cursor-pointer"
                >
                  Salva Truccatore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal for Makeup Artist */}
      {selectedArtistForQr && (
        <ParticipantQRModal
          isOpen={Boolean(selectedArtistForQr)}
          onClose={() => setSelectedArtistForQr(null)}
          person={selectedArtistForQr}
          category="truccatori"
        />
      )}
    </div>
  );
};
