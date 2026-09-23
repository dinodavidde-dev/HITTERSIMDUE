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
  // Day 2 Slots
  'dir-1': {
    title: 'Staff Setup (Phases 1 & 2)',
    description: 'Staff briefing, radio check (CH1, CH2, CH3) and mannequin/simulator calibration.',
  },
  'd2-setup-1': {
    title: 'Pre-Opening & Technical Setup',
    description: 'Check simulators, infusion lines and mannequins.',
  },
  'd2-setup-2': {
    title: 'Staff Setup (Phases 3 & 4)',
    description: 'Faculty/control room alignment and final stations check (GO / NO-GO).',
  },
  'd2-welcome': {
    title: 'Learner Welcome & Training Agreement',
    description: 'Learner gathering and station reconnaissance.',
  },
  'd2-apertura': {
    title: 'Learner Welcome & Initial Plenary',
    description: 'Learner check-in, badge assignment and course introduction.',
  },
  'd2-prealert-1': {
    title: 'Pre-Alert T-15 Block 1',
    description: 'TCCC PRE-ALERT and station staging at T-15.',
  },
  'd2-b1-tccc': {
    title: 'BLOCK 1 • TCCC Tactical Scenario & WS',
    description: 'TCCC engagement, triage, Stop the Bleed (Pts 1-3) & Skill Workshops.',
  },
  'd2-b1-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Strict 5-minute stretcher clinical handover from TCCC to Shock Room teams.',
  },
  'd2-b1-sr': {
    title: 'BLOCK 1 • Shock Room Scenario & TCCC Debriefing',
    description: 'Critical patient management ABCDE in Shock Room (Pts 1-3) & TCCC Debriefing Part 1.',
  },
  'd2-b1-debrief-clinico': {
    title: 'Joint Clinical Debriefing SR & TCCC Part 2',
    description: 'Video review, non-technical skills (CRM) and block wrap-up.',
  },
  'd2-b1-reset': {
    title: 'Technical Reset Block 1',
    description: '15-min turnaround: Shock Room bays cleaning, sanitization and equipment reload.',
  },
  'd2-pausa-m': {
    title: 'Coffee Break + Block 2 Pre-Alert',
    description: 'Refreshment and transition to operating stations.',
  },
  'd2-b2-tccc': {
    title: 'BLOCK 2 • TCCC Tactical Scenario & WS',
    description: 'Blast injury hemostasis, triage (Pts 4-6) & Skill Workshops.',
  },
  'd2-b2-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Stretcher SBAR handover (< 5 min) between TCCC teams and Shock Room bays.',
  },
  'd2-b2-sr': {
    title: 'BLOCK 2 • Shock Room ABCDE & TCCC Debriefing',
    description: 'Hemorrhagic shock, massive transfusion protocol (Pts 4-6) & TCCC Debriefing Part 1.',
  },
  'd2-b2-debrief-clinico': {
    title: 'Joint Clinical Debriefing SR & TCCC Part 2',
    description: 'NTS video analysis, communication closed-loop and Block 2 closure.',
  },
  'd2-b2-reset': {
    title: 'Technical Reset Block 2',
    description: '15-minute quick turnaround: Shock Room bays cleaning and consumables reload.',
  },
  'd2-pranzo': {
    title: 'PROTECTED LUNCH BREAK',
    description: 'Protected 75-minute meal & rest interval. No active alarms.',
  },
  'd2-prealert-3': {
    title: 'Pre-Alert T-15 Block 3',
    description: 'Regrouping and TCCC PRE-ALERT for afternoon Block 3.',
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
    description: 'Chest drain, tension pneumothorax (Pts 7-9) & TCCC Debriefing Part 1.',
  },
  'd2-b3-debrief-clinico': {
    title: 'Joint Clinical Debriefing SR & TCCC Part 2',
    description: 'Video review, invasive skills analysis and CRM performance.',
  },
  'd2-b3-reset': {
    title: 'Technical Reset Block 3',
    description: '15-min turnaround: Shock Room bays cleaning and equipment reload.',
  },
  'd2-pausa-p': {
    title: 'Afternoon Break + Block 4 Pre-Alert',
    description: 'Refreshment and transition (T-15 Pre-Alert at 15:55).',
  },
  'd2-b4-tccc': {
    title: 'BLOCK 4 • TCCC Scenario & Skill Workshops',
    description: 'Major polytrauma, catastrophic bleeds (Pts 10-12) & Skill Workshops.',
  },
  'd2-b4-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Stretcher SBAR handover (< 5 min) between TCCC and Shock Room.',
  },
  'd2-b4-sr': {
    title: 'BLOCK 4 • Shock Room ABCDE & TCCC Debriefing',
    description: 'Traumatic cardiac arrest, MTP (Pts 10-12) & TCCC Debriefing Part 1.',
  },
  'd2-b4-debrief-clinico': {
    title: 'Joint Clinical Debriefing SR & TCCC Part 2',
    description: 'Comprehensive day review, faculty feedback and team score analysis.',
  },
  'd2-b4-reset': {
    title: 'Final Reset Block 4',
    description: 'Final turnaround: sanitization and stations shutdown.',
  },
  'd2-chiusura': {
    title: 'Day 2 Plenary Closing',
    description: 'Joint debriefing & general daily feedback.',
  },

  // Day 3 Slots
  'd3-setup-1': {
    title: 'Staff Setup (Phases 1 & 2)',
    description: 'Staff Briefing, radio check and Day 3 mannequin calibration.',
  },
  'd3-setup-2': {
    title: 'Staff Setup (Phases 3 & 4)',
    description: 'Faculty/control room alignment and final Day 3 stations check.',
  },
  'd3-welcome': {
    title: 'Learner Welcome & Day 3 Briefing',
    description: 'Learner assembly and specular rotation briefing.',
  },
  'd3-prealert-1': {
    title: 'Pre-Alert T-15 Block 1 (Day 3)',
    description: 'Staging and TCCC PRE-ALERT for Day 3 specular rotation.',
  },
  'd3-b1-tccc': {
    title: 'BLOCK 1 (DAY 3) • TCCC Scenario & WS',
    description: 'Cardiac tamponade, triage (Pts 13-15) & Skill Workshops.',
  },
  'd3-b1-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Stretcher handover between field tactical team and Shock Room bay.',
  },
  'd3-b1-sr': {
    title: 'BLOCK 1 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'REBOA Z3, pelvis (Pts 13-15) & TCCC Debriefing Part 1.',
  },
  'd3-b1-debrief-clinico': {
    title: 'Day 3 Block 1 Joint Debriefing',
    description: 'NTS video analysis, Plus/Delta and block 1 wrap-up.',
  },
  'd3-b1-reset': {
    title: 'Technical Reset Block 1 (Day 3)',
    description: '15-min turnaround: Shock Room bays cleaning and equipment reload.',
  },
  'd3-pausa-m': {
    title: 'Coffee Break + Block 2 Pre-Alert (Day 3)',
    description: 'Refreshment and rotation transition.',
  },
  'd3-b2-tccc': {
    title: 'BLOCK 2 (DAY 3) • TCCC Scenario & WS',
    description: 'Pericardiocentesis, triage (Pts 16-18) & Skill Workshops.',
  },
  'd3-b2-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Direct 1:1 clinical report from tactical leader to Shock Room physician.',
  },
  'd3-b2-sr': {
    title: 'BLOCK 2 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'REBOA Z3, MTP 1:1:1 (Pts 16-18) & TCCC Debriefing Part 1.',
  },
  'd3-b2-debrief-clinico': {
    title: 'Day 3 Block 2 Joint Debriefing',
    description: 'CRM team evaluation and leadership transition review.',
  },
  'd3-b2-reset': {
    title: 'Technical Reset Block 2 (Day 3)',
    description: '15-min turnaround: Shock Room bays cleaning and equipment reload.',
  },
  'd3-pranzo': {
    title: 'PROTECTED LUNCH BREAK (Day 3)',
    description: 'Protected 75-minute meal & rest interval. No active alarms.',
  },
  'd3-prealert-3': {
    title: 'Pre-Alert T-15 Block 3 (Day 3)',
    description: 'Assembly and TCCC PRE-ALERT for afternoon Block 3.',
  },
  'd3-b3-tccc': {
    title: 'BLOCK 3 (DAY 3) • TCCC Scenario & WS',
    description: 'Escharotomy, Parkland (Pts 19-21) & Skill Workshops.',
  },
  'd3-b3-handover': {
    title: 'STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Rigorous SBAR handover with continuous hemorrhage control maintenance.',
  },
  'd3-b3-sr': {
    title: 'BLOCK 3 (DAY 3) • Shock Room ABCDE & Debriefing',
    description: 'REBOA Z1, burns (Pts 19-21) & TCCC Debriefing Part 1.',
  },
  'd3-b3-debrief-clinico': {
    title: 'Day 3 Block 3 Joint Debriefing',
    description: 'NTS video analysis, Plus/Delta and block 3 wrap-up.',
  },
  'd3-b3-reset': {
    title: 'Technical Reset Block 3 (Day 3)',
    description: '15-min turnaround: Shock Room bays cleaning and equipment reload.',
  },
  'd3-pausa-p': {
    title: 'Afternoon Break + Block 4 Pre-Alert (Day 3)',
    description: 'Refreshment and transition.',
  },
  'd3-b4-tccc': {
    title: 'BLOCK 4 (DAY 3) • Final Complex Scenario & WS',
    description: 'Bilateral amputations, triage (Pts 22-24) & Skill Workshops.',
  },
  'd3-b4-handover': {
    title: 'FINAL STANDARDIZED SBAR HANDOVER 1:1',
    description: 'Culminating clinical handover from tactical extraction to surgical resuscitation.',
  },
  'd3-b4-sr': {
    title: 'BLOCK 4 (DAY 3) • Final Shock Room & Debriefing',
    description: 'Traumatic cardiac arrest (Pts 22-24) & TCCC Debriefing Part 1.',
  },
  'd3-b4-debrief-clinico': {
    title: 'Final Integrated Debriefing',
    description: 'Course summary debriefing and tactical skills consolidation.',
  },
  'd3-b4-reset': {
    title: 'Final Reset Block 4 (Day 3)',
    description: 'Final turnaround: sanitization and stations shutdown.',
  },
  'd3-chiusura': {
    title: 'Plenary Closing & Certificate Awarding',
    description: 'Final joint debriefing, clinical summary and course closing.',
  },
};

