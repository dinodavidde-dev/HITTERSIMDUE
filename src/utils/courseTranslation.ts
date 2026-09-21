import { TimelineSlot, SimulatorPatient, GroupType, GroupActivitySlot } from '../types';
import { Language } from '../i18n/translations';

// ==========================================
// LOCATION TRANSLATIONS
// ==========================================
export const LOCATION_TRANSLATIONS: Record<string, string> = {
  'Ambiente Tattico 1': 'Tactical Environment 1',
  'Ambiente Tattico 2': 'Tactical Environment 2',
  'Ambiente Tattico 3': 'Tactical Environment 3',
  'Ambiente Tattico': 'Tactical Environment',
  'Box Shock Room 1': 'Shock Room Bay 1',
  'Box Shock Room 2': 'Shock Room Bay 2',
  'Box Shock Room 3': 'Shock Room Bay 3',
  'Box Shock Room': 'Shock Room Bay',
  'Aula WS1': 'Workshop Hall 1',
  'Aula WS2': 'Workshop Hall 2',
  'Aula WS': 'Workshop Hall',
  'Aula Magna': 'Main Auditorium',
  'Aula Magna / Plenaria': 'Main Auditorium / Plenary',
  'Area Ristoro': 'Refreshment Area',
  'Mensa Campus': 'Campus Dining Hall',
  'Aula Debriefing 1': 'Debriefing Room 1',
  'Aula Debriefing 2': 'Debriefing Room 2',
  'Aula Debriefing 3': 'Debriefing Room 3',
  'Postazione 1': 'Station 1',
  'Postazione 2': 'Station 2',
  'Postazione 3': 'Station 3',
  'Postazione 4': 'Station 4',
  'Postazione 5': 'Station 5',
  'Postazione 6': 'Station 6',
  'Ambiente Tattico 1 ➔ Box SR': 'Tactical Area 1 ➔ Shock Room',
  'Ambiente Tattico 2 ➔ Box SR': 'Tactical Area 2 ➔ Shock Room',
  'Ambiente Tattico 3 ➔ Box SR': 'Tactical Area 3 ➔ Shock Room',
};

export function translateLocation(loc: string, lang: Language): string {
  if (lang !== 'en' || !loc) return loc;
  if (LOCATION_TRANSLATIONS[loc]) return LOCATION_TRANSLATIONS[loc];

  let result = loc;
  result = result.replace(/Ambiente Tattico (\d+)/g, 'Tactical Area $1');
  result = result.replace(/Box Shock Room (\d+)/g, 'Shock Room Bay $1');
  result = result.replace(/Aula WS(\d+)/g, 'Workshop Room WS$1');
  result = result.replace(/Aula Debriefing (\d+)/g, 'Debriefing Room $1');
  result = result.replace(/Postazione (\d+)/g, 'Station $1');
  result = result.replace(/Area Ristoro/g, 'Rest Area');
  result = result.replace(/Mensa Campus/g, 'Campus Dining');
  return result;
}

