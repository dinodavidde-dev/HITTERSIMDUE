import React, { useState, useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { ShieldAlert, Wrench, UserCheck, Activity, FileText, CheckCircle2, AlertTriangle, Layers, Search, Upload, Download, Edit3, Plus, Trash2, Save, X, RotateCcw, Clock, MapPin } from 'lucide-react';
import { Technician } from '../../types';

export interface MasterScenarioDef {
  id: string;
  code: string;
  title: string;
  teamNumber: number;
  group: 'A' | 'B' | 'C' | 'D';
  day: number;
  period: string; // Mattina / Pomeriggio
  assignedTechCode: string; // TECH-01 to TECH-12
  location: string;
  clinicalFocus: string;
  moulageSpecs: string;
  simulatorModel: string;
  procedures: string[];
  notes: string;
}

export const MASTER_SCENARIOS_LIST: MasterScenarioDef[] = [
  {
    id: 'scen-01',
    code: 'SCEN-01',
    title: 'Emorragia Femorale Massiva & Torace Iperteso',
    teamNumber: 1,
    group: 'A',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-01',
    location: 'Ambiente Tattico 1 / Box SR 1',
    clinicalFocus: 'Controllo emorragia con Tourniquet alto, Wound Packing giunzionale, decompressione ago-toracica per pneumotorace iperteso.',
    moulageSpecs: 'Protesi arto inferiore con sanguinamento arterioso pulsatile, protesi toracica con valvole per bolle d\'aria.',
    simulatorModel: 'Manichino Alta Fedeltà TraumaSim Pro + Attore ferito',
    procedures: ['Tourniquet TCCC', 'Chest Seal', 'Ago-decompressione', 'ABCDE Shock Room'],
    notes: 'Verificare pressione pompa idraulica a 120 mmHg prima dell\'ingaggio.'
  },
  {
    id: 'scen-02',
    code: 'SCEN-02',
    title: 'Lesione Vascolare Giunzionale Collo & Vie Aeree',
    teamNumber: 2,
    group: 'A',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-02',
    location: 'Ambiente Tattico 2 / Box SR 2',
    clinicalFocus: 'Gestione ematoma cervicale compressivo, cricotiroidotomia chirurgica d\'urgenza, packing carotideo.',
    moulageSpecs: 'Collare cervicale emorragico con sangue sintetico e trachea sostituibile con membrana.',
    simulatorModel: 'Manichino Airways & Trauma Neck Advanced',
    procedures: ['Cricotiroidotomia', 'Wound Packing Collo', 'Intubazione retrograda / video'],
    notes: 'Sostituire membrana cricotiroidea e ricaricare sacca sangue venoso 500ml dopo ogni sessione.'
  },
  {
    id: 'scen-03',
    code: 'SCEN-03',
    title: 'Amputazione Traumatica Multipla & Shock Emorragico',
    teamNumber: 3,
    group: 'A',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-03',
    location: 'Ambiente Tattico 3 / Box SR 3',
    clinicalFocus: 'Doppio Tourniquet arti inferiori, accesso intraosseo sternale/tibiale, rianimazione Damage Control.',
    moulageSpecs: 'Protesi doppia amputazione transfemorale con stump sanguinanti a pompa.',
    simulatorModel: 'Manichino TCCC Full-Body Double Amputee',
    procedures: ['Double Tourniquet', 'Accesso IO', 'Eco FAST in Shock Room', 'Transfusione massiva 1:1:1'],
    notes: 'Controllare serbatoi fluidi e pulizia post-sessione.'
  },
  {
    id: 'scen-04',
    code: 'SCEN-04',
    title: 'Pneumotorace Iperteso & Arresto Traumatico',
    teamNumber: 4,
    group: 'B',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-04',
    location: 'Ambiente Tattico 1 / Box SR 1',
    clinicalFocus: 'Riconoscimento tension pneumothorax, toracostomia con dito, massaggio cardiaco chiuso in arresto traumatico.',
    moulageSpecs: 'Ferita da taglio toracica anteriore con insussuflazione d\'aria pneumatica.',
    simulatorModel: 'Manichino Thorax Advanced Airway',
    procedures: ['Toracostomia con dito', 'Chest Tube Insertion', 'RCP avanzata trauma'],
    notes: 'Testare valvola di scarico aria toracica prima dell\'avvio.'
  },
  {
    id: 'scen-05',
    code: 'SCEN-05',
    title: 'Eviscerazione Addominale & Damage Control',
    teamNumber: 5,
    group: 'B',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-05',
    location: 'Ambiente Tattico 2 / Box SR 2',
    clinicalFocus: 'Protezione visceri con telini umidi sterili, gestione ipotermia, FAST positivo per emoperitoneo.',
    moulageSpecs: 'Protesi addominale con anse intestinali in silicone e sanguinamento mesenterico.',
    simulatorModel: 'Manichino Abdominal Trauma & FAST Simulator',
    procedures: ['Medicazione visceri eviscerati', 'Eco FAST', 'Laparotomia esplorativa simulata'],
    notes: 'Lubrificare anse intestinali con soluzione fisiologica.'
  },
  {
    id: 'scen-06',
    code: 'SCEN-06',
    title: 'GSW Cranio-Cervicale & Gestione ICP in Shock Room',
    teamNumber: 6,
    group: 'B',
    day: 2,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-06',
    location: 'Ambiente Tattico 3 / Box SR 3',
    clinicalFocus: 'Valutazione GCS sotto fuoco, protezione rachide cervicale, gestione target pressori cerebrali.',
    moulageSpecs: 'Ferita da arma da fuoco temporo-parietale con fuoriuscita di sostanza cerebrale simulata.',
    simulatorModel: 'Manichino Head Trauma & GCS Responsive',
    procedures: ['Valutazione GCS', 'Controllo vie aeree', 'Monitoraggio emodinamico cerebrale'],
    notes: 'Istruire l\'attore sui parametri neurologici da recitare.'
  },
  {
    id: 'scen-07',
    code: 'SCEN-07',
    title: 'Trauma Pelvico Maggiore con Instabilità Emodinamica',
    teamNumber: 7,
    group: 'C',
    day: 3,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-07',
    location: 'Ambiente Tattico 1 / Box SR 1',
    clinicalFocus: 'Applicazione cintura pelvica (T-POD / SAM Pelvic Sling), riconoscimento instabilità anello pelvico.',
    moulageSpecs: 'Bacino traumatizzato con deformità e pelvimetro simulato.',
    simulatorModel: 'Manichino Pelvic Trauma Simulator',
    procedures: ['Pelvic Binder Application', 'Eco FAST Pelvi', 'Controllo emorragia retroperitoneale'],
    notes: 'Verificare tensionamento corretto della cintura pelvica.'
  },
  {
    id: 'scen-08',
    code: 'SCEN-08',
    title: 'Ustioni Gravi (TBSA > 40%) & Fluid Resuscitation',
    teamNumber: 8,
    group: 'C',
    day: 3,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-08',
    location: 'Ambiente Tattico 2 / Box SR 2',
    clinicalFocus: 'Formula di Parkland, stima percentuale ustioni, escharotomia toracica d\'emergenza.',
    moulageSpecs: 'Moulage cutaneo completo di ustioni II/III grado con flittene e aree carbonizzate.',
    simulatorModel: 'Manichino Burn Patient Full Body',
    procedures: ['Calcolo fluidi Parkland', 'Escharotomia', 'Copertura sterile ustioni'],
    notes: 'Applicare gel idratante specifico per moulage ustioni.'
  },
  {
    id: 'scen-09',
    code: 'SCEN-09',
    title: 'Lesione Vascolare Femorale Profonda & Tourniquet Giunzionale',
    teamNumber: 9,
    group: 'C',
    day: 3,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-09',
    location: 'Ambiente Tattico 3 / Box SR 3',
    clinicalFocus: 'Applicazione Tourniquet giunzionale (JETT / CRF), compressione manuale aorta addominale.',
    moulageSpecs: 'Protesi inguinale profonda con sanguinamento arterioso massivo pulsatile.',
    simulatorModel: 'Manichino Junctional Tourniquet Trainer',
    procedures: ['Junctional Tourniquet', 'Pressione aortica', 'Resuscitative Endovascular Balloon'],
    notes: 'Calibrare pressione pompa a 100 mmHg.'
  },
  {
    id: 'scen-10',
    code: 'SCEN-10',
    title: 'Tamponamento Cardiaco Acuto da Arma Bianca',
    teamNumber: 10,
    group: 'D',
    day: 3,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-10',
    location: 'Ambiente Tattico 1 / Box SR 1',
    clinicalFocus: 'Triade di Beck, pericardientesi ecoguidata d\'urgenza, toracotomia di rianimazione.',
    moulageSpecs: 'Ferita da punta e taglio precordiale con ecogenicità pericardica simulata.',
    simulatorModel: 'Manichino Cardiology & Pericardiocentesis',
    procedures: ['Pericardiocentesi ecoguidata', 'Toracotomia d\'urgenza', 'Massaggio cardiaco interno'],
    notes: 'Controllare eco-trattamento liquido pericardico.'
  },
  {
    id: 'scen-11',
    code: 'SCEN-11',
    title: 'Coagulopatia Traumatica Acuta e IPOTERMIA',
    teamNumber: 11,
    group: 'D',
    day: 3,
    period: 'Mattina (TCCC + Shock Room)',
    assignedTechCode: 'TECH-11',
    location: 'Ambiente Tattico 2 / Box SR 2',
    clinicalFocus: 'Gestione della triade letale (acidosi, ipotermia, coagulopatia), riscaldamento attivo forzato.',
    moulageSpecs: 'Manichino ipotermico con colorito cianotico e sensori termometrici attivi.',
    simulatorModel: 'Manichino Advanced Trauma & Temperature Control',
    procedures: ['Riscaldamento attivo', 'Correzione coagulopatia', 'Trasfusione riscaldata'],
    notes: 'Verificare funzionamento presidi di riscaldamento fluidi.'
  },
  {
    id: 'scen-12',
    code: 'SCEN-12',
    title: 'Amputazione Traumatica Arto & Occlusione Aortica REBOA',
    teamNumber: 12,
    group: 'D',
    day: 3,
    period: 'Pomeriggio (TCCC + Shock Room)',
    assignedTechCode: 'TECH-12',
    location: 'Ambiente Tattico 3 / Box SR 3',
    clinicalFocus: 'Controllo emorragia da amputazione con Tourniquet, posizionamento catetere endovascolare REBOA Zone 1 in shock room.',
    moulageSpecs: 'Moncone emorragico arto inferiore, accesso femorale simulato per catetere REBOA.',
    simulatorModel: 'Manichino Endovascular REBOA & Amputee Trainer',
    procedures: ['Tourniquet TCCC', 'Posizionamento REBOA', 'Eco FAST', 'Transfusione massiva MTP'],
    notes: 'Verificare integrità pallone REBOA e calibrazione pressione.'
  }
];

export const ScenariMasterManager: React.FC = () => {
  const { language, technicians, activeDay } = useCourse();
  const isEn = language === 'en';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(activeDay || 2);

  const [scenarios, setScenarios] = useState<MasterScenarioDef[]>(() => {
    try {
      const saved = localStorage.getItem('master_scenarios_custom');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return MASTER_SCENARIOS_LIST;
  });

  useEffect(() => {
    try {
      localStorage.setItem('master_scenarios_custom', JSON.stringify(scenarios));
    } catch (e) {
      console.error(e);
    }
  }, [scenarios]);

  const [editingScenario, setEditingScenario] = useState<MasterScenarioDef | null>(null);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScenario) return;
    setScenarios(prev => prev.map(s => s.id === editingScenario.id ? editingScenario : s));
    setEditingScenario(null);
  };

  const handleResetDefault = () => {
    if (window.confirm(isEn ? 'Reset all scenarios to default values?' : 'Ripristinare tutti gli scenari ai valori predefiniti?')) {
      setScenarios(MASTER_SCENARIOS_LIST);
      localStorage.removeItem('master_scenarios_custom');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['id', 'code', 'title', 'teamNumber', 'group', 'day', 'period', 'assignedTechCode', 'location', 'clinicalFocus', 'moulageSpecs', 'simulatorModel', 'procedures', 'notes'];
    const rows = scenarios.map(s => [
      s.id,
      s.code,
      `"${s.title.replace(/"/g, '""')}"`,
      s.teamNumber,
      s.group,
      s.day,
      `"${s.period.replace(/"/g, '""')}"`,
      s.assignedTechCode,
      `"${s.location.replace(/"/g, '""')}"`,
      `"${s.clinicalFocus.replace(/"/g, '""')}"`,
      `"${s.moulageSpecs.replace(/"/g, '""')}"`,
      `"${s.simulatorModel.replace(/"/g, '""')}"`,
      `"${s.procedures.join('; ').replace(/"/g, '""')}"`,
      `"${s.notes.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'master_scenari_tccc.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length < 2) {
          alert(isEn ? 'Invalid or empty CSV file.' : 'File CSV non valido o vuoto.');
          return;
        }

        const newScenarios: MasterScenarioDef[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const clean = (val: string) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"').trim() : '';

          if (parts.length >= 14) {
            newScenarios.push({
              id: clean(parts[0]) || `scen-${i}`,
              code: clean(parts[1]) || `SCEN-${i}`,
              title: clean(parts[2]),
              teamNumber: parseInt(clean(parts[3])) || i,
              group: (clean(parts[4]) as any) || 'A',
              day: parseInt(clean(parts[5])) || 2,
              period: clean(parts[6]),
              assignedTechCode: clean(parts[7]) || `TECH-0${i}`,
              location: clean(parts[8]),
              clinicalFocus: clean(parts[9]),
              moulageSpecs: clean(parts[10]),
              simulatorModel: clean(parts[11]),
              procedures: clean(parts[12]).split(';').map(p => p.trim()).filter(Boolean),
              notes: clean(parts[13])
            });
          }
        }

        if (newScenarios.length > 0) {
          setScenarios(newScenarios);
          alert(isEn ? `Successfully imported ${newScenarios.length} scenarios from CSV!` : `Importati con successo ${newScenarios.length} scenari dal CSV!`);
        } else {
          alert(isEn ? 'No valid scenarios found in CSV.' : 'Nessuno scenario valido trovato nel CSV.');
        }
      } catch (err) {
        console.error(err);
        alert(isEn ? 'Error parsing CSV file.' : 'Errore durante il parsing del file CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter and chronologically sort scenarios for the selected day
  const dayScenarios = scenarios
    .filter(scen => scen.day === selectedDay)
    .sort((a, b) => a.teamNumber - b.teamNumber);

  const filteredScenarios = dayScenarios.filter(scen =>
    scen.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scen.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scen.assignedTechCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scen.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="bg-neutral-900 border-2 border-pink-500/80 p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest block mb-1">
            {isEn ? 'MASTER SCENARIOS MATRIX • 12 CORE MODULES' : 'MATRICE MASTER SCENARI • ELENCO CRONOLOGICO GIORNALIERO'}
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-pink-500 animate-pulse" />
            {isEn ? 'Master Scenarios & Chronological Timeline' : 'Scenari Master & Ordine Cronologico Programma'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Day Selector */}
          <div className="flex items-center bg-neutral-950 p-1 border border-neutral-700 rounded">
            <button
              onClick={() => setSelectedDay(2)}
              className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                selectedDay === 2
                  ? 'bg-pink-600 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 02 ({isEn ? 'Teams 1-6' : 'Sq. 1-6'})
            </button>
            <button
              onClick={() => setSelectedDay(3)}
              className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                selectedDay === 3
                  ? 'bg-pink-600 text-black shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              DAY 03 ({isEn ? 'Teams 7-12' : 'Sq. 7-12'})
            </button>
          </div>

          <div className="w-full sm:w-56 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isEn ? 'Search scenario...' : 'Cerca scenario...'}
              className="w-full bg-neutral-950 border border-neutral-700 rounded pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-pink-400 border border-pink-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow"
              title={isEn ? 'Export to CSV' : 'Esporta in CSV'}
            >
              <Download className="w-3.5 h-3.5" /> {isEn ? 'Export CSV' : 'Esporta CSV'}
            </button>

            <label className="px-3 py-2 bg-pink-600 hover:bg-pink-500 text-black font-black text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow">
              <Upload className="w-3.5 h-3.5" /> {isEn ? 'Import CSV' : 'Importa CSV'}
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleResetDefault}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-mono flex items-center gap-1.5 transition-all"
              title={isEn ? 'Reset defaults' : 'Ripristina default'}
            >
              <RotateCcw className="w-3.5 h-3.5" /> {isEn ? 'Reset' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Info Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between text-xs text-neutral-300">
        <div>
          <span>{isEn ? 'Chronological View' : 'Visualizzazione Cronologica'} • <strong className="text-white">Day 0{selectedDay}</strong> • {isEn ? 'Total Scheduled Scenarios:' : 'Totale Scenari in Programma:'} <strong className="text-pink-400">{filteredScenarios.length}</strong></span>
        </div>
        <span className="text-neutral-400">
          {isEn ? 'Technical Control & Clinical Master Coordination' : 'Coordinamento Regia Tecnica & Master Clinico'}
        </span>
      </div>

      {/* Chronological List of Scenarios for Regia */}
      <div className="space-y-4">
        {filteredScenarios.map((scen, index) => {
          const availableTechs = technicians && technicians.length > 0 ? technicians : [
            { name: isEn ? 'Support Technician' : 'Tecnico di Supporto', phone: '+39 333 000000', badgeCode: scen.assignedTechCode, specialty: isEn ? 'Simulation' : 'Simulazione' }
          ];
          const tech = availableTechs[(scen.teamNumber - 1) % availableTechs.length] || availableTechs[0];

          return (
            <div key={scen.id} className="bg-neutral-950 border-2 border-neutral-800 hover:border-pink-500/80 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all shadow-xl relative group">
              
              {/* Left Side: Order & Core Info */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 bg-pink-950 text-pink-300 border border-pink-700 font-black text-xs uppercase tracking-wider rounded">
                    #{index + 1} • {scen.code}
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-900 text-orange-400 border border-neutral-700 font-mono text-xs font-bold rounded">
                    {isEn ? 'Team' : 'Squadra'} {scen.teamNumber} ({isEn ? 'Group' : 'Gruppo'} {scen.group})
                  </span>
                  <span className="px-2.5 py-1 bg-neutral-900 text-cyan-300 border border-neutral-700 font-mono text-xs font-bold rounded flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Day 0{scen.day} • {scen.period}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug">
                    {scen.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium pt-1">
                    {scen.clinicalFocus}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="bg-neutral-900 p-2.5 border border-neutral-800 rounded">
                    <span className="text-neutral-400 text-[10px] uppercase block">{isEn ? 'Location / Station:' : 'Ubicazione / Postazione:'}</span>
                    <strong className="text-amber-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {scen.location}
                    </strong>
                  </div>

                  <div className="bg-neutral-900 p-2.5 border border-neutral-800 rounded">
                    <span className="text-neutral-400 text-[10px] uppercase block">{isEn ? 'Simulator Model:' : 'Modello Simulatore:'}</span>
                    <strong className="text-cyan-300 block pt-0.5 truncate" title={scen.simulatorModel}>{scen.simulatorModel}</strong>
                  </div>

                  <div className="bg-neutral-900 p-2.5 border border-neutral-800 rounded">
                    <span className="text-neutral-400 text-[10px] uppercase block">{isEn ? 'Moulage Specifications:' : 'Specifiche Moulage:'}</span>
                    <strong className="text-pink-300 block pt-0.5 truncate" title={scen.moulageSpecs}>{scen.moulageSpecs}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scen.procedures.map((proc, pIdx) => (
                    <span key={pIdx} className="px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-800 text-[10px] rounded">
                      • {proc}
                    </span>
                  ))}
                </div>

                {scen.notes && (
                  <div className="bg-amber-950/30 border border-amber-600/50 p-2.5 text-amber-200 text-xs rounded">
                    <span className="font-bold uppercase text-[10px] block text-amber-400">{isEn ? 'Control / Technical Notes:' : 'Note Regia / Tecniche:'}</span>
                    <p className="mt-0.5">{scen.notes}</p>
                  </div>
                )}
              </div>

              {/* Right Side: Assigned Technician & Action Buttons */}
              <div className="w-full md:w-72 flex flex-col justify-between gap-4 bg-neutral-900 p-4 border border-neutral-800 rounded flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-950 border border-pink-700 flex items-center justify-center text-pink-400 font-black text-sm rounded shadow">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest block">
                      {isEn ? 'ASSIGNED TECHNICIAN' : 'TECNICO ASSEGNATO'} ({tech.badgeCode || scen.assignedTechCode})
                    </span>
                    <span className="text-xs font-black text-white">{tech.name}</span>
                    <span className="text-[10px] font-mono text-neutral-400 block">{tech.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">✓ {isEn ? 'Control Ready' : 'Pronto Regia'}</span>
                  <button
                    onClick={() => setEditingScenario({ ...scen })}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-black text-xs font-black uppercase tracking-wider rounded shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> {isEn ? 'Edit Scenario' : 'Modifica Scenario'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* EDIT MODAL */}
      {editingScenario && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-950 border-2 border-pink-500 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest block">{isEn ? 'EDIT MASTER SCENARIO' : 'MODIFICA SCENARIO MASTER'}</span>
                <h3 className="text-xl font-black text-white uppercase">{editingScenario.code} - {editingScenario.title}</h3>
              </div>
              <button
                onClick={() => setEditingScenario(null)}
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Scenario Code' : 'Codice Scenario'}</label>
                  <input
                    type="text"
                    value={editingScenario.code}
                    onChange={(e) => setEditingScenario({ ...editingScenario, code: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Scenario Title' : 'Titolo Scenario'}</label>
                  <input
                    type="text"
                    value={editingScenario.title}
                    onChange={(e) => setEditingScenario({ ...editingScenario, title: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-medium rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Team No. (1-12)' : 'Squadra N° (1-12)'}</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editingScenario.teamNumber}
                    onChange={(e) => setEditingScenario({ ...editingScenario, teamNumber: parseInt(e.target.value) || 1 })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Group (A/B/C/D)' : 'Gruppo (A/B/C/D)'}</label>
                  <select
                    value={editingScenario.group}
                    onChange={(e) => setEditingScenario({ ...editingScenario, group: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                  >
                    <option value="A">{isEn ? 'Group A' : 'Gruppo A'}</option>
                    <option value="B">{isEn ? 'Group B' : 'Gruppo B'}</option>
                    <option value="C">{isEn ? 'Group C' : 'Gruppo C'}</option>
                    <option value="D">{isEn ? 'Group D' : 'Gruppo D'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Day' : 'Giorno (Day)'}</label>
                  <input
                    type="number"
                    min="2"
                    max="3"
                    value={editingScenario.day}
                    onChange={(e) => setEditingScenario({ ...editingScenario, day: parseInt(e.target.value) || 2 })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Station / Location' : 'Postazione / Location'}</label>
                  <input
                    type="text"
                    value={editingScenario.location}
                    onChange={(e) => setEditingScenario({ ...editingScenario, location: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Assigned Tech (e.g. TECH-01)' : 'Tecnico Assegnato (es. TECH-01)'}</label>
                  <input
                    type="text"
                    value={editingScenario.assignedTechCode}
                    onChange={(e) => setEditingScenario({ ...editingScenario, assignedTechCode: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Clinical Focus / Description' : 'Focus Clinico / Descrizione'}</label>
                <textarea
                  rows={2}
                  value={editingScenario.clinicalFocus}
                  onChange={(e) => setEditingScenario({ ...editingScenario, clinicalFocus: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Moulage Specifications' : 'Specifiche Moulage'}</label>
                  <input
                    type="text"
                    value={editingScenario.moulageSpecs}
                    onChange={(e) => setEditingScenario({ ...editingScenario, moulageSpecs: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Simulator Model' : 'Modello Simulatore'}</label>
                  <input
                    type="text"
                    value={editingScenario.simulatorModel}
                    onChange={(e) => setEditingScenario({ ...editingScenario, simulatorModel: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Procedures (comma or semicolon separated)' : 'Procedure (separate da virgola o punto e virgola)'}</label>
                <input
                  type="text"
                  value={editingScenario.procedures.join(', ')}
                  onChange={(e) => setEditingScenario({ ...editingScenario, procedures: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white font-mono rounded"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono mb-1">{isEn ? 'Control / Technical Notes' : 'Note Regia / Tecniche'}</label>
                <input
                  type="text"
                  value={editingScenario.notes}
                  onChange={(e) => setEditingScenario({ ...editingScenario, notes: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-white rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingScenario(null)}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs cursor-pointer rounded"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-black font-black font-mono text-xs flex items-center gap-1.5 shadow cursor-pointer rounded"
                >
                  <Save className="w-4 h-4" /> {isEn ? 'Save Changes' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
