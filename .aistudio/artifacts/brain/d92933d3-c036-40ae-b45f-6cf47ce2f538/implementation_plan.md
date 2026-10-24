# Piano di Rimodulazione Didattica e Operativa: Documento Fonte di Verità DEEPHITTER-VMK1 REV3

Rimodulazione integrale di tutti i contenuti clinico-organizzativi del Corso Avanzato di Emergenze Tattiche e Trauma Team sulla base del documento ufficiale `DEEPHITTERVMK1_REV3_HITTER70_-_Foglio1_abe179c1.csv`. Il piano garantisce la **preservazione rigorosa della timeline oraria e dei blocchi da 90 minuti esistenti**, aggiornando in profondità gli Scenari S1–S8 (Day 2 e Day 3), i Callsign tattici delle 12 Squadre, l'organico Faculty, le assegnazioni dei simulatori, e l'integrazione di Attori e Truccatori (Moulage) sia nelle schede paziente sia in un pannello di coordinamento Regia dedicato.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Timeline Invariata & Rimodulazione Clinica Integrale**: In conformità alle direttive dell'utente ("*prendi questo documento come fonte di verita eccetto che per gli orari, mantieni anzi l'attuale timeline ma rimodula tutte le funzioni del corso associate ai contenuti del documento*") e alle risposte di chiarimento:
> 1. **Timeline**: I blocchi orari da 90 minuti (con slot rigidi da 15 minuti, Standby Attivo nei Box a T -15 min e Handover 1:1 barellato tassativo al minuto :30) rimangono identici.
> 2. **Faculty**: L'organico dei docenti viene aggiornato con i 15 nominativi del documento (JAN, HUGO, KEVIN, LJUBA, XAVIER, DIRK, PIETER, JUSTIN, PORTIA, RUDO, MARISSA, LISA, ANDREU, GUILLEM, SEAN).
> 3. **Callsign Squadre**: Le 12 squadre vengono denominate con il formato combinato: `[CALLSIGN] (Squadra X - [Gruppo])`, ad esempio `EAGLE (Squadra 1 - Alpha)`.
> 4. **Attori e Trucco (Moulage)**: Vengono visualizzati sia all'interno di ogni scheda paziente sia in un nuovo pannello di controllo Regia & Moulage.

- **Decisione Confermata 1**: Roster Faculty esteso e aggiornato con i 15 profili specialistici del documento.
- **Decisione Confermata 2**: 12 Squadre identificate da Callsign tattico + appartenenza a Gruppo e Squadra numerica.
- **Decisione Confermata 3**: Aggiornamento delle 8 macro-rotazioni di scenario (S1–S8) con le esatte procedure cliniche (cricotomia HAZMAT, decompressione PNX, eviscerato, trauma pediatrico TBI/gunshot, amputazione, frattura pelvica, collo sanguinante, toracostomia, toracotomia resuscitativa, REBOA, drenaggio toracico).
- **Decisione Confermata 4**: Roster Direttori, Regia, Tecnici (7 nominativi esatti), 9 Attori e 6 Truccatori sincronizzati con il documento.

---

## 1. Overview & Core Concept

- **Cosa Fa**: Allinea l'intera applicazione al documento master `DEEPHITTERVMK1_REV3_HITTER70`. Quando un utente, tutor, regista o direttore interroga il sistema o naviga nelle viste (Timeline, Pazienti, Squadre, Anagrafica, Regia), ogni scenario clinico riflette esattamente le procedure, i docenti incaricati, gli attori feriti e i requisiti di simulazione/moulage del documento master.
- **Destinatari**: Direzione del Corso, Centrale Regia, Faculty clinica, Team Tecnico e Trucco, 60 Discenti (DISC-01 – DISC-60).
- **Valore Chiave**: Totale coerenza operativa tra i fogli di pianificazione della direzione e il sistema gestionale su tablet/desktop, eliminando ogni disallineamento nei momenti critici degli scenari ad alta fedeltà.

---

## 2. User Experience & Visual Design

