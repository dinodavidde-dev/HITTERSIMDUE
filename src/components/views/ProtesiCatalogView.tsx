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
  Package,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Users,
  Wrench,
  Zap,
  Lock,
  FileText
} from 'lucide-react';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const ProtesiCatalogView: React.FC = () => {
  const { language, userRole } = useCourse();
  const isEn = language === 'en';
  const isRegia = userRole === 'regia';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [selectedModalItem, setSelectedModalItem] = useState<ProtesiItem | null>(null);

  const districts = [
    { id: 'ALL', label: isEn ? 'ALL DISTRICTS' : 'TUTTI I DISTRETTI' },
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
      (selectedDay === 'DAY3' && item.scenariosUsed.some((s) => s.day === 3));

    return matchSearch && matchDistrict && matchDay;
  });

  const getDistrictBadge = (district: ProtesiItem['district']) => {
    switch (district) {
      case 'VIE_AEREE':
        return <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-black uppercase tracking-wider">VIE AEREE / CRICO</span>;
      case 'TORACE_CUORE':
        return <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-700 text-[10px] font-black uppercase tracking-wider">TORACE & TORACOTOMIA</span>;
      case 'COLLO_VASCOLARE':
        return <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-black uppercase tracking-wider">COLLO / GIUNZIONALE</span>;
      case 'ADDOME_PELVI':
        return <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black uppercase tracking-wider">ADDOME & PELVI</span>;
      case 'ARTI_AMPUTAZIONI':
        return <span className="px-2.5 py-0.5 bg-orange-950 text-orange-300 border border-orange-700 text-[10px] font-black uppercase tracking-wider">ARTI & AMPUTAZIONI</span>;
      case 'MAXILLO_FACCIALE':
        return <span className="px-2.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-black uppercase tracking-wider">MAXILLO-FACCIALE</span>;
      case 'USTIONI_BLAST':
        return <span className="px-2.5 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-700 text-[10px] font-black uppercase tracking-wider">USTIONI & BLAST</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-700 text-[10px] font-black uppercase tracking-wider">{district}</span>;
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
    <div className="space-y-4 sm:space-y-6 pb-12 px-2 sm:px-4 max-w-7xl mx-auto font-mono">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-slate-900 to-neutral-900 border-2 border-orange-500/40 p-3 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {isEn ? 'PROSTHETICS & MOULAGE' : 'PROTESI & MOULAGE'}
              </span>
              <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">
                {PROTESI_CATALOG.length} DISPOSITIVI ATTIVI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 sm:gap-3">
              <Droplet className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 shrink-0" />
              <span>{isEn ? 'Scenario Prosthetics & Moulage' : 'Catalogo Protesi & Moulage'}</span>
            </h1>
            <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-3xl">
              {isEn
                ? 'All anatomical prosthetics, biological soft-chest simulators, pressurized vascular circuits and theatrical moulage used across clinical scenarios.'
                : 'Tutte le protesi anatomiche, simulatori biologici a torace morbido, circuiti vascolari pressurizzati e moulage impiegati negli scenari.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher variant="badge" />
            <button
              onClick={handleExportProsthetics}
              className="w-full sm:w-auto min-h-[40px] px-3.5 sm:px-4 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-600/20"
            >
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Export JSON' : 'Esporta JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 shadow-lg space-y-2.5 sm:space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={isEn ? 'Search prosthesis, code...' : 'Cerca protesi, codice, procedura...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-100 pl-9 pr-3 py-2 text-xs uppercase placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">{isEn ? 'All Course Days' : 'Tutti i Giorni di Corso'}</option>
              <option value="DAY2">{isEn ? 'Used in Day 2 Scenarios' : 'Impiegate in Scenari Day 2'}</option>
              <option value="DAY3">{isEn ? 'Used in Day 3 Scenarios' : 'Impiegate in Scenari Day 3'}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-neutral-400 font-mono flex-wrap gap-2">
          <span>{isEn ? `Showing ${filteredProtesi.length} devices` : `Visualizzati ${filteredProtesi.length} dispositivi anatomici`}</span>
          {searchQuery || selectedDistrict !== 'ALL' || selectedDay !== 'ALL' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('ALL');
                setSelectedDay('ALL');
              }}
              className="text-orange-400 hover:underline uppercase text-[11px] font-bold cursor-pointer"
            >
              {isEn ? 'Reset Filters' : 'Resetta Filtri'}
            </button>
          ) : null}
        </div>
      </div>

      {/* MOBILE PROSTHETICS CARD VIEW (< md) */}
      <div className="block md:hidden space-y-3">
        {filteredProtesi.map((item) => (
          <div key={item.id} className="bg-neutral-950 border border-neutral-800 p-3.5 space-y-3 shadow-md rounded">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-xs rounded">
                  {item.code}
                </span>
                {getDistrictBadge(item.district)}
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {item.scenariosUsed.length} {isEn ? 'Scenarios' : 'Scenari'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-snug">
                {item.name}
              </h3>
              <p className="text-neutral-400 text-xs mt-1 font-sans line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="bg-neutral-900 p-2.5 border border-neutral-800 space-y-1.5 text-xs">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Procedura Guidata:</span>
                <span className="text-orange-400 font-bold text-xs">{item.requiredProcedures[0] || 'Procedura Guidata'}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Funzione / Feature:</span>
                <span className="text-neutral-200 text-xs">{item.activeFeatures[0]}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[11px]">
                <span className="text-neutral-400">Lead Tech: <strong className="text-amber-300">{item.leadTechnician}</strong></span>
                <span className="text-neutral-400 font-mono">{item.consumables.length} consumabili</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedModalItem(item)}
              className="w-full min-h-[40px] py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-neutral-700"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Visualizza Scheda Protesi</span>
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP Prosthetics Master Table (>= md) */}
      <div className="hidden md:block bg-neutral-900 border border-neutral-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-neutral-950 text-neutral-400 text-[11px] font-mono uppercase tracking-wider border-b border-neutral-800">
              <th className="p-3">Codice & Nome Protesi</th>
              <th className="p-3">Distretto Anatomico</th>
              <th className="p-3">Funzionalità & Procedure</th>
              <th className="p-3">Scenari di Impiego</th>
              <th className="p-3">Tecnico Responsabile</th>
              <th className="p-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 text-xs">
            {filteredProtesi.map((item) => {
              return (
                <tr key={item.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="p-3 font-mono">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 bg-orange-600 text-black font-black text-[10px]">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-white font-bold text-xs">
                      {item.name}
                    </div>
                    <p className="text-neutral-400 text-[10px] mt-0.5 line-clamp-1 font-sans">
                      {item.description}
                    </p>
                  </td>
                  <td className="p-3">
                    {getDistrictBadge(item.district)}
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="text-orange-400 font-bold text-[11px] mb-0.5">
                      {item.requiredProcedures[0] || 'Procedura Guidata'}
                    </div>
                    <div className="text-neutral-300 text-[10px] line-clamp-2">
                      {item.activeFeatures[0]}
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="text-white font-bold">
                      {item.scenariosUsed.length} {isEn ? 'Scenarios' : 'Scenari'}
                    </div>
                    <div className="text-neutral-400 text-[10px] truncate max-w-[180px]">
                      {item.scenariosUsed.map(s => s.scenarioCode).join(', ')}
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <div className="text-amber-400 font-bold text-[11px]">
                      {item.leadTechnician}
                    </div>
                    <div className="text-neutral-400 text-[10px]">
                      {item.consumables.length} {isEn ? 'consumables' : 'consumabili'}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedModalItem(item)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-orange-400" />
                      Scheda
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detailed Modal */}
      {selectedModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-orange-500/60 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-orange-600 text-black font-black text-xs uppercase">
                    {selectedModalItem.code}
                  </span>
                  {getDistrictBadge(selectedModalItem.district)}
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  {selectedModalItem.name}
                </h2>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {selectedModalItem.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedModalItem(null)}
                className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold flex items-center justify-center cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-300">
              {/* Funzionalità attive & procedure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-orange-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Droplet className="w-4 h-4" /> Funzionalità Circolatorie
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {selectedModalItem.activeFeatures.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <h4 className="text-cyan-400 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Procedure Guidate
                  </h4>
                  <ul className="list-disc pl-4 space-y-1 text-neutral-200 text-xs">
                    {selectedModalItem.requiredProcedures.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scenari di impiego */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                <h4 className="text-neutral-300 font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-400" /> Scenari di Impiego ({selectedModalItem.scenariosUsed.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedModalItem.scenariosUsed.map((scen, idx) => (
                    <div key={idx} className="bg-neutral-900 p-2.5 border border-neutral-800 font-mono text-[11px] space-y-0.5">
                      <div className="text-orange-400 font-bold">Pat. #{scen.patientId} • {scen.scenarioCode}</div>
                      <div className="text-neutral-300">Day {scen.day} • TCCC Extra: Sq. {scen.teamExtra} | ShockRoom: Sq. {scen.teamIntra}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup tecnico & consumabili */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Setup Tecnico & Manutenzione:</span>
                  <p className="text-white text-xs font-mono">{selectedModalItem.techRequirements}</p>
                  <p className="text-orange-400 font-bold text-[11px] mt-2">Lead Tech: {selectedModalItem.leadTechnician}</p>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 font-bold uppercase text-[10px]">Consumabili Necessari:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-neutral-200 text-xs font-mono">
                    {selectedModalItem.consumables.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedModalItem(null)}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase text-xs tracking-wider cursor-pointer"
              >
                Chiudi Scheda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
