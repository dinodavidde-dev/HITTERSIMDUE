import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { AlertType, GroupType } from '../types';
import { AlertTriangle, Bell, Flame, Info, Lock, PauseCircle, Send, ShieldAlert, ShieldCheck, X } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const { language, userRole, directors, sendBroadcastAlert } = useCourse();
  const isEn = language === 'en';

  // Determine sender display name (strictly Director)
  const defaultSenderName = directors[0]?.name || (isEn ? 'Course Direction' : 'Direzione Corso');

  const [type, setType] = useState<AlertType>('info');
  const [priority, setPriority] = useState<'normal' | 'high' | 'critical'>('normal');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroups, setTargetGroups] = useState<('ALL' | GroupType)[]>(['ALL']);
  const [senderName, setSenderName] = useState(defaultSenderName);

  if (!isOpen) return null;

  const isDirector = userRole === 'direttore';

  const presets = isEn
    ? [
        {
          label: '⏳ Phase Change in 5 Minutes',
          type: 'phase_change' as AlertType,
          priority: 'high' as const,
          title: 'Attention: Imminent Phase Change (5 Min)',
          message: 'Wrap up ongoing procedures, prepare for handover (SBAR) and debriefing with respective Faculty.',
        },
        {
          label: '✅ Patient Ready at Station',
          type: 'info' as AlertType,
          priority: 'normal' as const,
          title: 'Simulator Station Ready',
          message: 'The simulator and patient actor are configured and ready for the team entry.',
        },
        {
          label: '🩸 Supply / Synthetic Blood Request',
          type: 'warning' as AlertType,
          priority: 'high' as const,
          title: 'Station Supply Replenishment',
          message: 'Station technician requests immediate refill of simulated blood / cricoid cannulas / chest tube drainage kit.',
        },
        {
          label: '🚨 Clinical Emergency / Sudden Arrest',
          type: 'emergency' as AlertType,
          priority: 'critical' as const,
          title: 'Critical Scenario Evolution: Traumatic Arrest',
          message: 'Patient enters traumatic cardiac arrest / peri-arrest state. Activate resuscitative thoracotomy and REBOA protocol.',
        },
        {
          label: '⏸️ Tech Reset Break (5 Min)',
          type: 'pause' as AlertType,
          priority: 'normal' as const,
          title: 'Station Tech Reset Pause',
          message: '5-minute temporary pause to allow technicians to replace biologic insert and replenish fluids.',
        },
        {
          label: '📋 Debriefing End -> Station Rotation',
          type: 'phase_change' as AlertType,
          priority: 'normal' as const,
          title: 'Debriefing Completed',
          message: 'All teams rotate to their next scheduled station (Workshop or Scenario) per timeline.',
        },
      ]
    : [
        {
          label: '⏳ Cambio Fase tra 5 Minuti',
          type: 'phase_change' as AlertType,
          priority: 'high' as const,
          title: 'Attenzione: Cambio Fase Imminente (5 Min)',
          message: 'Completare le procedure in corso, prepararsi al passaggio consegne (Handover SBAR) e al debriefing con la rispettiva Faculty.',
        },
        {
          label: '✅ Paziente Pronto in Postazione',
          type: 'info' as AlertType,
          priority: 'normal' as const,
          title: 'Postazione Simulatore Pronta',
          message: 'Il simulatore e il paziente attore sono configurati e pronti per l\'ingresso della squadra.',
        },
        {
          label: '🩸 Richiesta Materiale / Sangue Simulato',
          type: 'warning' as AlertType,
          priority: 'high' as const,
          title: 'Rifornimento Materiale Postazione',
          message: 'Tecnico di postazione richiede rifornimento immediato di sangue simulato / cannule crico / set drenaggio torace.',
        },
        {
          label: '🚨 Emergenza Clinica / Arresto Improvviso',
          type: 'emergency' as AlertType,
          priority: 'critical' as const,
          title: 'Evoluzione Critica Scenario: ACC Traumatico',
          message: 'Il paziente entra in arresto cardio-circolatorio traumatico peri-arresto. Attivare protocollo toracotomia di rianimazione e REBOA.',
        },
        {
          label: '⏸️ Pausa Tecnica per Reset (5 Min)',
          type: 'pause' as AlertType,
          priority: 'normal' as const,
          title: 'Pausa Tecnica Reset Postazione',
          message: 'Interruzione temporanea di 5 minuti per consentire ai tecnici la sostituzione dell\'inserto biologico e il ripristino liquidi.',
        },
        {
          label: '📋 Fine Debriefing -> Rotazione',
          type: 'phase_change' as AlertType,
          priority: 'normal' as const,
          title: 'Debriefing Concluso',
          message: 'Tutte le squadre si spostano verso la postazione della sessione successiva (Workshop o Scenario) come da timeline.',
        },
      ];

  const handleApplyPreset = (preset: (typeof presets)[0]) => {
    setType(preset.type);
    setPriority(preset.priority);
    setTitle(preset.title);
    setMessage(preset.message);
  };

  const handleToggleGroup = (group: 'ALL' | GroupType) => {
    if (group === 'ALL') {
      setTargetGroups(['ALL']);
    } else {
      let next = targetGroups.filter((g) => g !== 'ALL');
      if (next.includes(group)) {
        next = next.filter((g) => g !== group);
        if (next.length === 0) next = ['ALL'];
      } else {
        next.push(group);
      }
      setTargetGroups(next);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirector) return;
    if (!title.trim() || !message.trim()) return;

    sendBroadcastAlert({
      senderRole: 'direttore',
      senderName,
      type,
      priority,
      title,
      message,
      targetGroups,
    });

    onClose();
  };

  // If not director, render security access restriction notice
  if (!isDirector) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
        <div
          id="broadcast-modal-unauthorized"
          className="bg-neutral-950 border-4 border-red-600 shadow-2xl w-full max-w-lg text-neutral-100 p-6 space-y-4 text-center"
        >
          <div className="w-14 h-14 mx-auto bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <span className="px-2 py-0.5 bg-red-900/60 text-red-300 border border-red-700 text-[10px] font-mono font-bold uppercase tracking-wider">
              {isEn ? 'COURSE DIRECTION RESTRICTED ACCESS' : 'ACCESSO RISERVATO DIREZIONE'}
            </span>
            <h3 className="text-lg font-black text-white uppercase tracking-tight">
              {isEn ? 'BROADCAST FEATURE RESTRICTED' : 'FUNZIONALITÀ DI BROADCAST LIMITATA'}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed pt-2">
              {isEn
                ? 'Sending global broadcast announcements and alerts to all 60 participants and course screens is strictly reserved for Course Directors.'
                : 'L\'invio di annunci ed allerte Broadcast globali a tutti i 60 discenti e schermi del corso è consentito esclusivamente ai Direttori del Corso.'}
            </p>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {isEn
                ? 'For communications or urgent requests, use the SIGNAL / MESSAGE TO COMMAND feature.'
                : 'Per comunicazioni o richieste urgenti, utilizza la funzione SEGNALA / MESSAGGIO ALLA REGIA.'}
            </p>
          </div>
          <div className="pt-3 border-t border-neutral-800 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider border border-neutral-700 cursor-pointer"
            >
              {isEn ? 'UNDERSTOOD (CLOSE)' : 'HO CAPITO (CHIUDI)'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        id="broadcast-modal-card"
        className="bg-neutral-950 border-4 border-neutral-100 shadow-2xl w-full max-w-2xl text-neutral-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-4 border-neutral-800 bg-neutral-900 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-yellow-500 text-black font-black flex-shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-xl text-neutral-100 uppercase tracking-tight truncate">
                  {isEn ? 'TRANSMIT BROADCAST' : 'TRASMETTI BROADCAST'}
                </h3>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-yellow-950 text-yellow-300 border border-yellow-600 text-[10px] font-mono font-bold">
                  {isEn ? 'DIRECTION ONLY' : 'SOLO DIREZIONE'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-yellow-400 truncate">
                {isEn ? 'REAL-TIME NOTIFICATION TO ALL MESH DEVICES' : 'NOTIFICA REAL-TIME TUTTI I DISPOSITIVI MESH'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label={isEn ? 'Close broadcast window' : 'Chiudi finestra broadcast'}
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">
              {isEn ? 'QUICK PRESETS' : 'MODELLI RAPIDI'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="min-h-[48px] text-left text-xs p-2.5 sm:p-3 bg-neutral-900 hover:bg-neutral-800 border-2 border-neutral-800 hover:border-orange-500 text-neutral-200 transition-all cursor-pointer font-medium"
                >
                  <div className="font-black uppercase tracking-wider text-neutral-100 text-[11px] mb-0.5 truncate">{preset.label}</div>
                  <div className="text-[11px] text-neutral-400 line-clamp-1">{preset.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alert Type */}
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">
                {isEn ? 'ALERT TYPE' : 'TIPO DI ALLERTA'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setType('info')}
                  className={`min-h-[48px] flex flex-col items-center justify-center p-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer ${
                    type === 'info'
                      ? 'bg-neutral-100 text-black border-neutral-100 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <Info className="w-4 h-4 mb-0.5" />
                  Info
                </button>
                <button
                  type="button"
                  onClick={() => setType('phase_change')}
                  className={`min-h-[48px] flex flex-col items-center justify-center p-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer ${
                    type === 'phase_change'
                      ? 'bg-orange-500 text-black border-orange-500 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <Bell className="w-4 h-4 mb-0.5" />
                  {isEn ? 'Phase' : 'Cambio'}
                </button>
                <button
                  type="button"
                  onClick={() => setType('warning')}
                  className={`min-h-[48px] flex flex-col items-center justify-center p-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer ${
                    type === 'warning'
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mb-0.5" />
                  {isEn ? 'Warning' : 'Attenzione'}
                </button>
                <button
                  type="button"
                  onClick={() => setType('emergency')}
                  className={`min-h-[48px] flex flex-col items-center justify-center p-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer ${
                    type === 'emergency'
                      ? 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <Flame className="w-4 h-4 mb-0.5" />
                  {isEn ? 'Emergency' : 'Emergenza'}
                </button>
                <button
                  type="button"
                  onClick={() => setType('pause')}
                  className={`min-h-[48px] flex flex-col items-center justify-center p-2 text-xs font-black uppercase tracking-wider border-2 col-span-2 transition-colors cursor-pointer ${
                    type === 'pause'
                      ? 'bg-neutral-100 text-black border-neutral-100 shadow-md'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <PauseCircle className="w-4 h-4 mb-0.5" />
                  {isEn ? 'Pause / Tech Reset' : 'Pausa / Reset Tecnico'}
                </button>
              </div>
            </div>

            {/* Sender & Priority */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                  {isEn ? 'SENDER' : 'MITTENTE'}
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                  {isEn ? 'PRIORITY' : 'PRIORITÀ'}
                </label>
                <div className="flex gap-2">
                  {(['normal', 'high', 'critical'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 min-h-[44px] py-2 text-xs font-black uppercase tracking-wider border-2 cursor-pointer ${
                        priority === p
                          ? 'bg-neutral-100 text-black border-neutral-100 shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p === 'normal'
                        ? isEn
                          ? 'Normal'
                          : 'Normale'
                        : p === 'high'
                        ? isEn
                          ? 'High'
                          : 'Alta'
                        : isEn
                        ? 'Critical'
                        : 'Critica'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Target Groups */}
          <div>
            <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">
              {isEn ? 'RECIPIENTS' : 'DESTINATARI'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => handleToggleGroup('ALL')}
                className={`min-h-[44px] col-span-2 sm:col-span-1 px-3 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer text-center ${
                  targetGroups.includes('ALL')
                    ? 'bg-orange-500 border-orange-500 text-black shadow-md'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {isEn ? 'All (60 Part.)' : 'Tutti (60 Disc.)'}
              </button>
              {(['A', 'B', 'C', 'D'] as GroupType[]).map((grp) => {
                const isSelected = targetGroups.includes(grp);
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => handleToggleGroup(grp)}
                    className={`min-h-[44px] px-3 py-2 text-xs font-black uppercase tracking-wider border-2 transition-colors cursor-pointer text-center ${
                      isSelected
                        ? 'bg-neutral-100 border-neutral-100 text-black shadow-md'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isEn ? `Group ${grp}` : `Gruppo ${grp}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                {isEn ? 'ANNOUNCEMENT TITLE' : 'TITOLO ANNUNCIO'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isEn ? 'E.G. PHASE CHANGE IN 5 MINUTES - SBAR HANDOVER' : 'ES. CAMBIO FASE TRA 5 MINUTI - HANDOVER SBAR'}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white uppercase focus:outline-hidden focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                {isEn ? 'DETAILED MESSAGE' : 'MESSAGGIO DETTAGLIATO'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={isEn ? 'Enter instructions for teams and technicians...' : 'Inserisci qui le istruzioni operative per le squadre e i tecnici...'}
                className="w-full px-3.5 py-2.5 bg-neutral-900 border-2 border-neutral-700 text-sm font-medium text-white focus:outline-hidden focus:border-orange-500 resize-none"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t-2 border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-neutral-900 border border-neutral-800 transition-colors cursor-pointer text-center"
            >
              {isEn ? 'CANCEL' : 'ANNULLA'}
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 transition-colors cursor-pointer shadow-lg text-center"
            >
              <Send className="w-4 h-4" />
              {isEn ? 'SEND BROADCAST NOW' : 'INVIA BROADCAST ORA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