// ==========================================
// SLOT TITLE & DESCRIPTION TRANSLATIONS
// ==========================================
const SLOT_TEXT_TRANSLATIONS: Record<string, { title: string; description: string }> = {
  'd2-setup-1': {
    title: 'Pre-Apertura & Allestimento Tecnico',
    description: 'Verifica simulatori, linee infusionali e manichini.',
  },
  'd2-setup-2': {
    title: 'Briefing Docenti & Allineamento Staff',
    description: 'Allineamento metodologico faculty, regia e tecnici.',
  },
  'd2-apertura': {
    title: 'Accoglienza Discenti & Plenaria Iniziale',
    description: 'Ingresso allievi, assegnazione badge e introduzione al corso.',
  },
  'd2-b1-tccc': {
    title: 'BLOCK 1 • TCCC Tactical Scenario & WS',
    description: 'Direct engagement, massive bleeding control (Pts 1-3) & Skill Workshops.',
  },
  'd2-b1-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Strict 5-minute stretcher clinical handover from TCCC to Shock Room teams.',
  },
  'd2-b1-sr': {
    title: 'BLOCK 1 • Shock Room Scenario & TCCC Debriefing',
    description: 'Critical patient management ABCDE, FAST, thoracostomy & TCCC debriefing.',
  },
  'd2-b1-debrief-clinico': {
    title: 'Joint Clinical Debriefing (Shock Room & TCCC)',
    description: 'Video review, non-technical skills (CRM) and plus/delta analysis.',
  },
  'd2-b1-reset': {
    title: 'Station Reset & Technical Turnaround',
    description: '15-min turnaround: synthetic skin replacement, fake blood & fluids reload.',
  },
  'd2-pausa-m': {
    title: 'Coffee Break + Block 2 Pre-Alert',
    description: 'Rest and transition to operating stations.',
  },
  'd2-b2-tccc': {
    title: 'BLOCK 2 • TCCC Scenario & Skill Workshops',
    description: 'Blast injury management, tactical triage (Pts 4-6) & Skill Workshops.',
  },
  'd2-b2-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Stretcher SBAR handover between TCCC teams and Shock Room bays.',
  },
  'd2-b2-sr': {
    title: 'BLOCK 2 • Shock Room ABCDE & TCCC Debriefing',
    description: 'Hemorrhagic shock, massive transfusion protocol (Pts 4-6) & debriefing.',
  },
  'd2-b2-debrief-clinico': {
    title: 'Joint Clinical Debriefing & Teamwork Review',
    description: 'NTS video analysis, communication closed-loop and Block 2 closure.',
  },
  'd2-b2-reset': {
    title: 'Block 2 Technical Reset',
    description: '15-minute quick turnaround of Shock Room bays by technicians.',
  },
  'd2-pranzo': {
    title: 'PROTECTED LUNCH BREAK',
    description: 'Protected 75-minute meal & rest interval. No active alarms.',
  },
  'd2-prealert-3': {
    title: 'Pre-Alert T-15 Block 3',
    description: 'Regrouping and TCCC pre-alert for afternoon Block 3.',
  },
  'd2-b3-tccc': {
    title: 'BLOCK 3 • TCCC Scenario & Skill Workshops',
    description: 'Penetrating trauma, junctional hemorrhage (Pts 7-9) & Workshops.',
  },
  'd2-b3-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: '1:1 Stretcher clinical transfer to Shock Room teams with SBAR report.',
  },
  'd2-b3-sr': {
    title: 'BLOCK 3 • Shock Room ABCDE & TCCC Debriefing',
    description: 'High-fidelity Shock Room management (Pts 7-9) and TCCC feedback.',
  },
  'd2-b3-debrief-clinico': {
    title: 'Joint Clinical Debriefing Block 3',
    description: 'Video review, invasive skills analysis and CRM performance.',
  },
  'd2-b3-reset': {
    title: 'Block 3 Technical Reset',
    description: '15-min turnaround: simulator calibration and consumables reload.',
  },
  'd2-pausa-p': {
    title: 'Technical Pause & Block 4 Pre-Alert',
    description: 'Hydration, PPE check and operational preparation for final block.',
  },
  'd2-b4-tccc': {
    title: 'BLOCK 4 • TCCC Scenario & Skill Workshops',
    description: 'Complex tactical scenarios, catastrophic bleeds (Pts 10-12) & WS.',
  },
  'd2-b4-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Final morning/afternoon rotation stretcher clinical handover.',
  },
  'd2-b4-sr': {
    title: 'BLOCK 4 • Shock Room ABCDE & TCCC Debriefing',
    description: 'Aggressive resuscitation, thoracic decompression (Pts 10-12) & Debriefing.',
  },
  'd2-b4-debrief-clinico': {
    title: 'Plenary Debriefing & Day 2 Evaluation',
    description: 'Comprehensive day review, faculty feedback and team score analysis.',
  },
  'd2-chiusura': {
    title: 'Day 2 Wrap-up & Overnight Standby',
    description: 'End of Day 2 activities. Recharging equipment and night scenario standby.',
  },

  // Day 3 Slots
  'd3-setup-1': {
    title: 'Day 3 Morning Setup & Simulator Check',
    description: 'Biomodel and technical calibration for Day 3 specular rotations.',
  },
  'd3-b1-tccc': {
    title: 'BLOCK 1 (DAY 3) • TCCC Scenario & WS',
    description: 'Specular clinical rotations: ballistic trauma, junctional packing (Pts 13-15).',
  },
  'd3-b1-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Stretcher handover between field tactical team and Shock Room bay.',
  },
  'd3-b1-sr': {
    title: 'BLOCK 1 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'Advanced hemodynamic resuscitation (Pts 13-15) and TCCC feedback.',
  },
  'd3-b1-debrief-clinico': {
    title: 'Day 3 Block 1 Joint Debriefing',
    description: 'Video review, rapid decision making and non-technical skills.',
  },
  'd3-b1-reset': {
    title: 'Block 1 Technical Reset',
    description: 'Consumables reload and mannequin maintenance.',
  },
  'd3-pausa-m': {
    title: 'Morning Break + Block 2 Pre-Alert',
    description: 'Coffee break and team rotation transition.',
  },
  'd3-b2-tccc': {
    title: 'BLOCK 2 (DAY 3) • TCCC Scenario & WS',
    description: 'Tactical extraction under hostile conditions (Pts 16-18) & WS.',
  },
  'd3-b2-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Direct 1:1 clinical report from tactical leader to Shock Room physician.',
  },
  'd3-b2-sr': {
    title: 'BLOCK 2 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'Damage control resuscitation (Pts 16-18) and field debriefing.',
  },
  'd3-b2-debrief-clinico': {
    title: 'Day 3 Block 2 Joint Debriefing',
    description: 'CRM team evaluation and leadership transition review.',
  },
  'd3-b2-reset': {
    title: 'Block 2 Technical Reset',
    description: 'Simulator preparation for afternoon rotation.',
  },
  'd3-pranzo': {
    title: 'PROTECTED LUNCH BREAK',
    description: 'Protected 75-minute rest and nutrition interval.',
  },
  'd3-prealert-3': {
    title: 'Pre-Alert T-15 Block 3',
    description: 'Equipment verification and afternoon station entry.',
  },
  'd3-b3-tccc': {
    title: 'BLOCK 3 (DAY 3) • TCCC Scenario & WS',
    description: 'Multiple penetrating wounds and pelvic fracture (Pts 19-21) & WS.',
  },
  'd3-b3-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Rigorous SBAR handover with continuous hemorrhage control maintenance.',
  },
  'd3-b3-sr': {
    title: 'BLOCK 3 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'Massive transfusion protocol, ultrasound and invasive procedures (Pts 19-21).',
  },
  'd3-b3-debrief-clinico': {
    title: 'Day 3 Block 3 Joint Debriefing',
    description: 'Faculty review and tactical decision breakdown.',
  },
  'd3-b3-reset': {
    title: 'Block 3 Technical Reset',
    description: 'Quick turnaround for final graduation block.',
  },
  'd3-pausa-p': {
    title: 'Technical Pause & Block 4 Pre-Alert',
    description: 'Pre-alert for the final integrated practical challenge.',
  },
  'd3-b4-tccc': {
    title: 'BLOCK 4 (DAY 3) • Final Complex Scenario & WS',
    description: 'Catastrophic polytrauma, severe TBI and blast injuries (Pts 22-24).',
  },
  'd3-b4-handover': {
    title: 'FINAL STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Culminating clinical handover from tactical extraction to surgical resuscitation.',
  },
  'd3-b4-sr': {
    title: 'BLOCK 4 (DAY 3) • Final Shock Room & Debriefing',
    description: 'High-intensity Damage Control Surgery & Thoracotomy resuscitation (Pts 22-24).',
  },
  'd3-b4-debrief-clinico': {
    title: 'Final Integrated Debriefing',
    description: 'Course summary debriefing and tactical skills consolidation.',
  },
  'd3-chiusura': {
    title: 'Official Closing, Graduation & Certificates',
    description: 'Faculty assessment, certificate presentation and final course closing.',
  },
};

