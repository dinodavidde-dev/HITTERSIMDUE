# HITTER 70 • Architettura Flessibilità Controllata & Modalità Offline

Questo documento riassume l'implementazione delle due funzionalità trasversali non distruttive integrate nella dashboard operativa del **Corso Avanzato di Emergenze Tattiche e Trauma Team (HITTER 70)**.

---

## 1. FLESSIBILITÀ CONTROLLATA DEL CRONOPROGRAMMA

### A1. Pulsante "PAUSA EVENTO" (⏸ / ▶ RIPRENDI)
- **Posizione**: Header della dashboard, situato accanto al controller del timer di fase.
- **Funzionamento**:
  - Al click sul pulsante ⏸ si apre il modale `PauseModal`.
  - Richiede la selezione di una Motivazione tra: *Sicurezza*, *Guasto tecnico*, *Emergenza reale*, *Altro*.
  - Se viene selezionato *Altro*, il campo note è tassativamente obbligatorio.
  - Richiede la spunta esplicita di conferma.
  - All'attivazione:
    - Lo stato dell'evento passa a `PAUSA`.
    - Tutti i timer (globale e di stazione) vengono congelati al secondo corrente.
    - Viene mostrato il badge lampeggiante `⏸ EVENTO SOSPESO` con motivo e orario.
    - L'azione viene registrata nell'Audit Trail con timestamp, utente e motivazione.
    - Lo stato di pausa è persistito in IndexedDB (`eventPause` store) e sopravvive a ricaricamenti di pagina.
  - Al click su `RIPRENDI`, i timer ripartono esattamente dal punto in cui erano stati congelati e viene registrata la ripresa nell'Audit Trail.

### A2. Modifica Slot con Ricalcolo a Cascata (`SlotActionsMenu` & `ChangePreviewModal`)
- Dalla timeline scroller (e da qualsiasi visuale operativa), ogni card di slot dispone del menu contestuale `⋯`:
  - **Estendi**: `+5 min`, `+10 min`, `+15 min`
  - **Riduci**: `−5 min`, `−10 min`
  - **Sposta a…**: Sposta in avanti (attivabile se slot futuro)
- Al click si apre il pannello **"Anteprima Impatto"** (`ChangePreviewModal`) che calcola in tempo reale:
  - Squadre impattate e relative rotazioni (TCCC, Shock Room, WS1, WS2).
  - Tutor (`FAC-01` – `FAC-12`) e Tecnici (`TECH-01` – `TECH-12`) coinvolti.
  - Delta orario e traslazione a cascata degli slot successivi della giornata.
  - Verifica automatica dei vincoli hard e soft (`validateChange`).
- L'operatore conferma con checkbox esplicita *"Ho verificato l'impatto sul cronoprogramma"* e pulsante *"Applica Modifica"*.
- All'applicazione:
  - Ricalcola dinamicamente gli orari successivi del giorno.
  - Scrive l'evento nell'Audit Log.
  - Mostra il toast di notifica e abilita il rollback rapido.

### A3. Modulo Vincoli Hard vs Soft (`scheduleValidator.ts`)
- **Vincoli Hard (bloccanti, evidenziati in rosso)**:
  - Sovrapposizione di postazioni cliniche.
  - Doppio impiego contemporaneo dello stesso tutor o tecnico.
  - Durata slot inferiore al minimo operativo (10 minuti).
  - Superamento della capienza massima delle stazioni.
- **Vincoli Soft (warning forzabili, evidenziati in giallo)**:
  - Pause didattiche o di recupero < 5 minuti.
  - Buchi o intervalli morti > 15 minuti.
  - Disallineamento orario superiore a 1 slot o sforamento oltre le 23:30.

### A4. Registro Modifiche & Audit Log (`AuditLogPanel.tsx` & `auditLogStore.ts`)
- Struttura entry: `{ id, timestamp, user, action, target, before, after, reason, synced }`
- Drawer globale *"REGISTRO MODIFICHE (AUDIT TRAIL)"* accessibile dal pulsante `AUDIT` nell'header.
- Filtri interattivi per azione (*pause, resume, extend, reduce, move, rollback, intent*) e ricerca testuale per operatore.
- Badge distintivo *"IN CODA"* per le azioni eseguite offline in attesa di sincronizzazione remota.
- Ispezione dettagliata del diff prima/dopo con timestamp formattato.

### A5. Rollback Rapido (`QuickRollbackToast.tsx` & Snapshot System)
- Prima di applicare qualsiasi variazione, viene salvato uno snapshot completo dello stato in IndexedDB (`scheduleSnapshots`).
- Compare automaticamente un toast fluttuante con countdown a barre di 60 secondi e pulsante *"ANNULLA MODIFICA (ROLLBACK)"*.
- Se premuto, ripristina lo stato originale in 1 click, aggiorna la cache e logga l'annullamento nell'audit trail.
- Gli snapshot rimangono archiviati e ripristinabili anche dal registro Audit.

---

## 2. MODALITÀ OFFLINE CON SINCRONIZZAZIONE DIFFERITA

### B1. PWA & Service Worker Caching
- Configurato con `vite-plugin-pwa` e Workbox.
- `registerType: 'autoUpdate'`.
- Cache precache dell'App Shell (HTML, JS, CSS, icone SVG, Web App Manifest).
- Cache runtime `StaleWhileRevalidate` per eventuali chiamate API di rete.
- `manifest.webmanifest` conforme PWA con nome "HITTER", icone, standalone mode e colore tema scuro (`#09090b`).