- **Identificazione Squadre nel Sistema**:
  - In ogni vista (Schede Paziente, Rotazioni, Timeline, Anagrafica, Filtri), la squadra è indicata chiaramente:
    - *Gruppo ALPHA*: `EAGLE (Squadra 1 - Alpha)`, `VIPER (Squadra 2 - Alpha)`, `TITAN (Squadra 3 - Alpha)`
    - *Gruppo BRAVO*: `SPARTAN (Squadra 4 - Bravo)`, `WOLF (Squadra 5 - Bravo)`, `SENTINEL (Squadra 6 - Bravo)`
    - *Gruppo CHARLIE*: `FALCON (Squadra 7 - Charlie)`, `RANGER (Squadra 8 - Charlie)`, `PHOENIX (Squadra 9 - Charlie)`
    - *Gruppo DELTA*: `COBRA (Squadra 10 - Delta)`, `RAPTOR (Squadra 11 - Delta)`, `THUNDER (Squadra 12 - Delta)`
- **Schede Pazienti e Scenari (Pazienti 1–24)**:
  - Header paziente con evidenza di: Procedura Clinica Primaria, Callsign Squadra TCCC, Callsign Squadra Shock Room, Docenti Faculty assegnati, Attore associato con specificità di trauma e Truccatore responsabile.
  - Box Handover T+30' con timing SBAR calibrato sul minuto :30.
- **Pannello Regia & Coordinamento Moulage**:
  - Vista tabellare / matrice rapida per la Regia e il Team Trucco:
    - Tabella Scenari S1–S8 con filtri rapidi per Giorno (Day 2 / Day 3) e Periodo (Mattina / Pomeriggio).
    - Monitoraggio stato attori (STANDBY, IN PREPARAZIONE, PRONTO AL T0, IN SCENARIO, RESET).
    - Tabella rapida delle 12 procedure cliniche con elenco degli attori certificati e ruotati.
- **Stile Visivo**:
  - Interfaccia tattico-sanitaria pulita, contrasto WCAG AA, tipografia rigorosa senza pill-boxes decorative statiche, con pulsanti operativi chiari per filtri e avanzamento stati.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisione 1: Struttura Dati Scenari S1–S8**:
  - *Scelta*: Codificare esplicitamente gli scenari S1–S8 sia nei `SimulatorPatient` (24 pazienti totali: 3 pazienti per ciascuno degli 8 scenari) sia nel cronoprogramma della Timeline.
  - *Motivazione*: Mantiene sincronizzati i report PDF, le schede paziente, l'assistente AI e le checklist tecniche.
- **Decisione 2: Organico Faculty a 15 Docenti**:
  - *Scelta*: Aggiornare `INITIAL_FACULTY` con i 15 nomi del documento (JAN, HUGO, KEVIN, LJUBA, XAVIER, DIRK, PIETER, JUSTIN, PORTIA, RUDO, MARISSA, LISA, ANDREU, GUILLEM, SEAN) mantenendo i codici univoci `FAC-01` – `FAC-15`. Negli scenari in cui 2 o 3 docenti operano insieme su una postazione (es. `JAN/HUGO/KEVIN`), il sistema associa l'intero team docente.
- **Decisione 3: Organico Attori & Trucco**:
  - *Scelta*: Aggiornare l'anagrafica attori con i 9 attori ufficiali (`ARON`, `MARIO ROSSI`, `MANUEL`, `ELISA DB`, `JANO`, `MICHELE`, `ELISA F`, `ANGELICA`, `TINA`) e il team trucco con i 6 truccatori (`SILVIA CASTELLUCCI`, `ASIA PROIETTI`, `ALESSANDRA AMICI`, `CHIARA COLACE`, `ALICE ARMENI`, `RAFFAELLA DEL BENE`).
- **Decisione 4: Staff Direzione, Regia e Tecnici**:
  - *Direttori*: MAQSHUDA KAJEE, MANSOOR KHAN, CARMINE DELLA VELLA.
  - *Regia*: DINO DAVIDDE, MARCO MARROCCO.
  - *Tecnici*: LUCA MONTAGNA, FABIO ANTONUCCI, DARIO ZAMPELLA, LUCA S., GIOVANNI, CLAUDIO BUCCIAERELLI, LUCIANO STENTELLA (+ presidi postazioni).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│               FONTE DI VERITÀ (DEEPHITTER REV3 CSV)                    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             DATA LAYER (src/data/initialData.ts & Types)               │
