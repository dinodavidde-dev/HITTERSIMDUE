import { GroupType, GroupActivitySlot, TimelineSlot, CourseDay, SimulatorPatient, Technician } from '../types';

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
  technicians: Technician[]
): GroupPhaseEnrichedDetails {
  if (!activity || !currentSlot) {
    return {
      phaseTypeLabel: 'Fase non definita',
      operationalDescription: 'Attesa avvio della sessione addestrativa.',
      didacticObjectives: ['Briefing iniziale'],
      simulatorData: { hasSimulators: false, attoriCount: 0 },
      technicianData: { hasTech: false },
    };
  }

  const slotTitle = (currentSlot.title || '').toLowerCase();
  const text = `${activity.title} ${activity.subtitle} ${activity.location}`.toLowerCase();
  const actType = activity.activityType;

  // 1. Determina descrizione operativa e obiettivi
  let phaseTypeLabel = 'ATTIVITÀ CLINICA';
  let operationalDescription = '';
  let didacticObjectives: string[] = [];
  let protocolTimingNote: string | undefined = undefined;

  if (text.includes('preallerta') || text.includes('pre-allerta') || text.includes('standby') || text.includes('t -15') || text.includes('vestizione')) {
    phaseTypeLabel = 'STANDBY ATTIVO & PRE-ALLERTA';
    operationalDescription = `Il Gruppo ${group} è in standby attivo operativo. Controllo presidi salvavita, vestizione DPI tattici o di biocontenimento Shock Room, verifica linee infusionali e posizionamento alla postazione a T -15 min prima dell'avvio o del trasferimento.`;
    didacticObjectives = [
      'Verifica integrità DPI e presidi emostatici',
      'Briefing rapido di squadra tra Team Leader e Operatori',
      'Allineamento comunicativo con il Faculty di postazione',
    ];
    protocolTimingNote = 'Finestra temporale critica: ingresso postazione tassativo 15 minuti prima dell\'handover.';
  } else if (slotTitle.includes('handover') || text.includes('handover') || text.includes('consegna sbar') || text.includes('ricezione sbar')) {
    phaseTypeLabel = 'HANDOVER STRUTTURATO SBAR (ORE :30)';
    operationalDescription = `Fase cardine di passaggio del ferito barellato: Handover 1:1 tra la Squadra TCCC e l'équipe di Shock Room secondo formato tassativo SBAR (Situation, Background, Assessment, Recommendation) della durata di 5 minuti, seguito dalla presa in carico clinica.`;
    didacticObjectives = [
      'Report SBAR conciso, prioritario e privo di ambiguità (max 5 min)',
      'Passaggio barellato con mantenimento delle manovre emostatiche',
      'Assunzione di leadership immediata da parte del Team Leader di Shock Room',
    ];
    protocolTimingNote = 'Tassativo ore :30 Handover 1:1 TCCC ➔ Shock Room (durata 5 min, :30–:35).';
  } else if (actType === 'scenario_extra' || text.includes('tccc') || text.includes('tattico')) {
    phaseTypeLabel = 'SCENARIO TATTICO TCCC LIVE';
    operationalDescription = `Gestione ferito under fire ed estrazione in ambiente tattico austero. Priorità assoluta al protocollo MARCH PAWS: arresto emorragie massive a getto (Stop the Bleed con TQ a monte e wound packing giunzionale), gestione vie aeree compromesse ed evacuazione barellata.`;
    didacticObjectives = [
      'Applicazione Tourniquet arterioso ad alta efficacia entro 60 secondi',
      'Wound packing con garza emostatica e compressione manuale continua',
      'Valutazione pneumotorace iperteso ed eventuale decompressione',
      'Preparazione barella tattica e movimentazione in sicurezza',
    ];
    protocolTimingNote = 'Slot da 15 minuti: stabilizzazione rapida e movimentazione entro il minuto :30.';
  } else if (actType === 'scenario_intra' || text.includes('shock room') || text.includes('abcde')) {
    phaseTypeLabel = 'SCENARIO SHOCK ROOM ABCDE LIVE';
    operationalDescription = `Accoglienza ferito critico in Box Shock Room ad alta fedeltà. Approccio sistematico ABCDE, ecografia point-of-care FAST/e-FAST, decompressione toracica d'emergenza o toracostomia, protocollo di trasfusione massiva (MTP) e supporto emodinamico avanzato.`;
    didacticObjectives = [
      'Valutazione primaria ABCDE rapida con assegnazione ruoli a circuito chiuso',
      'Scansione ecografica e-FAST per emotorace ed emoperitoneo',
      'Accesso vascolare ecoguidato o intraosseo d\'urgenza',
      'Decision-making rapido per Damage Control Surgery / Thoracotomy',
    ];
    protocolTimingNote = 'Avvio immediato post-Handover al minuto :35 fino al minuto :60 del blocco.';
  } else if (actType === 'workshop' || text.includes('workshop') || text.includes('ws1') || text.includes('ws2') || text.includes('ecografia') || text.includes('vie aeree') || text.includes('cricotiroidotomia')) {
    const isWS1 = text.includes('ws1') || text.includes('vie aeree') || text.includes('cricotiroidotomia');
    phaseTypeLabel = isWS1 ? 'SKILL WORKSHOP 1 (VIE AEREE & PACKING)' : 'SKILL WORKSHOP 2 (ECOGRAFIA FAST & ACCESSI)';
    operationalDescription = isWS1
      ? `Addestramento tecnico intensivo a stazioni: esecuzione pratica di cricotiroidotomia chirurgica d'emergenza (CRIC), gestione vie aeree difficili su manichino anatomico, wound packing giunzionale ad alta pressione e tourniquet giunzionali.`
      : `Addestramento tecnico intensivo a stazioni: esecuzione ecografia clinica avanzata e-FAST (finestre pericardica, epatorenale, splenorenale, pelvica, pleurica), reperimento accessi vascolari ecoguidati e decompressione toracica.`;
    didacticObjectives = isWS1
      ? [
          'Repere anatomico della membrana cricotiroidea e incisione chirurgica',
          'Tecnica di packing emostatico profondo fino a contatto osseo',
          'Posizionamento e bloccaggio Tourniquet giunzionale (JETT/SAM)',
        ]
      : [
          'Ottimizzazione gain, profondità e orientamento sonda ecografica',
          'Riconoscimento versamento anecogeno in Morrison e Douglas',
          'Puntura eco-assistita per incannulamento vascolare periferico/centrale',
        ];
  } else if (actType === 'debriefing' || text.includes('debriefing') || text.includes('revisione')) {
    phaseTypeLabel = 'DEBRIEFING CLINICO COLLEGIALE';
    operationalDescription = `Analisi retrospettiva non giudicante dell'operato di squadra con la Faculty: revisione registrazioni video multi-angolo della Regia, timeline eventi clinici, comunicazione in team (Crew Resource Management - CRM) e individuazione delle aree di miglioramento.`;
    didacticObjectives = [
      'Analisi del modello di leadership e della comunicazione a circuito chiuso (closed-loop)',
      'Revisione aderenza alle linee guida TCCC / ATLS / Damage Control',
      'Condivisione collegiale dei punti di forza e criticità operative',
    ];
  } else if (text.includes('pausa') || text.includes('ristoro') || text.includes('pranzo') || text.includes('riposo')) {
    phaseTypeLabel = 'PAUSA TECNICA & RISTORO';
    operationalDescription = `Intervallo per defaticamento psicofisico dei discenti, idratazione e sanificazione presidi. Turnaround e ripristino postazioni da parte del team tecnico.`;
    didacticObjectives = [
      'Decompressione cognitiva dopo scenari ad alto impatto emotivo',
      'Idratazione e verifica DPI personali in vista della rotazione successiva',
    ];
  } else {
    phaseTypeLabel = activity.title.toUpperCase();
    operationalDescription = activity.subtitle || 'Attività didattico-operativa di programma secondo il cronoprogramma generale del Corso.';
    didacticObjectives = ['Esecuzione compiti di postazione secondo disposizioni della Regia'];
  }

  // 2. Associazione Pazienti Simulatori & Attori
  // Cerca per patientIds espliciti o per associazione gruppo/squadra
  let relevantPatient: SimulatorPatient | undefined = undefined;
  if (activity.patientIds && activity.patientIds.length > 0) {
    relevantPatient = simulatorPatients.find(p => activity.patientIds!.includes(p.id));
  }
  if (!relevantPatient) {
    // Cerca paziente assegnato al gruppo
    relevantPatient = simulatorPatients.find(p => p.day === activeDay && (p.groupExtraAssigned === group || p.groupIntraAssigned === group));
  }

  const hasSimulators = Boolean(relevantPatient) || text.includes('simulatore') || text.includes('manichino') || text.includes('workshop') || text.includes('tccc') || text.includes('shock room');

  // Fallback simulator details per workshop se non c'è paziente unico
  let simulatorHardware = relevantPatient?.simulatori;
  let moulageProtesi = relevantPatient?.moulageProtesi;
  let attoriCount = relevantPatient?.attoriCount ?? 0;
  let attoreDettagli = relevantPatient?.attoreDettagli;

  if (!relevantPatient && (actType === 'workshop' || text.includes('workshop'))) {
    if (text.includes('ws1') || text.includes('vie aeree')) {
      simulatorHardware = 'Manichini testa-collo per cricotiroidotomia chirurgica + arti con ferite profonde da packing';
      moulageProtesi = 'Trachee sintetiche sostituibili, sangue simulato denso e garze emostatiche riutilizzabili';
      attoriCount = 0;
      attoreDettagli = 'Addestramento procedurale su biomodelli e simulatori di task';
    } else {
      simulatorHardware = 'Fantocci e-FAST dedicati con compartimenti liquidi regolabili + pad vascolari ecogeni';
      moulageProtesi = 'Gel acustico ecografico, sacche liquido anecogeno per versamento peritoneale/pleurico';
      attoriCount = 0;
      attoreDettagli = 'Pratica diretta ecoguidata con ecografi portatili Point-of-Care';
    }
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
      simulatorHardware: simulatorHardware || 'Simulatore avanzato alta fedeltà con monitor multiparametrico',
      moulageProtesi: moulageProtesi || 'Presidi e moulage lesioni ad alta fedeltà',
      attoriCount,
      attoreDettagli: attoreDettagli || (attoriCount > 0 ? `${attoriCount} attore/i con protesi cinematica realistica` : 'Manichino full-body con telemetria'),
      readinessStatus: relevantPatient?.readinessStatus || 'ready',
    },
    technicianData: {
      hasTech: Boolean(assignedTech),
      techBadge: assignedTech?.badgeCode || 'TECH-01',
      techName: assignedTech?.name || 'Team Tecnico Centrale',
      techSpecialty: assignedTech?.specialty || 'Gestione simulatori, audio/video e regia postazioni',
      techPhone: assignedTech?.phone || '+39 333 1234567',
      techNotes: assignedTech?.notes,
    },
  };
}
