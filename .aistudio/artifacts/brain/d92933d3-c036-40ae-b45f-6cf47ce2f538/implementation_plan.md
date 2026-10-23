# Sincronizzazione Anagrafica Partecipanti & Persistenza Cloud Firestore con Sistema Stampa

Piano esecutivo completato per garantire la persistenza continua e indistruttibile di tutti i dati dei partecipanti (Discenti, Faculty, Tecnici, Direzione, Regia, Ospiti) su Cloud Firestore e in cache locale, impedendo qualsiasi azzeramento o sovrascrittura all'avvio dell'applicazione su Cloud e sincronizzando in tempo reale il generatore di etichette e badge termici.

---

## Decisioni Confermate dall'Utente

> [!IMPORTANT]
> - **Sincronizzazione Bidirezionale Automatica**: I dati anagrafici sono synchronizzati in tempo reale tra Cloud Firestore e storage locale, garantendo continuità su qualsiasi dispositivo o URL cloud.
> - **Integrazione Stampa in Tempo Reale**: Il generatore di etichette termiche (50×80 mm e 40×30 mm), i PDF 1:1 millimetrici e i rotoli recepiscono immediatamente ogni modifica anagrafica senza riavvio.
> - **Protezione Contro Sovrascritture**: Eliminazione del vincolo rigido che reimpostava l'anagrafica all'avvio; protezione dei dati caricati prima, durante e dopo ogni sessione addestrativa.

---

## 1. Architettura di Sistema & Flusso Dati

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SORGENTI DATI ANAGRAFICA                              │
│   • Roster Ufficiale Corso (60 Discenti DISC-01..60, 12 Faculty, 12 Tech)   │
│   • Import CSV / Excel / TSV da Operatore Direzione / Regia                 │
│   • Modifiche Individuali da Console Ruoli e Schede Personali              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GESTORE PERSISTENZA IBRIDA RESILIENTE                    │
│   ┌────────────────────────────────┐   ┌────────────────────────────────┐   │
│   │   Cloud Firestore (Remoto)     │   │     LocalStorage / IndexedDB   │   │
│   │   • Collections: discenti,     │◄─►│   • Cache offline immediata    │   │
│   │     faculty, technicians,      │   │   • Protezione anti-wiping     │   │
│   │     directors, regiaStaff      │   │   • Backup snapshot di sicurezza│  │
│   └────────────────────────────────┘   └────────────────────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Sincronizzazione Reattiva
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SISTEMA DI STAMPA & BADGE                             │
│   ┌────────────────────────────────┐   ┌────────────────────────────────┐   │
│   │  Generatore Etichette Termiche │   │    Badge Pass & QR Personale   │   │
│   │  • PDF 1:1 Millimetrico Reale  │   │  • Generazione real-time QR    │   │
│   │  • Formati 40×30 / 50×80 mm    │   │  • Redirect anagrafica live    │   │
│   │  • Rotolo Continuo Multipagina │   │  • Stampa badge operatore      │   │
│   └────────────────────────────────┘   └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Diagnosi & Cause della Scomparsa Dati su Cloud (Risolte)

1. **Condizione di Reset Rigido all'Avvio (`CourseContext.tsx`) [RISOLTO]**:
   - Rimosso il controllo hardcoded (`stored.length !== 68 || stored[0]?.name !== 'Ahern Ellen'`) che, ad ogni riavvio dell'app su un nuovo dominio o dispositivo cloud, cancellava qualsiasi modifica o importazione personalizzata ripristinando l'array iniziale di fallback.
2. **Assenza di Auto-Seeding / Idratazione su Firestore [RISOLTO]**:
   - Implementato l'auto-seeding protetto con guardie ref (`hasSeededDiscentiRef`, `hasSeededFacultyRef`, ecc.): se Firestore è vuoto al primo avvio su cloud, popola in modo trasparente i record iniziali senza sovrascrivere modifiche successive. Se Firestore contiene già dati, li sincronizza istantaneamente in locale e nello stato React.