// Activity Titles & Subtitles translation dictionary
const ACTIVITY_PHRASES_EN: Record<string, { title: string; subtitle: string }> = {
  'Skills Workshop 1': { title: 'Skill Workshop 1', subtitle: 'Airway & Junctional Bleeding' },
  'Skills Workshop 2': { title: 'Skill Workshop 2', subtitle: 'e-FAST Ultrasound & Vascular Access' },
  'Scenario TCCC': { title: 'TCCC Live Scenario', subtitle: 'Under Fire Care & Stretcher Evacuation' },
  'Shock Room ABCDE': { title: 'Shock Room ABCDE', subtitle: 'Advanced Trauma Resuscitation' },
  'Ricezione SBAR': { title: 'SBAR Handover Reception', subtitle: 'Incoming Stretcher Transfer' },
  'Consegna SBAR': { title: 'SBAR Handover Delivery', subtitle: 'Clinical Handover to Shock Room' },
  'Debriefing TCCC': { title: 'TCCC Debriefing', subtitle: 'Tactical Phase Analysis' },
  'Debriefing TCCC (Pt 1)': { title: 'TCCC Debriefing (Part 1)', subtitle: 'Tactical Team Feedback' },
  'Debriefing TCCC (Pt 2)': { title: 'TCCC Debriefing (Part 2)', subtitle: 'Report & Lesson Learned' },
  'Debriefing SR Plus/Delta': { title: 'Shock Room Debriefing', subtitle: 'Video Review & CRM NTS ≥ 4' },
  'Pausa Caffè': { title: 'Coffee Break', subtitle: 'Rest & Station Preparation' },
  'Pausa Pranzo Protetta': { title: 'Protected Lunch Break', subtitle: 'Rest & Refreshment' },
  'Standby SR (Box 1-3)': { title: 'Shock Room Standby (Bays 1-3)', subtitle: 'Active Pre-Handover Standby (T-15)' },
  'PRE-ALLERTA TCCC': { title: 'TCCC PRE-ALERT', subtitle: 'PPE & Bleeding Control Kits Check' },
  'RESET Box SR': { title: 'Shock Room Reset', subtitle: 'Clean-up, fluids reload & skin change' },
  'Riordino WS1': { title: 'Workshop 1 Reset', subtitle: 'Material Restocking' },
  'Riordino WS2': { title: 'Workshop 2 Reset', subtitle: 'Ultrasound & Phantom Calibration' },
};