│  ├─ TEAMS: 12 Squadre con Callsign + Gruppo                            │
│  ├─ FACULTY: 15 Docenti (FAC-01 .. FAC-15)                             │
│  ├─ PATIENTS (1-24): S1-S8 Procedure, Attori, Trucco, Faculty          │
│  ├─ STAFF: Direttori (3), Regia (2), Tecnici (7+), Trucco (6)          │
│  └─ ACTORS: 9 Attori con ruoli di trauma specifici                     │
└──────────────────┬───────────────────────────────┬─────────────────────┘
                   │                               │
                   ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       TIMELINE & COURSE CONTEXT      │  │    VIEWS & INTERACTIVE UI    │
│  ├─ Blocchi 90 min (invariati)       │  │  ├─ TimelineView             │
│  ├─ Handover T+30' sincronizzato     │  │  ├─ PatientDetailModal       │
│  ├─ Matrice Scenari S1-S8            │  │  ├─ RegiaMoulageMatrixView   │
│  └─ Assistente AI (Prompt & Context) │  │  └─ AnagraficaView           │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Dettaglio Matrice Scenari Clinici S1–S8

1. **S1 (Day 2 Mattina)**:
   - *TCCC*:
     - P1: Cricotomia d'urgenza HAZMAT | Faculty: JAN, HUGO, KEVIN | Squadra: EAGLE (Alpha) | Attore: JANO
     - P2: Decompressione PNX con ago | Faculty: LJUBA, XAVIER | Squadra: VIPER (Alpha) | Attore: MICHELE
     - P3: Gestione eviscerato | Faculty: DIRK, PIETER | Squadra: TITAN (Alpha) | Attore: ELISA F
   - *Shock Room (Handover T+30')*:
     - P1: Toracostomia | Faculty: JUSTIN, PORTIA | Squadra: FALCON (Charlie) | Attore: JANO
     - P2: Toracotomia resuscitativa | Faculty: RUDO, MARISSA, LISA | Squadra: RANGER (Charlie) | Attore: MANUEL
     - P3: REBOA | Faculty: ANDREU, GUILLEM, SEAN | Squadra: PHOENIX (Charlie) | Attore: TINA

2. **S2 (Day 2 Mattina)**:
   - *TCCC*:
     - P4: Cricotomia d'urgenza HAZMAT | Faculty: JAN, HUGO, KEVIN | Squadra: SPARTAN (Bravo) | Attore: JANO
     - P5: Decompressione PNX con ago | Faculty: LJUBA, XAVIER | Squadra: WOLF (Bravo) | Attore: MICHELE
     - P6: Gestione eviscerato | Faculty: DIRK, PIETER | Squadra: SENTINEL (Bravo) | Attore: ELISA F
   - *Shock Room (Handover T+30')*:
     - P4: Toracostomia | Faculty: JUSTIN, PORTIA | Squadra: COBRA (Delta) | Attore: JANO
     - P5: Toracotomia resuscitativa | Faculty: RUDO, MARISSA, LISA | Squadra: RAPTOR (Delta) | Attore: MANUEL
     - P6: REBOA | Faculty: ANDREU, GUILLEM, SEAN | Squadra: THUNDER (Delta) | Attore: ELISA DB

3. **S3 (Day 2 Pomeriggio)**:
   - *TCCC*:
     - P7: Trauma pediatrico TBI / Gunshot addome | Faculty: DIRK, PORTIA | Squadra: FALCON (Charlie) | Attore: MARIO ROSSI
     - P8: Decompressione PNX con ago | Faculty: KEVIN, GUILLEM, JUSTIN | Squadra: RANGER (Charlie) | Attore: MICHELE
     - P9: Amputazione d'arto | Faculty: RUDO, ANDREU | Squadra: PHOENIX (Charlie) | Attore: AARON
   - *Shock Room (Handover T+30')*:
     - P7: Gestione avanzata pediatrica (PED) | Faculty: XAVIER, LJUBA, JAN | Squadra: EAGLE (Alpha) | Attore: MARIO ROSSI
     - P8: Drenaggio toracico | Faculty: PIETER, LISA | Squadra: VIPER (Alpha) | Attore: MANUEL
     - P9: REBOA | Faculty: MARISSA, HUGO, SEAN | Squadra: TITAN (Alpha) | Attore: AARON

4. **S4 (Day 2 Pomeriggio)**:
   - *TCCC*:
     - P10: Trauma pediatrico TBI / Gunshot addome | Faculty: DIRK, PORTIA | Squadra: COBRA (Delta) | Attore: MARIO ROSSI
     - P11: Decompressione PNX con ago | Faculty: KEVIN, GUILLEM, JUSTIN | Squadra: RAPTOR (Delta) | Attore: ELISA F
     - P12: Amputazione d'arto | Faculty: RUDO, ANDREU | Squadra: THUNDER (Delta) | Attore: AARON
   - *Shock Room (Handover T+30')*:
     - P10: Gestione avanzata pediatrica (PED) | Faculty: XAVIER, LJUBA, JAN | Squadra: SPARTAN (Bravo) | Attore: MARIO ROSSI
     - P11: Drenaggio toracico | Faculty: PIETER, LISA | Squadra: WOLF (Bravo) | Attore: TINA
     - P12: REBOA | Faculty: MARISSA, HUGO, SEAN | Squadra: SENTINEL (Bravo) | Attore: AARON

5. **S5 (Day 3 Mattina)**:
   - *TCCC*:
     - P13: Frattura pelvica & colpi d'arma pediatrici | Faculty: GUILLEM, LISA | Squadra: EAGLE (Alpha) | Attore: MARIO ROSSI
     - P14: Decompressione PNX con ago | Faculty: LJUBA, DIRK | Squadra: VIPER (Alpha) | Attore: MANUEL
     - P15: Collo sanguinante | Faculty: KEVIN, JUSTIN, JAN | Squadra: TITAN (Alpha) | Attore: ELISA DB
   - *Shock Room (Handover T+30')*:
     - P13: Gestione avanzata pediatrica | Faculty: XAVIER, HUGO | Squadra: FALCON (Charlie) | Attore: MARIO ROSSI
     - P14: Toracotomia resuscitativa | Faculty: MARISSA, SEAN, PORTIA | Squadra: RANGER (Charlie) | Attore: JANO
     - P15: REBOA | Faculty: RUDO, ANDREU, PIETER | Squadra: PHOENIX (Charlie) | Attore: ANGELICA

6. **S6 (Day 3 Mattina)**:
   - *TCCC*:
     - P16: Frattura pelvica & colpi d'arma pediatrici | Faculty: GUILLEM, LISA | Squadra: SPARTAN (Bravo) | Attore: MARIO ROSSI
     - P17: Decompressione PNX con ago | Faculty: LJUBA, DIRK | Squadra: WOLF (Bravo) | Attore: MICHELE
     - P18: Collo sanguinante | Faculty: KEVIN, JAN, JUSTIN | Squadra: SENTINEL (Bravo) | Attore: ELISA F
   - *Shock Room (Handover T+30')*:
     - P16: Gestione avanzata pediatrica | Faculty: XAVIER, HUGO | Squadra: COBRA (Delta) | Attore: MARIO ROSSI
     - P17: Toracotomia resuscitativa | Faculty: MARISSA, SEAN, PORTIA | Squadra: RAPTOR (Delta) | Attore: JANO
     - P18: REBOA | Faculty: RUDO, ANDREU, PIETER | Squadra: THUNDER (Delta) | Attore: ANGELICA

7. **S7 (Day 3 Pomeriggio)**:
   - *TCCC*:
     - P19: Cricotomia d'urgenza | Faculty: PORTIA, JAN | Squadra: FALCON (Charlie) | Attore: MICHELE
     - P20: Cricotomia d'urgenza | Faculty: LISA, KEVIN | Squadra: RANGER (Charlie) | Attore: ELISA F
     - P21: Amputazione d'arto | Faculty: DIRK, LJUBA | Squadra: PHOENIX (Charlie) | Attore: ARON
   - *Shock Room (Handover T+30')*:
     - P19: Toracotomia resuscitativa | Faculty: MARISSA, HUGO, SEAN | Squadra: EAGLE (Alpha) | Attore: JANO
     - P20: Toracotomia resuscitativa | Faculty: RUDO, XAVIER, PIETER | Squadra: VIPER (Alpha) | Attore: ELISA DB
     - P21: REBOA | Faculty: ANDREU, GUILLEM, JUSTIN | Squadra: TITAN (Alpha) | Attore: ARON

8. **S8 (Day 3 Pomeriggio)**:
   - *TCCC*:
     - P22: Cricotomia d'urgenza | Faculty: PORTIA, JAN | Squadra: COBRA (Delta) | Attore: MANUEL
     - P23: Cricotomia d'urgenza | Faculty: LISA, KEVIN | Squadra: RAPTOR (Delta) | Attore: ANGELICA
     - P24: Amputazione d'arto | Faculty: DIRK, LJUBA | Squadra: THUNDER (Delta) | Attore: ARON
   - *Shock Room (Handover T+30')*:
     - P22: Toracotomia resuscitativa | Faculty: MARISSA, HUGO, SEAN | Squadra: SPARTAN (Bravo) | Attore: MICHELE
     - P23: Toracotomia resuscitativa | Faculty: RUDO, XAVIER, PIETER | Squadra: WOLF (Bravo) | Attore: ELISA F
     - P24: REBOA | Faculty: ANDREU, GUILLEM, JUSTIN | Squadra: SENTINEL (Bravo) | Attore: ARON

---

## 5. Piano dei Cambiamenti nel Codice

1. **`src/types.ts`**:
   - Aggiungere campo opzionale `callsign?: string` a `Team`.
   - Supportare array di docenti assegnati o stringa multiruolo per `assignedFacultyNames?: string[]` nei simulatori e scenari.
   - Sincronizzare tipi per Attori e Truccatori con le nuove specialità e procedure.

2. **`src/data/initialData.ts` & `src/data/deephitterTruccoData.ts`**:
   - Aggiornare `INITIAL_DIRECTORS` con i 3 Direttori del documento.
   - Aggiornare `INITIAL_REGIA_STAFF` con DINO DAVIDDE e MARCO MARROCCO.
   - Aggiornare `INITIAL_TECHNICIANS` con i 7 tecnici indicati nel documento + presidi complementari.
   - Aggiornare `INITIAL_FACULTY` con i 15 docenti.
   - Aggiornare `INITIAL_TEAMS` con i Callsign tattici (`EAGLE`, `VIPER`, `TITAN`, `SPARTAN`, `WOLF`, `SENTINEL`, `FALCON`, `RANGER`, `PHOENIX`, `COBRA`, `RAPTOR`, `THUNDER`).
   - Aggiornare `DEEPHITTER_ACTORS` (9 attori) e `DEEPHITTER_MAKEUP_ARTISTS` (6 truccatrici).
   - Riscrivere integralmente `INITIAL_SIMULATOR_PATIENTS` (Pazienti 1–24) integrando le esatte procedure S1–S8, i docenti associati, gli attori, i truccatori e le relative squadre.

3. **`src/components/regia/RegiaMoulageCoordinationModal.tsx` o Tab Regia**:
   - Creare o aggiornare il componente per la visualizzazione matriciale rapida degli Scenari S1–S8, con associazione immediata Attore - Truccatore - Procedura e monitoraggio dello stato di preparazione per la regia.

4. **`src/components/patients/PatientDetailModal.tsx`**:
   - Mostrare chiaramente il Callsign combinato della squadra, i docenti specifici coinvolti, l'attore e il truccatore di riferimento per la procedura.

5. **Verifica & Compilazione**:
   - Eseguire `compile_applet` e validare l'integrità TypeScript.
