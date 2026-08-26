import { Language } from './translations';

const PROCEDURE_TRANSLATIONS: Record<string, { en: string; it: string }> = {
  'Cricotirotomia CRIC': { en: 'Surgical Cricothyroidotomy (CRIC)', it: 'Cricotirotomia CRIC' },
  'Cricotirotomia chirurgica': { en: 'Surgical Cricothyroidotomy', it: 'Cricotirotomia chirurgica' },
  'Tourniquet TQ': { en: 'Tourniquet Application (TQ)', it: 'Tourniquet TQ' },
  'Applicazione Tourniquet': { en: 'Tourniquet Application', it: 'Applicazione Tourniquet' },
  'Applicazione Tourniquet TQ multipli': { en: 'Multiple Tourniquet Applications (TQ)', it: 'Applicazione Tourniquet TQ multipli' },
  'Toracostomia con Decompressione': { en: 'Thoracostomy & Needle Decompression', it: 'Toracostomia con Decompressione' },
  'Decompressione Toracica con Ago ND': { en: 'Needle Chest Decompression (ND)', it: 'Decompressione Toracica con Ago ND' },
  'Resuscitative Thoracotomy': { en: 'Resuscitative Thoracotomy', it: 'Resuscitative Thoracotomy' },
  'Toracotomia d\'Urgenza': { en: 'Emergency Thoracotomy', it: 'Toracotomia d\'Urgenza' },
  'REBOA Zone 1/3': { en: 'REBOA Placement (Zone 1/3)', it: 'REBOA Zone 1/3' },
  'Drenaggio Toracico Bulau': { en: 'Chest Tube Insertion (Bulau Drainage)', it: 'Drenaggio Toracico Bulau' },
  'Bendaggio Compressivo Emostatico': { en: 'Hemostatic Wound Packing & Pressure Dressing', it: 'Bendaggio Compressivo Emostatico' },
  'Wound Packing & Celox': { en: 'Wound Packing & Celox Gauze', it: 'Wound Packing & Celox' },
  'Pelvic Binder': { en: 'Pelvic Binder Application (SAM)', it: 'Pelvic Binder' },
  'Fissatore Pelvico SAM': { en: 'SAM Pelvic Binder Placement', it: 'Fissatore Pelvico SAM' },
  'Intubazione RSI': { en: 'Rapid Sequence Intubation (RSI)', it: 'Intubazione RSI' },
  'Intubazione a Sequenza Rapida RSI': { en: 'Rapid Sequence Intubation (RSI)', it: 'Intubazione a Sequenza Rapida RSI' },
  'Accesso Intraosseo IO': { en: 'Intraosseous Access (IO)', it: 'Accesso Intraosseo IO' },
  'Accesso Intraosseo EZ-IO': { en: 'EZ-IO Intraosseous Access', it: 'Accesso Intraosseo EZ-IO' },
  'Ecografia FAST/eFAST': { en: 'eFAST Bedside Ultrasound', it: 'Ecografia FAST/eFAST' },
  'eFAST Ecografia Shock Room': { en: 'Shock Room eFAST Ultrasound', it: 'eFAST Ecografia Shock Room' },
  'Protocollo Trasfusione Massiva MTP': { en: 'Massive Transfusion Protocol (MTP)', it: 'Protocollo Trasfusione Massiva MTP' },
  'Triage Tattico START': { en: 'Tactical START Triage', it: 'Triage Tattico START' },
  'Handover SBAR Maxiemergenza': { en: 'MCI SBAR Radio Handover', it: 'Handover SBAR Maxiemergenza' },
  'Handover SBAR Pre-Intraospedaliero': { en: 'Pre-to-In Hospital SBAR Handover', it: 'Handover SBAR Pre-Intraospedaliero' },
  'Pericardiocentesi': { en: 'Pericardiocentesis', it: 'Pericardiocentesi' },
  'Clamping Ilo Polmonare': { en: 'Pulmonary Hilum Clamping', it: 'Clamping Ilo Polmonare' },
  'Cross-Clamping Aortico': { en: 'Aortic Cross-Clamping', it: 'Cross-Clamping Aortico' },
};

