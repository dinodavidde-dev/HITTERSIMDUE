import { ProtesiItem } from '../types';

export const PROTESI_CATALOG: ProtesiItem[] = [
  {
    id: 'prot-crico',
    code: 'PR-CRIC-01',
    name: 'Protesi Cricotirotomia Chirurgica (CRICO Sanguina ed Espande)',
    district: 'VIE_AEREE',
    description: 'Protesi laringea morbida a doppio strato con membrana cricotiroidea palpabile, micro-camera di espansione per simulazione ematoma compressivo e canale fluidico per sanguinamento pulsatile venoso/arterioso.',
    activeFeatures: [
      'Espansione pneumatica ematoma cervicale',
      'Sanguinamento attivo regolabile con siringa remota',
      'Membrana cricotiroidea incidibile e sostituibile',
      'Trachea cannulabile con tubo endotracheale 6.0'
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 4, scenarioCode: 'Scenario 6 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 7, teamIntra: 10 },
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 3 },
      { patientId: 12, scenarioCode: 'Scenario 3 (TCCC) - Replica', day: 2, period: 'pomeriggio', teamExtra: 12, teamIntra: 9 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 3, teamIntra: 6 },
      { patientId: 18, scenarioCode: 'Scenario 15 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 12 },
      { patientId: 19, scenarioCode: 'Scenario 7 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 4, teamIntra: 1 },
      { patientId: 22, scenarioCode: 'Scenario 7 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 10, teamIntra: 7 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Cricotirotomia chirurgica (CRIC)',
      'Incisione verticale/orizzontale membrana',
      'Inserimento uncino tracheale e cannula cuffiata'
    ],
    techRequirements: 'Ricarica sacca sangue venoso 500ml prima di ogni turno; verificare 3 membrane ricambio pronte per postazione.',
    leadTechnician: 'Silvia Rossi (Lead Moulage)',
    consumables: ['Membrana in silicone di ricambio', 'Cannula tracheostomica N.6', 'Bisturi lama 10/11', 'Sangue sintetico venoso']
  },
  {
    id: 'prot-gsw-schiena-torace',
    code: 'PR-GSW-02',
    name: 'Protesi Ferita da Arma da Fuoco Torace/Schiena con Pompa Sanguinante',
    district: 'TORACE_CUORE',
    description: 'Protesi toracica e dorsale a contatto epidermico con foro di entrata/uscita ad alta fedeltà, collegata a micro-pompa sommersa per getto pulsatile e camera pneumatica per bolle ematiche (pneumotorace aspirante).',
    activeFeatures: [
      'Foro di entrata/uscita passante trans-toracico',
      'Pompa sangue pulsatile a comando remoto',
      'Emissione di bolle ematiche per suzione d\'aria toracica',
      'Superficie adesiva conforme a chest seal con valvola'
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 5 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 16, scenarioCode: 'Scenario 18 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 10 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Medicazione toracica occlusiva ventilata (Chest Seal)',
      'Toracostomia con dito (Finger Thoracostomy)',
      'Drenaggio toracico e Resuscitative Thoracotomy'
    ],
    techRequirements: 'Spurgo aria tubi ad alta pressione; controllo alimentazione 12V pompa peristaltica.',
    leadTechnician: 'Roberto Bianchi / Silvia Rossi',
    consumables: ['Chest Seal ventilato TCCC', 'Tubi in silicone 4mm', 'Sangue sintetico arterioso', 'Drenaggio toracico 28-32 Fr']
  },
  {
    id: 'prot-collo-giugulo-carotidea',
    code: 'PR-JUNC-03',
    name: 'Protesi Emorragia Giunzionale del Collo (Lesione Giugulo-Carotidea)',
    district: 'COLLO_VASCOLARE',
    description: 'Collare anatomico con squarcio latero-cervicale profondo, vaso carotideo pressurizzato a 90 mmHg e tasca di contenimento profonda per wound packing con garze emostatiche e pressione mirata contro i processi vertebrali.',
    activeFeatures: [
      'Zampillo arterioso carotideo continuo/pulsatile',
      'Tasca profonda anatomica per garzaggio emostatico',
      'Riconoscimento tattile fascio vascolo-nervoso',
      'Sensibilità a occlusione mediante pressione digitale'
    ],
    scenariosUsed: [
      { patientId: 8, scenarioCode: 'Scenario 00 (Personalizzato)', day: 2, period: 'pomeriggio', teamExtra: 5, teamIntra: 2 },
      { patientId: 11, scenarioCode: 'Scenario 00 - Replica', day: 2, period: 'pomeriggio', teamExtra: 11, teamIntra: 8 },
      { patientId: 24, scenarioCode: 'Scenario 8 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 9 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Gestione Massive Bleeding Collo (Wound Packing)',
      'Applicazione garza emostatica caolino/chitosano',
      'Pressione digitale e clampaggio vascolare in shock room'
    ],
    techRequirements: 'Protezione tracheale durante il packing per evitare compressione vie aeree attore.',
    leadTechnician: 'Silvia Rossi (Lead Moulage)',
    consumables: ['Garze emostatiche TCCC (QuikClot / ChitoGauze)', 'Bende elastiche compressive', 'Ricarica sangue arterioso 1500ml']
  },
  {
    id: 'prot-addome-eviscerazione',
    code: 'PR-ABD-04',
    name: 'Protesi Addome con Eviscerazione & Emoperitoneo Attivo',
    district: 'ADDOME_PELVI',
    description: 'Protesi addominale aperta a conca con anse intestinali in silicone ultra-realistico, vasi mesenterici sanguinanti e cavità pelvica predisposta per packing peritoneale Damage Control.',
    activeFeatures: [
      'Anse intestinali morbide lubrificate',
      'Sanguinamento diffuso mesenterico ed emoperitoneo attivo',
      'Possibilità di applicazione medicazione umida non aderente',
      'Predisposta per laparotomia e packing a quadranti'
    ],
    scenariosUsed: [
      { patientId: 7, scenarioCode: 'Scenario 16 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 4, teamIntra: 1 },
      { patientId: 10, scenarioCode: 'Scenario 16 (TCCC) - Replica', day: 2, period: 'pomeriggio', teamExtra: 10, teamIntra: 7 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 3, teamIntra: 6 },
      { patientId: 18, scenarioCode: 'Scenario 15 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 12 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Copertura con telini umidi sterili e sacca laparotomica',
      'Laparotomia d\'urgenza Damage Control',
      'Packing peri-epatico e splenico a 4 quadranti'
    ],
    techRequirements: 'Idratazione costante anse intestinali con gel sterile idrosolubile per realismo ottico.',
    leadTechnician: 'Alessandro Conti / Silvia Rossi',
    consumables: ['Gel idrosolubile', 'Telini sterili trasparenti', 'Garze laparotomiche radio-opache', 'Sangue venoso per cavità']
  },
  {
    id: 'prot-amputazione-moncone-reboa',
    code: 'PR-AMP-05',
    name: 'Protesi Moncone Amputazione Traumatica Arto Inferiore con Accesso REBOA',
    district: 'ARTI_AMPUTAZIONI',
    description: 'Moncone emorragico di coscia/gamba ad alta fedeltà con osso femorale frantumato sporgente, arteria femorale sanguinante ad alta pressione (120 mmHg) e vaso femorale prossimale cannulabile con introduttore REBOA 7 Fr.',
    activeFeatures: [
      'Zampillo arterioso da lacerazione femorale interrotta da Tourniquet',
      'Arteria femorale cannulabile per catetere a palloncino REBOA',
      'Osso femorale esposto con tessuti muscolari slabbrati',
      'Compatibilità con tourniquet da combattimento (CAT / SAM-XT)'
    ],
    scenariosUsed: [
      { patientId: 3, scenarioCode: 'Scenario 11 (TCCC)', day: 2, period: 'mattina', teamExtra: 3, teamIntra: 6 },
      { patientId: 6, scenarioCode: 'Scenario 11 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 9, teamIntra: 12 },
      { patientId: 14, scenarioCode: 'Scenario 5 (TCCC)', day: 3, period: 'mattina', teamExtra: 2, teamIntra: 5 },
      { patientId: 17, scenarioCode: 'Scenario 5 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 8, teamIntra: 11 },
      { patientId: 21, scenarioCode: 'Scenario 8 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 6, teamIntra: 3 },
      { patientId: 24, scenarioCode: 'Scenario 8 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 9 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Applicazione Tourniquet CAT o giunzionale SAM-JETT',
      'Posizionamento introduttore femorale ecoguidato',
      'Gonfiaggio REBOA Zona 1 (Aorta toracica discendente) / Zona 3 (Iliaca)'
    ],
    techRequirements: 'Calibrazione manometro linea femorale a 80-100 mmHg; verificare arresto flusso al gonfiaggio palloncino.',
    leadTechnician: 'Alessandro Conti (Lead REBOA)',
    consumables: ['Catetere REBOA 7 Fr con siringa blocco', 'Tourniquet CAT Gen 7', 'Laccio emostatico giunzionale', 'Liquido arterioso pressurizzato']
  },
  {
    id: 'prot-frattura-esposta-avambraccio',
    code: 'PR-FRACT-06',
    name: 'Protesi Frattura Esposta Avambraccio con Emorragia a Getto',
    district: 'ARTI_AMPUTAZIONI',
    description: 'Guaina per braccio con monconi ossei di radio/ulna sporgenti, lesione dell\'arteria radiale/brachiale con zampillo sincronizzato e lacero-contusioni dei tessuti molli.',
    activeFeatures: [
      'Estremità ossee appuntite sporgenti mobili',
      'Getto arterioso radiale/ulnare regolabile',
      'Sensibilità a tourniquet omerale o garzaggio compressivo'
    ],
    scenariosUsed: [
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 5 },
      { patientId: 6, scenarioCode: 'Scenario 11 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 9, teamIntra: 12 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 16, scenarioCode: 'Scenario 18 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 10 }
    ],
    nightScenarioUsed: false,
    requiredProcedures: [
      'Applicazione Tourniquet arto superiore',
      'Allineamento provvisorio e steccaggio SAM Splint',
      'Controllo vascolare e medicazione sterile'
    ],
    techRequirements: 'Verificare fissaggio comodo sull\'arto dell\'attore con fascia in velcro a sgancio rapido.',
    leadTechnician: 'Silvia Rossi (Lead Moulage)',
    consumables: ['Stecche SAM Splint 36"', 'Bende orlate', 'Sangue sintetico arterioso', 'Guanti monouso']
  },
  {
    id: 'prot-trauma-facciale-maxillo',
    code: 'PR-MAX-07',
    name: 'Maschera Trauma Maxillo-Facciale Complesso & Epistassi Massiva',
    district: 'MAXILLO_FACCIALE',
    description: 'Maschera prostetica facciale completa con frattura tipo Le Fort II/III, deviazione massiccio facciale, perdita di sostanza ossea mandibolare e circuito sangue cavo orale/nasale per inondazione vie aeree.',
    activeFeatures: [
      'Sanguinamento massivo faringeo e cavità orale con aspirazione difficile',
      'Deformità scheletrica palpabile',
      'Ostruzione meccanica che impedisce l\'intubazione orotracheale standard'
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 4, scenarioCode: 'Scenario 6 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 7, teamIntra: 10 },
      { patientId: 5, scenarioCode: 'Scenario 1 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 8, teamIntra: 11 },
      { patientId: 15, scenarioCode: 'Scenario 15 (TCCC)', day: 3, period: 'mattina', teamExtra: 3, teamIntra: 6 },
      { patientId: 18, scenarioCode: 'Scenario 15 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 9, teamIntra: 12 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Aspirazione energica cavo orale con cannula Yankauer rigida',
      'Posizionamento cannula nasofaringea (se non sospetta frattura base cranica)',
      'Conversione immediata a Cricotirotomia chirurgica'
    ],
    techRequirements: 'Applicazione silicone dermatologico 20 minuti prima del turno; test flusso sangue orale.',
    leadTechnician: 'Silvia Rossi (Lead Moulage)',
    consumables: ['Cannule Yankauer', 'Aspiratore chirurgico portatile', 'Protesi silicone maxillo', 'Coloranti teatrali traumatologici']
  },
  {
    id: 'prot-ustioni-torace-collo',
    code: 'PR-BURN-08',
    name: 'Protesi Ustioni II & III Grado Viso/Collo/Torace a Corazza con Fumi Caldi',
    district: 'USTIONI_BLAST',
    description: 'Applicazione prostetica estesa per simulazione ustione a corazza circonferenziale con flictene, tessuti necrotici carbonizzati, peli bruciacchiati ed edema imminente delle vie aeree da inalazione fumi.',
    activeFeatures: [
      'Cute anelastica carbonizzata a corazza che riduce l\'escursione toracica',
      'Flictene a liquido siero-ematico simulato',
      'Coinvolgimento circonferenziale del collo'
    ],
    scenariosUsed: [
      { patientId: 9, scenarioCode: 'Scenario 3 (TCCC)', day: 2, period: 'pomeriggio', teamExtra: 6, teamIntra: 3 },
      { patientId: 12, scenarioCode: 'Scenario 3 (TCCC) - Replica', day: 2, period: 'pomeriggio', teamExtra: 12, teamIntra: 9 },
      { patientId: 19, scenarioCode: 'Scenario 7 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 4, teamIntra: 1 },
      { patientId: 20, scenarioCode: 'Scenario 13 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 5, teamIntra: 2 },
      { patientId: 22, scenarioCode: 'Scenario 7 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 10, teamIntra: 7 },
      { patientId: 23, scenarioCode: 'Scenario 13 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 11, teamIntra: 8 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Ispezione cavo orale per fuliggine/eritema e intubazione precoce o CRICO',
      'Escarotomia decompressiva toracica (linee ascellari e sottocostali)',
      'Calcolo fluidoterapia formula di Parkland'
    ],
    techRequirements: 'Fumo scenico pronto; applicazione lattice e gel combustione 30 min prima.',
    leadTechnician: 'Silvia Rossi / Davide Esposito',
    consumables: ['Gel idrogel ustioni (WaterJel)', 'Telini termici sterili', 'Trucco prostetico effetto carbonizzazione']
  },
  {
    id: 'prot-impalamento-addome',
    code: 'PR-IMP-09',
    name: 'Protesi Lesione da Impalamento Addomino-Pelvico con Corpo Estraneo in Situ',
    district: 'ADDOME_PELVI',
    description: 'Impalcatura anatomica addominale ancorata con corpo estraneo rigido (barra metallica / frammento legno) conficcato nell\'addome, lesione dei grossi vasi sottostanti e sanguinamento perilesionale.',
    activeFeatures: [
      'Corpo estraneo stabilmente conficcato ma suscettibile a mobilitazione traumatica',
      'Sanguinamento attivo intorno alla base d\'impalamento',
      'Simulatore pelvico associato per REBOA / Packing'
    ],
    scenariosUsed: [
      { patientId: 21, scenarioCode: 'Scenario 8 (TCCC)', day: 3, period: 'pomeriggio', teamExtra: 6, teamIntra: 3 },
      { patientId: 24, scenarioCode: 'Scenario 8 (TCCC) - Replica', day: 3, period: 'pomeriggio', teamExtra: 12, teamIntra: 9 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Stabilizzazione manuale e con rotoli di bende del corpo estraneo (MAI rimuovere)',
      'Posizionamento REBOA per controllo vascolare a monte',
      'Estrazione chirurgica controllata in laparotomia shock room'
    ],
    techRequirements: 'Verificare imbragatura di sicurezza sotto i vestiti dell\'attore per non gravare sulla pelle.',
    leadTechnician: 'Alessandro Conti / Silvia Rossi',
    consumables: ['Corpo estraneo da simulazione smussato', 'Bende rigide di fissaggio', 'Teli di stabilizzazione ad anello']
  },
  {
    id: 'prot-toracotomia-biologica-cuore',
    code: 'PR-THOR-10',
    name: 'Torace Morbido con Organi Biologici (Cuore e Polmone Maiale) per Toracotomia',
    district: 'TORACE_CUORE',
    description: 'Manichino a torace morbido con gabbia toracica incisibile (costole cartilaginee), sacco pericardico biologico con tamponamento cardiaco simulato, aorta discendente per clampaggio crociato e polmone suturabile.',
    activeFeatures: [
      'Gabbia toracica incidibile al 4°-5° spazio intercostale sinistro (Clamshell / Anterolaterale)',
      'Organi di maiale innervati di tubi sangue per massaggio cardiaco e clampaggio',
      'Pericardiocentesi / Apertura pericardica a T con rilascio tamponamento'
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Scenario 6 (TCCC)', day: 2, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 2, scenarioCode: 'Scenario 1 (TCCC)', day: 2, period: 'mattina', teamExtra: 2, teamIntra: 5 },
      { patientId: 5, scenarioCode: 'Scenario 1 (TCCC) - Replica', day: 2, period: 'mattina', teamExtra: 8, teamIntra: 11 },
      { patientId: 8, scenarioCode: 'Scenario 00 (Personalizzato)', day: 2, period: 'pomeriggio', teamExtra: 5, teamIntra: 2 },
      { patientId: 11, scenarioCode: 'Scenario 00 - Replica', day: 2, period: 'pomeriggio', teamExtra: 11, teamIntra: 8 },
      { patientId: 13, scenarioCode: 'Scenario 18 (TCCC)', day: 3, period: 'mattina', teamExtra: 1, teamIntra: 4 },
      { patientId: 16, scenarioCode: 'Scenario 18 (TCCC) - Replica', day: 3, period: 'mattina', teamExtra: 7, teamIntra: 10 }
    ],
    nightScenarioUsed: false,
    requiredProcedures: [
      'Resuscitative Thoracotomy (Clamshell / Anterolaterale sinistra)',
      'Incisione pericardica verticale anteriore al nervo frenico',
      'Massaggio cardiaco interno bimanuale',
      'Clampaggio aortico sovradiaframmatico'
    ],
    techRequirements: 'Preparazione e conservazione refrigerata tessuti biologici; sostituzione blocchi costali tra una sessione e l\'altra.',
    leadTechnician: 'Roberto Bianchi (Lead Tessuti Biologici & Toraco)',
    consumables: ['Set organi biologici suini freschi', 'Costole in resina epossidica/poliuretano incidibili', 'Divaricatore Finochietto', 'Pinza Satinsky/DeBakey']
  },
  {
    id: 'prot-blast-mci-schegge',
    code: 'PR-BLAST-11',
    name: 'Kit Protesico Esplosione di Massa & Lesioni da Blast Notturno (MCI)',
    district: 'USTIONI_BLAST',
    description: 'Set multiplo di 12 postazioni per la simulazione notturna: lacerazioni multiple da schegge metalliche, pneumotorace iperteso multiplo, traumi cranici da onda d\'urto, ostruzioni e amputazioni sub-totali da deflagrazione.',
    activeFeatures: [
      'Schegge metalliche finte conficcate nei tessuti molli',
      'Simulazione polmonare con suoni di affanno e cianosi periferica',
      'Marcatura triage fosforescente per scarsa illuminazione'
    ],
    scenariosUsed: [
      { patientId: 1, scenarioCode: 'Night Scenario Sq 1', day: 3, period: 'notturno', teamExtra: 1, teamIntra: 1 },
      { patientId: 2, scenarioCode: 'Night Scenario Sq 2', day: 3, period: 'notturno', teamExtra: 2, teamIntra: 2 },
      { patientId: 3, scenarioCode: 'Night Scenario Sq 3', day: 3, period: 'notturno', teamExtra: 3, teamIntra: 3 },
      { patientId: 4, scenarioCode: 'Night Scenario Sq 4', day: 3, period: 'notturno', teamExtra: 4, teamIntra: 4 },
      { patientId: 5, scenarioCode: 'Night Scenario Sq 5', day: 3, period: 'notturno', teamExtra: 5, teamIntra: 5 },
      { patientId: 6, scenarioCode: 'Night Scenario Sq 6', day: 3, period: 'notturno', teamExtra: 6, teamIntra: 6 },
      { patientId: 7, scenarioCode: 'Night Scenario Sq 7', day: 3, period: 'notturno', teamExtra: 7, teamIntra: 7 },
      { patientId: 8, scenarioCode: 'Night Scenario Sq 8', day: 3, period: 'notturno', teamExtra: 8, teamIntra: 8 },
      { patientId: 9, scenarioCode: 'Night Scenario Sq 9', day: 3, period: 'notturno', teamExtra: 9, teamIntra: 9 },
      { patientId: 10, scenarioCode: 'Night Scenario Sq 10', day: 3, period: 'notturno', teamExtra: 10, teamIntra: 10 },
      { patientId: 11, scenarioCode: 'Night Scenario Sq 11', day: 3, period: 'notturno', teamExtra: 11, teamIntra: 11 },
      { patientId: 12, scenarioCode: 'Night Scenario Sq 12', day: 3, period: 'notturno', teamExtra: 12, teamIntra: 12 }
    ],
    nightScenarioUsed: true,
    requiredProcedures: [
      'Triage rapido di maxiemergenza START / SALT',
      'Emostasi rapida con tourniquet tattici e wound packing',
      'Decompressione toracica e stabilizzazione vie aeree'
    ],
    techRequirements: 'Allestimento con torce tattiche, fumo scenico e simulazione suoni esplosione.',
    leadTechnician: 'Davide Esposito & Silvia Rossi',
    consumables: ['Braccialetti Triage colorati', 'Chemlight / Glowstick per identificazione', '12 Kit medicazioni trauma rapido']
  }
];
