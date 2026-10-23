# Risoluzione Accesso QR Stampati e Reindirizzamento Diretto

Piano operativo per rendere immediatamente accessibili e funzionanti su tutti i dispositivi i QR code già stampati e consegnati, eliminando il blocco di autenticazione Google e garantendo il caricamento diretto della scheda personale del partecipante.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> I QR code già stampati contengono l'URL del servizio Cloud Run (dominio `ais-dev-...run.app` o `ais-pre-...run.app`). La richiesta di login Google rilevata dagli smartphone è generata dal filtro IAM di Google Cloud Run (invocazione autenticata) quando la risorsa è impostata per consentire l'accesso solo all'account proprietario (`DinoDavidde@gmail.com`).

- **Decisione Confermata 1 (Integrità QR Stampati)**: Nessun QR verrà ristampato. La soluzione agisce a livello di policy di accesso e di routing dell'applicazione per preservare al 100% i codici già fisicamente distribuiti a discenti e faculty.
- **Decisione Confermata 2 (Comportamento Utente)**: Attivazione del caricamento automatico immediato della scheda personale del discente (visuale `DISC-xx`, squadra assegnata e rotazione TCCC / Shock Room / WS) non appena il QR viene inquadrato.
- **Decisione Confermata 3 (Zero Barriere Client)**: Nessun account Google, password o installazione richiesta sullo smartphone del discente.

---

## 1. Diagnosi del Problema Tecnico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUSSO ATTUALE CON BLOCCO                             │
└─────────────────────────────────────────────────────────────────────────────┘
  QR Stampato                         Cloud Run Gateway              Smartphone
 [ais-dev-.../?id=disc-05] ───────► [Controllo IAM Cloud Run] ───► [Chiede Login Google]
                                             │                               │
                                      (Manca allUsers)                 (Blocco Utente)
```

1. **Origine del Login Google**: L'infrastruttura Google Cloud Run dell'ambiente di sviluppo (`ais-dev`) blocca le connessioni che non dispongono dell'header di autorizzazione IAM, reindirizzando il browser mobile alla pagina di login Google.
2. **Obiettivo**: Riconfigurare la policy di invocazione (o reindirizzare sul canale pubblico `ais-pre` privo di restrizioni IAM) e strutturare l'applicazione affinché esegua il routing istantaneo alla vista del discente/tutor.

---

## 2. Architettura della Soluzione (Mantenimento QR Esistenti)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARCHITETTURA RISOLUTIVA A DOPPIO LIVELLO                 │
└─────────────────────────────────────────────────────────────────────────────┘

  LIVELLO 1: INFRASTRUTTURA CLOUD RUN (Risoluzione Login)
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. Assegnazione ruolo "Cloud Run Invoker" al principal "allUsers"       │
  │    sul servizio ais-dev-g6diswz5dmttn7dixahrpb-714965592473             │
  │ 2. In alternativa: Proxy redirect trasparente da ais-dev a ais-pre     │
  └─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
  LIVELLO 2: RUNTIME APPLICATION (Redirect Immediato Scheda Personale)
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. Parsing istantaneo pre-render dei parametri URL (id, badge, view)    │
  │ 2. Bypass totale di schermate di attesa o timeline pubblica             │
  │ 3. Attivazione automatica di DiscenteView / FacultyView / TecniciView   │
  │ 4. Persistenza locale (localStorage) per mantenere la sessione attiva   │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Piano Operativo di Esecuzione

### Fase 1: Sblocco dell'Accesso Pubblico su Google Cloud Run (Zero Login)
Per consentire a chiunque scansioni il QR di accedere senza account Google:
1. **Verifica Permessi Cloud Run**:
   - Sul progetto Google Cloud, aprire il servizio Cloud Run corrispondente ad `ais-dev-g6diswz5dmttn7dixahrpb-714965592473`.
   - Nella scheda **Sicurezza / Trigger** (o **Autorizzazioni / IAM**), aggiungere il principal:
     - **Nuovo membro / Principal**: `allUsers`
     - **Ruolo**: `Cloud Run Invoker` (`roles/run.invoker`)
   - Questo comando elimina all'istante la schermata di login Google per chiunque inquadri il QR stampato.

### Fase 2: Rafforzamento del Routing di Decodifica Rapida (`App.tsx` & `CourseContext.tsx`)
1. **Decodifica Aggressiva All'Avvio**:
   - Se l'URL contiene parametri come `id=disc-05`, `badge=DISC-05`, o `discente=DISC-05`, forzare immediatamente lo stato `currentTab = 'discente'` e `selectedDiscenteId = 'disc-5'` prima ancora che venga caricata la navbar o la timeline pubblica.
   - Inibire qualsiasi modale di benvenuto o blocco interattivo se la sessione proviene da QR scan (`isFromQR = true`).
2. **Auto-Recovery se l'Utente viene reindirizzato con sessione troncata**:
   - Memorizzare la matricola decodificata in `localStorage.setItem('last_scanned_badge', code)`: se il browser ricarica la pagina o l'utente chiude e riapre il browser, rientra direttamente nella sua scheda senza dover rifare la scansione.

### Fase 3: Fallback Tastierino Rapido di Emergenza
1. Per prevenire qualsiasi problema di fotocamera o blocco dei browser su telefoni più datati, inserire nella pagina un micro-tastierino rapido ad 1 tocco:
   - Campo *"Inserisci la tua matricola"* (es. `05` o `DISC-05`).
   - Tasto rapido che porta istantaneamente alla scheda dell'allievo con lo stesso identico stato del QR.

---

## 4. Verifica e Collaudo

1. Test di scansione dell'URL `https://ais-dev-g6diswz5dmttn7dixahrpb-714965592473.europe-west2.run.app/?view=discente&id=disc-05&badge=DISC-05&qr=1` da finestra di navigazione in incognito (senza alcun account Google attivo).
2. Verifica che non appaia la schermata di login Google.
3. Verifica che la pagina aperta mostri direttamente la vista dell'Allievo DISC-05 (Squadra BRAVO, Turno Day 2/Day 3, Ruolo e orari).
4. Verifica di non-regressione per Faculty e Tecnici.