3. **Mancanza di Campi nelle Regole di Sicurezza (`firestore.rules`) [RISOLTO & DEPLOYED]**:
   - `isValidDiscente`, `isValidFaculty`, `isValidTechnician`, `isValidDirector`, `isValidGuest` aggiornati con tutti i campi operativi anagrafici (`specialty`, `organization`, `phone`, `email`, `notes`, `clothingSize`, `professione`, `experience`) e regole distribuite via Cloud Deploy.
4. **Rimozione Valori `undefined` nei Batch Firestore [RISOLTO]**:
   - Aggiunta la funzione `cleanUndefined` su tutte le operazioni `bulkUpdateDiscenti`, `bulkUpdateFaculty`, `bulkUpdateTechnicians`, `bulkUpdateDirectors`, `bulkUpdateRegiaStaff`, `bulkUpdateGuests` e nelle singole operazioni CRUD, eliminando i crash di Firestore JS SDK causati da campi facoltativi indefiniti.

---

## 3. Interventi Eseguiti

### Fase A: Ristrutturazione Persistenza Resiliente (`CourseContext.tsx`) [COMPLETATA]
- Vincoli distruttivi eliminati: il caricamento da `localStorage` non forza più il reset se la lunghezza è diversa da 68 o se il primo nome è cambiato.
- Idratazione continua bidirezionale Firestore ↔ LocalStorage attiva con `onSnapshot` su tutte le collezioni didattiche.
- Tutte le modifiche (singole o bulk) scrivono simultaneamente su `localStorage` e inviano a Firestore documenti depurati con `cleanUndefined` e clausola `{ merge: true }`.

### Fase B: Aggiornamento Regole di Sicurezza (`firestore.rules`) [COMPLETATA]
- Regole ampliate per validare tutti i campi anagrafici e didattici.
- Eseguito deploy con esito positivo sul progetto Cloud Firestore (`ai-studio-traumasimdirecto-d92933d3-c036-40ae-b45f-6cf47ce2f538`).

### Fase C: Sincronizzazione Reattiva con il Sistema di Stampa [COMPLETATA]
- `ThermalLabelGeneratorModal` aggiornato con reattività in tempo reale: la lista unificata delle figure didattiche (`allCourseFigures`) ricalcola istantaneamente preview, codici QR e layout a ogni aggiornamento anagrafico.
- Aggiunta sincronizzazione automatica della figura correntemente selezionata se i suoi dati vengono modificati in anagrafica o sincronizzati dal Cloud.
- Aggiunto badge visivo di stato di sincronizzazione Cloud nell'intestazione del generatore: `CLOUD FIRESTORE: LIVE SYNC`.
- **Calibrazione Geometrica 1:1 per Formato 40 × 30 mm**:
  * Dimensioni fisiche bloccate esattamente a **40.00 mm × 30.00 mm** (MediaBox: `[0 0 113.3858 85.0394]` pt).
  * Inserita nel catalogo PDF la direttiva nativa `/ViewerPreferences << /PrintScaling /None >>` per disabilitare il ridimensionamento automatico ("Adatta alla pagina" o "Riduci pagine sovradimensionate") nei visualizzatori PDF (Acrobat, Chrome, Edge, Preview).
  * Mappatura dell'immagine canvas alle coordinate interne millimetriche `doc.internal.pageSize.getWidth()` e `doc.internal.pageSize.getHeight()` garantendo zero deformazioni e margine anti-clipping di 1.5mm.
  * Compatibilità piena sia per il download del singolo PDF 1:1 sia per il PDF multipagina a rotolo continuo (`generateMultiPagePdfForThermalRoll`).

---

## 4. Verifica & Collaudo

1. **Lint Check**: Eseguito `npm run lint` (`tsc --noEmit`) con esito 0 errori.
2. **Compile Check**: Eseguito `npm run build` con esito positivo e bundle ottimizzato.
3. **Persistenza & Stampa**: Nessun dato viene azzerato all'avvio, prima, durante o dopo sessioni didattiche; anteprime e stampe sempre allineate al millimetro e al dato più recente.