const INJURY_TRANSLATIONS: Record<string, { en: string; it: string }> = {
  'Trauma penetrante toracico': { en: 'Penetrating thoracic trauma', it: 'Trauma penetrante toracico' },
  'Shock emorragico grave': { en: 'Severe hemorrhagic shock', it: 'Shock emorragico grave' },
  'Pneumotorace iperteso': { en: 'Tension pneumothorax', it: 'Pneumotorace iperteso' },
  'Trauma addominale penetrante': { en: 'Penetrating abdominal trauma', it: 'Trauma addominale penetrante' },
  'Frattura di bacino instabile': { en: 'Unstable pelvic ring fracture', it: 'Frattura di bacino instabile' },
  'Shock refrattario': { en: 'Refractory hemorrhagic shock', it: 'Shock refrattario' },
  'Amputazione traumatica arto inferiore': { en: 'Traumatic lower extremity amputation', it: 'Amputazione traumatica arto inferiore' },
  'Emorragia giunzionale inguinale': { en: 'Junctional groin hemorrhage', it: 'Emorragia giunzionale inguinale' },
  'Ferita penetrante al collo': { en: 'Penetrating zone II neck wound', it: 'Ferita penetrante al collo' },
  'Ostruzione acuta vie aeree': { en: 'Acute upper airway obstruction', it: 'Ostruzione acuta vie aeree' },
  'Tamponamento cardiaco acuto': { en: 'Acute cardiac tamponade', it: 'Tamponamento cardiaco acuto' },
  'Ferite penetranti multiple da schegge ed esplosione': { en: 'Multiple penetrating shrapnel & blast injuries', it: 'Ferite penetranti multiple da schegge ed esplosione' },
  'Shock emorragico acuto con ipotermia secondaria': { en: 'Acute hemorrhagic shock with secondary hypothermia', it: 'Shock emorragico acuto con ipotermia secondaria' },
  'Sindrome da schiacciamento e lesioni da detriti': { en: 'Crush syndrome and blast debris lacerations', it: 'Sindrome da schiacciamento e lesioni da detriti' },
  'Eviscerazione addominale con ipotermia': { en: 'Abdominal evisceration with secondary hypothermia', it: 'Eviscerazione addominale con ipotermia' },
  'Ferita da arma da fuoco addomino-pelvica': { en: 'Abdomino-pelvic gunshot wound (GSW)', it: 'Ferita da arma da fuoco addomino-pelvica' },
  'Ustioni estese da fiamma e blast (35% TBSA)': { en: 'Extensive thermal & blast burns (35% TBSA)', it: 'Ustioni estese da fiamma e blast (35% TBSA)' },
  'Trauma cranico maggiore con ematoma epidurale': { en: 'Severe traumatic brain injury (TBI) with epidural hematoma', it: 'Trauma cranico maggiore con ematoma epidurale' },
};

const MOULAGE_TRANSLATIONS: Record<string, { en: string; it: string }> = {
  'Ferite penetranti complesse con simulazione emorragica attiva': {
    en: 'Complex penetrating wounds with active pulsatile bleeding simulation',
    it: 'Ferite penetranti complesse con simulazione emorragica attiva',
  },
  'Grave trauma addomino-pelvico con emoperitoneo': {
    en: 'Severe abdomino-pelvic trauma with hemoperitoneum simulation',
    it: 'Grave trauma addomino-pelvico con emoperitoneo',
  },
  'Moulage emorragie zampillanti, fumo artificiale, protesi amputazioni': {
    en: 'Pulsatile arterial bleeding moulage, theatrical smoke, amputation prosthetics',
    it: 'Moulage emorragie zampillanti, fumo artificiale, protesi amputazioni',
  },
  'Collo trafitto con lesione carotidea e tracheale': {
    en: 'Penetrating neck injury with carotid and tracheal laceration module',
    it: 'Collo trafitto con lesione carotidea e tracheale',
  },
  'Moncone femorale con sanguinamento arterioso massivo': {
    en: 'Femoral amputation stump with massive high-pressure arterial bleed',
    it: 'Moncone femorale con sanguinamento arterioso massivo',
  },
};

const SIMULATOR_TRANSLATIONS: Record<string, { en: string; it: string }> = {
  'Simulatore ad alta fedeltà con monitoraggio multiparametrico': {
    en: 'High-fidelity full-body manikin with telemetry monitoring',
    it: 'Simulatore ad alta fedeltà con monitoraggio multiparametrico',
  },
  'Manichino trauma avanzato corpo intero + task trainers': {
    en: 'Advanced trauma full-body manikin + procedural task trainers',
    it: 'Manichino trauma avanzato corpo intero + task trainers',
  },
  'Simulatore REBOA con accesso femorale pulsante': {
    en: 'Endovascular REBOA simulator with pulsatile femoral access',
    it: 'Simulatore REBOA con accesso femorale pulsante',
  },
  'Biomodello toracico biologico (cuore/polmone suino)': {
    en: 'Biological thoracic wet-lab model (porcine heart/lung block)',
    it: 'Biomodello toracico biologico (cuore/polmone suino)',
  },
};

