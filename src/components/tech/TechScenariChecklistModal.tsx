import React from 'react';
import { X, Wrench, CheckCircle2, AlertTriangle, Shield, Clock } from 'lucide-react';
import { SimulatorPatient, Technician } from '../../types';
import { useCourse } from '../../context/CourseContext';

interface TechScenariChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTech: Technician;
  patient: SimulatorPatient | null;
}

export const TechScenariChecklistModal: React.FC<TechScenariChecklistModalProps> = ({
  isOpen,
  onClose,
  currentTech,
  patient,
}) => {
  const { updateTechChecklist, language } = useCourse();
  const isEn = language === 'en';

  if (!isOpen || !patient) return null;

  const checklist = patient.techChecklist || { preDone: false, intraDone: false, postDone: false };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-pink-500 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-neutral-100 font-mono">
        
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-pink-500/80 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-600 text-white font-black flex items-center justify-center rounded shadow">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-pink-950 text-pink-300 border border-pink-600 rounded">
                  CHECKLIST TECNICA • {currentTech.badgeCode} ({currentTech.name})
                </span>
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-pink-400 border border-neutral-700">
                  Giorno {patient.day} • {patient.period.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-1">
                {patient.scenarioCode}: {patient.title || 'Scenario di Trauma'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-neutral-900 hover:bg-red-600/20 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500 rounded flex items-center justify-center transition-all cursor-pointer"
            title="Chiudi Finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Patient Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-900 p-4 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono text-pink-400 uppercase font-black block">
                POSTAZIONE & ASSEGNAZIONE SQUADRA:
              </span>
              <p className="text-sm font-bold text-white">
                {patient.groupExtraAssigned ? `Gruppo Extra: ${patient.groupExtraAssigned} (Sq. ${patient.teamExtraAssigned})` : ''}
                {patient.groupIntraAssigned ? ` | Gruppo Intra: ${patient.groupIntraAssigned} (Sq. ${patient.teamIntraAssigned})` : ''}
              </p>
              <p className="text-xs text-neutral-400">
                Simulatore: <strong className="text-pink-300">{patient.simulatori || 'Manichino Alta Fedeltà'}</strong>
              </p>
            </div>

            <div className="bg-neutral-900 p-4 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono text-pink-400 uppercase font-black block">
                PROTESI, MOULAGE & CONSUMABILI:
              </span>
              <p className="text-xs font-bold text-white">{patient.moulageProtesi || 'Protesi standard sanguinante'}</p>
              <p className="text-[11px] text-neutral-400">
                <strong>Dinamica:</strong> {patient.dinamicaDelleLesioni || patient.lesioni?.join(', ')}
              </p>
            </div>
          </div>

          {/* Checklist Interactive Controls with Timings */}
          <div className="bg-neutral-900 p-5 border-2 border-pink-500/50 space-y-4">
            <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pink-400" /> Fasi Temporali e Operazioni Tecniche (Blocco 90 min)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-neutral-950 p-3.5 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 uppercase font-bold">1. PRIMA (Min 00-30)</span>
                  <button
                    onClick={() => updateTechChecklist(patient.id, 'preDone', !checklist.preDone)}
                    className={`px-2 py-0.5 text-[10px] font-black uppercase transition-all cursor-pointer border rounded ${
                      checklist.preDone ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {checklist.preDone ? '✓ PRONTO' : 'DA FARE'}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Allestimento moulage, calibrazione pompe sangue/pulsazioni, verifica tourniquet e circuiti (T -15 min standby attivo).
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 uppercase font-bold">2. DURANTE (Min 30-75)</span>
                  <button
                    onClick={() => updateTechChecklist(patient.id, 'intraDone', !checklist.intraDone)}
                    className={`px-2 py-0.5 text-[10px] font-black uppercase transition-all cursor-pointer border rounded ${
                      checklist.intraDone ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {checklist.intraDone ? '✓ OK' : 'ATTIVO'}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Regia segnali vitali manichino, supporto Handover SBAR (:30-:35), monitoraggio ABCDE e gestione telemetria/audio-video.
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-pink-400 uppercase font-bold">3. DOPO (Min 75-90)</span>
                  <button
                    onClick={() => updateTechChecklist(patient.id, 'postDone', !checklist.postDone)}
                    className={`px-2 py-0.5 text-[10px] font-black uppercase transition-all cursor-pointer border rounded ${
                      checklist.postDone ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                    }`}
                  >
                    {checklist.postDone ? '🟢 LUCE VERDE' : 'RESET'}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300">
                  Turnaround rapido (15 min), pulizia Box Shock Room / Ambiente Tattico, reset manichini, ricarica consumabili.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Specifications from Source */}
          <div className="bg-neutral-900 p-4 border border-neutral-800 space-y-3 font-mono text-xs">
            <span className="text-pink-400 font-black uppercase tracking-wider block text-[10px]">
              SPECIFICHE OPERATIVE TECNICHE (FONTI & PROTOCOLLO):
            </span>
            <ul className="list-disc list-inside space-y-1 text-neutral-300">
              <li><strong>Pressione Sanguigna / Emorragia:</strong> Verificare la pompa pulsante su protesi e calibrazione pressione (target in base a protocollo shock).</li>
              <li><strong>Gestione Tourniquet & Wound Packing:</strong> Controllare il corretto riposizionamento dei bendeji emostatici e simulatori wound packing dopo ogni estrazione.</li>
              <li><strong>Handover 1:1 SBAR (Min 30-35):</strong> Assistere il passaggio di consegne barellato tra TCCC (Extra) e Shock Room (Intra) senza interruzioni di flusso.</li>
              <li><strong>Reset e Sanificazione Box:</strong> Completare la sanificazione e il ripristino dei 3 Box e 3 Ambienti Tattici entro i 15 minuti di turnaround.</li>
            </ul>
          </div>

          {/* Tech & Regia Notes */}
          <div className="bg-neutral-900 p-4 border border-neutral-800 space-y-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
              Note Tecniche & Logistiche (Regia):
            </span>
            <p className="text-xs text-neutral-200 font-mono">
              {patient.techNotes || 'Nessuna nota critica segnalata per questo scenario. Verificare la pressione del circuito e il corretto funzionamento del manichino prima dell’handover.'}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Conferma & Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
