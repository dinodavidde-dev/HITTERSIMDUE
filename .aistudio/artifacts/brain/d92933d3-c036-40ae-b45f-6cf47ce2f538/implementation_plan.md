# Profilo Dedicato Labelnize PM240 & Ottimizzazione Stampa 40 × 30 mm (4 × 3 cm)

Piano di implementazione per verificare e garantire la piena compatibilità hardware e software tra il sistema di generazione etichette e la stampante termica portatile **Labelnize PM240** con rotoli termoadesivi da **40 × 30 mm (4 × 3 cm)**, ottimizzando la risoluzione nativa a 203 DPI, i margini di sicurezza anti-ritaglio e il flusso di stampa da PC via cavo USB.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> In base alle risposte fornite nella fase di chiarimento:
> - **Metodo di Collegamento**: Cavo USB da PC con driver termico desktop (Windows / macOS).
> - **Profilo Hardware Dedicato**: Aggiunta di un preset rapido con un click **"LABELNIZE PM240 (203 DPI / 40×30 mm)"** che applica automaticamente la densità nativa della testina (8 punti/mm), l'orientamento orizzontale del rotolo e margini di sicurezza anti-ritaglio (1.5 mm).

---

### 1. Overview & Core Concept

- **Che cosa fa**: Integra un profilo di calibrazione dedicato per la stampante termica **Labelnize PM240** sia nella console di stampa batch di Regia (`RegiaBatchLabelPrintView`) sia nel generatore di singole etichette (`ThermalLabelGeneratorModal`).
- **Compatibilità Fisica 4cm × 3cm**:
  - Risoluzione nativa hardware: **203 DPI (8 dpmm)**.
  - Dimensioni in pixel a 203 DPI: **320 pixel (larghezza 40 mm) × 240 pixel (altezza 30 mm)**.
  - Margine di sicurezza anti-ritaglio: Spostamento del riquadro esterno da 0.6 mm a **1.5 mm (12 pixel a 203 DPI)**, proteggendo il codice QR e le diciture dal dead-zone fisico del rullo e dal sensore di gap.
- **Flusso Stampa USB da PC**:
  - Foglio di stile CSS `@page { size: 40mm 30mm; margin: 0; }` ottimizzato per i driver termici desktop (eliminazione di margini di default del browser che scalerebbero l'etichetta).
  - Esportazione PDF multipagina con viewport millimetrico esatto `[40, 30] mm`.

---

### 2. User Experience & Visual Design

- **Flussi Utente**:
  1. *Selezione Profilo Rapido*: Nella barra di configurazione, oltre ai pulsanti manuali `50×80` e `40×30`, compare il pulsante evidenziato **"LABELNIZE PM240 (40×30 mm • 203 DPI)"**.
  2. *Calibrazione Automatica Istantanea*:
     - Imposta automaticamente formato `40x30`, orientamento `landscape`, densità `203 DPI` e profilo bordi anti-ritaglio.
     - Mostra una notifica visiva: "Profilo Hardware Labelnize PM240 Attivo (320×240 px • Margini Anti-Clipping 1.5mm)".
  3. *Guida Rapida Configurazione Driver USB*:
     - Un pratico banner a comparsa o tooltip con i 3 passaggi chiave per il driver USB da PC:
       1. Impostare formato carta nel driver Windows/Mac su **40mm × 30mm**.
       2. Impostare i margini di stampa su **Nessuno (0 mm)** e scala su **100% (Effettiva)**.
       3. Tipo supporto: **Etichetta con Gap / Die-Cut**.
  4. *Esportazione e Stampa*:
     - Stampa diretta a rotolo dal browser senza slittamenti.
     - Download PDF multipagina calibrato per il driver USB.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisione 1: Margine di Sicurezza Fisico a 1.5 mm (Anti-Clipping)**
  - *Approccio Scelto*: Incrementare l'inset del bordo a 1.5 mm (12 pixel a 203 DPI) e riadattare la larghezza utile delle colonne.
  - *Motivazione*: Le stampanti termiche portatili da 2 pollici come la PM240 presentano una leggera tolleranza meccanica di trascinamento della carta (±0.5 mm). Un margine di 1.5 mm evita che il bordo nero o il QR code vengano tagliati ai bordi dell'adesivo.
  - *Alternative Considerate*: Lasciare i margini a 0.6 mm. Questo causava saltuari tagli del bordo sul lato destro del QR code durante l'avanzamento su rulli fisici.

- **Decisione 2: Ottimizzazione Pixel a 203 DPI (8.0 dpmm)**
  - *Approccio Scelto*: A 203 DPI le linee vettoriali e i moduli del QR code vengono rasterizzati con precisione su griglia intera (pixel rounding rigoroso), evitando l'anti-aliasing grigio che sulle testine termiche dirette produce sbavature.
  - *Motivazione*: La stampa termica diretta è puramente binaria (pixel nero acceso o spento). Eliminando i mezzi toni, il QR code risulta nitido e scansionabile anche su etichette compatte da 4×3 cm.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Interfaccia Utente (UI)                         │
│  [50x80 mm]  [40x30 mm]  ★ [PRESET LABELNIZE PM240 (40x30 / 203 DPI)] │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Attiva configurazione ottimizzata
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   src/utils/thermalLabelGenerator.ts                   │
│                                                                        │
│ • getLabelPixelDimensions:                                             │
│     size: '40x30', orientation: 'landscape', dpi: 203                  │
│     => width: 320 px, height: 240 px (40x30 mm)                        │
│ • renderThermalLabelToCanvas:                                          │
│     - Inset anti-clipping: 1.5 mm (12 px a 203 DPI)                    │
│     - Colonna Sinistra (Dati): 165 px, font scalati con drawFittedText │
│     - Colonna Destra (QR): 130 px, modulo QR nitido senza blur         │
│     - Linea divisoria verticale e bordo nero a 1 px intero             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────────────┐   ┌──────────────────────────────┐
│       Stampa Rotolo Browser         │   │   PDF Multipagina (jsPDF)    │
│ @page { size: 40mm 30mm; margin:0 } │   │ Format: [40, 30] mm a 203DPI │
│ Driver USB PC: Margini 0, Scala 100%│   │ Pronto per driver termico PC │
└─────────────────────────────────────┘   └──────────────────────────────┘
```

#### Modifiche Tecniche Previste:
1. `src/utils/thermalLabelGenerator.ts`:
   - Aggiungere il preset `isPm240Optimized?: boolean` o calibrare l'inset a 1.5mm per `40x30` a `203 DPI`.
   - Garantire rasterizzazione binaria pura ad alto contrasto per le etichette 40×30 mm a 203 DPI.
2. `src/components/regia/RegiaBatchLabelPrintView.tsx`:
   - Aggiungere pulsante preset rapido "PRESET LABELNIZE PM240".
   - Aggiungere box indicazioni per driver PC USB (impostazioni formato 40×30 mm, margini 0).
3. `src/components/anagrafica/ThermalLabelGeneratorModal.tsx`:
   - Inserire il pulsante rapido PM240 anche nella modale delle etichette singole.