export function translateProcedure(procedure: string, lang: Language): string {
  if (lang === 'it') return procedure;
  const match = PROCEDURE_TRANSLATIONS[procedure];
  if (match) return match.en;
  // Fallback for partial matches
  for (const [key, val] of Object.entries(PROCEDURE_TRANSLATIONS)) {
    if (procedure.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(procedure.toLowerCase())) {
      return val.en;
    }
  }
  return procedure;
}

export function translateInjury(injury: string, lang: Language): string {
  if (lang === 'it') return injury;
  const match = INJURY_TRANSLATIONS[injury];
  if (match) return match.en;
  for (const [key, val] of Object.entries(INJURY_TRANSLATIONS)) {
    if (injury.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(injury.toLowerCase())) {
      return val.en;
    }
  }
  return injury;
}

export function translateMoulage(moulage: string, lang: Language): string {
  if (lang === 'it') return moulage;
  const match = MOULAGE_TRANSLATIONS[moulage];
  if (match) return match.en;
  for (const [key, val] of Object.entries(MOULAGE_TRANSLATIONS)) {
    if (moulage.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(moulage.toLowerCase())) {
      return val.en;
    }
  }
  return moulage;
}

export function translateSimulator(sim: string, lang: Language): string {
  if (lang === 'it') return sim;
  const match = SIMULATOR_TRANSLATIONS[sim];
  if (match) return match.en;
  for (const [key, val] of Object.entries(SIMULATOR_TRANSLATIONS)) {
    if (sim.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(sim.toLowerCase())) {
      return val.en;
    }
  }
  return sim;
}

export function translateRoleOrSpecialty(role: string, lang: Language): string {
  if (lang === 'it') return role;
  const roleMap: Record<string, string> = {
    'Medico Emergenza Urgenza / Anestesista': 'Emergency Physician / Anesthesiologist',
    'Chirurgo Generale / Trauma Surgeon': 'General Surgeon / Trauma Surgeon',
    'Infermiere Area Critica / 118': 'Critical Care & EMS Nurse',
    'Infermiere Strumentista / Sala Operatoria': 'Surgical Scrub Nurse',
    'Specializzando Anestesia e Rianimazione': 'Anesthesia & Intensive Care Resident',
    'Specializzando Chirurgia Generale': 'General Surgery Resident',
    'Paramedico 118 / Soccorritore Avanzato': 'Paramedic / Advanced EMT',
    'Medico 118 Elisoccorso': 'HEMS Flight Physician',
    'Caposquadra / Team Leader': 'Team Leader / Incident Commander',
    'Operatore Vie Aeree / Airway Operator': 'Airway Specialist Operator',
    'Operatore Circolo & Accessi Vascolari': 'Circulation & Vascular Access Operator',
    'Operatore Procedure Chirurgiche': 'Surgical Procedures Operator',
    'Moulage avanzato, ferite balistiche, protesi cricotirotomia': 'Advanced moulage, ballistic wounds, cricothyroidotomy prosthetics',
    'Simulatori torace morbido con tessuti biologici (organi maiale), toracotomia': 'Soft thoracic simulators with biological porcine tissues, thoracotomy',
    'Simulatori REBOA endovascolari, controllo emorragie arteriose da moncone': 'Endovascular REBOA simulators, arterial stump hemorrhage control',
    'Gestione materiali TCCC, barelle di estrazione, manichini da trascinamento': 'TCCC materials management, rescue litters, drag rescue mannequins',
    'Materiali di improvvisazione, steccaggi da campo, presidi ventilatori': 'Austere improvisation kits, field splinting, emergency ventilation devices',
    'Effetti sonori, fumi scenici, illuminazione tattica notturna, briefing video': 'Sound effects, theatrical smoke, night tactical lighting, video briefings',
    'Direttore del Corso & Anestesista Rianimatore': 'Course Director & Anesthesiologist / Intensivist',
    'Co-Direttrice del Corso & Chirurgo Trauma Center': 'Co-Course Director & Trauma Surgeon',
    'Direttore Scientifico': 'Scientific Director',
    'Responsabile Scenari': 'Scenarios Coordinator',
    'Coordinatore Faculty': 'Faculty Lead Coordinator',
  };
  return roleMap[role] || role;
}
