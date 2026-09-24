import React, { useState, useEffect, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import { SimulatorPatient, GroupType, CourseDay } from '../../types';
import { INITIAL_SIMULATOR_PATIENTS } from '../../data/initialData';
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplet,
  Edit3,
  FileText,
  Plus,
  RotateCcw,
  Save,
  Shield,
  Trash2,
  Users,
  Wrench,
  X,
  Zap,
  Sliders,
  Eye,
  Info
} from 'lucide-react';

interface ScenarioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: number | null;
}

const COMMON_TCCC_PROCEDURES = [
  'Tourniquet TCCC (Arto)',
  'Tourniquet giunzionale (JETT / SAM)',
  'Wound Packing con garza emostatica',
  'Cricotirotomia chirurgica (CRIC)',
  'Decompressiva con ago (ND - 14G)',
  'Chest Seal valvolato',
  'Barella tattica & Estrazione sotto fuoco',
  'Kit prevenzione ipotermia & Acido Tranexamico',
  'Bendaggio compressivo d\'emergenza',
  'Accesso intraosseo (FAST1 / EZ-IO)'
];

const COMMON_SHOCKROOM_PROCEDURES = [
  'Approccio ABCDE sistematico',
  'Ecografia clinica e-FAST estesa',
  'Toracostomia con drenaggio pleurico',
  'Resuscitative Thoracotomy d\'emergenza',
  'Intubazione sequenza rapida (RSI) con videolaringoscopio',
  'Massimo Protocollo Trasfusionale (MTP 1:1:1)',
  'Accesso venoso centrale ecoguidato (CVC)',
  'Pelvic Binder / Fascia pelvica stabilizzante',
  'Decompressione cranica / Monitoraggio PIC',
  'Handover SBAR con Team Tattico'
];