// Activity Titles & Subtitles translation dictionary
const ACTIVITY_PHRASES_EN: Record<string, { title: string; subtitle: string }> = {
  'Airway & Bleeding': { title: 'Airway & Bleeding', subtitle: 'Junctional Bleeding & Airway Management' },
  'Check postazioni': { title: 'Station Check', subtitle: 'Technical Calibration & GO/NO-GO' },
  'Check presidi': { title: 'Equipment Check', subtitle: 'Kit & Simulator Readiness' },
  'Chiusura report tattico': { title: 'Tactical Report Wrap-up', subtitle: 'SBAR Documentation & Team Evaluation' },
  'Consegna SBAR ➔ Shock Room': { title: 'SBAR Handover ➔ Shock Room', subtitle: 'Stretcher Patient Delivery' },
  'Debriefing clinico congiunto': { title: 'Joint Clinical Debriefing', subtitle: 'Video Review & CRM Feedback' },
  'Debriefing TCCC': { title: 'TCCC Debriefing', subtitle: 'Tactical Phase Analysis' },
  'Debriefing TCCC (Pt 1)': { title: 'TCCC Debriefing (Part 1)', subtitle: 'Tactical Phase Analysis' },
  'Debriefing TCCC (Pt 2)': { title: 'TCCC Debriefing (Part 2)', subtitle: 'SBAR Documentation & Review' },
  'Debriefing workshop': { title: 'Workshop Debriefing', subtitle: 'Technical Skills Assessment' },
  'Debriefing SR Plus/Delta': { title: 'Shock Room Debriefing', subtitle: 'Video Review & CRM NTS ≥ 4' },
  'Eco FAST & IO': { title: 'e-FAST Ultrasound & IO', subtitle: 'Vascular Access & Sonography' },
  'Patto d\'Aula': { title: 'Training Agreement', subtitle: 'Initial Briefing & Station Walkthrough' },
  'Pausa Caffè': { title: 'Coffee Break', subtitle: 'Refreshment & Rest' },
  'Pausa Pranzo Protetta': { title: 'Protected Lunch Break', subtitle: 'Rest & Refreshment' },
  'Plenaria finale': { title: 'Final Plenary', subtitle: 'General Feedback & Certificate Awarding' },
  'PRE-ALLERTA TCCC': { title: 'TCCC PRE-ALERT', subtitle: 'PPE & Bleeding Control Kits Check' },
  'RESET Box SR': { title: 'Shock Room Bays Reset', subtitle: 'Clean-up, fluids reload & skin change' },
  'Ricezione SBAR ➔ Box 1-3': { title: 'SBAR Reception ➔ Bays 1-3', subtitle: 'Incoming Stretcher Patient Reception' },
  'Riordino WS1': { title: 'Workshop 1 Reset', subtitle: 'Airway Consumables Restock' },
  'Riordino WS2': { title: 'Workshop 2 Reset', subtitle: 'Ultrasound Calibration & Needle Reset' },
  'Scenario TCCC': { title: 'TCCC Tactical Scenario', subtitle: 'Under Fire Care & Stretcher Evacuation' },
  'Shock Room ABCDE': { title: 'Shock Room ABCDE', subtitle: 'Advanced Trauma Resuscitation' },
  'Skills Workshop 1': { title: 'Skill Workshop 1', subtitle: 'Airway & Junctional Bleeding' },
  'Skills Workshop 2': { title: 'Skill Workshop 2', subtitle: 'e-FAST Ultrasound & Vascular Access' },
  'Standby SR (Box 1-3)': { title: 'Shock Room Standby (Bays 1-3)', subtitle: 'Active Pre-Handover Standby (T-15)' },
  'Validazione CH1/CH2': { title: 'Radio CH1/CH2 Check', subtitle: 'Communications & Link Validation' },
};

