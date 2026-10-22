import { ProtesiItem, CourseDay } from '../types';

export interface OperationalBlockMeta {
  blockNumber: 1 | 2 | 3 | 4;
  day: CourseDay;
  period: 'mattina' | 'pomeriggio';
  blockLabelIt: string;
  blockLabelEn: string;
  blockTimeRange: string;
  truccoPrepWindow: string;
  preAlertTcccWindow: string;
  tcccWindow: string;
  preAlertSrWindow: string;
  handoverTime: string;
  srWindow: string;
  debriefResetWindow: string;
  tcccGroup: 'A' | 'B' | 'C' | 'D';
  srGroup: 'A' | 'B' | 'C' | 'D';
  ws1Group: 'A' | 'B' | 'C' | 'D';
  ws2Group: 'A' | 'B' | 'C' | 'D';
  patientIds: [number, number, number];
}

const DAY_1_OPERATIONAL_BLOCKS: OperationalBlockMeta[] = [
  {
    blockNumber: 1,
    day: 1,
    period: 'mattina',
    blockLabelIt: 'BLOCCO 1 • MATTINA (09:00 – 10:35)',
    blockLabelEn: 'BLOCK 1 • MORNING (09:00 – 10:35)',
    blockTimeRange: '09:00 - 10:35',
    truccoPrepWindow: '08:15 - 09:00',
    preAlertTcccWindow: '08:45 - 09:00',
    tcccWindow: '09:00 - 09:30',
    preAlertSrWindow: '09:15 - 09:30',
    handoverTime: '09:30 - 09:35',
    srWindow: '09:35 - 10:05',
    debriefResetWindow: '10:05 - 10:35',
    tcccGroup: 'A',
    srGroup: 'C',
    ws1Group: 'B',
    ws2Group: 'D',
    patientIds: [1, 2, 3],
  },
  {
    blockNumber: 2,
    day: 1,
    period: 'mattina',
    blockLabelIt: 'BLOCCO 2 • MATTINA (11:05 – 12:40)',
    blockLabelEn: 'BLOCK 2 • MORNING (11:05 – 12:40)',
    blockTimeRange: '11:05 - 12:40',
    truccoPrepWindow: '10:20 - 11:05',
    preAlertTcccWindow: '10:50 - 11:05',
    tcccWindow: '11:05 - 11:35',
    preAlertSrWindow: '11:20 - 11:35',
    handoverTime: '11:35 - 11:40',
    srWindow: '11:40 - 12:10',
    debriefResetWindow: '12:10 - 12:40',
    tcccGroup: 'D',
    srGroup: 'B',
    ws1Group: 'C',
    ws2Group: 'A',
    patientIds: [4, 5, 6],
  },
  {
    blockNumber: 3,
    day: 1,
    period: 'pomeriggio',
    blockLabelIt: 'BLOCCO 3 • POMERIGGIO (14:10 – 15:45)',
    blockLabelEn: 'BLOCK 3 • AFTERNOON (14:10 – 15:45)',
    blockTimeRange: '14:10 - 15:45',
    truccoPrepWindow: '13:25 - 14:10',
    preAlertTcccWindow: '13:55 - 14:10',
    tcccWindow: '14:10 - 14:40',
    preAlertSrWindow: '14:25 - 14:40',
    handoverTime: '14:40 - 14:45',
    srWindow: '14:45 - 15:15',
    debriefResetWindow: '15:15 - 15:45',
    tcccGroup: 'B',
    srGroup: 'D',
    ws1Group: 'A',
    ws2Group: 'C',
    patientIds: [7, 8, 9],
  },
  {
    blockNumber: 4,
    day: 1,
    period: 'pomeriggio',
    blockLabelIt: 'BLOCCO 4 • POMERIGGIO (16:10 – 17:45)',
    blockLabelEn: 'BLOCK 4 • AFTERNOON (16:10 – 17:45)',
    blockTimeRange: '16:10 - 17:45',
    truccoPrepWindow: '15:25 - 16:10',
    preAlertTcccWindow: '15:55 - 16:10',
    tcccWindow: '16:10 - 16:40',
    preAlertSrWindow: '16:25 - 16:40',
    handoverTime: '16:40 - 16:45',
    srWindow: '16:45 - 17:15',
    debriefResetWindow: '17:15 - 17:45',
    tcccGroup: 'C',
    srGroup: 'A',
    ws1Group: 'D',
    ws2Group: 'B',
    patientIds: [10, 11, 12],
  },
];