export function translateGroupActivity(act: GroupActivitySlot, lang: Language): GroupActivitySlot {
  if (lang !== 'en' || !act) return act;

  let translatedTitle = act.title;
  let translatedSubtitle = act.subtitle;

  for (const [key, val] of Object.entries(ACTIVITY_PHRASES_EN)) {
    if (act.title.toLowerCase().includes(key.toLowerCase())) {
      translatedTitle = val.title;
      if (!translatedSubtitle || translatedSubtitle.length < 5) {
        translatedSubtitle = val.subtitle;
      }
      break;
    }
  }

  // Regex patterns
  if (translatedTitle.includes('Pausa Pranzo')) translatedTitle = 'Protected Lunch Break';
  if (translatedTitle.includes('Pausa Caffè')) translatedTitle = 'Coffee Break';
  if (translatedTitle.includes('Consegna SBAR')) translatedTitle = 'SBAR Handover Delivery';
  if (translatedTitle.includes('Ricezione SBAR')) translatedTitle = 'SBAR Handover Reception';
  if (translatedTitle.includes('Scenario TCCC')) translatedTitle = 'TCCC Tactical Scenario';
  if (translatedTitle.includes('Shock Room ABCDE')) translatedTitle = 'Shock Room ABCDE';
  if (translatedTitle.includes('Debriefing')) translatedTitle = translatedTitle.replace(/Debriefing/g, 'Debriefing');

  if (translatedSubtitle.includes('Ristoro')) translatedSubtitle = 'Refreshment & Rest';
  if (translatedSubtitle.includes('Check presidi')) translatedSubtitle = 'Kit & Equipment Check';
  if (translatedSubtitle.includes('Pratica avanzata')) translatedSubtitle = 'Advanced Hands-on Practice';
  if (translatedSubtitle.includes('Valutazione tecnica')) translatedSubtitle = 'Technical Assessment';
  if (translatedSubtitle.includes('Analisi tattica')) translatedSubtitle = 'Tactical Analysis';
  if (translatedSubtitle.includes('Ripristino')) translatedSubtitle = 'Turnaround & Restock';
  if (translatedSubtitle.includes('Gestione avanzata')) translatedSubtitle = translatedSubtitle.replace(/Gestione avanzata/g, 'Advanced Management');

  return {
    ...act,
    title: translatedTitle,
    subtitle: translatedSubtitle,
    location: translateLocation(act.location, lang),
  };
}