const SUBTITLE_EXACT_MAP: Record<string, string> = {
  'Check presidi Box 1-3': 'Equipment Check Bays 1-3',
  'Analisi tattica e triage': 'Tactical Analysis & Triage',
  'Revisione video NTS ≥ 4': 'Video Review NTS ≥ 4',
  'Restituzione generale': 'General Feedback',
  'Briefing iniziale': 'Initial Briefing',
  'Briefing Day 3': 'Day 3 Briefing',
  'Briefing pomeridiano': 'Afternoon Briefing',
  'Preparazione materiale': 'Material Preparation',
  'Standby attivo pre-handover': 'Active Pre-Handover Standby',
  'Ripristino materiale': 'Equipment Restock',
  'Ristoro': 'Refreshment & Rest',
  'Pratica avanzata': 'Advanced Hands-on Practice',
  'Valutazione tecnica': 'Technical Evaluation',
  'TECH-01/02/03 (Pulizia, fluidi, cute)': 'TECH-01/02/03 (Clean-up, fluids, skin)',
  'TECH-01/02/03 (Sanificazione finale)': 'TECH-01/02/03 (Final sanitization)',
  'TECH-04/05/06 (Pulizia, fluidi, cute)': 'TECH-04/05/06 (Clean-up, fluids, skin)',
  'TECH-04/05/06 (Sanificazione finale)': 'TECH-04/05/06 (Final sanitization)',
  'TECH-07/08/09 (Pulizia, fluidi, cute)': 'TECH-07/08/09 (Clean-up, fluids, skin)',
  'TECH-10/11/12 (Pulizia, fluidi, cute)': 'TECH-10/11/12 (Clean-up, fluids, skin)',
};