const DAY_2_OPERATIONAL_BLOCKS: OperationalBlockMeta[] = [
  {
    blockNumber: 1,
    day: 2,
    period: 'mattina',
    blockLabelIt: 'BLOCCO 1 • MATTINA (09:00 – 10:35)',
    blockLabelEn: 'BLOCK 1 • MORNING (09:00 – 10:35)',
    blockTimeRange: '09:00 - 10:35',
    truccoPrepWindow: '08:15 - 09:00',
    preAlertTcccWindow: '08:45 - 09:00',
    tcccWindow: '09:00 - 09:30',
    preAlertSrWindow: '09:15 - 09:30',
    handoverTime: '09:30 - 09:35',
    srWindow: '09:35 - 10:05',
    debriefResetWindow: '10:05 - 10:35',
    tcccGroup: 'B',
    srGroup: 'D',
    ws1Group: 'C',
    ws2Group: 'A',
    patientIds: [13, 14, 15],
  },
  {
    blockNumber: 2,
    day: 2,
    period: 'mattina',
    blockLabelIt: 'BLOCCO 2 • MATTINA (11:05 – 12:40)',
    blockLabelEn: 'BLOCK 2 • MORNING (11:05 – 12:40)',
    blockTimeRange: '11:05 - 12:40',
    truccoPrepWindow: '10:20 - 11:05',
    preAlertTcccWindow: '10:50 - 11:05',
    tcccWindow: '11:05 - 11:35',
    preAlertSrWindow: '11:20 - 11:35',
    handoverTime: '11:35 - 11:40',
    srWindow: '11:40 - 12:10',
    debriefResetWindow: '12:10 - 12:40',
    tcccGroup: 'C',
    srGroup: 'A',
    ws1Group: 'B',
    ws2Group: 'D',
    patientIds: [16, 17, 18],
  },
  {
    blockNumber: 3,
    day: 2,
    period: 'pomeriggio',
    blockLabelIt: 'BLOCCO 3 • POMERIGGIO (14:10 – 15:45)',
    blockLabelEn: 'BLOCK 3 • AFTERNOON (14:10 – 15:45)',
    blockTimeRange: '14:10 - 15:45',
    truccoPrepWindow: '13:25 - 14:10',
    preAlertTcccWindow: '13:55 - 14:10',
    tcccWindow: '14:10 - 14:40',
    preAlertSrWindow: '14:25 - 14:40',
    handoverTime: '14:40 - 14:45',
    srWindow: '14:45 - 15:15',
    debriefResetWindow: '15:15 - 15:45',
    tcccGroup: 'A',
    srGroup: 'C',
    ws1Group: 'D',
    ws2Group: 'B',
    patientIds: [19, 20, 21],
  },
  {
    blockNumber: 4,
    day: 2,
    period: 'pomeriggio',
    blockLabelIt: 'BLOCCO 4 • POMERIGGIO (16:10 – 17:45)',
    blockLabelEn: 'BLOCK 4 • AFTERNOON (16:10 – 17:45)',
    blockTimeRange: '16:10 - 17:45',
    truccoPrepWindow: '15:25 - 16:10',
    preAlertTcccWindow: '15:55 - 16:10',
    tcccWindow: '16:10 - 16:40',
    preAlertSrWindow: '16:25 - 16:40',
    handoverTime: '16:40 - 16:45',
    srWindow: '16:45 - 17:15',
    debriefResetWindow: '17:15 - 17:45',
    tcccGroup: 'D',
    srGroup: 'B',
    ws1Group: 'A',
    ws2Group: 'C',
    patientIds: [22, 23, 24],
  },
];

export const OPERATIONAL_BLOCKS_BY_DAY: Record<CourseDay, OperationalBlockMeta[]> = {
  1: DAY_1_OPERATIONAL_BLOCKS,
  2: DAY_2_OPERATIONAL_BLOCKS,
  3: DAY_2_OPERATIONAL_BLOCKS,
};

export function getBlockForPatientId(patientId: number): OperationalBlockMeta {
  const day: CourseDay = patientId <= 12 ? 1 : 2;
  const blocks = OPERATIONAL_BLOCKS_BY_DAY[day] || OPERATIONAL_BLOCKS_BY_DAY[1];
  return (
    blocks.find((b) => b.patientIds.includes(patientId)) || blocks[0]
  );
}

export function getStationIndexForPatientId(patientId: number): 1 | 2 | 3 {
  const mod = ((patientId - 1) % 3) + 1;
  return mod as 1 | 2 | 3;
}