export const ScenarioEditorModal: React.FC<ScenarioEditorModalProps> = ({
  isOpen,
  onClose,
  initialPatientId
}) => {
  const {
    simulatorPatients,
    updateSimulatorPatient,
    addSimulatorPatient,
    deleteSimulatorPatient,
    technicians,
    language
  } = useCourse();

  const isEn = language === 'en';

  // Active scenario ID being edited
  const [activeId, setActiveId] = useState<number>(() => {
    if (initialPatientId && simulatorPatients.some(p => p.id === initialPatientId)) {
      return initialPatientId;
    }
    return simulatorPatients.length > 0 ? simulatorPatients[0].id : 1;
  });

  // Is creating a new scenario mode?
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Active tab in editor: 'clinical' | 'tactical' | 'logistics' | 'preview'
  const [editorTab, setEditorTab] = useState<'clinical' | 'tactical' | 'logistics' | 'preview'>('clinical');

  // Working state of the scenario being edited
  const [formData, setFormData] = useState<SimulatorPatient | null>(null);

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Inputs for adding new items
  const [newInjuryInput, setNewInjuryInput] = useState<string>('');
  const [newExtraProcInput, setNewExtraProcInput] = useState<string>('');
  const [newIntraProcInput, setNewIntraProcInput] = useState<string>('');

  // Sync active scenario into form
  useEffect(() => {
    if (!isOpen) return;

    if (isCreatingNew) {
      const nextId = simulatorPatients.length > 0 ? Math.max(...simulatorPatients.map(p => p.id)) + 1 : 25;
      const blankPatient: SimulatorPatient = {
        id: nextId,
        day: 2,
        period: 'mattina',
        scenarioCode: `Scenario ${nextId} (Custom)`,
        groupExtraAssigned: 'A',
        groupIntraAssigned: 'B',
        teamExtraAssigned: 1,
        teamIntraAssigned: 4,
        lesioni: [isEn ? 'New trauma injury' : 'Nuova lesione traumatica'],
        dinamicaDelleLesioni: isEn
          ? 'Description of incident, hostile environment, blast or ballistic dynamics...'
          : 'Descrizione della dinamica dell\'incidente, ambiente tattico ostile o scenario urbano...',
        procedureExtra: ['Tourniquet TCCC (Arto)', 'Wound Packing con garza emostatica'],
        procedureIntra: ['Approccio ABCDE sistematico', 'Ecografia clinica e-FAST estesa'],
        procedureSpecifiche: [],
        approccioTcccVsShockRoom: isEn
          ? 'TCCC: Immediate hemorrhage control under fire. Shock Room: ABCDE resuscitation and thoracic stabilization.'
          : 'In TCCC: Controllo emorragia immediata under fire. In Shock Room: Rianimazione ABCDE e stabilizzazione toracica.',
        moulageProtesi: isEn ? 'Simulated silicon wound prosthetics with blood pumping line' : 'Protesi silicone lesione con linea di pompaggio sangue sintetico',
        simulatori: isEn ? 'High-fidelity trauma simulator manikin' : 'Manichino alta fedeltà TraumaSim',
        attoriCount: 1,
        attoreDettagli: isEn ? 'Actor 1: conscious patient, agitation, severe pain' : 'Attore 1: paziente cosciente, agitato, dolore acuto',
        techNotes: isEn ? 'Check hydraulic pressure and consumable reset turnaround' : 'Verificare pressione idraulica e turnaround reset postazione',
        readinessStatus: 'ready',
        techChecklist: {
          preDone: false,
          intraDone: false,
          postDone: false,
        },
      };
      setFormData(blankPatient);
      setHasUnsavedChanges(false);
      setStatusMessage(null);
      return;
    }

    const targetPatient = simulatorPatients.find(p => p.id === activeId);
    if (targetPatient) {
      setFormData(JSON.parse(JSON.stringify(targetPatient)));
      setHasUnsavedChanges(false);
      setStatusMessage(null);
    }
  }, [activeId, isCreatingNew, isOpen, simulatorPatients, isEn]);

  // When initialPatientId prop changes
  useEffect(() => {
    if (initialPatientId && simulatorPatients.some(p => p.id === initialPatientId)) {
      setActiveId(initialPatientId);
      setIsCreatingNew(false);
    }
  }, [initialPatientId, simulatorPatients]);

  // Handle switching scenario
  const handleSelectScenario = (id: number) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        isEn
          ? 'You have unsaved changes in this scenario. Discard and switch?'
          : 'Ci sono modifiche non salvate in questo scenario. Procedere perdendo le modifiche?'
      );
      if (!confirmSwitch) return;
    }
    setIsCreatingNew(false);
    setActiveId(id);
  };

  // Step prev / next
  const currentIndex = simulatorPatients.findIndex(p => p.id === activeId);
  const handlePrevScenario = () => {
    if (currentIndex > 0) {
      handleSelectScenario(simulatorPatients[currentIndex - 1].id);
    }
  };
  const handleNextScenario = () => {
    if (currentIndex < simulatorPatients.length - 1) {
      handleSelectScenario(simulatorPatients[currentIndex + 1].id);
    }
  };

  // Helper to update form data
  const updateFormField = <K extends keyof SimulatorPatient>(key: K, value: SimulatorPatient[K]) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
    setHasUnsavedChanges(true);
    setStatusMessage(null);
  };

  // Injury list helpers
  const handleAddInjury = () => {
    if (!newInjuryInput.trim() || !formData) return;
    updateFormField('lesioni', [...formData.lesioni, newInjuryInput.trim()]);
    setNewInjuryInput('');
  };

  const handleUpdateInjury = (index: number, val: string) => {
    if (!formData) return;
    const next = [...formData.lesioni];
    next[index] = val;
    updateFormField('lesioni', next);
  };

  const handleRemoveInjury = (index: number) => {
    if (!formData || formData.lesioni.length <= 1) {
      alert(isEn ? 'At least one injury must be specified.' : 'È necessario mantenere almeno una lesione per lo scenario.');
      return;
    }
    const next = formData.lesioni.filter((_, idx) => idx !== index);
    updateFormField('lesioni', next);
  };

  // Procedures helpers
  const handleAddExtraProc = (procName: string) => {
    if (!procName.trim() || !formData) return;
    if (formData.procedureExtra.includes(procName.trim())) return;
    updateFormField('procedureExtra', [...formData.procedureExtra, procName.trim()]);
    setNewExtraProcInput('');
  };

  const handleRemoveExtraProc = (procName: string) => {
    if (!formData) return;
    updateFormField('procedureExtra', formData.procedureExtra.filter(p => p !== procName));
  };

  const handleAddIntraProc = (procName: string) => {
    if (!procName.trim() || !formData) return;
    if (formData.procedureIntra.includes(procName.trim())) return;
    updateFormField('procedureIntra', [...formData.procedureIntra, procName.trim()]);
    setNewIntraProcInput('');
  };

  const handleRemoveIntraProc = (procName: string) => {
    if (!formData) return;
    updateFormField('procedureIntra', formData.procedureIntra.filter(p => p !== procName));
  };

  // Save handler
  const handleSave = () => {
    if (!formData) return;

    if (!formData.scenarioCode.trim()) {
      setStatusMessage({ type: 'error', text: isEn ? 'Scenario Code is mandatory' : 'Il codice scenario è obbligatorio' });
      return;
    }
    if (formData.lesioni.length === 0 || !formData.lesioni[0].trim()) {
      setStatusMessage({ type: 'error', text: isEn ? 'At least one primary injury is required' : 'Almeno una lesione principale è richiesta' });
      return;
    }

    if (isCreatingNew) {
      // Add new scenario
      const { id, ...newPatientData } = formData;
      if (addSimulatorPatient) {
        addSimulatorPatient(newPatientData);
      }
      setIsCreatingNew(false);
      setActiveId(formData.id);
      setStatusMessage({
        type: 'success',
        text: isEn ? `New scenario #${formData.id} successfully created and synchronized!` : `Nuovo scenario #${formData.id} creato e sincronizzato con successo!`
      });
      setHasUnsavedChanges(false);
    } else {
      // Update existing scenario
      updateSimulatorPatient(formData.id, formData);
      setStatusMessage({
        type: 'success',
        text: isEn ? `Scenario #${formData.id} updated and synchronized in real-time!` : `Scenario #${formData.id} salvato e sincronizzato in tempo reale su tutti i dispositivi!`
      });
      setHasUnsavedChanges(false);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    if (!formData) return;
    const defaultPatient = INITIAL_SIMULATOR_PATIENTS.find(p => p.id === formData.id);
    if (!defaultPatient) {
      alert(isEn ? 'This is a custom scenario; no default template found.' : 'Questo è uno scenario personalizzato; nessun default trovato.');
      return;
    }
    const confirmReset = window.confirm(
      isEn
        ? `Reset Scenario #${formData.id} to original default values?`
        : `Ripristinare lo Scenario #${formData.id} ai valori originali del corso?`
    );
    if (!confirmReset) return;

    setFormData(JSON.parse(JSON.stringify(defaultPatient)));
    updateSimulatorPatient(formData.id, defaultPatient);
    setHasUnsavedChanges(false);
    setStatusMessage({
      type: 'success',
      text: isEn ? `Scenario #${formData.id} reset to factory defaults!` : `Scenario #${formData.id} ripristinato ai valori predefiniti!`
    });
  };

  // Duplicate scenario
  const handleDuplicate = () => {
    if (!formData) return;
    const nextId = simulatorPatients.length > 0 ? Math.max(...simulatorPatients.map(p => p.id)) + 1 : 25;
    const duplicated: SimulatorPatient = {
      ...formData,
      id: nextId,
      scenarioCode: `${formData.scenarioCode} (Copia)`,
      lesioni: [`${formData.lesioni[0]} (Copia)`, ...formData.lesioni.slice(1)],
    };

    if (addSimulatorPatient) {
      const { id, ...data } = duplicated;
      addSimulatorPatient(data);
    }
    setActiveId(nextId);
    setIsCreatingNew(false);
    setStatusMessage({
      type: 'success',
      text: isEn ? `Scenario duplicated as #${nextId}!` : `Scenario duplicato con successo come #${nextId}!`
    });
  };

  // Delete scenario (only for custom ones > 24)
  const handleDelete = () => {
    if (!formData) return;
    if (formData.id <= 24) {
      alert(isEn ? 'Core course scenarios (1-24) cannot be deleted. You can edit or reset them.' : 'I 24 scenari fondamentali del corso non possono essere eliminati, ma solo modificati o resettati.');
      return;
    }
    const confirmDelete = window.confirm(
      isEn ? `Are you sure you want to permanently delete custom scenario #${formData.id}?` : `Sei sicuro di voler eliminare definitivamente lo scenario #${formData.id}?`
    );
    if (!confirmDelete) return;

    if (deleteSimulatorPatient) {
      deleteSimulatorPatient(formData.id);
    }
    setActiveId(1);
    setStatusMessage({
      type: 'info',
      text: isEn ? `Custom scenario #${formData.id} deleted.` : `Scenario personalizzato #${formData.id} eliminato.`
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border-2 border-orange-500 max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-neutral-950 via-slate-900 to-neutral-950 p-3 sm:p-4 border-b border-orange-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-600 text-black flex items-center justify-center font-black rounded shrink-0 shadow-lg shadow-orange-600/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 font-black text-[10px] uppercase tracking-wider">
                  {isCreatingNew ? (isEn ? 'NEW SCENARIO CREATOR' : 'CREAZIONE NUOVO SCENARIO') : (isEn ? 'SCENARIO MASTER EDITOR' : 'EDITOR SCENARI MASTER')}
                </span>
                {hasUnsavedChanges && (
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] uppercase rounded animate-pulse">
                    ● {isEn ? 'Unsaved Changes' : 'Modifiche non salvate'}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>{formData?.scenarioCode || (isEn ? 'Scenario Editor' : 'Editor Scenari')}</span>
                {formData && (
                  <span className="text-neutral-400 font-normal text-xs">
                    (ID #{formData.id})
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer rounded"
            >
              <Save className="w-4 h-4" />
              <span>{isEn ? 'Save' : 'Salva'}</span>
            </button>
            <button
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirmExit = window.confirm(
                    isEn ? 'Discard unsaved changes and close?' : 'Chiudere l\'editor e perdere le modifiche non salvate?'
                  );
                  if (!confirmExit) return;
                }
                onClose();
              }}
              className="w-8 h-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STATUS BANNER */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                : statusMessage.type === 'error'
                ? 'bg-red-950/80 text-red-300 border-red-700'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
              {statusMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
          </div>
        )}

        {/* SCENARIO NAVIGATION BAR */}
        <div className="bg-neutral-950 px-3 sm:px-4 py-2.5 border-b border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={handlePrevScenario}
              disabled={currentIndex <= 0 || isCreatingNew}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none text-neutral-200 text-xs font-bold flex items-center gap-1 border border-neutral-800 cursor-pointer rounded"
              title={isEn ? 'Previous Scenario' : 'Scenario Precedente'}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Prev' : 'Prec.'}</span>
            </button>

            {/* Quick dropdown switcher */}
            <div className="flex-1 sm:w-80">
              <select
                value={isCreatingNew ? 'NEW' : activeId}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setIsCreatingNew(true);
                  } else {
                    handleSelectScenario(Number(e.target.value));
                  }
                }}
                className="w-full bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs font-bold py-1.5 px-2.5 rounded focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {isCreatingNew && (
                  <option value="NEW">➕ {isEn ? '-- Creating New Scenario --' : '-- Creazione Nuovo Scenario --'}</option>
                )}
                {simulatorPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} • {p.scenarioCode} • {p.lesioni[0]?.slice(0, 30)}... (D{p.day} {p.period === 'mattina' ? 'Mat.' : 'Pom.'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextScenario}
              disabled={currentIndex >= simulatorPatients.length - 1 || isCreatingNew}
              className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none text-neutral-200 text-xs font-bold flex items-center gap-1 border border-neutral-800 cursor-pointer rounded"
              title={isEn ? 'Next Scenario' : 'Scenario Successivo'}
            >
              <span className="hidden sm:inline">{isEn ? 'Next' : 'Succ.'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const ok = window.confirm(isEn ? 'Discard unsaved changes?' : 'Perdere le modifiche non salvate?');
                  if (!ok) return;
                }
                setIsCreatingNew(true);
              }}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border rounded cursor-pointer transition-all ${
                isCreatingNew
                  ? 'bg-orange-600 text-black border-orange-500 shadow-md'
                  : 'bg-neutral-900 text-orange-400 hover:text-white hover:bg-neutral-800 border-neutral-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? 'New Scenario' : 'Nuovo Scenario'}</span>
            </button>

            {!isCreatingNew && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-neutral-800 rounded cursor-pointer transition-colors"
                  title={isEn ? 'Duplicate as new scenario' : 'Duplica come nuovo scenario'}
                >
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">{isEn ? 'Duplicate' : 'Duplica'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 border border-neutral-800 rounded cursor-pointer transition-colors"
                  title={isEn ? 'Reset to factory defaults' : 'Ripristina ai valori predefiniti'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? 'Reset Default' : 'Ripristina'}</span>
                </button>

                {formData && formData.id > 24 && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2.5 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-bold flex items-center gap-1 border border-red-800 rounded cursor-pointer transition-colors"
                    title={isEn ? 'Delete this custom scenario' : 'Elimina questo scenario personalizzato'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* EDITOR TABS */}
        <div className="bg-neutral-900 px-3 sm:px-4 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setEditorTab('clinical')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              editorTab === 'clinical'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isEn ? '1. Clinical Profile & Injuries' : '1. Quadro Clinico & Lesioni'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorTab('tactical')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              editorTab === 'tactical'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isEn ? '2. Teams, Timing & Procedures' : '2. Squadre, Orari & Procedure'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorTab('logistics')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              editorTab === 'logistics'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isEn ? '3. Moulage, Hardware & Actors' : '3. Moulage, Simulatori & Attori'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEditorTab('preview')}
            className={`py-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              editorTab === 'preview'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isEn ? 'Preview Card' : 'Anteprima Scheda'}</span>
          </button>
        </div>

        {/* FORM CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {formData && (
            <>
              {/* TAB 1: CLINICAL PROFILE & INJURIES */}
              {editorTab === 'clinical' && (
                <div className="space-y-5">
                  {/* General Identification */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-950 p-4 border border-neutral-800 rounded">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Scenario Code' : 'Codice Scenario'} *
                      </label>
                      <input
                        type="text"
                        value={formData.scenarioCode}
                        onChange={(e) => updateFormField('scenarioCode', e.target.value)}
                        placeholder="e.g. Scenario 1 (TCCC)"
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-bold rounded focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Readiness Status' : 'Stato di Prontezza Operativa'}
                      </label>
                      <select
                        value={formData.readinessStatus || 'ready'}
                        onChange={(e) => updateFormField('readinessStatus', e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-bold rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="ready">🟢 {isEn ? 'Ready for Simulation' : 'Pronto / Operativo'}</option>
                        <option value="preparing">🟡 {isEn ? 'Preparing / Setup in Progress' : 'In Allestimento / Preparazione'}</option>
                        <option value="critical">🔴 {isEn ? 'Critical Issue Reported' : 'Criticità Segnalata / Blocco'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Criticality / Setup Note' : 'Note Criticità / Allestimento'}
                      </label>
                      <input
                        type="text"
                        value={formData.criticalityNotes || ''}
                        onChange={(e) => updateFormField('criticalityNotes', e.target.value)}
                        placeholder={isEn ? 'e.g. Needs replacement membrane...' : 'es. Pompa idraulica da calibrare...'}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Primary & Secondary Injuries */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <h3 className="text-xs font-black uppercase text-orange-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        <span>{isEn ? 'Clinical Injuries & Trauma Spectrum' : 'Elenco Lesioni & Quadro Traumatico'}</span>
                      </h3>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {isEn ? 'Primary injury is displayed as the scenario headline' : 'La prima lesione è il titolo principale dello scenario'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {formData.lesioni.map((lesione, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-[10px] font-black rounded shrink-0 ${idx === 0 ? 'bg-orange-600 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                            {idx === 0 ? (isEn ? 'MAIN' : 'PRINCIPALE') : `#${idx + 1}`}
                          </span>
                          <input
                            type="text"
                            value={lesione}
                            onChange={(e) => handleUpdateInjury(idx, e.target.value)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3 py-1.5 text-xs rounded focus:outline-none focus:border-orange-500"
                            placeholder={idx === 0 ? (isEn ? 'Primary traumatic injury (Title)' : 'Lesione traumatica principale (Titolo)') : (isEn ? 'Secondary injury...' : 'Lesione secondaria...')}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInjury(idx)}
                            className="p-1.5 bg-neutral-800 hover:bg-red-950 hover:text-red-400 text-neutral-400 rounded cursor-pointer transition-colors"
                            title={isEn ? 'Remove injury' : 'Rimuovi lesione'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add new injury input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={newInjuryInput}
                          onChange={(e) => setNewInjuryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddInjury();
                            }
                          }}
                          placeholder={isEn ? '+ Add secondary lesion (press Enter)...' : '+ Aggiungi lesione secondaria (premi Invio)...'}
                          className="flex-1 bg-neutral-900 border border-neutral-800 text-white px-3 py-1.5 text-xs rounded placeholder:text-neutral-600 focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddInjury}
                          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 rounded cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-orange-400" />
                          <span>{isEn ? 'Add' : 'Aggiungi'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamics & Environment Description */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-2">
                    <label className="block text-xs font-black uppercase text-orange-400">
                      {isEn ? 'Tactical Dynamics & Scene Environment Description' : 'Dinamica dell\'Evento & Descrizione Ambiente da Ricreare'}
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      {isEn
                        ? 'Describe context: under-fire ambush, IED blast, structure collapse, sniper, noise, light conditions...'
                        : 'Descrivi il contesto dell\'ingaggio: imboscata sotto fuoco ostile, deflagrazione IED, crollo strutturale, fumo o condizioni di luce...'}
                    </p>
                    <textarea
                      rows={3}
                      value={formData.dinamicaDelleLesioni || ''}
                      onChange={(e) => updateFormField('dinamicaDelleLesioni', e.target.value)}
                      placeholder={isEn ? 'Enter environmental dynamics and situational description...' : 'Inserisci la dinamica dell\'evento e la ricostruzione dell\'ambiente scenico...'}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 text-xs leading-relaxed rounded focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {/* Tactical vs Shock Room Approach */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-2">
                    <label className="block text-xs font-black uppercase text-cyan-400">
                      {isEn ? 'TCCC vs Shock Room Clinical Strategy Flow' : 'Flusso Strategico: Approccio TCCC vs Shock Room'}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.approccioTcccVsShockRoom || ''}
                      onChange={(e) => updateFormField('approccioTcccVsShockRoom', e.target.value)}
                      placeholder={isEn ? 'Specify priorities in the tactical field vs the hospital shock room...' : 'Descrivi le priorità d\'intervento in ambiente tattico rispetto alla stabilizzazione avanzata in Shock Room...'}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 text-xs leading-relaxed rounded focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TEAMS, TIMING & PROCEDURES */}
              {editorTab === 'tactical' && (
                <div className="space-y-5">
                  {/* Scheduling: Day & Period */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950 p-4 border border-neutral-800 rounded">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Training Day' : 'Giorno di Corso'}
                      </label>
                      <select
                        value={formData.day}
                        onChange={(e) => updateFormField('day', Number(e.target.value) as CourseDay)}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-bold rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value={2}>{isEn ? 'Day 2 (Scenarios 1-12)' : 'Day 2 (Scenari 1-12)'}</option>
                        <option value={3}>{isEn ? 'Day 3 (Scenarios 13-24)' : 'Day 3 (Scenari 13-24)'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Session Period' : 'Fascia Oraria / Periodo'}
                      </label>
                      <select
                        value={formData.period}
                        onChange={(e) => updateFormField('period', e.target.value as 'mattina' | 'pomeriggio')}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-bold rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="mattina">{isEn ? 'Morning (Mattina)' : 'Mattina (Blocco 1 o 3)'}</option>
                        <option value="pomeriggio">{isEn ? 'Afternoon (Pomeriggio)' : 'Pomeriggio (Blocco 2 o 4)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Team & Group Assignments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* TCCC Extra-Hospital */}
                    <div className="bg-neutral-950 p-4 border border-orange-700/50 rounded space-y-3">
                      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                        <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                        <h4 className="text-xs font-black uppercase text-orange-400">
                          {isEn ? 'TCCC Phase (Tactical Environment)' : 'Fase TCCC (Ambiente Tattico)'}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                            {isEn ? 'TCCC Group' : 'Gruppo TCCC'}
                          </label>
                          <select
                            value={formData.groupExtraAssigned}
                            onChange={(e) => updateFormField('groupExtraAssigned', e.target.value as GroupType)}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white px-2 py-1.5 text-xs font-bold rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                          >
                            <option value="A">Gruppo ALPHA (A)</option>
                            <option value="B">Gruppo BRAVO (B)</option>
                            <option value="C">Gruppo CHARLIE (C)</option>
                            <option value="D">Gruppo DELTA (D)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                            {isEn ? 'TCCC Team #' : 'Squadra TCCC #'}
                          </label>
                          <select
                            value={formData.teamExtraAssigned}
                            onChange={(e) => updateFormField('teamExtraAssigned', Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white px-2 py-1.5 text-xs font-bold rounded focus:outline-none focus:border-orange-500 cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                              <option key={t} value={t}>Squadra {t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Shock Room Intra-Hospital */}
                    <div className="bg-neutral-950 p-4 border border-cyan-700/50 rounded space-y-3">
                      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full" />
                        <h4 className="text-xs font-black uppercase text-cyan-400">
                          {isEn ? 'Shock Room Phase (Hospital Box)' : 'Fase Shock Room (Box Ospedaliero)'}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                            {isEn ? 'Shock Room Group' : 'Gruppo Shock Room'}
                          </label>
                          <select
                            value={formData.groupIntraAssigned}
                            onChange={(e) => updateFormField('groupIntraAssigned', e.target.value as GroupType)}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white px-2 py-1.5 text-xs font-bold rounded focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            <option value="A">Gruppo ALPHA (A)</option>
                            <option value="B">Gruppo BRAVO (B)</option>
                            <option value="C">Gruppo CHARLIE (C)</option>
                            <option value="D">Gruppo DELTA (D)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                            {isEn ? 'Shock Room Team #' : 'Squadra Shock Room #'}
                          </label>
                          <select
                            value={formData.teamIntraAssigned}
                            onChange={(e) => updateFormField('teamIntraAssigned', Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white px-2 py-1.5 text-xs font-bold rounded focus:outline-none focus:border-cyan-500 cursor-pointer"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                              <option key={t} value={t}>Squadra {t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TCCC Procedures Checklist */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <h4 className="text-xs font-black uppercase text-orange-400">
                        {isEn ? 'TCCC Mandatory Procedures (Tactical Phase)' : 'Procedure TCCC Richieste (Fase Tattica)'}
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formData.procedureExtra.length} {isEn ? 'procedures defined' : 'procedure configurate'}
                      </span>
                    </div>

                    {/* Active tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {formData.procedureExtra.map((proc, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-orange-950 text-orange-200 border border-orange-700/70 text-xs font-bold flex items-center gap-1.5 rounded"
                        >
                          <span>{proc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraProc(proc)}
                            className="hover:text-red-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {formData.procedureExtra.length === 0 && (
                        <span className="text-xs text-neutral-500 italic">
                          {isEn ? 'No TCCC procedures added yet.' : 'Nessuna procedura TCCC aggiunta.'}
                        </span>
                      )}
                    </div>

                    {/* Add custom procedure */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newExtraProcInput}
                        onChange={(e) => setNewExtraProcInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddExtraProc(newExtraProcInput);
                          }
                        }}
                        placeholder={isEn ? 'Type custom TCCC procedure and press Enter...' : 'Scrivi procedura TCCC personalizzata e premi Invio...'}
                        className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3 py-1.5 text-xs rounded focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddExtraProc(newExtraProcInput)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 rounded cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-orange-400" />
                        <span>{isEn ? 'Add' : 'Aggiungi'}</span>
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="pt-2 border-t border-neutral-850">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1.5">
                        {isEn ? 'Quick-add standard TCCC procedure:' : 'Aggiunta rapida procedura standard TCCC:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_TCCC_PROCEDURES.map((p, idx) => {
                          const isAlreadyAdded = formData.procedureExtra.includes(p);
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddExtraProc(p)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                                isAlreadyAdded
                                  ? 'bg-neutral-900 text-neutral-600 cursor-default'
                                  : 'bg-neutral-850 hover:bg-neutral-700 text-neutral-300 border border-neutral-750 cursor-pointer'
                              }`}
                            >
                              + {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Shock Room Procedures Checklist */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <h4 className="text-xs font-black uppercase text-cyan-400">
                        {isEn ? 'Shock Room Mandatory Procedures (ABCDE Phase)' : 'Procedure Shock Room Richieste (Fase ABCDE)'}
                      </h4>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {formData.procedureIntra.length} {isEn ? 'procedures defined' : 'procedure configurate'}
                      </span>
                    </div>

                    {/* Active tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {formData.procedureIntra.map((proc, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-cyan-950 text-cyan-200 border border-cyan-700/70 text-xs font-bold flex items-center gap-1.5 rounded"
                        >
                          <span>{proc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIntraProc(proc)}
                            className="hover:text-red-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {formData.procedureIntra.length === 0 && (
                        <span className="text-xs text-neutral-500 italic">
                          {isEn ? 'No Shock Room procedures added yet.' : 'Nessuna procedura Shock Room aggiunta.'}
                        </span>
                      )}
                    </div>

                    {/* Add custom procedure */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newIntraProcInput}
                        onChange={(e) => setNewIntraProcInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddIntraProc(newIntraProcInput);
                          }
                        }}
                        placeholder={isEn ? 'Type custom Shock Room procedure and press Enter...' : 'Scrivi procedura Shock Room personalizzata e premi Invio...'}
                        className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3 py-1.5 text-xs rounded focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddIntraProc(newIntraProcInput)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 rounded cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{isEn ? 'Add' : 'Aggiungi'}</span>
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="pt-2 border-t border-neutral-850">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1.5">
                        {isEn ? 'Quick-add standard Shock Room procedure:' : 'Aggiunta rapida procedura standard Shock Room:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {COMMON_SHOCKROOM_PROCEDURES.map((p, idx) => {
                          const isAlreadyAdded = formData.procedureIntra.includes(p);
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddIntraProc(p)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
                                isAlreadyAdded
                                  ? 'bg-neutral-900 text-neutral-600 cursor-default'
                                  : 'bg-neutral-850 hover:bg-neutral-700 text-neutral-300 border border-neutral-750 cursor-pointer'
                              }`}
                            >
                              + {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MOULAGE, HARDWARE & ACTORS */}
              {editorTab === 'logistics' && (
                <div className="space-y-5">
                  {/* Moulage & Prosthetics */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-2">
                    <label className="block text-xs font-black uppercase text-red-400 flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-red-400" />
                      <span>{isEn ? 'Moulage & Prosthetic Specifications (Sim Lab / Moulage Team)' : 'Specifiche Moulage & Protesi (Laboratorio Silicone & Trucco)'}</span>
                    </label>
                    <p className="text-[11px] text-neutral-400">
                      {isEn
                        ? 'Detail silicone prosthetic models, artificial blood supply, arterial vs venous bleeding, pneumatic lines...'
                        : 'Dettagliare protesi in silicone, circuito sangue sintetico, sanguinamento pulsatile vs continuo, ustioni, fratture...'}
                    </p>
                    <textarea
                      rows={3}
                      value={formData.moulageProtesi}
                      onChange={(e) => updateFormField('moulageProtesi', e.target.value)}
                      placeholder={isEn ? 'e.g. Femoral junctional prosthetic with pulsatile arterial pump...' : 'es. Protesi CRICO espansibile sanguinante, ferita arma da fuoco con pompa idraulica...'}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 text-xs leading-relaxed rounded focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Simulators & Hardware */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-2">
                    <label className="block text-xs font-black uppercase text-amber-400 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <span>{isEn ? 'Hardware Manikins & Training Simulators' : 'Simulatori, Manichini & Hardware di Postazione'}</span>
                    </label>
                    <input
                      type="text"
                      value={formData.simulatori}
                      onChange={(e) => updateFormField('simulatori', e.target.value)}
                      placeholder={isEn ? 'e.g. Soft chest simulator + TraumaSim High Fidelity Full Body...' : 'es. Manichino Alta Fedeltà TraumaSim Pro + Torace Morbido decompressivo...'}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-medium rounded focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Actors / Figuranti Setup */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-950 p-4 border border-neutral-800 rounded">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Actor / Roleplayer Count' : 'Numero Attori / Figuranti'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={formData.attoriCount}
                        onChange={(e) => updateFormField('attoriCount', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs font-bold rounded focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                        {isEn ? 'Actor Acting Instructions & Behavior' : 'Copione & Dettagli Comportamento Attore'}
                      </label>
                      <input
                        type="text"
                        value={formData.attoreDettagli || ''}
                        onChange={(e) => updateFormField('attoreDettagli', e.target.value)}
                        placeholder={isEn ? 'e.g. Conscious, severe dyspnea, responsive to voice initially...' : 'es. Cosciente agitato, dispnea grave, risponde a stimoli vocali all\'ingaggio...'}
                        className="w-full bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-xs rounded focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Tech Notes & Audio/Video Regia Instructions */}
                  <div className="bg-neutral-950 p-4 border border-neutral-800 rounded space-y-2">
                    <label className="block text-xs font-black uppercase text-purple-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span>{isEn ? 'Control Room (Regia) & Station Technician Technical Notes' : 'Istruzioni Regia Audio/Video & Team Tecnico di Postazione'}</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.techNotes || ''}
                      onChange={(e) => updateFormField('techNotes', e.target.value)}
                      placeholder={isEn ? 'e.g. Pump pressure 120 mmHg, 15-min turnaround reset, replenish blood pouches...' : 'es. Verificare pompa a 120 mmHg, ricaricare sacca sangue 500ml e sostituire membrana crico...'}
                      className="w-full bg-neutral-900 border border-neutral-700 text-white p-3 text-xs leading-relaxed rounded focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: PREVIEW CARD */}
              {editorTab === 'preview' && (
                <div className="space-y-4">
                  <div className="bg-neutral-950 border border-neutral-800 p-5 rounded space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-orange-600 text-black font-black text-xs rounded">
                          #{formData.id}
                        </span>
                        <span className="text-orange-400 font-bold text-sm">{formData.scenarioCode}</span>
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold rounded">
                          Day {formData.day} • {formData.period.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">
                        {formData.readinessStatus === 'critical' ? '🔴 Criticità' : formData.readinessStatus === 'preparing' ? '🟡 In Allestimento' : '🟢 Pronto'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white">{formData.lesioni[0]}</h3>
                      {formData.lesioni.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {formData.lesioni.slice(1).map((l, i) => (
                            <span key={i} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[11px] rounded">
                              + {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-neutral-900 p-3 border border-neutral-800 text-xs text-neutral-300 rounded leading-relaxed">
                      <span className="text-neutral-500 uppercase text-[10px] font-bold block mb-1">{isEn ? 'Dynamics & Setting:' : 'Dinamica & Ambiente:'}</span>
                      {formData.dinamicaDelleLesioni}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-neutral-900 p-3 border border-orange-900/40 rounded space-y-1.5">
                        <span className="text-orange-400 font-bold uppercase text-[10px] block">
                          TCCC (Squadra {formData.teamExtraAssigned} • Grp {formData.groupExtraAssigned})
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-neutral-300 text-[11px]">
                          {formData.procedureExtra.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-neutral-900 p-3 border border-cyan-900/40 rounded space-y-1.5">
                        <span className="text-cyan-400 font-bold uppercase text-[10px] block">
                          Shock Room (Squadra {formData.teamIntraAssigned} • Grp {formData.groupIntraAssigned})
                        </span>
                        <ul className="list-disc pl-4 space-y-0.5 text-neutral-300 text-[11px]">
                          {formData.procedureIntra.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-neutral-850">
                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase font-bold block">{isEn ? 'Hardware & Manikins:' : 'Simulatori:'}</span>
                        <span className="text-white font-medium">{formData.simulatori}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase font-bold block">{isEn ? 'Actors / Moulage:' : 'Attori / Moulage:'}</span>
                        <span className="text-white font-medium">{formData.attoriCount} attori ({formData.moulageProtesi})</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-neutral-950 p-3 sm:p-4 border-t border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-400 font-mono hidden sm:block">
            {hasUnsavedChanges ? (
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{isEn ? 'You have unsaved changes.' : 'Ci sono modifiche non salvate in memoria.'}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>{isEn ? 'All changes synchronized.' : 'Tutti i dati sono sincronizzati.'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                if (hasUnsavedChanges) {
                  const confirmExit = window.confirm(
                    isEn ? 'Discard unsaved changes and close?' : 'Chiudere l\'editor e perdere le modifiche non salvate?'
                  );
                  if (!confirmExit) return;
                }
                onClose();
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors"
            >
              {isEn ? 'Cancel' : 'Chiudi'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-orange-600/30 rounded cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEn ? 'Save Changes' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