export function translateSlot(slot: TimelineSlot, lang: Language): TimelineSlot {
  if (lang !== 'en' || !slot) return slot;

  const translation = SLOT_TEXT_TRANSLATIONS[slot.id];
  const translatedTitle = translation ? translation.title : slot.title;
  const translatedDesc = translation ? translation.description : slot.description;

  const translatedGroupActivities: Record<GroupType, GroupActivitySlot> = { ...slot.groupActivities };
  for (const g of ['A', 'B', 'C', 'D'] as GroupType[]) {
    if (translatedGroupActivities[g]) {
      translatedGroupActivities[g] = translateGroupActivity(translatedGroupActivities[g], lang);
    }
  }

  return {
    ...slot,
    title: translatedTitle,
    description: translatedDesc,
    groupActivities: translatedGroupActivities,
  };
}

// ==========================================
// SIMULATOR PATIENTS TRANSLATIONS
// ==========================================
const MEDICAL_TERM_DICTIONARY: Record<string, string> = {
  'Amputazione traumatica': 'Traumatic amputation',
  'Amputazione sub-totale': 'Sub-total amputation',
  'Ferita arma da fuoco': 'Gunshot wound (GSW)',
  'Ferita arma da fuoco torace': 'Gunshot wound to chest',
  'Ferita arma da fuoco addome': 'Gunshot wound to abdomen',
  'Ferita arma da fuoco coscia': 'Gunshot wound to thigh',
  'Frattura esposta': 'Open compound fracture',
  'Frattura esposta femore': 'Open femur fracture',
  'Frattura esposta tibia-perone': 'Open tibia-fibula fracture',
  'Frattura pelvica instabile': 'Unstable pelvic fracture (Open Book)',
  'Pneumotorace iperteso': 'Tension pneumothorax',
  'Pneumotorace aperto': 'Open sucking chest wound',
  'PNX iperteso': 'Tension pneumothorax',
  'PNX sx': 'Left tension pneumothorax',
  'PNX dx': 'Right tension pneumothorax',
  'PNX': 'Pneumothorax',
  'Emotorace massivo': 'Massive hemothorax',
  'Emotorace': 'Hemothorax',
  'Tamponamento cardiaco': 'Cardiac tamponade',
  'Trauma Cranico Grave (TBI)': 'Severe Traumatic Brain Injury (TBI)',
  'Trauma cranico maggiore': 'Major Traumatic Brain Injury',
  'TBI': 'Severe TBI',
  'Shock emorragico classe IV': 'Class IV hemorrhagic shock',
  'Shock emorragico classe III': 'Class III hemorrhagic shock',
  'Shock emorragico': 'Hemorrhagic shock',
  'Ustione torace - collo': 'Deep burns to chest & neck',
  'Ustione da scoppio': 'Blast burn injury',
  'Ustioni di II e III grado': '2nd and 3rd degree burns',
  'Collo sanguinante': 'Massive bleeding neck wound',
  'Lesione vascolare giunzionale': 'Junctional vascular injury',
  'Emorragia giunzionale ascellare': 'Axillary junctional hemorrhage',
  'Emorragia giunzionale inguinale': 'Inguinal junctional hemorrhage',
  'ACC traumatico imminente': 'Imminent traumatic cardiac arrest',
  'ACC (Arresto Cardio-Circolatorio traumatico)': 'Traumatic Cardiac Arrest (TCA)',
  'Decompressione ago': 'Needle chest decompression',
  'Decompressione toracica con ago': 'Needle chest decompression',
  'Toracostomia con drenaggio toracico': 'Tube thoracostomy & chest drain',
  'Toracostomia': 'Finger thoracostomy',
  'Cricotirotomia chirurgica (CRIC)': 'Surgical cricothyroidotomy (CRIC)',
  'Cricotirotomia': 'Surgical cricothyroidotomy',
  'Tourniquet arterioso': 'Arterial Tourniquet',
  'Tourniquet TQ': 'Combat application tourniquet (CAT)',
  'Tourniquet giunzionale (JETT/SAM)': 'Junctional Tourniquet (JETT/SAM)',
  'Wound packing con garza emostatica': 'Wound packing with hemostatic gauze',
  'Wound packing emostatico': 'Hemostatic wound packing',
  'Pelvic binder / cintura pelvica': 'Pelvic binder placement',
  'Accesso intraosseo (EZ-IO)': 'Intraosseous access (EZ-IO)',
  'Accesso vascolare ecoguidato': 'Ultrasound-guided vascular access',
  'Eco e-FAST': 'e-FAST Ultrasound',
  'Ecografia FAST': 'FAST Ultrasound',
  'Laparotomia Damage Control': 'Damage Control Laparotomy',
  'Toracotomia di rianimazione': 'Resuscitative Thoracotomy',
  'Resus Thoracotomy': 'Resuscitative Thoracotomy',
  'Protocollo Trasfusione Massiva (MTP)': 'Massive Transfusion Protocol (MTP)',
  'Torace morbido con tessuti biologici': 'Soft chest model with biological tissues',
  'Torace rigido': 'Rigid torso simulator',
  'Torace morbido': 'Soft torso simulator',
  'Simulatore avanzato alta fedeltà': 'High-fidelity advanced trauma simulator',
  'Manichino avanzato': 'Advanced patient simulator',
};

