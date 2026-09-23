import { GroupType, GroupActivitySlot, TimelineSlot, CourseDay, SimulatorPatient, Technician } from '../types';
import { Language } from '../i18n/translations';
import { translateMedicalText } from './courseTranslation';

export interface GroupPhaseEnrichedDetails {
  phaseTypeLabel: string;
  operationalDescription: string;
  didacticObjectives: string[];
  protocolTimingNote?: string;
  simulatorData: {
    hasSimulators: boolean;
    patientId?: number;
    scenarioCode?: string;
    simulatorHardware?: string;
    moulageProtesi?: string;
    attoriCount: number;
    attoreDettagli?: string;
    readinessStatus?: string;
  };
  technicianData: {
    hasTech: boolean;
    techBadge?: string;
    techName?: string;
    techSpecialty?: string;
    techPhone?: string;
    techNotes?: string;
  };
}

/**
 * Calcola i dettagli operativi della fase in corso per un gruppo
 */
export function getGroupPhaseDetails(
  group: GroupType,
  activity: GroupActivitySlot | undefined,
  currentSlot: TimelineSlot | undefined,
  activeDay: CourseDay,
  simulatorPatients: SimulatorPatient[],
  technicians: Technician[],
  lang: Language = 'it'
): GroupPhaseEnrichedDetails {
  const isEn = lang === 'en';

  if (!activity || !currentSlot) {
    return {
      phaseTypeLabel: isEn ? 'Undefined Phase' : 'Fase non definita',
      operationalDescription: isEn ? 'Awaiting start of training session.' : 'Attesa avvio della sessione addestrativa.',
      didacticObjectives: [isEn ? 'Initial Briefing' : 'Briefing iniziale'],
      simulatorData: { hasSimulators: false, attoriCount: 0 },
      technicianData: { hasTech: false },
    };
  }

  const slotTitle = (currentSlot.title || '').toLowerCase();
  const text = `${activity.title} ${activity.subtitle} ${activity.location}`.toLowerCase();
  const actType = activity.activityType;

  // 1. Determina descrizione operativa e obiettivi
  let phaseTypeLabel = isEn ? 'CLINICAL ACTIVITY' : 'ATTIVITÀ CLINICA';
  let operationalDescription = '';
  let didacticObjectives: string[] = [];
  let protocolTimingNote: string | undefined = undefined;

  if (text.includes('preallerta') || text.includes('pre-allerta') || text.includes('standby') || text.includes('t -15') || text.includes('vestizione')) {
    phaseTypeLabel = isEn ? 'ACTIVE STANDBY & PRE-ALERT' : 'STANDBY ATTIVO & PRE-ALLERTA';
    operationalDescription = isEn
      ? `Group ${group} is on active operational standby. Check lifesaving gear, don tactical or biocontainment PPE, verify infusion lines, and report to station at T -15 min prior to handover.`
      : `Il Gruppo ${group} è in standby attivo operativo. Controllo presidi salvavita, vestizione DPI tattici o di biocontenimento Shock Room, verifica linee infusionali e posizionamento alla postazione a T -15 min prima dell'avvio o del trasferimento.`;
    didacticObjectives = isEn
      ? [
          'Verify PPE integrity and hemostatic dressings',
          'Rapid team briefing between Team Leader and Operators',
          'Communication alignment with station Faculty',
        ]
      : [
          'Verifica integrità DPI e presidi emostatici',
          'Briefing rapido di squadra tra Team Leader e Operatori',
          'Allineamento comunicativo con il Faculty di postazione',
        ];
    protocolTimingNote = isEn
      ? 'Critical time window: Mandatory station entry 15 minutes before handover.'
      : 'Finestra temporale critica: ingresso postazione tassativo 15 minuti prima dell\'handover.';
  } else if (slotTitle.includes('handover') || text.includes('handover') || text.includes('consegna sbar') || text.includes('ricezione sbar')) {
    phaseTypeLabel = isEn ? 'STRUCTURED SBAR HANDOVER (:30 MIN)' : 'HANDOVER STRUTTURATO SBAR (ORE :30)';
    operationalDescription = isEn
      ? `Key clinical transition of the stretcher patient: 1:1 Handover between TCCC squad and Shock Room team following mandatory SBAR format (Situation, Background, Assessment, Recommendation) for 5 minutes, followed by clinical transfer.`
      : `Fase cardine di passaggio del ferito barellato: Handover 1:1 tra la Squadra TCCC e l'équipe di Shock Room secondo formato tassativo SBAR (Situation, Background, Assessment, Recommendation) della durata di 5 minuti, seguito dalla presa in carico clinica.`;
    didacticObjectives = isEn
      ? [
          'Concise, prioritized and unambiguous SBAR report (max 5 min)',
          'Stretcher transfer while maintaining continuous hemostatic control',
          'Immediate assumption of leadership by Shock Room Team Leader',
        ]
      : [
          'Report SBAR conciso, prioritario e privo di ambiguità (max 5 min)',
          'Passaggio barellato con mantenimento delle manovre emostatiche',
          'Assunzione di leadership immediata da parte del Team Leader di Shock Room',
        ];
    protocolTimingNote = isEn
      ? 'Mandatory at minute :30 1:1 Handover TCCC ➔ Shock Room (duration 5 min, :30–:35).'
      : 'Tassativo ore :30 Handover 1:1 TCCC ➔ Shock Room (durata 5 min, :30–:35).';
  } else if (actType === 'scenario_extra' || text.includes('tccc') || text.includes('tattico')) {
    phaseTypeLabel = isEn ? 'TCCC LIVE TACTICAL SCENARIO' : 'SCENARIO TATTICO TCCC LIVE';
    operationalDescription = isEn
      ? `Care under fire and extraction in austere tactical environment. Absolute priority to MARCH PAWS protocol: massive arterial hemorrhage control (Stop the Bleed with proximal TQ and junctional packing), airway management, and stretcher evacuation.`
      : `Gestione ferito under fire ed estrazione in ambiente tattico austero. Priorità assoluta al protocollo MARCH PAWS: arresto emorragie massive a getto (Stop the Bleed con TQ a monte e wound packing giunzionale), gestione vie aeree compromesse ed evacuazione barellata.`;
    didacticObjectives = isEn
      ? [
          'High-efficacy arterial Tourniquet placement within 60 seconds',
          'Wound packing with hemostatic gauze and continuous manual pressure',
          'Tension pneumothorax assessment and needle decompression',
          'Tactical stretcher preparation and safe movement under cover',
        ]
      : [
          'Applicazione Tourniquet arterioso ad alta efficacia entro 60 secondi',
          'Wound packing con garza emostatica e compressione manuale continua',
          'Valutazione pneumotorace iperteso ed eventuale decompressione',
          'Preparazione barella tattica e movimentazione in sicurezza',
        ];
    protocolTimingNote = isEn
      ? '15-minute slot: rapid stabilization and movement before minute :30.'
      : 'Slot da 15 minuti: stabilizzazione rapida e movimentazione entro il minuto :30.';
  } else if (actType === 'scenario_intra' || text.includes('shock room') || text.includes('abcde')) {
    phaseTypeLabel = isEn ? 'SHOCK ROOM ABCDE LIVE SCENARIO' : 'SCENARIO SHOCK ROOM ABCDE LIVE';
    operationalDescription = isEn
      ? `Critical patient reception in high-fidelity Shock Room Bay. Systematic ABCDE approach, point-of-care FAST/e-FAST ultrasound, emergency chest decompression or tube thoracostomy, massive transfusion protocol (MTP), and advanced hemodynamic stabilization.`
      : `Accoglienza ferito critico in Box Shock Room ad alta fedeltà. Approccio sistematico ABCDE, ecografia point-of-care FAST/e-FAST, decompressione toracica d'emergenza o toracostomia, protocollo di trasfusione massiva (MTP) e supporto emodinamico avanzato.`;
    didacticObjectives = isEn
      ? [
          'Rapid primary ABCDE survey with closed-loop role delegation',
          'e-FAST ultrasound scan for hemothorax and hemoperitoneum',
          'Emergency ultrasound-guided or intraosseous vascular access',
          'Rapid decision-making for Damage Control Surgery / Thoracotomy',
        ]
      : [
          'Valutazione primaria ABCDE rapida con assegnazione ruoli a circuito chiuso',
          'Scansione ecografica e-FAST per emotorace ed emoperitoneo',
          'Accesso vascolare ecoguidato o intraosseo d\'urgenza',
          'Decision-making rapido per Damage Control Surgery / Thoracotomy',
        ];
    protocolTimingNote = isEn
      ? 'Immediate start post-handover at minute :35 until minute :60 of the block.'
      : 'Avvio immediato post-Handover al minuto :35 fino al minuto :60 del blocco.';
  } else if (actType === 'workshop' || text.includes('workshop') || text.includes('ws1') || text.includes('ws2') || text.includes('ecografia') || text.includes('vie aeree') || text.includes('cricotiroidotomia')) {
    const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('cricotiroidotomia');
    phaseTypeLabel = isWS1
      ? (isEn ? 'SKILL WORKSHOP 1 (AIRWAY & PACKING)' : 'SKILL WORKSHOP 1 (VIE AEREE & PACKING)')
      : (isEn ? 'SKILL WORKSHOP 2 (FAST ULTRASOUND & ACCESS)' : 'SKILL WORKSHOP 2 (ECOGRAFIA FAST & ACCESSI)');
    operationalDescription = isWS1
      ? (isEn
          ? 'Intensive station hands-on training: surgical cricothyroidotomy (CRIC), difficult airway management on anatomical mannequin, high-pressure junctional wound packing and junctional tourniquets.'
          : `Addestramento tecnico intensivo a stazioni: esecuzione pratica di cricotiroidotomia chirurgica d'emergenza (CRIC), gestione vie aeree difficili su manichino anatomico, wound packing giunzionale ad alta pressione e tourniquet giunzionali.`)
      : (isEn
          ? 'Intensive station hands-on training: advanced clinical e-FAST ultrasound (pericardial, hepatorenal, splenorenal, pelvic, pleural windows), ultrasound-guided vascular access and thoracic decompression.'
          : `Addestramento tecnico intensivo a stazioni: esecuzione ecografia clinica avanzata e-FAST (finestre pericardica, epatorenale, splenorenale, pelvica, pleurica), reperimento accessi vascolari ecoguidati e decompressione toracica.`);
    didacticObjectives = isWS1
      ? (isEn
          ? [
              'Anatomical landmarking of cricothyroid membrane and surgical incision',
              'Deep hemostatic packing technique down to bone contact',
              'Placement and locking of junctional tourniquet (JETT/SAM)',
            ]
          : [
              'Repere anatomico della membrana cricotiroidea e incisione chirurgica',
              'Tecnica di packing emostatico profondo fino a contatto osseo',
              'Posizionamento e bloccaggio Tourniquet giunzionale (JETT/SAM)',
            ])
      : (isEn
          ? [
              'Ultrasound gain, depth and transducer probe orientation optimization',
              'Detection of anechoic fluid in Morrison and Douglas pouches',
              'Ultrasound-guided needle puncture for peripheral/central cannulation',
            ]
          : [
              'Ottimizzazione gain, profondità e orientamento sonda ecografica',
              'Riconoscimento versamento anecogeno in Morrison e Douglas',
              'Puntura eco-assistita per incannulamento vascolare periferico/centrale',
            ]);
  } else if (actType === 'debriefing' || text.includes('debriefing') || text.includes('revisione')) {
    phaseTypeLabel = isEn ? 'JOINT CLINICAL DEBRIEFING' : 'DEBRIEFING CLINICO COLLEGIALE';
    operationalDescription = isEn
      ? 'Non-judgmental retrospective squad performance analysis with Faculty: multi-angle Regia video review, clinical event timeline, Crew Resource Management (CRM) communication, and improvement areas.'
      : `Analisi retrospettiva non giudicante dell'operato di squadra con la Faculty: revisione registrazioni video multi-angolo della Regia, timeline eventi clinici, comunicazione in team (Crew Resource Management - CRM) e individuazione delle aree di miglioramento.`;
    didacticObjectives = isEn
      ? [
          'Leadership model and closed-loop communication breakdown',
          'Review of compliance with TCCC / ATLS / Damage Control protocols',
          'Joint sharing of operational strengths and clinical bottlenecks',
        ]
      : [
          'Analisi del modello di leadership e della comunicazione a circuito chiuso (closed-loop)',
          'Revisione aderenza alle linee guida TCCC / ATLS / Damage Control',
          'Condivisione collegiale dei punti di forza e criticità operative',
        ];
  } else if (text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('riposo')) {
    phaseTypeLabel = isEn ? 'TECHNICAL PAUSE & REST' : 'PAUSA TECNICA & RISTORO';
    operationalDescription = isEn
      ? 'Rest and recovery interval for learners, hydration and PPE sanitization. Turnaround and station reset by the technical team.'
      : `Intervallo per defaticamento psicofisico dei discenti, idratazione e sanificazione presidi. Turnaround e ripristino postazioni da parte del team tecnico.`;
    didacticObjectives = isEn
      ? [
          'Cognitive decompression following high-intensity scenarios',
          'Hydration and personal PPE check before next rotation',
        ]
      : [
          'Decompressione cognitiva dopo scenari ad alto impatto emotivo',
          'Idratazione e verifica DPI personali in vista della rotazione successiva',
        ];
  } else {
    phaseTypeLabel = isEn ? (activity.title ? translateMedicalText(activity.title, 'en').toUpperCase() : 'OPERATIONAL PHASE') : (activity.title || 'FASE OPERATIVA').toUpperCase();
    operationalDescription = isEn
      ? (activity.subtitle ? translateMedicalText(activity.subtitle, 'en') : 'Operational training activity per Course master schedule.')
      : (activity.subtitle || 'Attività didattico-operativa di programma secondo il cronoprogramma generale del Corso.');
    didacticObjectives = [isEn ? 'Execute station tasks per Regia directives' : 'Esecuzione compiti di postazione secondo disposizioni della Regia'];
  }

  // 2. Associazione Pazienti Simulatori & Attori
  let relevantPatient: SimulatorPatient | undefined = undefined;
  if (activity.patientIds && activity.patientIds.length > 0) {
    relevantPatient = simulatorPatients.find(p => activity.patientIds!.includes(p.id));
  }
  if (!relevantPatient) {
    relevantPatient = simulatorPatients.find(p => p.day === activeDay && (p.groupExtraAssigned === group || p.groupIntraAssigned === group));
  }

  const hasSimulators = Boolean(relevantPatient) || text.includes('simulatore') || text.includes('manichino') || text.includes('workshop') || text.includes('tccc') || text.includes('shock room');

  let simulatorHardware = relevantPatient?.simulatori;
  let moulageProtesi = relevantPatient?.moulageProtesi;
  let attoriCount = relevantPatient?.attoriCount ?? 0;
  let attoreDettagli = relevantPatient?.attoreDettagli;

  if (!relevantPatient && (actType === 'workshop' || text.includes('workshop'))) {
    if (text.includes('ws1') || text.includes('vie aeree')) {
      simulatorHardware = isEn
        ? 'Head-neck mannequins for surgical cricothyroidotomy + limbs with deep packing wounds'
        : 'Manichini testa-collo per cricotiroidotomia chirurgica + arti con ferite profonde da packing';
      moulageProtesi = isEn
        ? 'Replaceable synthetic tracheas, dense simulated blood, and reusable hemostatic gauze'
        : 'Trachee sintetiche sostituibili, sangue simulato denso e garze emostatiche riutilizzabili';
      attoriCount = 0;
      attoreDettagli = isEn ? 'Procedural training on biomodels and task trainers' : 'Addestramento procedurale su biomodelli e simulatori di task';
    } else {
      simulatorHardware = isEn
        ? 'Dedicated e-FAST phantoms with adjustable fluid compartments + echogenic vascular pads'
        : 'Fantocci e-FAST dedicati con compartimenti liquidi regolabili + pad vascolari ecogeni';
      moulageProtesi = isEn
        ? 'Acoustic ultrasound gel, anechoic fluid bags for peritoneal/pleural effusion'
        : 'Gel acustico ecografico, sacche liquido anecogeno per versamento peritoneale/pleurico';
      attoriCount = 0;
      attoreDettagli = isEn ? 'Direct ultrasound-guided practice with handheld Point-of-Care machines' : 'Pratica diretta ecoguidata con ecografi portatili Point-of-Care';
    }
  }

  if (isEn) {
    if (simulatorHardware) simulatorHardware = translateMedicalText(simulatorHardware, 'en');
    if (moulageProtesi) moulageProtesi = translateMedicalText(moulageProtesi, 'en');
    if (attoreDettagli) attoreDettagli = translateMedicalText(attoreDettagli, 'en');
  }

  // 3. Associazione Team Tecnico (TECH)
  const loc = (activity.location || '').toLowerCase();
  let assignedTech = technicians.find(t => {
    return t.assignedStations.some(s => loc.includes(s.toLowerCase()) || s.toLowerCase().includes(loc));
  });

  if (!assignedTech) {
    if (loc.includes('postazione 1') || loc.includes('box shock room 1') || loc.includes('ambiente tattico 1')) {
      assignedTech = technicians.find(t => t.badgeCode === 'TECH-01' || t.id === 'tech-1');
    } else if (loc.includes('postazione 2') || loc.includes('box shock room 2') || loc.includes('ambiente tattico 2')) {
      assignedTech = technicians.find(t => t.badgeCode === 'TECH-02' || t.id === 'tech-2');
    } else if (loc.includes('postazione 3') || loc.includes('box shock room 3') || loc.includes('ambiente tattico 3')) {
      assignedTech = technicians.find(t => t.badgeCode === 'TECH-03' || t.id === 'tech-3');
    } else if (text.includes('ws1') || loc.includes('ws1')) {
      assignedTech = technicians.find(t => t.badgeCode === 'TECH-10' || t.id === 'tech-10');
    } else if (text.includes('ws2') || loc.includes('ws2')) {
      assignedTech = technicians.find(t => t.badgeCode === 'TECH-11' || t.id === 'tech-11');
    } else {
      assignedTech = technicians[0];
    }
  }

  return {
    phaseTypeLabel,
    operationalDescription,
    didacticObjectives,
    protocolTimingNote,
    simulatorData: {
      hasSimulators,
      patientId: relevantPatient?.id,
      scenarioCode: relevantPatient?.scenarioCode,
      simulatorHardware: simulatorHardware || (isEn ? 'High-fidelity simulator with multiparameter monitor' : 'Simulatore avanzato alta fedeltà con monitor multiparametrico'),
      moulageProtesi: moulageProtesi || (isEn ? 'High-fidelity lesion prosthetics and moulage' : 'Presidi e moulage lesioni ad alta fedeltà'),
      attoriCount,
      attoreDettagli: attoreDettagli || (attoriCount > 0 ? (isEn ? `${attoriCount} actor(s) with realistic kinematic prosthetics` : `${attoriCount} attore/i con protesi cinematica realistica`) : (isEn ? 'Full-body mannequin with telemetry' : 'Manichino full-body con telemetria')),
      readinessStatus: relevantPatient?.readinessStatus || 'ready',
    },
    technicianData: {
      hasTech: Boolean(assignedTech),
      techBadge: assignedTech?.badgeCode || 'TECH-01',
      techName: assignedTech?.name || (isEn ? 'Central Technical Team' : 'Team Tecnico Centrale'),
      techSpecialty: assignedTech?.specialty ? (isEn ? translateMedicalText(assignedTech.specialty, 'en') : assignedTech.specialty) : (isEn ? 'Simulator management, audio/video & stream' : 'Gestione simulatori, audio/video e regia postazioni'),
      techPhone: assignedTech?.phone || '+39 333 1234567',
      techNotes: assignedTech?.notes ? (isEn ? translateMedicalText(assignedTech.notes, 'en') : assignedTech.notes) : undefined,
    },
  };
}