### B2. Pre-load Dati Critici & IndexedDB (`dataPreloader.ts` & `db.ts`)
- Storage relazionale client-side basato su **Dexie (IndexedDB)** (nessun uso di localStorage per dati strutturati).
- Al primo avvio scarica e memorizza:
  - Cronoprogramma completo dei 2 giorni addestrativi (`cachedSlots`).
  - Matrice assegnazioni e rotazioni cliniche per i 60 discenti e le 12 squadre.
  - Anagrafica Faculty (`FAC-01` – `FAC-12`) e Tecnici (`TECH-01` – `TECH-12`).
  - Stazioni cliniche (TCCC, Shock Room, WS1, WS2) e checklist SBAR.
- Banner discreto di progresso *"Preparazione modalità offline in corso"* visualizzato durante il caricamento.

### B3. Indicatore di Stato Rete (`NetworkStatusBadge.tsx`)
- Badge dinamico a tre stati presente nell'header:
  - 🟢 **ONLINE**: *"Ultima sync: HH:MM"* (verde brillante con ping live).
  - 🟡 **SYNC**: *"Sincronizzazione in corso…"* (ambra pulsante).
  - 🔴 **OFFLINE**: *"N azioni in coda"* (rosso vivo).
- Al click apre la scheda diagnostica di dettaglio con:
  - Stato di connessione istantaneo.
  - Orario dell'ultima sincronizzazione riuscita.
  - Conteggio delle azioni accodate localmente.
  - Spiegazione chiara delle funzionalità operative offline vs online.
  - Pulsante per forzare la sincronizzazione manuale immediata.

### B4. Coda di Sincronizzazione (`syncQueue.ts`)
- Ogni azione svolta offline viene registrata nello store IndexedDB `syncQueue` con:
  `{ id, type, payload, createdAt, userId, status: 'pending' }`
- Supporta:
  - `handover_sbar`: Handover clinici 1:1 barellati.
  - `note`: Note cliniche o logistiche dei tutor/regia.
  - `presence_toggle`: Registrazione presenze e verifiche checklist.
  - `intent_schedule_change`: Intenzioni di modifica oraria salvate come proposte.
- Al ripristino della connettività (`navigator.onLine` o storage event):
  - Esegue il replay sequenziale ordinato cronologicamente.
  - Applica la strategia *Last-Write-Wins (LWW)* per note e handover clinici.
  - Separa le modifiche al cronoprogramma in intenzioni (`ScheduleIntent`), che vengono sottoposte alla Regia nel pannello di revisione (`IntentReviewPanel`).

### B5. Riconciliazione & Risoluzione Conflitti (`SyncSummaryModal.tsx`)
- Nel caso di disallineamento tra stato locale e stato remoto durante la riconciliazione:
  - Mostra il modal di revisione conflitti con visualizzazione side-by-side (diff tra versione locale e remota).
  - Pulsanti espliciti: *"Mantieni Locale"* vs *"Mantieni Remoto"*.
  - Nessuna perdita silenziosa di dati.

### B6. Banner Dati Obsoleti (`OfflineReadOnlyBanner.tsx`)
- Se il client opera offline e i dati locali non sono stati sincronizzati da oltre 30 minuti:
  - Mostra un banner persistente in cima alla pagina con avviso di sola lettura:
    *"Dati del cronoprogramma non aggiornati da oltre 30 minuti. Le modifiche al piano sono temporaneamente disabilitate finché non viene ristabilita la connessione."*

---

## 3. VERIFICA DEI 10 CRITERI DI ACCETTAZIONE

1. **Pausa evento e congelamento**: Cliccare ⏸ nell'header, scegliere una motivazione, inserire note se richiesto e confermare. I timer si arrestano e compare il badge `PAUSA`. Al click su `RIPRENDI`, il corso riparte.
2. **Persistenza pausa al reload**: Mettere in pausa l'evento e ricaricare la pagina con `F5` / `Ctrl+R`. Lo stato di pausa e i secondi residui rimangono congelati grazie a Dexie IndexedDB.
3. **Modifica slot e anteprima impatto**: Cliccare `⋯` su uno slot e selezionare `+10 min`. Si apre `ChangePreviewModal` con la matrice delle squadre, tutor e tecnici impattati e i controlli dei vincoli.
4. **Vincoli hard bloccanti**: Tentare una modifica che generi sovrapposizione o riduca la durata sotto i 10 minuti. Il pulsante `Applica` è disabilitato e l'errore compare in rosso.
5. **Applicazione e ricalcolo a cascata**: Confermare una modifica valida. Gli orari degli slot successivi vengono traslati a cascata e viene emesso l'evento di notifica.
6. **Rollback rapido entro 60s**: Dopo l'applicazione di una modifica, compare in basso a destra il toast con barra progressiva a 60 secondi. Cliccare su `Annulla Ultima Modifica` per ripristinare all'istante lo stato precedente.
7. **Audit Log consultabile**: Cliccare sul pulsante `AUDIT` nell'header per aprire il registro. Tutte le azioni (pause, estensioni, rollback) sono visualizzabili con timestamp e dettagli diff.
8. **Funzionamento offline (PWA + App Shell)**: Simulando l'assenza di rete (DevTools -> Offline), l'app continua a caricarsi e funzionare regolarmente dalla cache del Service Worker.
9. **Coda offline e sincronizzazione**: Con rete assente, registrare note o variazioni. Il badge nell'header passa a 🔴 OFFLINE con il conteggio delle azioni in coda. Al ripristino della rete, le azioni vengono sincronizzate in automatico.
10. **Sincronizzazione Countdown MASCAL**: Il countdown MASCAL visualizzato in Regia rispetta tassativamente l'apertura gate e l'orario ufficiale previsto (21:00 - 23:00 Day 2).