export function translateMedicalText(text: string, lang: Language): string {
  if (lang !== 'en' || !text) return text;
  if (MEDICAL_TERM_DICTIONARY[text]) return MEDICAL_TERM_DICTIONARY[text];

  let res = text;
  for (const [itKey, enVal] of Object.entries(MEDICAL_TERM_DICTIONARY)) {
    if (res.includes(itKey)) {
      res = res.replace(new RegExp(itKey, 'g'), enVal);
    }
  }

  // Common replacements
  res = res.replace(/Ferita arma da fuoco/g, 'Gunshot wound');
  res = res.replace(/Frattura esposta/g, 'Open fracture');
  res = res.replace(/sangue pulsante/g, 'pulsatile bleeding');
  res = res.replace(/emorragia massiva/g, 'massive hemorrhage');
  res = res.replace(/manichino/g, 'mannequin');
  res = res.replace(/attore/g, 'actor');
  res = res.replace(/attori/g, 'actors');
  res = res.replace(/protesi/g, 'prosthetic');

  return res;
}

export function translatePatient(patient: SimulatorPatient, lang: Language): SimulatorPatient {
  if (lang !== 'en' || !patient) return patient;

  return {
    ...patient,
    lesioni: patient.lesioni.map((l) => translateMedicalText(l, lang)),
    procedureExtra: patient.procedureExtra.map((p) => translateMedicalText(p, lang)),
    procedureIntra: patient.procedureIntra.map((p) => translateMedicalText(p, lang)),
    moulageProtesi: translateMedicalText(patient.moulageProtesi, lang),
    simulatori: translateMedicalText(patient.simulatori, lang),
    attoreDettagli: patient.attoreDettagli ? translateMedicalText(patient.attoreDettagli, lang) : undefined,
    techNotes: patient.techNotes ? translateMedicalText(patient.techNotes, lang) : undefined,
    dinamicaDelleLesioni: patient.dinamicaDelleLesioni ? translateMedicalText(patient.dinamicaDelleLesioni, lang) : undefined,
    approccioTcccVsShockRoom: patient.approccioTcccVsShockRoom ? translateMedicalText(patient.approccioTcccVsShockRoom, lang) : undefined,
  };
}
