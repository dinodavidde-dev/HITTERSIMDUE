import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { PROTESI_CATALOG } from '../../data/protesiCatalog';
import { ProtesiItem } from '../../types';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Droplet,
  ExternalLink,
  Flame,
  Heart,
  Layers,
  Moon,
  Package,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const ProtesiCatalogView: React.FC = () => {
  const { language, t } = useCourse();
  const isEn = language === 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('prot-crico');
  const [statusMap, setStatusMap] = useState<Record<string, 'PRONTA' | 'PREPARAZIONE' | 'IN_USO' | 'RICARICA'>>({});

  const districts = [
    { id: 'ALL', label: isEn ? 'ALL REGIONS' : 'TUTTI I DISTRETTI' },
    { id: 'VIE_AEREE', label: isEn ? 'AIRWAY (CRIC)' : 'VIE AEREE (CRICO)' },
    { id: 'TORACE_CUORE', label: isEn ? 'CHEST & BIOLOGICAL HEART' : 'TORACE & CUORE BIOLOGICO' },
    { id: 'COLLO_VASCOLARE', label: isEn ? 'NECK & JUNCTIONAL BLEEDING' : 'COLLO & EMORRAGIE GIUNZIONALI' },
    { id: 'ADDOME_PELVI', label: isEn ? 'ABDOMEN, EVISCERATION & IMPALEMENT' : 'ADDOME, EVISCERAZIONE & IMPALAMENTO' },
    { id: 'ARTI_AMPUTAZIONI', label: isEn ? 'EXTREMITIES, AMPUTATIONS & REBOA' : 'ARTI, AMPUTAZIONI & REBOA' },
    { id: 'MAXILLO_FACCIALE', label: isEn ? 'MAXILLOFACIAL' : 'MAXILLO-FACCIALE' },
    { id: 'USTIONI_BLAST', label: isEn ? 'BURNS & NIGHT BLAST' : 'USTIONI & BLAST NOTTURNO' },
  ];

  const filteredProtesi = PROTESI_CATALOG.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requiredProcedures.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.leadTechnician.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDistrict = selectedDistrict === 'ALL' || item.district === selectedDistrict;

    const matchDay =
      selectedDay === 'ALL' ||
      (selectedDay === 'DAY2' && item.scenariosUsed.some((s) => s.day === 2)) ||
      (selectedDay === 'DAY3' && item.scenariosUsed.some((s) => s.day === 3)) ||
      (selectedDay === 'NIGHT' && item.nightScenarioUsed);

    return matchSearch && matchDistrict && matchDay;
  });

  const getDistrictBadge = (district: ProtesiItem['district']) => {
    switch (district) {
      case 'VIE_AEREE':
        return <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'AIRWAYS / CRIC' : 'VIE AEREE / CRICO'}</span>;
      case 'TORACE_CUORE':
        return <span className="px-2.5 py-1 bg-red-950 text-red-300 border border-red-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'CHEST & THORACOTOMY' : 'TORACE & TORACOTOMIA'}</span>;
      case 'COLLO_VASCOLARE':
        return <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'NECK / JUNCTIONAL' : 'COLLO / GIUNZIONALE'}</span>;
      case 'ADDOME_PELVI':
        return <span className="px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'ABDOMEN & PELVIS' : 'ADDOME & PELVI'}</span>;
      case 'ARTI_AMPUTAZIONI':
        return <span className="px-2.5 py-1 bg-orange-950 text-orange-300 border border-orange-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'LIMBS & AMPUTATIONS' : 'ARTI & AMPUTAZIONI'}</span>;
      case 'MAXILLO_FACCIALE':
        return <span className="px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'MAXILLOFACIAL' : 'MAXILLO-FACCIALE'}</span>;
      case 'USTIONI_BLAST':
        return <span className="px-2.5 py-1 bg-yellow-950 text-yellow-300 border border-yellow-700 text-[10px] font-black uppercase tracking-wider">{isEn ? 'BURNS & BLAST MCI' : 'USTIONI & BLAST MCI'}</span>;
      default:
        return <span className="px-2.5 py-1 bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] font-black uppercase tracking-wider">{district}</span>;
    }
  };

  const toggleStatus = (id: string) => {
    setStatusMap((prev) => {
      const current = prev[id] || 'PRONTA';
      const order: ('PRONTA' | 'PREPARAZIONE' | 'IN_USO' | 'RICARICA')[] = ['PRONTA', 'IN_USO', 'RICARICA', 'PREPARAZIONE'];
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      return { ...prev, [id]: order[nextIdx] };
    });
  };

  const getStatusLabel = (status: string) => {
    if (!isEn) return status;
    switch (status) {
      case 'PRONTA': return 'READY';
      case 'IN_USO': return 'IN USE';
      case 'RICARICA': return 'RECHARGE';
      case 'PREPARAZIONE': return 'PREP';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_USO':
        return 'bg-blue-600 text-white border-blue-400';
      case 'RICARICA':
        return 'bg-red-600 text-white border-red-400';
      case 'PREPARAZIONE':
        return 'bg-yellow-600 text-black border-yellow-400';
      case 'PRONTA':
      default:
        return 'bg-emerald-600 text-white border-emerald-400';
    }
  };

  const handleExportProsthetics = () => {
    const jsonStr = JSON.stringify(PROTESI_CATALOG, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalogo_protesi_moulage_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header Banner */}
      <div className="bg-neutral-950 border-2 border-neutral-700 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-orange-500 text-black text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Package className="w-3.5 h-3.5" />
              {isEn ? 'CLINICAL PROSTHETICS & MOULAGE INVENTORY' : 'INVENTARIO PROTESI CLINICHE & MOULAGE'}
            </span>
            <span className="text-[11px] text-neutral-300 font-mono font-bold px-2 py-0.5 bg-neutral-900 border border-neutral-700">
              {PROTESI_CATALOG.length} {isEn ? 'ACTIVE TRAUMA DEVICES' : 'DISPOSITIVI TRAUMATOLOGICI ATTIVI'}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight leading-tight">
            {isEn ? 'Detailed List of Scenario Prosthetics & Moulage' : 'Elenco Dettagliato delle Protesi Citate negli Scenari'}
          </h2>
          <p className="text-xs text-neutral-300 font-medium max-w-3xl leading-relaxed">
            {isEn
              ? 'All anatomical prosthetics, biological soft-chest simulators, pressurized vascular circuits and theatrical moulage used across 24 daytime clinical scenarios and 12 night scenario stations.'
              : 'Tutte le protesi anatomiche, simulatori biologici a torace morbido, circuiti vascolari pressurizzati e moulage teatrale impiegati nei 24 scenari clinici diurni e nelle 12 postazioni dello scenario notturno.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          <LanguageSwitcher variant="badge" />

          <button
            onClick={handleExportProsthetics}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider border border-neutral-100 transition-all cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>{isEn ? 'EXPORT SPECS' : 'ESPORTA SCHEDE'}</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider">{isEn ? 'CRICOTHYROIDOTOMY' : 'PROTESI CRICOTIRO'}</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white">{isEn ? '8 SCENARIOS' : '8 SCENARI'}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{isEn ? 'Incisable membrane & hematoma' : 'Membrana incidibile & ematoma'}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider">{isEn ? 'BIO THORACOTOMY' : 'TORACOTOMIA BIO'}</span>
            <Heart className="w-3.5 h-3.5 text-red-500" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white">{isEn ? '7 SCENARIOS' : '7 SCENARI'}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{isEn ? 'Fresh porcine biological organs' : 'Organi biologici suini freschi'}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider">{isEn ? 'AMPUTATIONS & REBOA' : 'AMPUTAZIONI & REBOA'}</span>
            <Zap className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white">{isEn ? '6 SCENARIOS' : '6 SCENARI'}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{isEn ? 'Cannulable femoral artery' : 'Arteria femorale cannulabile'}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-2.5 sm:p-3">
          <div className="flex items-center justify-between text-neutral-400 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider">{isEn ? 'NIGHT BLAST' : 'BLAST NOTTURNO'}</span>
            <Moon className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-lg sm:text-xl font-black text-white">{isEn ? '12 TEAMS' : '12 SQUADRE'}</p>
          <p className="text-[10px] text-neutral-400 font-mono">{isEn ? 'MCI Mass Casualty Day 3' : 'Maxiemergenza MCI Day 3'}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-neutral-950 border border-neutral-800 p-3 sm:p-3.5 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search by name, code, procedure, technician (e.g., CRICO, thoracotomy, Silvia, REBOA)...' : 'Cerca protesi per nome, codice, procedura, tecnico (es. CRICO, toracotomia, Silvia, REBOA)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900 border-2 border-neutral-700 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 font-bold focus:border-orange-500 focus:outline-none uppercase"
            />
          </div>

          {/* Day / Session Filter */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 border-2 border-neutral-700 w-full sm:w-auto justify-center">
            {['ALL', 'DAY2', 'DAY3', 'NIGHT'].map((dayKey) => (
              <button
                key={dayKey}
                onClick={() => setSelectedDay(dayKey)}
                className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedDay === dayKey
                    ? 'bg-neutral-100 text-black'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {dayKey === 'ALL' ? (isEn ? 'ALL' : 'TUTTE') : dayKey === 'DAY2' ? 'DAY 2' : dayKey === 'DAY3' ? 'DAY 3' : (isEn ? 'NIGHT' : 'NOTTE')}
              </button>
            ))}
          </div>
        </div>

        {/* District Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {districts.map((dist) => (
            <button
              key={dist.id}
              onClick={() => setSelectedDistrict(dist.id)}
              className={`flex-shrink-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                selectedDistrict === dist.id
                  ? 'bg-orange-500 text-black border-orange-500 font-black'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
              }`}
            >
              {dist.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prosthetics Directory Cards */}
      <div className="space-y-4">
        {filteredProtesi.length === 0 ? (
          <div className="bg-neutral-900 border-2 border-neutral-800 p-12 text-center text-neutral-400 font-mono text-sm">
            {isEn ? 'No prosthetics match the selected search criteria.' : 'Nessuna protesi trovata per i criteri di ricerca selezionati.'}
          </div>
        ) : (
          filteredProtesi.map((item) => {
            const isExpanded = expandedId === item.id;
            const currentStatus = statusMap[item.id] || 'PRONTA';

            return (
              <div
                key={item.id}
                id={`protesi-card-${item.id}`}
                className="bg-neutral-950 border-4 border-neutral-800 hover:border-neutral-600 transition-all shadow-xl overflow-hidden"
              >
                {/* Header line */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 sm:p-6 bg-neutral-900 border-b-2 border-neutral-800 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-orange-400 bg-neutral-950 px-2.5 py-0.5 border border-neutral-700">
                        {item.code}
                      </span>
                      {getDistrictBadge(item.district)}
                      <span className="text-[10px] font-mono text-neutral-400">
                        {isEn ? `Used in ${item.scenariosUsed.length} scenarios` : `Impiegata in ${item.scenariosUsed.length} scenari`}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                      {item.name}
                    </h3>

                    <p className="text-xs text-neutral-300 font-medium line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                    {/* Status Pill Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(item.id);
                      }}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer ${getStatusColor(
                        currentStatus
                      )}`}
                      title={isEn ? 'Click to change status (READY -> IN USE -> RECHARGE -> PREP)' : 'Clicca per cambiare stato (PRONTA -> IN USO -> RICARICA -> PREPARAZIONE)'}
                    >
                      {isEn ? 'STATUS:' : 'STATO:'} {getStatusLabel(currentStatus)}
                    </button>

                    <div className="w-8 h-8 bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 space-y-6 bg-neutral-950">
                    {/* Features and procedures grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Active Features */}
                      <div className="space-y-3 bg-neutral-900 border-2 border-neutral-800 p-4">
                        <div className="flex items-center gap-2 text-orange-400 text-xs font-black uppercase tracking-widest border-b border-neutral-800 pb-2">
                          <Droplet className="w-4 h-4" />
                          {isEn ? 'ACTIVE & CIRCULATORY FEATURES' : 'FUNZIONALITÀ ATTIVE & CIRCOLATORIE'}
                        </div>
                        <ul className="space-y-2">
                          {item.activeFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Required Procedures */}
                      <div className="space-y-3 bg-neutral-900 border-2 border-neutral-800 p-4">
                        <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest border-b border-neutral-800 pb-2">
                          <Wrench className="w-4 h-4" />
                          {isEn ? 'GUIDED PROCEDURES TO PERFORM' : 'PROCEDURE GUIDATE DA ESEGUIRE SULLA PROTESI'}
                        </div>
                        <ul className="space-y-2">
                          {item.requiredProcedures.map((proc, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-200">
                              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></span>
                              <span className="font-bold">{proc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Scenario Map & Assignment Matrix */}
                    <div className="space-y-3 bg-neutral-900 border-2 border-neutral-800 p-4">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest border-b border-neutral-800 pb-2 text-neutral-300">
                        <span className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-orange-400" />
                          {isEn ? 'ASSOCIATED CLINICAL SCENARIOS (PATIENTS 1-24)' : 'MAPPATURA SCENARI CLINICI ASSOCIATI (PAZIENTI 1-24)'}
                        </span>
                        <span className="font-mono text-neutral-400">
                          {item.scenariosUsed.length} {isEn ? 'DAYTIME SESSIONS' : 'SESSIONI DIURNE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {item.scenariosUsed.map((sc, idx) => (
                          <div
                            key={idx}
                            className="bg-neutral-950 border border-neutral-700 p-3 flex flex-col justify-between space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 bg-neutral-800 text-white font-mono text-[10px] font-black">
                                {isEn ? `PATIENT ${sc.patientId}` : `PAZIENTE ${sc.patientId}`}
                              </span>
                              <span className="text-[10px] font-black uppercase text-orange-400">
                                DAY 0{sc.day} • {sc.period.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-neutral-200 truncate" title={sc.scenarioCode}>
                              {sc.scenarioCode}
                            </p>
                            <div className="text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-800 flex justify-between">
                              <span>{isEn ? `Extra: Team ${sc.teamExtra}` : `Extra: Sq ${sc.teamExtra}`}</span>
                              <span>{isEn ? `Intra: Team ${sc.teamIntra}` : `Intra: Sq ${sc.teamIntra}`}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Setup, Lead Technician & Consumables */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-2">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-orange-400" />
                          {isEn ? 'LEAD MOULAGE TECHNICIAN' : 'TECNICO RESPONSABILE MOULAGE'}
                        </span>
                        <p className="text-xs font-black text-white">{item.leadTechnician}</p>
                        <p className="text-[11px] text-neutral-400">
                          {isEn ? 'Verifies mounting, line pressures and post-scenario reset.' : 'Verifica montaggio, pressione tubi e ripristino post-scenario.'}
                        </p>
                      </div>

                      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-2">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          {isEn ? 'TECHNICAL & PRESSURE SPECS' : 'ISTRUZIONI TECNICHE & PRESSIONE'}
                        </span>
                        <p className="text-xs text-neutral-200 font-medium">{item.techRequirements}</p>
                      </div>

                      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-2">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          {isEn ? 'CONSUMABLES & SPARE KITS' : 'MATERIALI DI CONSUMO & KIT RICAMBIO'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.consumables.map((c, i) => (
                            <span key={i} className="text-[10px] font-bold px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

