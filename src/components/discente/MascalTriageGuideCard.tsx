import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Footprints,
  HeartPulse,
  HelpCircle,
  Info,
  Radio,
  ShieldAlert,
  Wind,
  Brain,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

export interface MascalTriageGuideCardProps {
  compact?: boolean;
}

export const MascalTriageGuideCard: React.FC<MascalTriageGuideCardProps> = ({ compact = false }) => {
  const { language } = useCourse();
  const isEn = language === 'en';
  const [activeTab, setActiveTab] = useState<'categories' | 'algorithm'>('categories');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<'T1' | 'T2' | 'T3' | 'T4' | null>(null);

  const categories = [
    {
      code: 'T1',
      name: isEn ? 'IMMEDIATE' : 'IMMEDIATO',
      color: 'red',
      bgClass: 'bg-red-950/80 border-red-500 text-red-200',
      badgeClass: 'bg-red-600 text-white',
      accentBorder: 'border-red-500',
      titleColor: 'text-red-400',
      icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
      criteria: isEn
        ? 'Massive active hemorrhage, airway obstruction, RR > 30/min or < 10/min, absent radial pulse / capillary refill > 2s, altered mental state / fails simple commands.'
        : 'Emorragia massiva attiva, compromissione vie aeree, FR > 30/min o < 10/min, polso radiale assente o refill > 2s, alterazione dello stato di coscienza.',
      actions: isEn
        ? 'Immediate limb tourniquet or wound packing, basic airway clearance (chin lift / recovery position), immediate high-priority transport to resuscitation post.'
        : 'Applicazione immediata tourniquet o wound packing, pervietà vie aeree di base, evacuazione prioritaria assoluta verso la Shock Room / Posto Medico Avanzato.',
      timing: isEn ? '< 30 min' : 'Immediato (< 30 min)',
    },
    {
      code: 'T2',
      name: isEn ? 'DELAYED' : 'DIFFERIBILE',
      color: 'amber',
      bgClass: 'bg-amber-950/80 border-amber-500 text-amber-200',
      badgeClass: 'bg-amber-500 text-black',
      accentBorder: 'border-amber-500',
      titleColor: 'text-amber-400',
      icon: <HeartPulse className="w-4 h-4 text-amber-400" />,
      criteria: isEn
        ? 'Severe non-life-threatening trauma, controlled hemorrhage, stable hemodynamics (radial pulse present), RR 10-29/min, conscious and follows simple commands.'
        : 'Lesioni gravi ma stabili (fratture chiuse/esposte stabilizzate, traumi senza shock acuto), polso radiale presente, FR 10-29/min, esegue comandi semplici.',
      actions: isEn
        ? 'Splinting, dressing stabilization, secondary monitoring, evacuation after T1 casualties.'
        : 'Immobilizzazione, medicazioni compressive di supporto, monitoraggio continuo parametri vitali, evacuazione successiva ai T1.',
      timing: isEn ? '2 - 4 hours' : 'Differibile (2 - 4 ore)',
    },
    {
      code: 'T3',
      name: isEn ? 'MINIMAL (WALKING)' : 'MINORE (DEAMBULANTE)',
      color: 'emerald',
      bgClass: 'bg-emerald-950/80 border-emerald-500 text-emerald-200',
      badgeClass: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-500',
      titleColor: 'text-emerald-400',
      icon: <Footprints className="w-4 h-4 text-emerald-400" />,
      criteria: isEn
        ? 'Able to walk and move autonomously upon instruction. Minor superficial injuries, sprains, bruises. Oriented.'
        : 'Paziente in grado di deambulare autonomamente alla prima chiamata. Lesioni minori superficiali, contusioni o distorsioni. Orientato e collaborante.',
      actions: isEn
        ? 'Direct toward designated Walking Wounded assembly area; self/buddy aid; re-triage on condition changes.'
        : 'Indirizzare verso l\'Area Raccolta Feriti Leggeri; autosoccorso o soccorso reciproco; rivalutazione periodica.',
      timing: isEn ? '4 - 6 hours' : 'Differibile (> 4 ore)',
    },
    {
      code: 'T4',
      name: isEn ? 'EXPECTANT / DECEASED' : 'DECEDUTO / NON SOPRAVVIVIBILE',
      color: 'neutral',
      bgClass: 'bg-neutral-900 border-neutral-700 text-neutral-300',
      badgeClass: 'bg-neutral-800 text-neutral-300 border border-neutral-600',
      accentBorder: 'border-neutral-700',
      titleColor: 'text-neutral-300',
      icon: <ShieldAlert className="w-4 h-4 text-neutral-400" />,
      criteria: isEn
        ? 'No spontaneous breathing even after basic airway repositioning. Catastrophic injuries incompatible with survival in resource-limited MCI.'
        : 'Apnea persistente dopo disostruzione e riallineamento del capo, arresto cardiocircolatorio traumatico in contesto MASCAL, lesioni incompatibili con la vita.',
      actions: isEn
        ? 'No active CPR or extensive resources deployed. Maintain position, cover, tag with T4 and proceed to next casualty.'
        : 'Nessuna manovra di RCP prolungata nel maxiafflusso. Posizionamento cartellino nero T4, segnalazione cartografica e passaggio immediato al paziente successivo.',
      timing: isEn ? 'No treatment' : 'Nessun trattamento prioritario',
    },
  ];

  const algorithmSteps = [
    {
      step: 1,
      title: isEn ? 'Step 1 • Ambulation & Walking Wounded' : 'Step 1 • Deambulazione & Feriti Autonomi',
      question: isEn ? 'Can the casualty walk upon verbal order?' : 'Il ferito cammina autonomamente al comando verbale?',
      icon: <Footprints className="w-5 h-5 text-emerald-400" />,
      yesOutcome: {
        category: 'T3',
        label: isEn ? 'T3 • MINIMAL (GREEN)' : 'T3 • MINORE (VERDE)',
        badgeClass: 'bg-emerald-600 text-white',
        instruction: isEn
          ? 'Direct to the secondary Walking Wounded collection zone. Instruct to apply self-pressure.'
          : 'Indirizzare all\'area di raccolta feriti leggeri. Invitare all\'automedicazione se orientato.',
      },
      noOutcome: {
        label: isEn ? 'Proceed to Step 2 (Airway & Breathing)' : 'Procedere a Step 2 (Vie Aeree & Respirazione)',
        nextStep: 2,
      },
    },
    {
      step: 2,
      title: isEn ? 'Step 2 • Airway & Respiratory Rate' : 'Step 2 • Vie Aeree & Frequenza Respiratoria',
      question: isEn ? 'Is the casualty breathing spontaneously?' : 'Il paziente respira spontaneamente?',
      icon: <Wind className="w-5 h-5 text-cyan-400" />,
      subChecks: [
        {
          condition: isEn ? 'NO breathing -> Reposition airway once' : 'NON respira ➔ Aprire e riallineare vie aeree',
          result: isEn ? 'Still NO breath: T4 BLACK | Starts breathing: T1 RED' : 'Resta in apnea: T4 NERO | Riprende a respirare: T1 ROSSO',
          tag: 'T4 / T1',
        },
        {
          condition: isEn ? 'Breaths > 30/min OR < 10/min' : 'Respira, ma FR > 30/min o < 10/min',
          result: isEn ? 'Assign T1 RED (Tension pneumothorax / severe shock)' : 'Assegna T1 ROSSO (Sospetto PNX iperteso, grave distress o shock)',
          tag: 'T1',
        },
        {
          condition: isEn ? 'Normal RR (10 - 29/min)' : 'Respira regolarmente (FR 10 - 29/min)',
          result: isEn ? 'Proceed to Step 3 (Perfusion & Bleeding)' : 'Procedere a Step 3 (Circolazione & Emostasi)',
          tag: '➔ Step 3',
        },
      ],
    },
    {
      step: 3,
      title: isEn ? 'Step 3 • Perfusion & Massive Hemorrhage' : 'Step 3 • Circolazione & Emostasi Massiva',
      question: isEn ? 'Is there active massive hemorrhage or absent radial pulse?' : 'È presente emorragia massiva a getto o polso radiale assente?',
      icon: <HeartPulse className="w-5 h-5 text-red-400" />,
      subChecks: [
        {
          condition: isEn ? 'Active massive hemorrhage' : 'Emorragia arteriosa o massiva in corso',
          result: isEn ? 'Apply Tourniquet / Packing immediately ➔ Assign T1 RED' : 'Stop the Bleed immediato (Tourniquet / Wound Packing) ➔ Assegna T1 ROSSO',
          tag: 'T1',
        },
        {
          condition: isEn ? 'Radial pulse ABSENT or Capillary Refill > 2s' : 'Polso radiale ASSENTE o tempo di riempimento > 2 sec',
          result: isEn ? 'Assign T1 RED (Decompensated hemorrhagic shock)' : 'Assegna T1 ROSSO (Stato di shock emodinamico avanzato)',
          tag: 'T1',
        },
        {
          condition: isEn ? 'Radial pulse PRESENT & controlled bleeding' : 'Polso radiale PRESENTE ed emorragie controllate',
          result: isEn ? 'Proceed to Step 4 (Mental Status)' : 'Procedere a Step 4 (Stato Neurologico & Comandi)',
          tag: '➔ Step 4',
        },
      ],
    },
    {
      step: 4,
      title: isEn ? 'Step 4 • Neurological Status & Commands' : 'Step 4 • Stato Neurologico & Comandi Semplici',
      question: isEn ? 'Can the patient follow simple commands (e.g. squeeze hand)?' : 'Il paziente è in grado di eseguire ordini semplici (es. stringere la mano)?',
      icon: <Brain className="w-5 h-5 text-amber-400" />,
      subChecks: [
        {
          condition: isEn ? 'FAILS simple commands / Incoherent' : 'NON esegue comandi semplici / Incosciente / Confuso',
          result: isEn ? 'Assign T1 RED (Severe TBI or hypoperfusion)' : 'Assegna T1 ROSSO (Grave trauma cranico o ipoperfusione cerebrale)',
          tag: 'T1',
        },
        {
          condition: isEn ? 'FOLLOWS simple commands & oriented' : 'ESEGUE comandi semplici ed è cosciente',
          result: isEn ? 'Assign T2 YELLOW (Urgent delayed care)' : 'Assegna T2 GIALLO (Trattamento differibile, monitoraggio continuo)',
          tag: 'T2',
        },
      ],
    },
  ];

  return (
    <div className="bg-neutral-950 border-2 border-red-500/80 rounded-xl p-3 sm:p-5 shadow-2xl font-mono text-xs text-neutral-200 space-y-4">
      {/* Top Banner Triage MASCAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-wider rounded flex items-center gap-1.5 animate-pulse">
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isEn ? 'MASCAL TACTICAL TRIAGE' : 'TRIAGE TATTICO MASCAL'}</span>
            </span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-950/80 border border-amber-600/60 px-2 py-0.5 rounded">
              {isEn ? 'DAY 2 NIGHT SESSION • 21:00 - 23:00' : 'DAY 2 SESSIONE NOTTURNA • 21:00 - 23:00'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight uppercase mt-1">
            {isEn ? 'RAPID MASS CASUALTY TRIAGE GUIDE' : 'GUIDA RAPIDA DI TRIAGE MAXIAFFLUSSO'}
          </h3>
          <p className="text-[11px] text-neutral-400 font-sans">
            {isEn
              ? 'Classification standard: < 30 seconds per casualty. Verbal commands from Master Control on scene.'
              : 'Standard di classificazione rapida: < 30 secondi a ferito. Disposizioni di dettaglio impartite a voce sul posto.'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-lg shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isEn ? 'Priority Tags' : 'Cartellini'}</span>
          </button>
          <button
            onClick={() => setActiveTab('algorithm')}
            className={`px-3 py-1.5 rounded font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeTab === 'algorithm'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{isEn ? 'Step Algorithm' : 'Algoritmo'}</span>
          </button>
        </div>
      </div>

      {/* Mode A: 4 Priority Categories Cards */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCategory(isSelected ? null : (c.code as any))}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? `${c.bgClass} ring-2 ring-white scale-[1.02] shadow-xl`
                      : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`px-2 py-0.5 rounded font-black text-xs ${c.badgeClass}`}>
                      {c.code}
                    </span>
                    {c.icon}
                  </div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                    {c.name}
                  </h4>
                  <div className="text-[10px] text-neutral-400 mt-1 flex items-center justify-between font-mono">
                    <span>{c.timing}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Expansion for Categories */}
          <div className="space-y-2">
            {categories
              .filter((c) => !selectedCategory || selectedCategory === c.code)
              .map((c) => (
                <div
                  key={c.code}
                  className={`p-3 rounded-lg border-2 ${c.bgClass} space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap border-b border-white/10 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded font-black text-xs ${c.badgeClass}`}>
                        {c.code} • {c.name}
                      </span>
                      <span className="text-[11px] font-bold text-neutral-300">
                        {isEn ? `Window: ${c.timing}` : `Finestra: ${c.timing}`}
                      </span>
                    </div>
                    {c.icon}
                  </div>

                  <div className="space-y-1 font-sans text-xs">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {isEn ? 'CRITICAL IDENTIFICATION CRITERIA:' : 'CRITERI CLINICI DI RICONOSCIMENTO:'}
                      </span>
                      <p className="text-neutral-100 font-semibold leading-relaxed mt-0.5">
                        {c.criteria}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-white/10">
                      <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {isEn ? 'MASCAL FIELD ACTIONS:' : 'AZIONI SUL CAMPO:'}
                      </span>
                      <p className="text-neutral-200 leading-relaxed mt-0.5">
                        {c.actions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mode B: Step-by-Step Algorithm */}
      {activeTab === 'algorithm' && (
        <div className="space-y-3">
          {/* Step Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {algorithmSteps.map((st) => (
              <button
                key={st.step}
                onClick={() => setActiveStep(st.step)}
                className={`px-2.5 py-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                  activeStep === st.step
                    ? 'bg-red-950/80 border-red-500 text-white shadow-lg'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                  activeStep === st.step ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {st.step}
                </span>
                <span className="text-[11px] font-bold truncate">
                  {st.title.split('•')[1] || st.title}
                </span>
              </button>
            ))}
          </div>

          {/* Active Step Detail Card */}
          {(() => {
            const currentStepData = algorithmSteps.find((s) => s.step === activeStep) || algorithmSteps[0];
            return (
              <div className="bg-neutral-900/95 border-2 border-red-500/80 rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    {currentStepData.icon}
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">
                      {currentStepData.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-red-400 bg-red-950 px-2 py-0.5 border border-red-800 rounded">
                    {isEn ? `Step ${currentStepData.step} of 4` : `Passo ${currentStepData.step} di 4`}
                  </span>
                </div>

                <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-0.5">
                    {isEn ? 'CORE QUESTION:' : 'DOMANDA FONDAMENTALE:'}
                  </span>
                  <p className="text-sm font-black text-white">
                    {currentStepData.question}
                  </p>
                </div>

                {/* SubChecks or Yes/No */}
                {currentStepData.yesOutcome && currentStepData.noOutcome ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-sans text-xs">
                    <div className="p-3 bg-emerald-950/70 border border-emerald-500/70 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-black text-emerald-300 text-sm">
                          {isEn ? 'YES (Walking)' : 'SÌ (Cammina)'}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-mono font-black text-[10px] rounded">
                          T3 VERDE
                        </span>
                      </div>
                      <p className="text-neutral-200">
                        {currentStepData.yesOutcome.instruction}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-950 border border-neutral-700 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-black text-neutral-200 text-sm">
                          {isEn ? 'NO (Immobile)' : 'NO (Immobile)'}
                        </span>
                        <span className="px-2 py-0.5 bg-red-950 border border-red-500 text-red-300 font-mono font-bold text-[10px] rounded">
                          {isEn ? 'CONTINUE ASSESSMENT' : 'CONTINUA VALUTAZIONE'}
                        </span>
                      </div>
                      <p className="text-neutral-400">
                        {currentStepData.noOutcome.label}
                      </p>
                      <button
                        onClick={() => setActiveStep(2)}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-[10px] uppercase rounded transition-all"
                      >
                        <span>{isEn ? 'Jump to Step 2' : 'Passa a Step 2'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentStepData.subChecks?.map((chk, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-neutral-950 rounded border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-white font-mono">
                            {chk.condition}
                          </span>
                          <p className="text-xs text-neutral-300 font-sans">
                            {chk.result}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded font-mono font-black text-xs shrink-0 self-start sm:self-center ${
                          chk.tag.includes('T1')
                            ? 'bg-red-600 text-white'
                            : chk.tag.includes('T2')
                            ? 'bg-amber-500 text-black'
                            : chk.tag.includes('T3')
                            ? 'bg-emerald-600 text-white'
                            : chk.tag.includes('T4')
                            ? 'bg-neutral-800 border border-neutral-600 text-white'
                            : 'bg-cyan-900 text-cyan-200'
                        }`}>
                          {chk.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Operational directive note */}
      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2 text-[10px] text-neutral-400 font-sans flex-wrap">
        <span className="flex items-center gap-1 text-red-400 font-mono font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>{isEn ? 'Radio CH-1 Regia • Active MASCAL Mode' : 'Radio CH-1 Regia • Modalità MASCAL Attiva'}</span>
        </span>
        <span>
          {isEn
            ? 'Dynamic casualties handled by Control Room without prior schedule.'
            : 'Feriti multipli a sorpresa gestiti in tempo reale dalla Regia.'}
        </span>
      </div>
    </div>
  );
};