export function translateGroupActivity(act: GroupActivitySlot, lang: Language): GroupActivitySlot {
  if (lang !== 'en' || !act) return act;

  let translatedTitle = act.title;
  let translatedSubtitle = act.subtitle;

  // Exact or prefix match from dictionary
  if (ACTIVITY_PHRASES_EN[act.title]) {
    translatedTitle = ACTIVITY_PHRASES_EN[act.title].title;
    if (!translatedSubtitle || translatedSubtitle.length < 5) {
      translatedSubtitle = ACTIVITY_PHRASES_EN[act.title].subtitle;
    }
  } else {
    for (const [key, val] of Object.entries(ACTIVITY_PHRASES_EN)) {
      if (act.title.toLowerCase().includes(key.toLowerCase())) {
        translatedTitle = val.title;
        if (!translatedSubtitle || translatedSubtitle.length < 5) {
          translatedSubtitle = val.subtitle;
        }
        break;
      }
    }
  }

  // Exact subtitle dictionary match
  if (SUBTITLE_EXACT_MAP[act.subtitle]) {
    translatedSubtitle = SUBTITLE_EXACT_MAP[act.subtitle];
  }

  // Dynamic replacements for titles
  if (translatedTitle.includes('Pausa Pranzo')) translatedTitle = 'Protected Lunch Break';
  if (translatedTitle.includes('Pausa Caffè')) translatedTitle = 'Coffee Break';
  if (translatedTitle.includes('Consegna SBAR')) translatedTitle = translatedTitle.replace(/Consegna SBAR/g, 'SBAR Handover Delivery');
  if (translatedTitle.includes('Ricezione SBAR')) translatedTitle = translatedTitle.replace(/Ricezione SBAR/g, 'SBAR Handover Reception');
  if (translatedTitle.includes('Scenario TCCC')) translatedTitle = 'TCCC Tactical Scenario';
  if (translatedTitle.includes('Shock Room ABCDE')) translatedTitle = 'Shock Room ABCDE';
  if (translatedTitle.includes('Debriefing')) translatedTitle = translatedTitle.replace(/Debriefing/g, 'Debriefing');

  // Dynamic replacements for subtitles
  if (translatedSubtitle.includes('➔ Consegna ad ')) translatedSubtitle = translatedSubtitle.replace(/➔ Consegna ad /g, '➔ Handover to ');
  if (translatedSubtitle.includes('➔ Consegna a ')) translatedSubtitle = translatedSubtitle.replace(/➔ Consegna a /g, '➔ Handover to ');
  if (translatedSubtitle.includes('➔ Ricezione da ')) translatedSubtitle = translatedSubtitle.replace(/➔ Ricezione da /g, '➔ Reception from ');
  if (translatedSubtitle.includes('Gestione avanzata Pz')) translatedSubtitle = translatedSubtitle.replace(/Gestione avanzata Pz/g, 'Advanced Management Pts');
  if (translatedSubtitle.includes('Ingaggio / Stop Bleed (Pz')) translatedSubtitle = translatedSubtitle.replace(/Ingaggio \/ Stop Bleed \(Pz/g, 'Engagement / Stop Bleed (Pts');
  if (translatedSubtitle.includes('Ingaggio / Triage (Pz')) translatedSubtitle = translatedSubtitle.replace(/Ingaggio \/ Triage \(Pz/g, 'Engagement / Triage (Pts');
  if (translatedSubtitle.includes('Ferite complesse (Pz')) translatedSubtitle = translatedSubtitle.replace(/Ferite complesse \(Pz/g, 'Complex Wounds (Pts');
  if (translatedSubtitle.includes('Politrauma (Pz')) translatedSubtitle = translatedSubtitle.replace(/Politrauma \(Pz/g, 'Polytrauma (Pts');
  if (translatedSubtitle.includes('(Pulizia, fluidi, cute)')) translatedSubtitle = translatedSubtitle.replace(/\(Pulizia, fluidi, cute\)/g, '(Clean-up, fluids, skin)');
  if (translatedSubtitle.includes('(Sanificazione finale)')) translatedSubtitle = translatedSubtitle.replace(/\(Sanificazione finale\)/g, '(Final sanitization)');
  if (translatedSubtitle.includes('Ristoro')) translatedSubtitle = 'Refreshment & Rest';
  if (translatedSubtitle.includes('Check presidi')) translatedSubtitle = 'Equipment & Kit Check';
  if (translatedSubtitle.includes('Pratica avanzata')) translatedSubtitle = 'Advanced Hands-on Practice';
  if (translatedSubtitle.includes('Valutazione tecnica')) translatedSubtitle = 'Technical Evaluation';
  if (translatedSubtitle.includes('Analisi tattica')) translatedSubtitle = 'Tactical Analysis';
  if (translatedSubtitle.includes('Ripristino')) translatedSubtitle = 'Turnaround & Restock';

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
