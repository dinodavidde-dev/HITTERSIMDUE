import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  HardHat,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Radio,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { SimulatorPatient, Technician } from '../../types';

interface ScenarioCriticalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: SimulatorPatient | null;
  technicians: Technician[];
  onUpdatePatient: (patientId: number, updates: Partial<SimulatorPatient>) => void;
  onSendRadioAlert?: (msg: string) => void;
}

export const ScenarioCriticalityModal: React.FC<ScenarioCriticalityModalProps> = ({
  isOpen,
  onClose,
  patient,
  technicians,
  onUpdatePatient,
  onSendRadioAlert,
}) => {
  const [editedNotes, setEditedNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [radioMsg, setRadioMsg] = useState('');
  const [radioSent, setRadioSent] = useState(false);

  if (!isOpen || !patient) return null;

  const isCritical = patient.readinessStatus === 'critical';
  const isReady = patient.readinessStatus === 'ready';

  // Find assigned technician for this station
  const assignedTech = technicians.find((t) =>
    t.assignedStations.some(
      (st) =>
        st.toLowerCase().includes(`postazione ${patient.id}`) ||
        st.toLowerCase().includes(`postazione ${patient.teamExtraAssigned}`)
    )
  ) || technicians[0];

  const handleResolveCriticality = () => {
    onUpdatePatient(patient.id, {
      readinessStatus: 'ready',
      criticalityNotes: undefined,
      techChecklist: {
        ...patient.techChecklist,
        preDone: true,
        verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    });
    onClose();
  };

  const handleMarkCritical = (notes: string) => {
    onUpdatePatient(patient.id, {
      readinessStatus: 'critical',
      criticalityNotes: notes,
      criticalityReportedBy: 'Regia Master (Direzione Corso)',
      criticalityTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (!editedNotes.trim()) return;
    onUpdatePatient(patient.id, {
      criticalityNotes: editedNotes.trim(),
      criticalityReportedBy: patient.criticalityReportedBy || 'Regia Master',
      criticalityTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsEditingNotes(false);
  };

  const handleSendRadio = () => {
    if (!radioMsg.trim()) return;
    if (onSendRadioAlert) {
      onSendRadioAlert(`[ALLERTA POSTAZIONE ${patient.id}] ${radioMsg.trim()}`);
    }
    setRadioSent(true);
    setRadioMsg('');
    setTimeout(() => setRadioSent(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-950 border-3 border-amber-500 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-neutral-900 border-b-2 border-amber-500 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 font-black text-black flex-shrink-0 ${
                isCritical ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            >
              {isCritical ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase font-mono tracking-widest px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-600">
                  MONITORAGGIO READINESS PRE-SCENARIO (T-30m)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase mt-0.5">
                {isCritical ? '⚠️ Pronto con Criticità Segnalata' : '✅ Scenario Pronto & Verificato'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 transition-colors cursor-pointer bg-neutral-900 border border-neutral-800"
            aria-label="Chiudi finestra"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Station & Scenario Summary Card */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-black text-xs">
                  POSTAZIONE #{patient.id}
                </span>
                <span className="font-black text-white text-sm uppercase">
                  {patient.scenarioCode}
                </span>
              </div>

              <span className="text-neutral-300 font-mono text-xs">
                Squadre: <strong className="text-white">Sq.{patient.teamExtraAssigned}</strong> (Extra) &{' '}
                <strong className="text-white">Sq.{patient.teamIntraAssigned}</strong> (Intra)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-neutral-400 font-mono uppercase block font-bold">
                  Protesi & Moulage:
                </span>
                <span className="text-neutral-200">{patient.moulageProtesi}</span>
              </div>
              <div>
                <span className="text-neutral-400 font-mono uppercase block font-bold">
                  Simulatore / Manichino:
                </span>
                <span className="text-neutral-200">{patient.simulatori}</span>
              </div>
            </div>
          </div>

          {/* CRITICALITY DETAILS BOX */}
          {isCritical ? (
            <div className="bg-amber-950/40 border-2 border-amber-500 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  DETTAGLIO CRITICITÀ SEGNALATA DALLA POSTAZIONE:
                </span>
                {patient.criticalityTimestamp && (
                  <span className="text-[10px] font-mono text-neutral-400">
                    Ore {patient.criticalityTimestamp} • {patient.criticalityReportedBy || 'Tecnico'}
                  </span>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    rows={3}
                    placeholder="Descrivi la criticità riscontrata..."
                    className="w-full bg-neutral-900 border border-amber-500 p-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1 bg-neutral-800 text-neutral-300 font-bold text-xs"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase"
                    >
                      Salva Modifiche
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-950 p-3 border border-amber-500/40 space-y-2">
                  <p className="text-amber-100 text-sm font-semibold leading-relaxed">
                    {patient.criticalityNotes ||
                      'Attenzione: Verificare serbatoio sangue e raccordo protesi prima dello start.'}
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditedNotes(patient.criticalityNotes || '');
                        setIsEditingNotes(true);
                      }}
                      className="text-[10px] font-mono text-amber-400 hover:underline uppercase font-bold"
                    >
                      Modifica / Aggiorna Nota ✎
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-950/40 border-2 border-emerald-500 p-4 space-y-2">
              <span className="text-xs font-black uppercase text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                POSTAZIONE VERIFICATA AL 100% - NESSUNA CRITICITÀ ATTIVA
              </span>
              <p className="text-neutral-300 text-xs">
                Tutti i presidi, manichini biologici, protesi in silicone e circuiti sangue pulsante
                risultano allestiti e collaudati secondo la checklist tecnica di regia.
              </p>
            </div>
          )}

          {/* Assigned Technician Contact Card */}
          {assignedTech && (
            <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-black text-white uppercase">
                    Tecnico Referente: {assignedTech.name}
                  </span>
                  <span className="px-1.5 py-0.2 bg-neutral-800 text-cyan-300 font-mono text-[10px]">
                    {assignedTech.badgeCode || 'TECH'}
                  </span>
                </div>
                {assignedTech.phone && (
                  <a
                    href={`tel:${assignedTech.phone}`}
                    className="text-xs font-mono text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {assignedTech.phone}
                  </a>
                )}
              </div>
              <p className="text-[11px] text-neutral-400">{assignedTech.specialty}</p>
            </div>
          )}

          {/* Radio Message Box */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-black flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              INVIA NOTIFICA / ORDINE RADIO AL TECNICO DI POSTAZIONE:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={radioMsg}
                onChange={(e) => setRadioMsg(e.target.value)}
                placeholder="Es. Richiesta sostituzione guarnizione pompa sangue entro 5 min..."
                className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleSendRadio}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>INVIA</span>
              </button>
            </div>
            {radioSent && (
              <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Notifica inviata sui canali audio/video e radio regia!
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isCritical ? (
              <button
                type="button"
                onClick={handleResolveCriticality}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>RISOLVI & SEGNA SCENARIO PRONTO</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleMarkCritical('Segnalata criticità di allestimento dalla Regia Master.')
                }
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>SEGNALA CRITICITÀ DA REGIA</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase cursor-pointer"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
