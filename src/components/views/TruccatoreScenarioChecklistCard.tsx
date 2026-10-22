import React, { useState, useEffect, useMemo } from 'react';
import { DeephitterTruccoEntry, DEEPHITTER_ACTORS } from '../../data/deephitterTruccoData';
import { MakeupArtist, ProtesiItem, CourseActor } from '../../types';
import { getDeephitterEntryLiveStatus, formatMinutesCountdown, formatMinutesToTime } from '../../utils/deephitterSync';
import { useCourse } from '../../context/CourseContext';
import { getAssignedTechnicianForScenario } from '../../utils/staffBalancer';
import {
  Layers,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Send,
  Check,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Activity,
  Droplets,
  HeartPulse,
  Wrench,
  Sliders,
} from 'lucide-react';
import { CardOperativaCongiunta } from '../common/CardOperativaCongiunta';

export interface ScenarioChecklistItem {
  id: string;
  label: string;
  type: 'protesi' | 'consumabile' | 'sicurezza';
  quantity?: string;
  mandatory: boolean;
}

// Tailored realistic medical moulage consumables and prosthetic steps for each actor
export const ACTOR_MOULAGE_CHECKLISTS: Record<
  string,
  {
    protesiTitle: string;
    protesiSteps: ScenarioChecklistItem[];
    consumables: ScenarioChecklistItem[];
    safetyCues: string;
  }