export const PROTESI_CATALOG: ProtesiItem[] = [
  {
    id: 'prot-crico-exp',
    code: 'PRO-01 • CRIC-EXP',
    name: 'Protesi Cervicale Cricotirotomia "Sanguina ed Espande"',
    district: 'VIE_AEREE',
    description:
      'Collare protesico laringo-tracheale multistrato con camera vascolare pressurizzata che simula un ematoma cervicale in espansione progressiva e sanguinamento attivo all\'incisione.',
    activeFeatures: [
      'Camera di espansione ematoma cervicale',
      'Membrana cricotiroidea sostituibile post-incisione',
      'Linea di sanguinamento venoso/arterioso a comando',
      ' Struttura cartilaginea palpabile per repere anatomico',
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 7 },
      { patientId: 4, scenarioCode: 'Scenario 6 - Replica', day: 2, period: 'mattina', teamExtra: 10, teamIntra: 4 },
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 12 },
      { patientId: 12, scenarioCode: 'Scenario 3 - Replica', day: 2, period: 'pomeriggio', teamExtra: 9, teamIntra: 3 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 6, teamIntra: 12 },
      { patientId: 18, scenarioCode: 'Scenario 15 - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 3 },
      { patientId: 19, scenarioCode: 'Scenario 7 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 1, teamIntra: 7 },
      { patientId: 22, scenarioCode: 'Scenario 7 - Replica', day: 3, period: 'pomeriggio', teamExtra: 10, teamIntra: 4 },
    ],
    requiredProcedures: [
      'Cricotirotomia chirurgica d\'urgenza (Tecnica Scalpel-Bougie-Tube)',
      'Aspirazione massiva delle vie aeree',
      'Conferma capnografica e fissaggio cannula',
    ],
    techRequirements:
      'Verificare tenuta raccordo idraulico prima dell\'inizio blocco; sostituire strato cute siliconica e membrana cricotiroidea ad ogni reset (15 min).',
    leadTechnician: 'Silvia Rossi (TECH-01)',
    consumables: ['Pelle cervicale in silicone (x8)', 'Membrane cricotiroidee (x10)', 'Cannule tracheo 6.0 cuffiate (x8)', 'Sangue artificiale 500ml'],
  },
  {
    id: 'prot-collo-carotide',
    code: 'PRO-02 • NECK-HEM',
    name: 'Protesi Emorragia Giunzionale Collo (Lesione Giugulo-Carotidea)',
    district: 'COLLO_VASCOLARE',
    description:
      'Guscio cervicale laterale indossabile da attore o manichino con condotto arterioso ad alta pressione (zampillo pulsatile) e cavità profonda per training di Wound Packing giunzionale.',
    activeFeatures: [
      'Pompa peristaltica remota per getto arterioso sincronizzato con FC',
      'Cavità profonda 6 cm per zaffaggio con garza emostatica',
      'Sensore di compressione per stop flusso al raggiungimento della pressione target',
      'Protezione rigida interna per trachea dell\'attore vivo',
    ],
    scenariosUsed: [
      { patientId: 8, scenarioCode: 'Scenario 00 (Collo Sanguinante)', day: 2, period: 'pomeriggio', teamExtra: 5, teamIntra: 11 },
      { patientId: 11, scenarioCode: 'Scenario 00 - Replica', day: 2, period: 'pomeriggio', teamExtra: 8, teamIntra: 2 },
      { patientId: 24, scenarioCode: 'Scenario 8 - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 6 },
    ],
    requiredProcedures: [
      'Compressione digitale diretta immediata in arteria carotide/succlavia',
      'Wound Packing giunzionale con garza emostatica (Combat Gauze)',
      'Medicazione compressiva non circonferenziale del collo',
    ],
    techRequirements:
      'Attenzione a non far occludere la via aerea dell\'attore durante la pressione; pre-caricare serbatoio da 1.5L di sangue ad alta viscosità.',
    leadTechnician: 'Roberto Bianchi (TECH-02)',
    consumables: ['Garze emostatiche Z-fold da training (x12)', 'Sangue teatrale denso 3L', 'Pellicola adesiva medicale per bordi protesi'],
  },
  {
    id: 'prot-torace-morbido-thoraco',
    code: 'PRO-03 • THOR-RESUS',
    name: 'Torace Morbido Chirurgico Ibrido (Con Organi Biologici per Resus Thoracotomy)',
    district: 'TORACE_CUORE',
    description:
      'Cassa toracica anatomica rivestita da parete muscolo-cutanea incindibile con alloggiamento interno per blocco cuore-polmoni biologico (suino) perfuso, progettata per toracotomia d\'emergenza (Clamshell / Antero-laterale sx).',
    activeFeatures: [
      'Spazi intercostali incindibili con bisturi e divaricatore Finochietto',
      'Sacco pericardico suturato con tamponamento cardiaco reale (coaguli + sangue)',
      'Aorta toracica discendente isolabile per Cross-Clamping aortico',
      'Emitorace con raccolta emotoracica aspirabile (> 1200 ml)',
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 7 },
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 8 },
      { patientId: 5, scenarioCode: 'Scenario 1 - Replica', day: 2, period: 'mattina', teamExtra: 11, teamIntra: 5 },
      { patientId: 8, scenarioCode: 'Scenario 00 (Collo Sanguinante)', day: 2, period: 'pomeriggio', teamExtra: 5, teamIntra: 11 },
      { patientId: 11, scenarioCode: 'Scenario 00 - Replica', day: 2, period: 'pomeriggio', teamExtra: 8, teamIntra: 2 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 4, teamIntra: 10 },
      { patientId: 16, scenarioCode: 'Scenario 18 - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 1 },
    ],
    requiredProcedures: [
      'Finger Thoracostomy (Toracostomia digitale decompressiva)',
      'Posizionamento tubo di drenaggio toracico 28-32 Fr',
      'Resuscitative Thoracotomy (Pericardiotomia, evacuazione coaguli, sutura miocardica, massaggio cardiaco interno, clampaggio aortico)',
    ],
    techRequirements:
      'Conservazione blocchi biologici a +4°C fino a 20 min prima dello scenario; smaltimento biohazard immediato post-sessione e lavaggio camera toracica.',
    leadTechnician: 'Marco Cattaneo (TECH-03)',
    consumables: ['Blocchi biologici cuore-polmone (x8)', 'Pareti toraciche incindibili di ricambio (x8)', 'Tubi toracici 32Fr (x10)', 'Foley 20Fr per cardiorrafia temporanea'],
  },
  {
    id: 'prot-torace-pnx-balistico',
    code: 'PRO-04 • CHEST-GSW',
    name: 'Pettorina Balistica Toracica (Pneumotorace Aperto Sibilante & Uscita Posteriore)',
    district: 'TORACE_CUORE',
    description:
      'Corazza toracica in silicone medicale indossabile dall\'attore con foro d\'entrata anteriore (sucking chest wound con bolle d\'aria ed emottisi) e foro d\'uscita posteriore sanguinante.',
    activeFeatures: [
      'Valvola acustica integrata che simula il risucchio d\'aria (sucking chest wound)',
      'Schiuma ematica rosata al foro anteriore sincronizzata con gli atti respiratori',
      'Pad sottocutaneo in 2° e 5° spazio intercostale per decompressione con ago 14G/10G',
      'Linea di sanguinamento posteriore nascosta nella barella per effetto sorpresa al Log-Roll',
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 7 },
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 8 },
      { patientId: 3, scenarioCode: 'Scenario 11 (TCCC)', day: 2, period: 'mattina', teamExtra: 3, teamIntra: 9 },
      { patientId: 6, scenarioCode: 'Scenario 11 - Replica', day: 2, period: 'mattina', teamExtra: 12, teamIntra: 6 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 4, teamIntra: 10 },
      { patientId: 16, scenarioCode: 'Scenario 18 - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 1 },
    ],
    requiredProcedures: [
      'Applicazione immediata di Chest Seal valvolato (anteriore e posteriore post Log-Roll)',
      'Decompressione toracica con ago (Needle Decompression - 2° ICS MCL o 5° ICS AAL)',
      'Burping della medicazione toracica in caso di peggioramento dispnoico',
    ],
    techRequirements:
      'Asciugare accuratamente la cute siliconica con alcool isopropilico tra gli scenari per garantire l\'adesione del Chest Seal.',
    leadTechnician: 'Elena Fontana (TECH-04)',
    consumables: ['Chest Seal valvolati da training (x16)', 'Aghi da decompressione 14G 8cm (x20)', 'Soluzione saponosa ematica per bolle (500ml)'],
  },
  {
    id: 'prot-addome-eviscerazione',
    code: 'PRO-05 • ABD-EVISC',
    name: 'Modulo Addominale Chirurgico con Eviscerazione & Packing Peritoneale (PPP)',
    district: 'ADDOME_PELVI',
    description:
      'Cavità addomino-pelvica completa di anse intestinali estruse in gel balistico, mesentere sanguinante, loggia epatica/splenica e spazio retroperitoneale pre-peritoneale per Damage Control Laparotomy e PPP.',
    activeFeatures: [
      'Anse intestinali realistiche calde ed umide con peristalsi passiva',
      'Doppio circuito emorragico: asse celiaco/porta (Zona 1) e plesso venoso presacrale (Pelvi)',
      'Parete fasciale suturabile o predisposta per Bogota Bag / medicazione a pressione negativa',
      'Serbatoio emoperitoneo da 2000 ml per riscontro positivo immediato Eco-FAST',
    ],
    scenariosUsed: [
      { patientId: 7, scenarioCode: 'Scenario 16 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 4, teamIntra: 10 },
      { patientId: 10, scenarioCode: 'Scenario 16 - Replica', day: 2, period: 'pomeriggio', teamExtra: 7, teamIntra: 1 },
      { patientId: 14, scenarioCode: 'Scenario 5 (TCCC)', day: 3, period: 'mattina', teamExtra: 5, teamIntra: 11 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 6, teamIntra: 12 },
      { patientId: 17, scenarioCode: 'Scenario 5 - Replica', day: 3, period: 'mattina', teamExtra: 8, teamIntra: 2 },
      { patientId: 18, scenarioCode: 'Scenario 15 - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 3 },
      { patientId: 20, scenarioCode: 'Scenario 13 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 2, teamIntra: 8 },
      { patientId: 23, scenarioCode: 'Scenario 13 - Replica', day: 3, period: 'pomeriggio', teamExtra: 11, teamIntra: 5 },
    ],
    requiredProcedures: [
      'Copertura sterile umida atraumatic delle anse eviscerate (TCCC)',
      'Esecuzione E-FAST con identificazione liquido libero in Morison, Douglas e splenorenale',
      'Pre-Peritoneal Pelvic Packing (PPP) con 3+3 laparotomic pads',
      'Damage Control Laparotomy (Packing peri-epatico nei 4 quadranti)',
    ],
    techRequirements:
      'Riscaldare il liquido peritoneale a 37°C per evitare appannamento sonde ecografiche e mantenere fedeltà termica.',
    leadTechnician: 'Davide Galli (TECH-05)',
    consumables: ['Garze laparotomiche radiopache 45x45 (x40)', 'Telini sterili umidi per eviscerazione (x10)', 'Gel ecografico 1L'],
  },
  {
    id: 'prot-reboa-endovasc',
    code: 'PRO-06 • VASC-REBOA',
    name: 'Simulatore Endovascolare Aorto-Iliaco per REBOA (Zone 1 & Zone 3)',
    district: 'ADDOME_PELVI',
    description:
      'Sistema vascolare pressurizzato ad alta fedeltà ecografica dall\'arteria femorale comune fino all\'aorta toracica ascendente, dotato di trasduttore di pressione invasiva a monte e a valle del pallone.',
    activeFeatures: [
      'Inserto inguinale ecoguidabile con arteria femorale pulsante e vena femorale comprimibile',
      'Conduzione realistica del catetere REBOA 7 Fr (ER-REBOA) con landmark centimetrati (46 cm Z1 / 28 cm Z3)',
      'Feedback immediato su monitor parametri: incremento PA sistolica +45 mmHg al gonfiaggio del pallone',
      'Simulazione complicanze (rottura aortica da sovra-gonfiaggio o migrazione in Zona 2)',
    ],
    scenariosUsed: [
      { patientId: 3, scenarioCode: 'Scenario 11 (TCCC)', day: 2, period: 'mattina', teamExtra: 3, teamIntra: 9 },
      { patientId: 6, scenarioCode: 'Scenario 11 - Replica', day: 2, period: 'mattina', teamExtra: 12, teamIntra: 6 },
      { patientId: 14, scenarioCode: 'Scenario 5 (TCCC)', day: 3, period: 'mattina', teamExtra: 5, teamIntra: 11 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 6, teamIntra: 12 },
      { patientId: 17, scenarioCode: 'Scenario 5 - Replica', day: 3, period: 'mattina', teamExtra: 8, teamIntra: 2 },
      { patientId: 18, scenarioCode: 'Scenario 15 - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 3 },
      { patientId: 21, scenarioCode: 'Scenario 8 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 3, teamIntra: 9 },
      { patientId: 24, scenarioCode: 'Scenario 8 - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 6 },
    ],
    requiredProcedures: [
      'Pungitura ecoguidata (Out-of-Plane / In-Plane) dell\'arteria femorale comune',
      'Inserimento introduttore arterioso 7 Fr secondo tecnica di Seldinger',
      'Misurazione landmark anatomici esterni (Giugulo / Xifoide / Ombelico)',
      'Gonfiaggio titolato con soluzione fisiologica e monitoraggio tempo di ischemia (< 30 min Z1)',
    ],
    techRequirements:
      'Spurgare completamente l\'aria dal circuito aorto-femorale prima di ogni blocco per garantire visibilità ecografica nitida senza artefatti.',
    leadTechnician: 'Chiara Moretti (TECH-06)',
    consumables: ['Pad inguinali vascolari auto-sigillanti (x6)', 'Introduttori 7 Fr (x8)', 'Cateteri REBOA da training (x4)', 'Fisiologica 0.9% 250ml'],
  },
  {
    id: 'prot-impalamento-addome',
    code: 'PRO-07 • IMP-ABDPELV',
    name: 'Struttura Protesica Impalamento Addomino-Pelvico con Corpo Estraneo In Situ',
    district: 'ADDOME_PELVI',
    description:
      'Piastra toraco-addominale rinforzata con ancoraggio meccanico per tondino metallico/scheggia legnosa penetrante in ipocondrio/ipogastrio, progettata per addestrare la stabilizzazione pre-ospedaliera e il transfer barellato sicuro.',
    activeFeatures: [
      'Snodo meccanico con sensore di oscillazione: attiva emorragia massiva se il corpo estraneo viene mobilizzato incautamente',
      'Compatibile con taglio/accorciamento tecnico o rimozione chirurgica controllata in Shock Room',
      'Supporto lombare ergonomico per attore vivo durante l\'estrazione in ambiente tattico',
    ],
    scenariosUsed: [
      { patientId: 21, scenarioCode: 'Scenario 8 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 3, teamIntra: 9 },
      { patientId: 24, scenarioCode: 'Scenario 8 - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 6 },
    ],
    requiredProcedures: [
      'Divieto assoluto di rimozione sul campo (TCCC)',
      'Confezionamento di bulky dressing stabilizzante a ciambella/piramide',
      'Trasferimento barellato (Log-Roll modificato / Scoop Stretcher) senza dislocazione',
      'Rimozione sotto visione diretta chirurgica previa occlusione aortica REBOA in Shock Room',
    ],
    techRequirements:
      'Verificare il serraggio della piastra protettiva in kevlar tra l\'asta impalata e l\'addome dell\'attore prima dello scenario.',
    leadTechnician: 'Silvia Rossi (TECH-01)',
    consumables: ['Rotoli garza Kerlix (x10)', 'Cerotto telato ad alta tenuta 5cm (x6)', 'Sangue denso per fuoriuscita peri-oggetto'],
  },
  {
    id: 'prot-amputazione-arti',
    code: 'PRO-08 • AMP-BLAST',
    name: 'Moncone Traumatico da Deflagrazione (Arto Superiore / Inferiore) con Arteria Pulsante',
    district: 'ARTI_AMPUTAZIONI',
    description:
      'Protesi terminale per amputazione sub-totale da mina/IED con esposizione di monconi ossei tibiali/omerali frastagliati, lembi muscolari devitalizzati e doppia linea arteriosa ad alta portata.',
    activeFeatures: [
      'Getto arterioso pulsante a 120 mmHg che si arresta solo con serraggio corretto del Tourniquet CAT (≥ 3 giri di windlass)',
      'Simulazione di sanguinamento residuo midollare/venoso che richiede secondo Tourniquet affiancato (Side-by-Side)',
      'Indossabile da attore con arto reale occultato in tasca mimetica/bassa barella',
    ],
    scenariosUsed: [
      { patientId: 3, scenarioCode: 'Scenario 11 (TCCC)', day: 2, period: 'mattina', teamExtra: 3, teamIntra: 9 },
      { patientId: 6, scenarioCode: 'Scenario 11 - Replica', day: 2, period: 'mattina', teamExtra: 12, teamIntra: 6 },
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 12 },
      { patientId: 12, scenarioCode: 'Scenario 3 - Replica', day: 2, period: 'pomeriggio', teamExtra: 9, teamIntra: 3 },
      { patientId: 21, scenarioCode: 'Scenario 8 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 3, teamIntra: 9 },
      { patientId: 24, scenarioCode: 'Scenario 8 - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 6 },
    ],
    requiredProcedures: [
      'Applicazione immediata Tourniquet (CAT Gen7 / SOFTT-W) "High & Tight" in Care Under Fire',
      'Rivalutazione in Tactical Field Care e posizionamento del 2° Tourniquet prossimale se persiste sanguinamento',
      'Segnatura orario di applicazione (T) sulla fronte del paziente',
      'Conversione del Tourniquet o controllo chirurgico definitivo in Shock Room',
    ],
    techRequirements:
      'Rifornire la sacca a pressione da 3L a 150 mmHg; proteggere i connettori rapidi Luer-Lock dallo strappo durante il trascinamento TCCC.',
    leadTechnician: 'Roberto Bianchi (TECH-02)',
    consumables: ['Tourniquet CAT da addestramento blu/neri (x16)', 'Bende israeliane 6" (x12)', 'Sangue artificiale lavabile 5L'],
  },
  {
    id: 'prot-frattura-esposta-arto',
    code: 'PRO-09 • FRAC-OPEN',
    name: 'Manicotto Frattura Esposta Avambraccio / Tibia-Perone & Ferita Balistica Coscia',
    district: 'ARTI_AMPUTAZIONI',
    description:
      'Manicotto in silicone rinforzato con segmenti ossei di radio/ulna o tibia sporgenti dalla cute lacerata, associato a tasca muscolare di coscia per ferita d\'arma da fuoco femorale.',
    activeFeatures: [
      'Crepitio osseo reale alla palpazione e deformità angolare riducibile sotto trazione',
      'Sanguinamento arterioso a getto dall\'arteria brachiale o femorale superficiale',
      'Possibilità di eseguire riduzione, splinting (SAM Splint) e controllo dei polsi distali',
    ],
    scenariosUsed: [
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 8 },
      { patientId: 6, scenarioCode: 'Scenario 11 - Replica', day: 2, period: 'mattina', teamExtra: 12, teamIntra: 6 },
      { patientId: 7, scenarioCode: 'Scenario 16 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 4, teamIntra: 10 },
      { patientId: 10, scenarioCode: 'Scenario 16 - Replica', day: 2, period: 'pomeriggio', teamExtra: 7, teamIntra: 1 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 4, teamIntra: 10 },
      { patientId: 14, scenarioCode: 'Scenario 5 (TCCC)', day: 3, period: 'mattina', teamExtra: 5, teamIntra: 11 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 6, teamIntra: 12 },
      { patientId: 16, scenarioCode: 'Scenario 18 - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 1 },
      { patientId: 17, scenarioCode: 'Scenario 5 - Replica', day: 3, period: 'mattina', teamExtra: 8, teamIntra: 2 },
      { patientId: 18, scenarioCode: 'Scenario 15 - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 3 },
    ],
    requiredProcedures: [
      'Emostasi immediata con Tourniquet o Wound Packing profondo + bendaggio compressivo',
      'Irrigazione, copertura sterile dei monconi ossei esposti e immobilizzazione con SAM Splint',
      'Profilassi antibiotica precoce (Moxifloxacina / Ertapenem) e acido tranexamico (TXA 2g EV)',
    ],
    techRequirements:
      'Verificare che i bordi in lattice del manicotto siano sfumati con pasta modellante ed ematoma viola/rosso.',
    leadTechnician: 'Elena Fontana (TECH-04)',
    consumables: ['Stecche modellabili SAM Splint (x8)', 'Bende coesive Coban (x12)', 'Garze sterili 10x10 (x30)'],
  },
  {
    id: 'prot-maxillo-facciale',
    code: 'PRO-10 • MAX-GSW',
    name: 'Maschera Protesica Trauma Maxillo-Facciale Balistico (Le Fort III / Mandibolare)',
    district: 'MAXILLO_FACCIALE',
    description:
      'Protesi facciale inferiore e zigomatica con avulsione dentaria, instabilità mandibolare, sanguinamento massivo oro-nasale ed ostruzione meccanica della glottide che impedisce la laringoscopia tradizionale.',
    activeFeatures: [
      'Erogazione continua di sangue coagulato e saliva densa nel cavo orale',
      'Anatomia sovraglottica distorta (impossibilità di posizionare i-Gel o tubo endotracheale per via orale)',
      'Induce automaticamente i team alla decisione rapida di via aerea chirurgica (Cricotirotomia)',
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 7 },
      { patientId: 4, scenarioCode: 'Scenario 6 - Replica', day: 2, period: 'mattina', teamExtra: 10, teamIntra: 4 },
      { patientId: 5, scenarioCode: 'Scenario 1 - Replica', day: 2, period: 'mattina', teamExtra: 11, teamIntra: 5 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 6, teamIntra: 12 },
      { patientId: 18, scenarioCode: 'Scenario 15 - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 3 },
    ],
    requiredProcedures: [
      'Posizionamento posturale di drenaggio (Sit-Up & Lean-Forward se paziente cosciente in TCCC)',
      'Aspirazione con cannula rigida Yankauer ad alto flusso',
      'Transizione immediata al piano D dell\'algoritmo vie aeree difficili (FONA / Cricotirotomia)',
    ],
    techRequirements:
      'Abbinare sempre la maschera maxillo-facciale al collare per cricotirotomia PRO-01; testare l\'aspiratore chirurgico da campo.',
    leadTechnician: 'Silvia Rossi (TECH-01)',
    consumables: ['Coaguli artificiali in gelatina (barattolo 500g)', 'Sondini Yankauer (x10)', 'Colla mastice pros-aide ipoallergenica'],
  },
  {
    id: 'prot-ustioni-torace-escarotomia',
    code: 'PRO-11 • BURN-ESCHAR',
    name: 'Corazza Toraco-Cervicale Ustione Circonferenziale III Grado (Per Escarotomia)',
    district: 'USTIONI_BLAST',
    description:
      'Rivestimento cutaneo coriaceo carbonizzato a tutto spessore su collo, torace anteriore ed avambraccio che limita meccanicamente l\'espansione della gabbia toracica fino all\'incisione longitudinale delle escare.',
    activeFeatures: [
      'Effetto "corazza" che riduce i volumi correnti sul ventilatore e innalza le pressioni di picco (> 40 cmH2O)',
      'Strato superficiale carbonizzato con fuliggine periorale e vibrisse bruciate (segno di inalazione)',
      'Linee di escarotomia toracica (medio-ascellari bilaterali e sottocostale) incindibili con rilascio elastico immediato',
    ],
    scenariosUsed: [
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 12 },
      { patientId: 12, scenarioCode: 'Scenario 3 - Replica', day: 2, period: 'pomeriggio', teamExtra: 9, teamIntra: 3 },
      { patientId: 19, scenarioCode: 'Scenario 7 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 1, teamIntra: 7 },
      { patientId: 20, scenarioCode: 'Scenario 13 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 2, teamIntra: 8 },
      { patientId: 22, scenarioCode: 'Scenario 7 - Replica', day: 3, period: 'pomeriggio', teamExtra: 10, teamIntra: 4 },
      { patientId: 23, scenarioCode: 'Scenario 13 - Replica', day: 3, period: 'pomeriggio', teamExtra: 11, teamIntra: 5 },
    ],
    requiredProcedures: [
      'Intubazione precoce o Cricotirotomia prima della chiusura completa della glottide da edema termico',
      'Escarotomia toracica d\'urgenza in Shock Room per insufficienza ventilatoria restrittiva',
      'Rianimazione volemica secondo formula di Parkland modificata / TCCC Burn Resuscitation (Rule of Ten)',
    ],
    techRequirements:
      'Attivare generatore di fumo scenico atossico nell\'ambiente tattico e applicare polvere di carbone vegetale sul volto dell\'attore.',
    leadTechnician: 'Marco Cattaneo (TECH-03)',
    consumables: ['Fogli lattice ustione III grado pre-tesi (x8)', 'Polvere carbone scenico e glicerina per flittene', 'Medicazioni idrogel Water-Jel'],
  },
  {
    id: 'prot-cranio-tbi-liquorrea',
    code: 'PRO-12 • HEAD-TBI',
    name: 'Calotta Cranica Ferita Lacero-Contusa (FLC) con Frattura Base Cranica & Oto-Liquorrea',
    district: 'MAXILLO_FACCIALE',
    description:
      'Protesi epicranica parieto-temporale con ferita lacero-contusa sanguinante, infossamento osseo palpabile, ecchimosi periorbitaria ("occhi da procione"), segno di Battle retroauricolare e fuoriuscita di liquor misto a sangue dal condotto uditivo.',
    activeFeatures: [
      'Gocciolamento lento dall\'orecchio con "segno dell\'alone" positivo su garza',
      'Lenti a contatto sclero-corneali o pupille LED asimmetriche per simulare Anisocoria da erniazione uncale',
      'Sanguinamento venoso dallo scalpo ad alta vascolarizzazione',
    ],
    scenariosUsed: [
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 12 },
      { patientId: 12, scenarioCode: 'Scenario 3 - Replica', day: 2, period: 'pomeriggio', teamExtra: 9, teamIntra: 3 },
      { patientId: 20, scenarioCode: 'Scenario 13 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 2, teamIntra: 8 },
      { patientId: 23, scenarioCode: 'Scenario 13 - Replica', day: 3, period: 'pomeriggio', teamExtra: 11, teamIntra: 5 },
    ],
    requiredProcedures: [
      'Divieto di sondaggio naso-gastrico o cannula rinofaringea (NPA) in presenza di frattura base cranica',
      'Prevenzione dell\'insulto cerebrale secondario (Target SpO2 > 94%, PAS > 110 mmHg)',
      'Terapia iperosmolare d\'attacco in Shock Room (Salina Ipertonica 3% o Mannitolo) e neuroprotezione',
    ],
    techRequirements:
      'Istruire l\'attore sulla postura decerebrata/decorticata (GCS 6: E1 V2 M3) e sul respiro di Cheyne-Stokes.',
    leadTechnician: 'Davide Galli (TECH-05)',
    consumables: ['Lenti pupillari midriasi fissa (x4)', 'Fluido chiaro sieroso per oto-liquorrea', 'Palette colori ematomi (blu/viola/giallo)'],
  },
];
