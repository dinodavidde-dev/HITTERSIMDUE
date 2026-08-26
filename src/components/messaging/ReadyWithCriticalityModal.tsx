import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Radio,
  Send,
  ShieldAlert,
  Wrench,
  X,
} from 'lucide-react';

interface ReadyWithCriticalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  scenarioRef?: string;
  techName: string;
  onConfirm: (notes: string, severity: 'MODERATA' | 'ATTENZIONE', selectedTags: string[]) => void;
}

const CRITICALITY_TAGS_IT = [
  'Presidio alternativo impiegato (equivalente funzionale)',
  'Livello sacca sangue sintetico al 50%',
  'Protesi con lieve usura (tenuta verificata)',
  'Parametri manichino monitorati con app secondaria',
  'Richiesto reintegro materiale durante la prima pausa',
  'Accesso vascolare simulato con cannula alternativa',
  'Lieve usura cute silicone (pronta per 1 ciclo)',
];

const CRITICALITY_TAGS_EN = [
  'Alternative equipment deployed (functional equivalent)',
  'Synthetic blood reservoir level at 50%',
  'Prosthetic with minor cosmetic wear (seal verified)',
  'Mannequin telemetry monitored via secondary app',
  'Supply restock requested during first scheduled break',
  'Simulated vascular access using alternative catheter/cannula',
  'Minor silicone skin wear (ready for 1 active cycle)',
];

export const ReadyWithCriticalityModal: React.FC<ReadyWithCriticalityModalProps> = ({
  isOpen,
  onClose,
  stationName,
  scenarioRef,
  techName,
  onConfirm,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';
  const criticalityTags = isEn ? CRITICALITY_TAGS_EN : CRITICALITY_TAGS_IT;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [severity, setSeverity] = useState<'MODERATA' | 'ATTENZIONE'>('MODERATA');
  const [confirmCanRun, setConfirmCanRun] = useState<boolean>(true);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmCanRun) return;

    // Combine notes
    const combinedNotes = [
      ...selectedTags,
      customNotes.trim(),
    ]
      .filter(Boolean)
      .join('; ');

    if (!combinedNotes) {
      alert(isEn ? 'Please enter at least one note or select an identified criticality tag.' : 'Inserisci almeno una nota o seleziona una criticità riscontrata.');
      return;
    }

    onConfirm(combinedNotes, severity, selectedTags);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-amber-500 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-black font-black flex-shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest text-amber-400">
                  {isEn ? 'COMMAND SIGNAL • YELLOW LIGHT ⚠️' : 'SEGNALE REGIA • LUCE GIALLA ⚠️'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                {isEn ? 'Ready with Warnings for Scenario' : 'OK con Criticità per lo Scenario'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
            aria-label={isEn ? 'Close modal' : 'Chiudi finestra'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Station context summary */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                {isEn ? 'STATION / SCENARIO' : 'POSTAZIONE / SCENARIO'}
              </span>
              <div className="text-white font-black text-sm truncate">{stationName}</div>
              {scenarioRef && (
                <div className="text-neutral-400 text-[11px] font-mono">{scenarioRef}</div>
              )}
            </div>
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                {isEn ? 'RESPONSIBLE TECHNICIAN' : 'TECNICO RESPONSABILE'}
              </span>
              <div className="text-amber-400 font-bold">{techName}</div>
            </div>
          </div>

          {/* Quick preset tags */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300">
              {isEn ? 'Select Identified Criticalities (Tap to toggle):' : 'Seleziona Criticità Riscontrate (Tocca per aggiungere):'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {criticalityTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1.5 rounded-none text-left text-[11px] font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-300 font-bold shadow-xs'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-amber-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-black" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    )}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed text notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-300">
              {isEn ? 'Detailed Description for Command & Direction:' : 'Descrizione Dettagliata per la Regia & Direzione:'}
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder={isEn ? 'e.g. Simulator is set up and functional; used #15 scalpel instead of #11, reservoir has 500ml simulated blood. Scenario can proceed safely...' : 'Es. Il simulatore è allestito e pronto; è stato utilizzato un bisturi n.15 al posto del n.11 ed è presente 500ml di sangue sintetico anziché 1000ml. Lo scenario può partire...'}
              className="w-full bg-neutral-900 border border-neutral-700 p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Severity selector */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSeverity('MODERATA')}
              className={`p-2.5 border text-left cursor-pointer transition-all ${
                severity === 'MODERATA'
                  ? 'bg-amber-950/70 border-amber-500 text-amber-200 ring-1 ring-amber-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="font-black text-[11px] uppercase flex items-center gap-1.5">
                <span>{isEn ? '🟡 MODERATE WARNING' : '🟡 CRITICITÀ MODERATA'}</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {isEn ? 'Scenario can run without major impact on learning objectives.' : 'Scenario eseguibile senza impatto primario sugli obiettivi formativi.'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSeverity('ATTENZIONE')}
              className={`p-2.5 border text-left cursor-pointer transition-all ${
                severity === 'ATTENZIONE'
                  ? 'bg-amber-950 border-amber-400 text-amber-200 ring-1 ring-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="font-black text-[11px] uppercase flex items-center gap-1.5">
                <span>{isEn ? '⚠️ SPECIAL ATTENTION' : '⚠️ ATTENZIONE SPECIALE'}</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">
                {isEn ? 'Command must brief instructors/tutors regarding this station setup.' : 'La Regia deve avvisare i docenti/tutor sulla particolarità della postazione.'}
              </div>
            </button>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-2 bg-neutral-900 p-2.5 border border-neutral-800">
            <input
              type="checkbox"
              id="confirm-can-run"
              checked={confirmCanRun}
              onChange={(e) => setConfirmCanRun(e.target.checked)}
              className="mt-0.5 rounded-none border-neutral-600 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label
              htmlFor="confirm-can-run"
              className="text-[11px] text-neutral-300 font-semibold cursor-pointer select-none leading-tight"
            >
              {isEn ? (
                <>I confirm that this station is <strong>operational and safe to launch</strong> with the indicated notes and warnings.</>
              ) : (
                <>Confermo che la postazione è <strong>operativa e sicura per l'avvio</strong> con le note e riserve indicate.</>
              )}
            </label>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Annulla'}
            </button>

            <button
              type="submit"
              disabled={!confirmCanRun}
              className={`px-4 py-2.5 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg transition-all ${
                confirmCanRun
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-2 border-amber-300'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-black" />
              <span>{isEn ? 'SEND WARNING SIGNAL (YELLOW LIGHT)' : 'INVIA SEGNALE OK CON CRITICITÀ (LUCE GIALLA)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