> = {
  'ACT-01': {
    protesiTitle: 'Moncone Femorale Balistico IED & Accesso REBOA (Pz 6, 12, 21)',
    protesiSteps: [
      { id: 'p1', label: 'Posizionamento guscio protettivo anatomico su moncone reale', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Ancoraggio manicotto siliconico con osso resina scheggiato', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Collegamento linea idraulica a pompa arteriosa a getto pulsante', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Test tenuta circuito e verifica tenuta Tourniquet a 250 mmHg', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Sangue sintetico arterioso alta viscosità', type: 'consumabile', quantity: '800 ml', mandatory: true },
      { id: 'c2', label: 'Mastice adesivo Pros-Aide medicale ad acqua', type: 'consumabile', quantity: '30 ml', mandatory: true },
      { id: 'c3', label: 'Garze laparotomiche assorbenti per packing', type: 'consumabile', quantity: '4 confezioni', mandatory: true },
      { id: 'c4', label: 'Raccordi rapidi Luer-Lock 6mm per pompa', type: 'consumabile', quantity: '2 pezzi', mandatory: false },
    ],
    safetyCues: 'Verificare comfort moncone attore, nessuna costrizione vascolare a monte del set protesico.',
  },
  'ACT-02': {
    protesiTitle: 'Collare Cervicale Cricotiroidotomia Incidibile (Pz 1, 16, 19, 20)',
    protesiSteps: [
      { id: 'p1', label: 'Applicazione film barriera protettivo oleoso su collo attore', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Fissaggio piastra cervicale con repere cartilagine cricoide', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Inserimento membrana cricotiroidea siliconica nuova (incisione 2-3 cm)', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Caricamento camera vascolare espansione ematoma cervicale', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Membrana cricotiroidea di ricambio mono-uso', type: 'consumabile', quantity: '2 pezzi', mandatory: true },
      { id: 'c2', label: 'Pelle siliconica cervicale incidibile di strato', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
      { id: 'c3', label: 'Cannula tracheostomica 6.0 con cuffia', type: 'consumabile', quantity: '1 set', mandatory: true },
      { id: 'c4', label: 'Sangue artificiale venoso scuro', type: 'consumabile', quantity: '250 ml', mandatory: true },
      { id: 'c5', label: 'Remover oleoso delicato Isopropyl Myristate', type: 'consumabile', quantity: '50 ml', mandatory: true },
    ],
    safetyCues: 'Attenzione: NON usare solventi alcolici su attrice. Piastra rigida interna a protezione della laringe reale.',
  },
  'ACT-03': {
    protesiTitle: 'Kit Figurante Commilitone sotto Shock (Pz 1, 9, 14)',
    protesiSteps: [
      { id: 'p1', label: 'Allestimento divisa tattica lacera e bruciata da deflagrazione', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Impolveramento massivo volto, mani e uniforme con fuliggine cosmetica', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Applicazione sangue secondario da impatto su tempia e nocche', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Briefing comportamentale: agitazione, disorientamento e richiami verbali', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Polvere cosmetica nera/cenere da blast', type: 'consumabile', quantity: '1 flacone', mandatory: true },
      { id: 'c2', label: 'Spray sudore artificiale e lacrime', type: 'consumabile', quantity: '100 ml', mandatory: true },
      { id: 'c3', label: 'Sangue denso per croste ed escoriazioni', type: 'consumabile', quantity: '150 ml', mandatory: true },
      { id: 'c4', label: 'Gel protettivo occhi contro polvere', type: 'consumabile', quantity: '1 tubetto', mandatory: true },
    ],
    safetyCues: 'Proteggere occhi e vie aeree dell\'attore durante l\'impolveramento; acqua potabile sempre a disposizione.',
  },
  'ACT-04': {
    protesiTitle: 'Amputazione Sub-Totale Arto Superiore / Avambraccio (Pz 9, 24)',
    protesiSteps: [
      { id: 'p1', label: 'Calzata guanto di schermatura arto reale attore', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Ancoraggio gambaletto protesico brachiale con osso in resina scheggiato', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Connessione linea arteriosa brachiale a getto intermittente', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Rifinitura fasce muscolari esposte e test tenuta Tourniquet TQ', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Sacca sangue arterioso pulsatile', type: 'consumabile', quantity: '500 ml', mandatory: true },
      { id: 'c2', label: 'PlatSil Gel silicone per carni vive e lacerazioni', type: 'consumabile', quantity: '100 g', mandatory: true },
      { id: 'c3', label: 'Garze emostatiche con bario radiopaco', type: 'consumabile', quantity: '2 pezzi', mandatory: true },
      { id: 'c4', label: 'Tourniquet da addestramento CAT Gen7 dedicato', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
    ],
    safetyCues: 'Non stringere il TQ sull\'arto vivo dell\'attore: la compressione avviene sul supporto rigido protesico.',
  },
  'ACT-05': {
    protesiTitle: 'Placca Eviscerazione Enterica & Packing Addominale (Pz 3, 17, 18, 24)',
    protesiSteps: [
      { id: 'p1', label: 'Stesura pellicola barriera ipoallergenica su addome attrice', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Posizionamento placca laparotomica sagomata con breccia aperta', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Alloggiamento anse intestinali artificiali e idratazione continua', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Iniezione sangue denso scuro peritoneale per simulazione emoperitoneo', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Gel lubrificante idratante per anse artificiali', type: 'consumabile', quantity: '500 ml', mandatory: true },
      { id: 'c2', label: 'Sangue sintetico venoso profondo scuro', type: 'consumabile', quantity: '400 ml', mandatory: true },
      { id: 'c3', label: 'Pellicola barriera trasparente cutanea Skin-Shield', type: 'consumabile', quantity: '1 rotolo', mandatory: true },
      { id: 'c4', label: 'Teli sterili da campo per impacco umido addominale', type: 'consumabile', quantity: '3 confezioni', mandatory: true },
    ],
    safetyCues: 'Mantenere le anse lubrificate a temperatura ambiente; evitare ristagno freddo sull\'addome.',
  },
  'ACT-06': {
    protesiTitle: 'Figurante Testimone Crollo & Disorientamento (Pz 12, 19)',
    protesiSteps: [
      { id: 'p1', label: 'Imbrattamento divisa con intonaco e calce teatrale inerte', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Moulage escoriazioni multiple volto e avambracci da calcinacci', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Simulazione ipoacusia e stordimento acustico da onda d\'urto', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Calce teatrale polverizzata neutra (senza polveri irritanti)', type: 'consumabile', quantity: '200 g', mandatory: true },
      { id: 'c2', label: 'Palette colori ematomi a cera (blu, violaceo, giallo)', type: 'consumabile', quantity: '1 set', mandatory: true },
      { id: 'c3', label: 'Sangue semi-denso coagulato per ferite chiuse', type: 'consumabile', quantity: '100 ml', mandatory: true },
    ],
    safetyCues: 'Occhiali protettivi per l\'attore durante l\'allestimento iniziale; rimuovere polveri dagli occhi.',
  },
  'ACT-07': {
    protesiTitle: 'Pad Toracico PNX 2° Spazio & Placca Toracotomica (Pz 2, 4, 5, 13, 14)',
    protesiSteps: [
      { id: 'p1', label: 'Posizionamento pettorina protettiva rigida antisfondamento su torace attore', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Innesto modulo PNX 2° spazio intercostale emiclaveare con camera pneumatica', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Carica aria a pressione 1.2 bar per fischio decompressivo ago', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Allestimento ferita penetrante con zaffo toracico e sangue gorgogliante', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Membrana perforabile in lattice per sfogo d\'aria PNX', type: 'consumabile', quantity: '2 pezzi', mandatory: true },
      { id: 'c2', label: 'Ago cannula decompressiva 14G da addestramento', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
      { id: 'c3', label: 'Sangue sintetico fluido con additivo schiumogeno (aria/bolle)', type: 'consumabile', quantity: '350 ml', mandatory: true },
      { id: 'c4', label: 'Valvola di sicurezza per tenuta camera pneumatica', type: 'consumabile', quantity: '1 pezzo', mandatory: false },
    ],
    safetyCues: 'Controllo scrupoloso della piastra posteriore in alluminio/kevlar: NESSUN ago deve raggiungere la cute reale.',
  },
  'ACT-08': {
    protesiTitle: 'Pad Toracico Tubo Drenaggio 28-32 Fr & PNX Teso (Pz 7, 8, 10, 11)',
    protesiSteps: [
      { id: 'p1', label: 'Vestizione corazza toracica protettiva con repere 5° spazio ascellare', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Innesto guscio pleurico multistrato a tenuta d\'acqua e aria', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Riempimento camera pleurica con 300 ml sangue e caricamento aria tesa', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Verifica breccia per pinza Kelly e passaggio tubo toracico 28-32 Fr', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Strato pleurico sintetico sacrificabile per incisione Kelly', type: 'consumabile', quantity: '2 ricambi', mandatory: true },
      { id: 'c2', label: 'Tubo di drenaggio toracico 28-32 Fr da simulazione', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
      { id: 'c3', label: 'Sangue simulato emotorace con micro-coaguli', type: 'consumabile', quantity: '400 ml', mandatory: true },
      { id: 'c4', label: 'Medicazione occlusiva a 3 vie con valvola di sfogo', type: 'consumabile', quantity: '1 set', mandatory: true },
    ],
    safetyCues: 'Arresto corsa forcipe: verificare finecorsa rigido interno prima dell\'ingresso della squadra discenti.',
  },
  'ACT-09': {
    protesiTitle: 'Lacerazione Collo Z2 Asse Carotideo a Pompa (Pz 15, 22, 23)',
    protesiSteps: [
      { id: 'p1', label: 'Fissaggio guscio latero-cervicale sagomato con tubicino a pompa', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Priming condotto carotideo e regolazione getto continuo/pulsante', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Creazione cavità profonda 5 cm per zaffaggio emostatico', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Test valvola arresto getto su compressione manuale mirata', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Sangue sintetico arterioso rosso vivo brillante', type: 'consumabile', quantity: '600 ml', mandatory: true },
      { id: 'c2', label: 'Garze emostatiche per zaffaggio profondo collo', type: 'consumabile', quantity: '2 pezzi', mandatory: true },
      { id: 'c3', label: 'Pompetta manuale / automatica peristaltica ricaricata', type: 'consumabile', quantity: '1 unità', mandatory: true },
      { id: 'c4', label: 'Adesivo siliconico medicale a tenuta stagna su cute', type: 'consumabile', quantity: '20 ml', mandatory: true },
    ],
    safetyCues: 'Nessuna pressione deve gravare sul seno carotideo reale dell\'attore. Schermo plastico rigido interno certificato.',
  },
  'ACT-10': {
    protesiTitle: 'Primo Soccorritore Tattico & Briefing SBAR (Pz 1-3, 13-15)',
    protesiSteps: [
      { id: 'p1', label: 'Vestizione tuta tattica imbrattata e gilet operatore sanitario', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Applicazione sangue sintetico essiccato su guanti e divisa', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Cartellino triage di consegna barellata e scheda MIST precompilata', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Scheda MIST / SBAR impermeabile da campo', type: 'consumabile', quantity: '1 foglio', mandatory: true },
      { id: 'c2', label: 'Sangue secco spray per vestiario e guanti nitrile', type: 'consumabile', quantity: '100 ml', mandatory: true },
      { id: 'c3', label: 'Pennarello dermografico per orari Tourniquet su fronte', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
    ],
    safetyCues: 'Garantire auricolare radio libero per comunicazioni tra soccorritore e regia prima dell\'handover.',
  },
  'ACT-11': {
    protesiTitle: 'Accesso Femorale REBOA Z1 & Stabilizzatore Pelvico (Pz 17, 18)',
    protesiSteps: [
      { id: 'p1', label: 'Indossamento pantaloncino inguinale in finta pelle con vasi siliconici', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Priming asse femorale con soluzione ematica e controllo reflusso', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Posizionamento introduttore vascolare 7 Fr per catetere a palloncino', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Verifica tenuta cuffia palloncino in Zona 1 toraco-addominale', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Tubi femorali siliconici sacrificabili per puntura', type: 'consumabile', quantity: '2 segmenti', mandatory: true },
      { id: 'c2', label: 'Introduttore vascolare 7 Fr da addestramento', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
      { id: 'c3', label: 'Sangue sintetico venoso/arterioso per reflusso', type: 'consumabile', quantity: '300 ml', mandatory: true },
      { id: 'c4', label: 'Fascia pelvica SAM Pelvic Sling da addestramento', type: 'consumabile', quantity: '1 pezzo', mandatory: true },
    ],
    safetyCues: 'Verificare che la puntura avvenga rigorosamente nel modulo esterno senza contatto con l\'inguine reale.',
  },
  'ACT-12': {
    protesiTitle: 'Pad Toracico & Tamponamento Cardiaco Ecoguidato (Pz 4, 5, 23)',
    protesiSteps: [
      { id: 'p1', label: 'Applicazione scudo sternale protettivo con serbatoio pericardico', type: 'protesi', mandatory: true },
      { id: 'p2', label: 'Iniezione 150 ml fluido pericardico anecogeno visibile a eco FAST', type: 'protesi', mandatory: true },
      { id: 'p3', label: 'Innesto camera toracica per toracotomia di emergenza e massaggio', type: 'protesi', mandatory: true },
      { id: 'p4', label: 'Test visualizzazione finestra sottocostale ecografica', type: 'protesi', mandatory: true },
    ],
    consumables: [
      { id: 'c1', label: 'Fluido anecogeno per pericardiocentesi ecoguidata', type: 'consumabile', quantity: '200 ml', mandatory: true },
      { id: 'c2', label: 'Membrana pericardica forabile di ricambio', type: 'consumabile', quantity: '2 pezzi', mandatory: true },
      { id: 'c3', label: 'Ago da pericardiocentesi con raccordo a 3 vie', type: 'consumabile', quantity: '1 set', mandatory: true },
      { id: 'c4', label: 'Gel ecografico neutro ad alta conduzione', type: 'consumabile', quantity: '1 flacone', mandatory: true },
    ],
    safetyCues: 'Maneggiare sonda ecografica delicatamente sulla cute simulata; non forzare l\'ago oltre il fermo di sicurezza.',
  },
};

interface TruccatoreScenarioChecklistCardProps {
  entry: DeephitterTruccoEntry;
  artist: MakeupArtist;
  isActiveScenario: boolean;
  currentCourseMinutes: number;
  isPronto: boolean;
  onValidatePronto: () => void;
  protesiList: ProtesiItem[];
  actor?: CourseActor;
}

export const TruccatoreScenarioChecklistCard: React.FC<TruccatoreScenarioChecklistCardProps> = ({
  entry,
  artist,
  isActiveScenario,
  currentCourseMinutes,
  isPronto,
  onValidatePronto,
  protesiList,
  actor,
}) => {
  const { technicians, simulatorPatients, updateTechChecklist } = useCourse();
  const assignedTech = useMemo(() => {
    return getAssignedTechnicianForScenario(technicians, entry.patientIds[0], entry.postazioneLogistica);
  }, [technicians, entry]);

  const storageKey = `trauma_trucco_checklist_v1_d${entry.day}_b${entry.blockNumber}_${entry.actorCode}`;

  const defaultChecklistData = useMemo(() => {
    return ACTOR_MOULAGE_CHECKLISTS[entry.actorCode] || {
      protesiTitle: entry.presidioMoulageFx || 'Presidio Moulage Standard',
      protesiSteps: [
        { id: 'def_p1', label: 'Posizionamento e ancoraggio silicone su attore', type: 'protesi', mandatory: true },
        { id: 'def_p2', label: 'Verifica tenuta raccordi e circuito fluidi', type: 'protesi', mandatory: true },
        { id: 'def_p3', label: 'Controllo finale vestizione e cue recitativi', type: 'protesi', mandatory: true },
      ],
      consumables: [
        { id: 'def_c1', label: 'Sangue sintetico simulato', type: 'consumabile', quantity: '500 ml', mandatory: true },
        { id: 'def_c2', label: 'Mastice adesivo medico Pros-Aide', type: 'consumabile', quantity: '30 ml', mandatory: true },
        { id: 'def_c3', label: 'Garze e medicazioni da campo', type: 'consumabile', quantity: '2 set', mandatory: true },
      ],
      safetyCues: 'Verificare comfort attore e protezione della cute reale.',
    };
  }, [entry.actorCode, entry.presidioMoulageFx]);

  // Checked state stored in local storage
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {};
  });

  const [activeTab, setActiveTab] = useState<'all' | 'protesi' | 'consumabili'>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(isActiveScenario);
  const [showJointModal, setShowJointModal] = useState(false);

  // Auto expand when becoming active scenario
  useEffect(() => {
    if (isActiveScenario) {
      setIsExpanded(true);
    }
  }, [isActiveScenario]);

  const toggleCheck = (id: string) => {
    setCheckedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedMap({});
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  const actorObj = actor || DEEPHITTER_ACTORS.find((a) => a.badgeCode === entry.actorCode);
  const liveStatus = getDeephitterEntryLiveStatus(
    entry,
    currentCourseMinutes,
    actor?.progressStatus || (isPronto ? 'PRONTO_T0' : undefined)
  );
  const isCritical = liveStatus.isCriticalT0InPrep;

  const totalProtesiCount = defaultChecklistData.protesiSteps.length;
  const checkedProtesiCount = defaultChecklistData.protesiSteps.filter((s) => checkedMap[s.id]).length;

  const totalConsumablesCount = defaultChecklistData.consumables.length;
  const checkedConsumablesCount = defaultChecklistData.consumables.filter((s) => checkedMap[s.id]).length;

  const totalItems = totalProtesiCount + totalConsumablesCount;
  const totalChecked = checkedProtesiCount + checkedConsumablesCount;
  const allCompleted = totalItems > 0 && totalChecked === totalItems;

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isCritical
          ? 'bg-neutral-900 border-2 border-red-500 shadow-2xl ring-2 ring-red-500/80 animate-pulse'
          : isActiveScenario
          ? 'bg-neutral-900 border-2 border-emerald-400 shadow-2xl ring-2 ring-emerald-500/50'
          : isPronto
          ? 'bg-neutral-900/90 border-emerald-600/70 shadow-lg'
          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Priority Warning Banner if in prep and T0 < 10 min */}
      {isCritical && (
        <div className="p-2.5 bg-red-950 border-b border-red-500 text-red-100 text-xs font-black flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>⚠️ ALLERTA T0 &lt; 10 MIN • IN PREPARAZIONE</span>
          </div>
          <span className="tabular-nums font-mono text-white bg-red-600 px-2 py-0.5 rounded text-[11px]">
            {formatMinutesCountdown(liveStatus.countdownT0Minutes)}
          </span>
        </div>
      )}

      {/* Header bar */}
      <div className="p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {isActiveScenario && (
              <span className={`px-2.5 py-1 ${isCritical ? 'bg-red-600' : 'bg-emerald-500'} text-black font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 shadow-md animate-pulse`}>
                <Activity className="w-3.5 h-3.5" />
                <span>{isCritical ? 'CRITICO • T0 < 10m' : 'SCENARIO ATTIVO • IN CORSO'}</span>
              </span>
            )}
            <span className="px-2 py-0.5 bg-pink-600 text-white font-black text-xs rounded">
              BLOCCO {entry.blockNumber}
            </span>
            <span className="text-sm font-black text-white">{entry.scenarioAndPatient}</span>
            <span className="text-xs text-neutral-400">({entry.postazioneLogistica})</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-xs font-bold rounded border ${liveStatus.badgeClass}`}
            >
              {liveStatus.statusLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded cursor-pointer"
              title={isExpanded ? 'Riduci scheda' : 'Espandi dettagli'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4 Protocol Timing Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs pt-1">
          <div className="p-1.5 bg-black/60 rounded border border-neutral-800">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">1. Convocazione</span>
            <span className="font-bold text-white text-xs tabular-nums">{entry.convocazioneTime}</span>
          </div>
          <div className="p-1.5 bg-black/60 rounded border border-neutral-800">
            <span className="text-[10px] text-pink-400 uppercase font-bold block">2. Finestra FX</span>
            <span className="font-bold text-neutral-200 text-xs tabular-nums">{entry.finestraTrucco}</span>
          </div>
          <div className="p-1.5 bg-black/60 rounded border border-neutral-800">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">3. Pronto Scena</span>
            <span className="font-bold text-emerald-400 text-xs tabular-nums">{entry.prontoTime}</span>
          </div>
          <div className="p-1.5 bg-black/60 rounded border border-neutral-800">
            <span className="text-[10px] text-red-400 uppercase font-bold block">4. T0 Ingaggio</span>
            <span className="font-bold text-red-400 text-xs tabular-nums">{entry.t0Time}</span>
          </div>
        </div>

        {/* Actor and Progress Gauge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-black/70 rounded-lg border border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-xs rounded">
              {entry.actorCode}
            </span>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{entry.actorName}</span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  ({actorObj?.physicalStatus || 'INTERO'})
                </span>
              </div>
              <div className="text-[11px] text-neutral-300 font-sans line-clamp-1">
                {defaultChecklistData.protesiTitle}
              </div>
            </div>
          </div>

          {/* Checklist progress pill */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase block">Checklist Kit</span>
              <span className={`text-xs font-black tabular-nums ${allCompleted ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalChecked} / {totalItems} Pronti
              </span>
            </div>
            <div className="w-16 bg-neutral-800 h-2 rounded-full overflow-hidden border border-neutral-700">
              <div
                className={`h-full transition-all duration-300 ${
                  allCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${totalItems > 0 ? (totalChecked / totalItems) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Interactive Body */}
      {isExpanded && (
        <div className="px-3.5 pb-4 sm:px-4 space-y-4 border-t border-neutral-800 pt-3">
          {/* TECNICO ASSEGNATO & REGIA SIMULATORE AFFIANCATO */}
          <div className="p-3 bg-neutral-900/90 rounded-lg border border-pink-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 bg-pink-600 text-white font-mono font-black text-xs rounded shrink-0">
                  {assignedTech.badgeCode}
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-white text-xs truncate">{assignedTech.name}</span>
                  <span className="text-[10px] text-pink-300 ml-2 font-mono shrink-0">Regia CH-3</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-neutral-300 text-[10px] rounded font-mono shrink-0">
                {assignedTech.assignedStation || entry.postazioneLogistica}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono truncate">
              {assignedTech.specialty}
            </div>
            {/* Checklist Congiunta Trucco & Simulatore */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px]">
              <div className={`p-1.5 rounded text-center font-bold border flex items-center justify-center gap-1 ${
                isPronto ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500' : 'bg-neutral-950 text-pink-300 border-neutral-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Moulage: {isPronto ? '✓ OK' : 'In allestimento'}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const pzId = entry.patientIds[0];
                  const patient = simulatorPatients.find((p) => p.id === pzId);
                  const newVal = !patient?.techChecklist?.preDone;
                  updateTechChecklist(pzId, 'preDone', newVal, 'Convalida congiunta mobile');
                }}
                className={`p-1.5 rounded text-center font-bold border cursor-pointer flex items-center justify-center gap-1 transition-colors ${
                  simulatorPatients.find((p) => p.id === entry.patientIds[0])?.techChecklist?.preDone
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 hover:bg-cyan-900'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulatore: {simulatorPatients.find((p) => p.id === entry.patientIds[0])?.techChecklist?.preDone ? '✓ OK (Regia)' : 'Convalida'}</span>
              </button>
            </div>

            {/* Pulsante rapido Card Operativa Congiunta Completa */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowJointModal(true);
              }}
              className="w-full py-1.5 px-3 bg-gradient-to-r from-fuchsia-950 via-purple-950 to-pink-950 hover:from-fuchsia-900 hover:to-pink-900 border border-fuchsia-500/80 rounded-lg text-xs font-black text-pink-200 uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Apri Card Operativa Congiunta (Checklist & Regia CH-3)</span>
            </button>
          </div>

          {/* Sub-tab selection */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-black p-1 rounded border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                  activeTab === 'all' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tutto ({totalItems})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('protesi')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                  activeTab === 'protesi' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Protesi ({checkedProtesiCount}/{totalProtesiCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('consumabili')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                  activeTab === 'consumabili' ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Package className="w-3 h-3" />
                <span>Consumabili ({checkedConsumablesCount}/{totalConsumablesCount})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={resetChecklist}
              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Resetta tutte le spunte di questo scenario"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetta Spunte</span>
            </button>
          </div>

          {/* 1. SEZIONE PROTESI */}
          {(activeTab === 'all' || activeTab === 'protesi') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                <span className="flex items-center gap-1.5 uppercase text-[11px]">
                  <Layers className="w-3.5 h-3.5" />
                  Checklist Allestimento Protesi ({checkedProtesiCount}/{totalProtesiCount})
                </span>
                <span className="text-[10px] text-neutral-400">
                  Target: {entry.prontoTime} (T-15&apos;)
                </span>
              </div>

              <div className="space-y-1.5">
                {defaultChecklistData.protesiSteps.map((step) => {
                  const isChecked = Boolean(checkedMap[step.id]);
                  return (
                    <label
                      key={step.id}
                      onClick={() => toggleCheck(step.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                          : 'bg-neutral-950 border-neutral-800 hover:border-pink-500/50 text-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-500 border-emerald-400 text-black'
                            : 'border-neutral-600 bg-neutral-900'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 text-xs font-sans leading-snug">
                        <span className={isChecked ? 'line-through text-neutral-400' : 'text-neutral-200'}>
                          {step.label}
                        </span>
                        {step.mandatory && (
                          <span className="text-[10px] text-pink-400 font-mono ml-2 font-bold uppercase">
                            [Tassativo]
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SEZIONE CONSUMABILI */}
          {(activeTab === 'all' || activeTab === 'consumabili') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span className="flex items-center gap-1.5 uppercase text-[11px]">
                  <Droplets className="w-3.5 h-3.5 text-red-400" />
                  Consumabili & Ricarica Fluidi ({checkedConsumablesCount}/{totalConsumablesCount})
                </span>
                <span className="text-[10px] text-neutral-400">Verifica scorte e cariche</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {defaultChecklistData.consumables.map((item) => {
                  const isChecked = Boolean(checkedMap[item.id]);
                  return (
                    <label
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                          : 'bg-neutral-950 border-neutral-800 hover:border-amber-500/50 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-neutral-600 bg-neutral-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs font-sans truncate ${
                            isChecked ? 'line-through text-neutral-400' : 'text-neutral-200'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.quantity && (
                        <span className="px-1.5 py-0.5 bg-black border border-neutral-700 text-amber-300 font-mono text-[10px] font-bold shrink-0 ml-2">
                          {item.quantity}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safety & Protocol Cues */}
          <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-[11px] text-neutral-400 font-sans flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-200">Presidio Sicurezza Attore:</strong>{' '}
              {defaultChecklistData.safetyCues}
            </div>
          </div>

          {/* 1-Click Validation Button with Radio Broadcast */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onValidatePronto}
              className={`w-full py-3 px-4 text-xs font-black uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xl ${
                isPronto
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25 ring-2 ring-emerald-400'
                  : allCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-black animate-pulse shadow-emerald-600/30'
                  : 'bg-neutral-800 hover:bg-emerald-950 text-neutral-200 hover:text-emerald-300 border border-neutral-700 hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isPronto
                  ? '✓ PRONTO SCENA (T-15\') RAGGIUNTO & NOTIFICATO A REGIA'
                  : allCompleted
                  ? 'INVIA COMPLETAMENTO KIT & PROTESI A REGIA CH-3'
                  : `CONFERMA TARGET PRONTO SCENA (T-15\') [${totalChecked}/${totalItems}]`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MODALE CARD OPERATIVA CONGIUNTA */}
      {showJointModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full my-auto animate-in fade-in zoom-in-95 duration-200">
            <CardOperativaCongiunta
              patientId={entry.patientIds[0]}
              entry={entry}
              activeRolePerspective="trucco"
              onClose={() => setShowJointModal(false)}
              isModal
            />
          </div>
        </div>
      )}
    </div>
  );
};
