import React, { useState, useMemo } from 'react';
import {
  PROTESI_CATALOG,
  OPERATIONAL_BLOCKS_BY_DAY,
  getBlockForPatientId,
  getStationIndexForPatientId,
} from '../../data/protesiCatalog';
import { ProtesiItem, CourseDay } from '../../types';
import { useCourse } from '../../context/CourseContext';
import { ProtesiEditModal } from '../protesi/ProtesiEditModal';
import {
  Wrench,
  Activity,
  Droplet,
  Flame,
  ShieldAlert,
  Search,
  CheckCircle2,
  ClipboardList,
  Layers,
  Crosshair,
  HeartPulse,
  Sparkles,
  UserCheck,
  AlertCircle,
  FileText,
  Plus,
  Edit,
  RotateCcw,
  Package,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const ProtesiCatalogView: React.FC = () => {
  const {
    language,
    protesiCatalog,
    resetProtesiCatalog,
    simulatorPatients,
    teams,
    updateTechChecklist,
    setCurrentTab,
  } = useCourse();
  const isEn = language === 'en';
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<'ALL' | CourseDay>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'catalog' | 'by_block'>('catalog');
  const [selectedModalItem, setSelectedModalItem] = useState<ProtesiItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ProtesiItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const catalogSource =
    protesiCatalog && protesiCatalog.length > 0 ? protesiCatalog : PROTESI_CATALOG;

  const getTeamName = (teamId: number) => {
    return teams.find((t) => t.id === teamId)?.name || `SQ-${teamId}`;
  };

  const districts = [
    { id: 'ALL', label: isEn ? 'All Districts' : 'Tutti i Distretti' },
    { id: 'VIE_AEREE', label: isEn ? 'Airway / Cric' : 'Vie Aeree / Crico' },
    { id: 'COLLO_VASCOLARE', label: isEn ? 'Neck / Vascular' : 'Collo / Vascolare' },
    { id: 'TORACE_CUORE', label: isEn ? 'Chest / Heart' : 'Torace / Cuore' },
    { id: 'ADDOME_PELVI', label: isEn ? 'Abdomen / Pelvis / REBOA' : 'Addome / Pelvi / REBOA' },
    { id: 'ARTI_AMPUTAZIONI', label: isEn ? 'Limbs / Amputations' : 'Arti / Amputazioni' },
    { id: 'MAXILLO_FACCIALE', label: isEn ? 'Maxillofacial / Head' : 'Maxillo-Facciale / Cranio' },
    { id: 'USTIONI_BLAST', label: isEn ? 'Burns / Blast' : 'Ustioni / Blast' },
  ];

  const filteredProtesi = useMemo(() => {
    return catalogSource.filter((item) => {
      const matchDistrict =
        selectedDistrict === 'ALL' || item.district === selectedDistrict;

      const matchDayAndBlock =
        (selectedDay === 'ALL' && selectedBlock === 'ALL') ||
        (item.scenariosUsed || []).some((scen) => {
          const dayOk = selectedDay === 'ALL' || scen.day === selectedDay;
          const blockMeta = getBlockForPatientId(scen.patientId);
          const blockOk =
            selectedBlock === 'ALL' || blockMeta.blockNumber === selectedBlock;
          return dayOk && blockOk;
        });

      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.requiredProcedures || []).some((p) => p.toLowerCase().includes(q)) ||
        (item.scenariosUsed || []).some((s) =>
          s.scenarioCode.toLowerCase().includes(q) || `pz ${s.patientId}`.includes(q)
        );
      return matchDistrict && matchDayAndBlock && matchQuery;
    });
  }, [catalogSource, selectedDistrict, selectedDay, selectedBlock, searchQuery]);

  const handleOpenCreateModal = () => {
    setItemToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: ProtesiItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleConfirmReset = () => {
    resetProtesiCatalog();
    setIsResetConfirmOpen(false);
  };

  const getDistrictBadge = (district: ProtesiItem['district']) => {
    switch (district) {
      case 'VIE_AEREE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-700/60">
            {isEn ? 'AIRWAY & CRIC' : 'VIE AEREE & CRICO'}
          </span>
        );
      case 'COLLO_VASCOLARE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-red-950 text-red-300 border border-red-700/60">
            {isEn ? 'JUNCTIONAL NECK' : 'COLLO GIUNZIONALE'}
          </span>
        );
      case 'TORACE_CUORE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-rose-950 text-rose-300 border border-rose-700/60">
            {isEn ? 'CHEST & HEART' : 'TORACE & CUORE'}
          </span>
        );
      case 'ADDOME_PELVI':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700/60">
            {isEn ? 'ABDOMEN, PELVIS & REBOA' : 'ADDOME, PELVI & REBOA'}
          </span>
        );
      case 'ARTI_AMPUTAZIONI':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-orange-950 text-orange-300 border border-orange-700/60">
            {isEn ? 'LIMBS & AMPUTATIONS' : 'ARTI & AMPUTAZIONI'}
          </span>
        );
      case 'MAXILLO_FACCIALE':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-purple-950 text-purple-300 border border-purple-700/60">
            {isEn ? 'MAXILLOFACIAL & HEAD' : 'MAXILLO & CRANIO'}
          </span>
        );
      case 'USTIONI_BLAST':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-yellow-950 text-yellow-300 border border-yellow-700/60">
            {isEn ? 'BURNS & ESCHAROTOMY' : 'USTIONI & ESCAROTOMIA'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Header Banner */}
      <div className="bg-neutral-900 border-l-4 border-cyan-500 p-4 sm:p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-cyan-500 text-black font-mono font-black text-[10px] uppercase tracking-wider">
              {isEn
                ? 'PROSTHETICS & MOULAGE MENU • BLOCKS 1–4 MAPPING'
                : 'MENU PROTESI & MOULAGE • MATRICE BLOCCHI 1–4'}
            </span>
            <span className="text-xs font-mono text-neutral-400">
              •{' '}
              {isEn
                ? `${catalogSource.length} Active Prosthetic Systems • Lead: Silvia Rossi (TECH-01)`
                : `${catalogSource.length} Sistemi Protesici Attivi • Coord: Silvia Rossi (TECH-01)`}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1 flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>
              {isEn
                ? 'Prosthetics, Simulators & Block 1–4 Deployment Matrix'
                : 'Menu Protesi, Simulatori & Matrice Impiego Blocchi 1–4'}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-4xl font-sans">
            {isEn
              ? 'Each prosthetic device is mapped to the exact Operational Blocks (1–4) of Day 2 and Day 3, showing the TCCC ➔ Shock Room team pairs, required consumables, and pre-scenario makeup readiness.'
              : 'Ogni dispositivo protesico è sincronizzato con i Blocchi Operativi (1–4) di Day 2 e Day 3, con indicazione delle coppie TCCC ➔ Shock Room, dei consumabili per il reset e dello stato di approntamento trucco.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end xl:self-center">
          <button
            type="button"
            onClick={() => setCurrentTab('trucco')}
            className="px-3.5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg border border-pink-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEn ? 'MAKEUP TIMELINE' : 'VISUALE TRUCCO'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('scenari')}
            className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-orange-300 font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-orange-600/60"
          >
            <FileText className="w-4 h-4 text-orange-400" />
            <span>{isEn ? 'SCENARIOS (24)' : 'MENU SCENARI (24)'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isEn ? 'NEW PROSTHESIS' : 'NUOVA PROTESI'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold uppercase text-xs tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-700"
            title={isEn ? 'Restore default catalog' : 'Ripristina catalogo predefinito'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-3 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Day Filter */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Course Day' : 'Giornata d\'Impiego'}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 2, 3] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDay(d)}
                  className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                    selectedDay === d
                      ? 'bg-cyan-500 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {d === 'ALL' ? (isEn ? 'ALL DAYS' : 'TUTTI') : `DAY 0${d}`}
                </button>
              ))}
            </div>
          </div>

          {/* Operational Block 1-4 Filter */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Operational Block (1–4)' : 'Blocco Operativo (1–4)'}
            </label>
            <div className="grid grid-cols-5 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 1, 2, 3, 4] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBlock(b)}
                  className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer ${
                    selectedBlock === b
                      ? 'bg-cyan-500 text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {b === 'ALL' ? (isEn ? 'ALL' : 'TUTTI') : `B${b}`}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Search Prosthesis / Procedure' : 'Cerca Protesi / Procedura / Paziente'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search PRO-01, REBOA, CRIC...' : 'Cerca PRO-01, REBOA, CRIC...'}
                className="w-full bg-neutral-950 border border-neutral-800 pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* View Mode Switcher */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">
              {isEn ? 'Display Mode' : 'Vista Operativa'}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setLayoutMode('catalog')}
                className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  layoutMode === 'catalog'
                    ? 'bg-cyan-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{isEn ? 'Prosthetics Cards' : 'Schede Protesi'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('by_block')}
                className={`py-1.5 text-xs font-black uppercase transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  layoutMode === 'by_block'
                    ? 'bg-cyan-500 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isEn ? 'By Blocks 1–4' : 'Per Blocchi 1–4'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Anatomical District Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800">
          {districts.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDistrict(d.id)}
              className={`px-2.5 py-1 text-[11px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                selectedDistrict === d.id
                  ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: PROSTHETICS CARDS WITH BLOCK 1–4 DEPLOYMENT MATRIX */}
      {layoutMode === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProtesi.map((item) => {
            const matchingScenarios = (item.scenariosUsed || []).filter((s) => {
              const dayOk = selectedDay === 'ALL' || s.day === selectedDay;
              const blockMeta = getBlockForPatientId(s.patientId);
              const blockOk =
                selectedBlock === 'ALL' || blockMeta.blockNumber === selectedBlock;
              return dayOk && blockOk;
            });

            return (
              <div
                key={item.id}
                className="bg-neutral-950 border-2 border-neutral-800 hover:border-cyan-700/60 transition-colors p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3.5">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-3 flex-wrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-cyan-500 text-black font-black text-xs">
                          {item.code}
                        </span>
                        {getDistrictBadge(item.district)}
                        <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-amber-300 text-[10px] font-bold">
                          Lead: {item.leadTechnician}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-white leading-snug pt-0.5">
                        {item.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedModalItem(item)}
                        className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-[10px] cursor-pointer border border-neutral-700"
                      >
                        Scheda
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item)}
                        className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold uppercase text-[10px] cursor-pointer border border-cyan-600"
                      >
                        Modifica
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                    {item.description}
                  </p>

                  {/* Procedures & Active Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-orange-400 block">
                        Procedure Cliniche Supportate:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-neutral-200 text-[11px]">
                        {item.requiredProcedures.map((proc, i) => (
                          <li key={i}>{proc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-neutral-900 p-3 border border-neutral-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-pink-400 block">
                        Consumabili & Reintegro Reset:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-neutral-200 text-[11px]">
                        {item.consumables.map((cons, i) => (
                          <li key={i}>{cons}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Block 1-4 Deployment Matrix for this Prosthesis */}
                  <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-cyan-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Impiego nei Blocchi 1–4 ({matchingScenarios.length} Scenari):
                        </span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Clicca "Trucco T0" per validare il montaggio
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingScenarios.map((scen, idx) => {
                        const blockMeta = getBlockForPatientId(scen.patientId);
                        const stationIdx = getStationIndexForPatientId(scen.patientId);
                        const ptObj = simulatorPatients.find((p) => p.id === scen.patientId);
                        const isReady = Boolean(ptObj?.techChecklist?.preDone);

                        return (
                          <div
                            key={`${scen.patientId}-${idx}`}
                            className="bg-neutral-950 border border-neutral-800 p-2.5 flex flex-col justify-between gap-1.5 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black text-orange-400">
                                PZ #{scen.patientId} • D{scen.day}/B{blockMeta.blockNumber}
                              </span>
                              <span className="text-[10px] text-pink-300 font-bold">
                                Prep {blockMeta.truccoPrepWindow}
                              </span>
                            </div>

                            <div className="text-[10px] text-neutral-300">
                              Postazione {stationIdx}:{' '}
                              <strong className="text-orange-300">
                                {getTeamName(scen.teamExtra)}
                              </strong>{' '}
                              ➔{' '}
                              <strong className="text-cyan-300">
                                {getTeamName(scen.teamIntra)}
                              </strong>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                              <span className="text-[10px] text-neutral-400 truncate max-w-[130px]">
                                {scen.scenarioCode}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateTechChecklist(scen.patientId, 'preDone', !isReady)
                                }
                                className={`px-2 py-0.5 text-[9px] font-black uppercase border cursor-pointer transition-colors ${
                                  isReady
                                    ? 'bg-emerald-600 text-black border-emerald-400'
                                    : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-pink-500 hover:text-pink-300'
                                }`}
                              >
                                {isReady ? '✓ Trucco Pronto' : 'Da Montare'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tech Note Footer */}
                <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between gap-2">
                  <span className="truncate">
                    <strong className="text-amber-400">Nota Tecnica:</strong> {item.techRequirements}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODE 2: GROUPED BY OPERATIONAL BLOCKS 1–4 */}
      {layoutMode === 'by_block' && (
        <div className="space-y-6">
          {([2, 3] as CourseDay[])
            .filter((d) => selectedDay === 'ALL' || d === selectedDay)
            .map((day) =>
              OPERATIONAL_BLOCKS_BY_DAY[day]
                .filter((b) => selectedBlock === 'ALL' || b.blockNumber === selectedBlock)
                .map((blockMeta) => {
                  const blockProtesi = filteredProtesi.filter((item) =>
                    item.scenariosUsed?.some((s) =>
                      blockMeta.patientIds.includes(s.patientId)
                    )
                  );

                  return (
                    <div
                      key={`protesi-d${day}-b${blockMeta.blockNumber}`}
                      className="bg-neutral-950 border-2 border-neutral-800 p-4 sm:p-5 space-y-4 shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-cyan-500 text-black font-black text-xs">
                              DAY 0{day} • BLOCCO {blockMeta.blockNumber} ({blockMeta.blockTimeRange})
                            </span>
                            <span className="px-2.5 py-0.5 bg-pink-950 border border-pink-600 text-pink-300 font-bold text-xs">
                              🎭 Finestra Allestimento Trucco & Protesi: {blockMeta.truccoPrepWindow}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-white uppercase mt-1">
                            Kit Protesi & Simulatori per Pazienti #{blockMeta.patientIds.join(', #')}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentTab('trucco')}
                          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Vai a Timeline Trucco Blocco {blockMeta.blockNumber}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {blockMeta.patientIds.map((pid) => {
                          const pt = simulatorPatients.find((p) => p.id === pid);
                          const stIdx = getStationIndexForPatientId(pid);
                          const ptProtesi = blockProtesi.filter((item) =>
                            item.scenariosUsed?.some((s) => s.patientId === pid)
                          );

                          if (!pt) return null;

                          return (
                            <div
                              key={pid}
                              className="bg-neutral-900 border border-neutral-800 p-3.5 space-y-3 flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 bg-orange-500 text-black font-black text-xs">
                                    PAZIENTE #{pid} (Postazione {stIdx})
                                  </span>
                                  <span className="text-[11px] font-bold text-neutral-300">
                                    {getTeamName(pt.teamExtraAssigned)} ➔ {getTeamName(pt.teamIntraAssigned)}
                                  </span>
                                </div>

                                <div className="text-xs font-bold text-white">{pt.lesioni[0]}</div>
                                <div className="text-[11px] text-pink-300 font-sans">
                                  Moulage: {pt.moulageProtesi}
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                                  <span className="text-[10px] font-black uppercase text-cyan-400 block">
                                    Protesi da Montare ({ptProtesi.length}):
                                  </span>
                                  {ptProtesi.map((pr) => (
                                    <div
                                      key={pr.id}
                                      className="p-2 bg-neutral-950 border border-cyan-800/60 space-y-0.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-cyan-300 font-black text-[11px]">
                                          {pr.code}
                                        </span>
                                        <span className="text-[9px] text-amber-300">
                                          {pr.leadTechnician}
                                        </span>
                                      </div>
                                      <div className="text-white text-[11px] font-bold">
                                        {pr.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updateTechChecklist(
                                    pid,
                                    'preDone',
                                    !pt.techChecklist?.preDone
                                  )
                                }
                                className={`w-full py-2 text-xs font-black uppercase border cursor-pointer flex items-center justify-center gap-1.5 ${
                                  pt.techChecklist?.preDone
                                    ? 'bg-emerald-600 text-black border-emerald-400'
                                    : 'bg-neutral-950 text-pink-300 border-pink-600 hover:bg-pink-950'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>
                                  {pt.techChecklist?.preDone
                                    ? '✓ Protesi & Trucco Pronti per T0'
                                    : 'Conferma Allestimento Protesi T0'}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
        </div>
      )}

      {/* Detailed Sheet Modal */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-cyan-500/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-cyan-500 text-black font-black text-xs uppercase">
                    {selectedModalItem.code}
                  </span>
                  {getDistrictBadge(selectedModalItem.district)}
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedModalItem.name}
                </h2>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed font-sans">
                  {selectedModalItem.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedModalItem(null)}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Droplet className="w-4 h-4" /> Funzionalità Circolatorie & Meccaniche
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {selectedModalItem.activeFeatures?.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-cyan-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Procedure Cliniche Supportate
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {selectedModalItem.requiredProcedures?.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-neutral-300 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-cyan-400" /> Matrice Blocchi Operativi ({selectedModalItem.scenariosUsed?.length || 0} Scenari)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedModalItem.scenariosUsed?.map((scen, idx) => {
                    const blockMeta = getBlockForPatientId(scen.patientId);
                    return (
                      <div
                        key={idx}
                        className="bg-neutral-900 p-2.5 border border-neutral-800 font-mono text-[11px] space-y-0.5"
                      >
                        <div className="text-orange-400 font-bold">
                          Pz #{scen.patientId} • Day {scen.day} Blocco {blockMeta.blockNumber} ({blockMeta.blockTimeRange})
                        </div>
                        <div className="text-neutral-300">
                          TCCC: {getTeamName(scen.teamExtra)} ➔ SR: {getTeamName(scen.teamIntra)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = selectedModalItem;
                  setSelectedModalItem(null);
                  handleOpenEditModal(target);
                }}
                className="px-4 py-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 font-bold uppercase text-xs cursor-pointer"
              >
                Modifica Protesi
              </button>

              <button
                type="button"
                onClick={() => setSelectedModalItem(null)}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-xs cursor-pointer"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      <ProtesiEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        itemToEdit={itemToEdit}
      />

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-amber-500 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-black uppercase text-sm">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Ripristinare Catalogo Protesi?</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Verranno ripristinate le 12 protesi e simulatori master ufficiali del Corso Avanzato Trauma sincronizzate con i Blocchi 1–4 di Day 2 e Day 3.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
              >
                Conferma Ripristino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
