import React, { useState } from 'react';
import { ProtesiItem, CourseDay, SessionPeriod } from '../../types';
import { useCourse } from '../../context/CourseContext';
import {
  X,
  Save,
  Trash2,
  Plus,
  Wrench,
  Droplet,
  Layers,
  ClipboardList,
  AlertCircle,
  Sparkles,
  Package,
} from 'lucide-react';

interface ProtesiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: ProtesiItem | null; // null means create new
}

const DISTRICT_OPTIONS: { id: ProtesiItem['district']; labelIt: string; labelEn: string }[] = [
  { id: 'VIE_AEREE', labelIt: 'VIE AEREE (CRICO)', labelEn: 'AIRWAY (CRIC)' },
  { id: 'TORACE_CUORE', labelIt: 'TORACE & CUORE BIOLOGICO', labelEn: 'CHEST & BIOLOGICAL HEART' },
  { id: 'COLLO_VASCOLARE', labelIt: 'COLLO & EMORRAGIE GIUNZIONALI', labelEn: 'NECK & JUNCTIONAL BLEEDING' },
  { id: 'ADDOME_PELVI', labelIt: 'ADDOME, EVISCERAZIONE & IMPALAMENTO', labelEn: 'ABDOMEN, EVISCERATION & IMPALEMENT' },
  { id: 'ARTI_AMPUTAZIONI', labelIt: 'ARTI, AMPUTAZIONI & REBOA', labelEn: 'EXTREMITIES, AMPUTATIONS & REBOA' },
  { id: 'MAXILLO_FACCIALE', labelIt: 'MAXILLO-FACCIALE', labelEn: 'MAXILLOFACIAL' },
  { id: 'USTIONI_BLAST', labelIt: 'USTIONI & BLAST NOTTURNO', labelEn: 'BURNS & NIGHT BLAST' },
];

const SUGGESTED_FEATURES = [
  'Pompa arteriosa pulsante a comando remoto',
  'Espansione pneumatica ematoma cervicale',
  'Membrana cricotiroidea incidibile e sostituibile',
  'Camera pneumatica per bolle ematiche (pneumotorace)',
  'Tessuto biologico morbido suino per dissezione reale',
  'Modulo eviscerazione anse intestinali',
  'Canale fluidico venoso a bassa pressione',
  'Dispositivo REBOA compatibile Zona 1 / Zona 3',
];

const SUGGESTED_PROCEDURES = [
  'Cricotirotomia chirurgica (CRIC)',
  'Medicazione toracica occlusiva (Chest Seal)',
  'Toracostomia con dito (Finger Thoracostomy)',
  'Wound packing emostatico giunzionale',
  'Tourniquet arto / giunzionale (SAM/JETT)',
  'Inserimento catetere REBOA femorale',
  'Decompressione con ago toracico',
  'Packing peritoneale Damage Control',
];

const SUGGESTED_CONSUMABLES = [
  'Membrana in silicone di ricambio',
  'Cannula tracheostomica N.6 cuffiata',
  'Bisturi chirurgico lama 10/11',
  'Sangue sintetico venoso 500ml',
  'Sangue sintetico arterioso 500ml',
  'Chest Seal ventilato TCCC',
  'Garze emostatiche QuikClot Combat Gauze',
  'Laccio emostatico CAT Gen 7',
  'Tubi in silicone 4mm alta pressione',
  'Silicone bicomponente rapido per moulage',
];

export const ProtesiEditModal: React.FC<ProtesiEditModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { language, addProtesiItem, updateProtesiItem, deleteProtesiItem, technicians } = useCourse();
  const isEn = language === 'en';
  const isEditMode = Boolean(itemToEdit);

  // Form states
  const [code, setCode] = useState(itemToEdit?.code || `PR-${Math.floor(10 + Math.random() * 90)}`);
  const [name, setName] = useState(itemToEdit?.name || '');
  const [district, setDistrict] = useState<ProtesiItem['district']>(itemToEdit?.district || 'VIE_AEREE');
  const [description, setDescription] = useState(itemToEdit?.description || '');
  const [leadTechnician, setLeadTechnician] = useState(itemToEdit?.leadTechnician || 'Silvia Rossi (Lead Moulage)');
  const [techRequirements, setTechRequirements] = useState(itemToEdit?.techRequirements || '');

  // Dynamic Array States
  const [activeFeatures, setActiveFeatures] = useState<string[]>(itemToEdit?.activeFeatures || []);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [requiredProcedures, setRequiredProcedures] = useState<string[]>(itemToEdit?.requiredProcedures || []);
  const [newProcedureText, setNewProcedureText] = useState('');

  const [consumables, setConsumables] = useState<string[]>(itemToEdit?.consumables || []);
  const [newConsumableText, setNewConsumableText] = useState('');

  // Scenarios state
  const [scenariosUsed, setScenariosUsed] = useState(itemToEdit?.scenariosUsed || []);
  const [newScenarioPatientId, setNewScenarioPatientId] = useState<number>(1);
  const [newScenarioCode, setNewScenarioCode] = useState<string>('Scenario TCCC');
  const [newScenarioDay, setNewScenarioDay] = useState<CourseDay>(2);
  const [newScenarioPeriod, setNewScenarioPeriod] = useState<SessionPeriod>('mattina');
  const [newScenarioTeamExtra, setNewScenarioTeamExtra] = useState<number>(1);
  const [newScenarioTeamIntra, setNewScenarioTeamIntra] = useState<number>(4);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  // Add Item to arrays
  const handleAddFeature = (feature?: string) => {
    const text = (feature || newFeatureText).trim();
    if (!text) return;
    if (!activeFeatures.includes(text)) {
      setActiveFeatures((prev) => [...prev, text]);
    }
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setActiveFeatures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddProcedure = (procedure?: string) => {
    const text = (procedure || newProcedureText).trim();
    if (!text) return;
    if (!requiredProcedures.includes(text)) {
      setRequiredProcedures((prev) => [...prev, text]);
    }
    setNewProcedureText('');
  };

  const handleRemoveProcedure = (idx: number) => {
    setRequiredProcedures((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddConsumable = (cons?: string) => {
    const text = (cons || newConsumableText).trim();
    if (!text) return;
    if (!consumables.includes(text)) {
      setConsumables((prev) => [...prev, text]);
    }
    setNewConsumableText('');
  };

  const handleRemoveConsumable = (idx: number) => {
    setConsumables((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddScenarioAssignment = () => {
    if (!newScenarioCode.trim()) return;
    setScenariosUsed((prev) => [
      ...prev,
      {
        patientId: Number(newScenarioPatientId),
        scenarioCode: newScenarioCode.trim(),
        day: newScenarioDay,
        period: newScenarioPeriod,
        teamExtra: Number(newScenarioTeamExtra),
        teamIntra: Number(newScenarioTeamIntra),
      },
    ]);
  };

  const handleRemoveScenarioAssignment = (idx: number) => {
    setScenariosUsed((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError(isEn ? 'Please specify a prosthesis name.' : 'Inserisci il nome della protesi.');
      return;
    }
    if (!code.trim()) {
      setValidationError(isEn ? 'Please specify a prosthesis code.' : 'Inserisci un codice univoco per la protesi.');
      return;
    }

    const payload: ProtesiItem = {
      id: itemToEdit?.id || `prot-${code.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${Date.now().toString().slice(-4)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      district,
      description: description.trim() || (isEn ? 'No description provided.' : 'Nessuna descrizione specificata.'),
      activeFeatures: activeFeatures.length > 0 ? activeFeatures : [isEn ? 'Standard tactical tissue' : 'Tessuto tattico standard'],
      scenariosUsed,
      requiredProcedures: requiredProcedures.length > 0 ? requiredProcedures : [isEn ? 'Standard trauma procedures' : 'Procedure trauma standard'],
      techRequirements: techRequirements.trim() || (isEn ? 'Standard maintenance before every session.' : 'Manutenzione ordinaria prima di ogni sessione.'),
      leadTechnician: leadTechnician.trim() || 'Silvia Rossi (Lead Moulage)',
      consumables: consumables.length > 0 ? consumables : [isEn ? 'Standard moulage consumables' : 'Consumabili moulage standard'],
    };

    if (isEditMode && itemToEdit) {
      updateProtesiItem(itemToEdit.id, payload);
    } else {
      addProtesiItem(payload);
    }

    onClose();
  };

  const handleDelete = () => {
    if (itemToEdit) {
      deleteProtesiItem(itemToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border-2 border-orange-500 max-w-3xl w-full my-6 rounded-none shadow-2xl overflow-hidden font-mono flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-neutral-950 border-b-2 border-orange-500/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-orange-600 text-black">
              <Package className="w-4 h-4 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>{isEditMode ? (isEn ? 'Edit Prosthesis Item' : 'Modifica Scheda Protesi') : (isEn ? 'New Prosthesis Item' : 'Aggiungi Nuova Protesi')}</span>
                <span className="text-xs px-2 py-0.5 bg-neutral-800 text-orange-400 border border-orange-500/40">
                  {code || 'DRAFT'}
                </span>
              </h2>
              <span className="text-[10px] text-neutral-400">
                {isEn ? 'Clinical & Moulage Registry Management' : 'Gestione Registro Protesi & Moulage Clinico'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-neutral-800 hover:bg-red-700 text-neutral-300 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-neutral-200">
          {validationError && (
            <div className="bg-red-950/80 border border-red-500 text-red-200 px-3.5 py-2 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Identification */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase text-[11px] border-b border-neutral-800 pb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{isEn ? '1. Identification & Classification' : '1. Identificazione & Distretto'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                  {isEn ? 'Prosthesis Code *' : 'Codice Protesi *'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="es. PR-CRIC-02"
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 text-white px-2.5 py-1.5 text-xs uppercase font-bold outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                  {isEn ? 'Anatomical District *' : 'Distretto Anatomico *'}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as ProtesiItem['district'])}
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 text-white px-2.5 py-1.5 text-xs uppercase font-bold outline-none cursor-pointer"
                >
                  {DISTRICT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {isEn ? opt.labelEn : opt.labelIt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                {isEn ? 'Prosthesis Descriptive Name *' : 'Nome Completo della Protesi *'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError(null);
                }}
                placeholder={isEn ? 'e.g. Surgical Cricothyroidotomy Soft Module with Bleeding Pump' : 'es. Protesi Cricotirotomia Chirurgica con Pompa Sanguinante ed Ematoma'}
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 text-white px-2.5 py-1.5 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                {isEn ? 'Clinical & Moulage Description' : 'Descrizione Clinica & Realizzazione Moulage'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isEn ? 'Detailed anatomical characteristics, tissues, fluids and behavior during scenario...' : 'Dettagli costruttivi, strati tissutali, circuiti idraulici o pneumatici impiegati...'}
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-orange-500 text-white px-2.5 py-1.5 text-xs outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Active Circulatory & Tissue Features */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold uppercase text-[11px]">
                <Droplet className="w-3.5 h-3.5" />
                <span>{isEn ? '2. Active Circulatory & Mechanical Features' : '2. Funzionalità Circolatorie & Meccaniche Attive'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {activeFeatures.length} {isEn ? 'features' : 'funzionalità'}
              </span>
            </div>

            {/* Quick Suggestions Chips */}
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block mb-1">
                {isEn ? 'Quick Add Preset Feature:' : 'Suggerimenti Rapidi (Clicca per aggiungere):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_FEATURES.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddFeature(sug)}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-orange-950/80 border border-neutral-700 hover:border-orange-500 text-neutral-300 text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-orange-400" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Feature */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder={isEn ? 'Type new active feature...' : 'Aggiungi nuova funzionalità attiva...'}
                className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-orange-500 text-white px-2.5 py-1 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddFeature()}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                + {isEn ? 'Add' : 'Aggiungi'}
              </button>
            </div>

            {/* Current Active Features List */}
            <div className="space-y-1 pt-1">
              {activeFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs"
                >
                  <span className="text-neutral-200">• {feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer font-bold px-1"
                    title={isEn ? 'Remove' : 'Rimuovi'}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {activeFeatures.length === 0 && (
                <span className="text-[11px] text-neutral-500 italic block py-1">
                  {isEn ? 'No active features assigned yet.' : 'Nessuna funzionalità attiva configurata.'}
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Guided Procedures */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase text-[11px]">
                <Wrench className="w-3.5 h-3.5" />
                <span>{isEn ? '3. Guided Clinical Procedures' : '3. Procedure Cliniche Guidate'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {requiredProcedures.length} {isEn ? 'procedures' : 'procedure'}
              </span>
            </div>

            {/* Suggestions Chips */}
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block mb-1">
                {isEn ? 'Quick Add Procedure:' : 'Procedure Rapide:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_PROCEDURES.map((proc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddProcedure(proc)}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-cyan-950/80 border border-neutral-700 hover:border-cyan-500 text-neutral-300 text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-cyan-400" />
                    <span>{proc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Procedure */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newProcedureText}
                onChange={(e) => setNewProcedureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddProcedure();
                  }
                }}
                placeholder={isEn ? 'Type new clinical procedure...' : 'Aggiungi nuova procedura clinica guidata...'}
                className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-cyan-500 text-white px-2.5 py-1 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddProcedure()}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase cursor-pointer"
              >
                + {isEn ? 'Add' : 'Aggiungi'}
              </button>
            </div>

            {/* List */}
            <div className="space-y-1 pt-1">
              {requiredProcedures.map((proc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-xs"
                >
                  <span className="text-cyan-300 font-bold">• {proc}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveProcedure(idx)}
                    className="text-neutral-500 hover:text-red-400 cursor-pointer font-bold px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Lead Tech, Maintenance & Consumables */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px] border-b border-neutral-800 pb-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>{isEn ? '4. Technical Maintenance & Consumables' : '4. Setup Tecnico, Responsabile & Consumabili'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                  {isEn ? 'Lead Technician / Moulage Specialist' : 'Tecnico Responsabile / Specialista Moulage'}
                </label>
                <select
                  value={leadTechnician}
                  onChange={(e) => setLeadTechnician(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={`${t.name} (${t.specialty.split(',')[0]})`}>
                      {t.badgeCode ? `[${t.badgeCode}] ` : ''}{t.name} - {t.specialty.slice(0, 30)}
                    </option>
                  ))}
                  <option value="Silvia Rossi (Lead Moulage & Protesi)">Silvia Rossi (Lead Moulage & Protesi)</option>
                  <option value="Roberto Bianchi (Sistemi Idraulici)">Roberto Bianchi (Sistemi Idraulici)</option>
                  <option value="Marco Verdi (Simulatori Avanzati)">Marco Verdi (Simulatori Avanzati)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 text-[10px] uppercase font-bold mb-1">
                  {isEn ? 'Technical Requirements & Reset Protocol' : 'Protocollo di Reset e Requisiti Tecnici'}
                </label>
                <input
                  type="text"
                  value={techRequirements}
                  onChange={(e) => setTechRequirements(e.target.value)}
                  placeholder={isEn ? 'e.g. Recharge 500ml venous blood, replace silicone membrane' : 'es. Ricarica sacca 500ml, spurgo circuito, 3 membrane ricambio pronte'}
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-2.5 py-1.5 text-xs outline-none"
                />
              </div>
            </div>

            {/* Consumables */}
            <div className="space-y-2 pt-2 border-t border-neutral-850">
              <span className="text-[10px] text-neutral-400 uppercase block font-bold">
                {isEn ? 'Required Consumables:' : 'Consumabili Tattici Necessari:'}
              </span>

              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_CONSUMABLES.map((cons, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddConsumable(cons)}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5 text-amber-400" />
                    <span>{cons}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConsumableText}
                  onChange={(e) => setNewConsumableText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddConsumable();
                    }
                  }}
                  placeholder={isEn ? 'Add required consumable item...' : 'Aggiungi consumabile...'}
                  className="flex-1 bg-neutral-900 border border-neutral-700 focus:border-amber-500 text-white px-2.5 py-1 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddConsumable()}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase cursor-pointer"
                >
                  + {isEn ? 'Add' : 'Aggiungi'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {consumables.map((c, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2 py-1 text-neutral-200 text-xs"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveConsumable(idx)}
                      className="text-neutral-500 hover:text-red-400 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Scenario Assignments */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-neutral-300 font-bold uppercase text-[11px]">
                <ClipboardList className="w-3.5 h-3.5 text-orange-400" />
                <span>{isEn ? '5. Clinical Scenarios of Use' : '5. Assegnazione Scenari di Impiego'}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {scenariosUsed.length} {isEn ? 'scenarios linked' : 'scenari associati'}
              </span>
            </div>

            {/* Add Scenario Form Row */}
            <div className="bg-neutral-900 p-2.5 border border-neutral-800 space-y-2">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                {isEn ? 'Link to Scenario:' : 'Associa a Nuovo Scenario:'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase block">{isEn ? 'Patient #' : 'Paziente #'}</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={newScenarioPatientId}
                    onChange={(e) => setNewScenarioPatientId(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white px-2 py-1 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[9px] text-neutral-500 uppercase block">{isEn ? 'Scenario Code' : 'Codice Scenario'}</label>
                  <input
                    type="text"
                    value={newScenarioCode}
                    onChange={(e) => setNewScenarioCode(e.target.value)}
                    placeholder="es. Scenario 6 (TCCC)"
                    className="w-full bg-neutral-950 border border-neutral-700 text-white px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase block">Day</label>
                  <select
                    value={newScenarioDay}
                    onChange={(e) => setNewScenarioDay(Number(e.target.value) as CourseDay)}
                    className="w-full bg-neutral-950 border border-neutral-700 text-white px-2 py-1 text-xs"
                  >
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase block">Extra / Intra</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newScenarioTeamExtra}
                      onChange={(e) => setNewScenarioTeamExtra(Number(e.target.value))}
                      title="Sq. Extra"
                      className="w-1/2 bg-neutral-950 border border-neutral-700 text-white px-1 py-1 text-center text-xs"
                    />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={newScenarioTeamIntra}
                      onChange={(e) => setNewScenarioTeamIntra(Number(e.target.value))}
                      title="Sq. Intra"
                      className="w-1/2 bg-neutral-950 border border-neutral-700 text-white px-1 py-1 text-center text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddScenarioAssignment}
                    className="w-full py-1 bg-orange-600 hover:bg-orange-500 text-black font-bold uppercase text-[11px] cursor-pointer"
                  >
                    + {isEn ? 'Link' : 'Associa'}
                  </button>
                </div>
              </div>
            </div>

            {/* Scenarios List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {scenariosUsed.map((sc, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-900 border border-neutral-800 p-2 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="text-orange-400 font-bold">
                      Pat. #{sc.patientId} • {sc.scenarioCode}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Day {sc.day} • Extra: Sq. {sc.teamExtra} | Intra: Sq. {sc.teamIntra}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveScenarioAssignment(idx)}
                    className="text-neutral-500 hover:text-red-400 font-bold px-2 py-1 cursor-pointer"
                    title={isEn ? 'Remove' : 'Rimuovi'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Delete confirmation section */}
          {isEditMode && showDeleteConfirm && (
            <div className="bg-red-950/90 border-2 border-red-500 p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-300 font-bold">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span>
                  {isEn
                    ? `Are you sure you want to permanently delete "${name}"?`
                    : `Confermi l'eliminazione definitiva della protesi "${name}"?`}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-neutral-800 text-white font-bold text-xs cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase cursor-pointer"
                >
                  {isEn ? 'Confirm Delete' : 'Conferma Eliminazione'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-950 border-t border-neutral-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div>
            {isEditMode && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-300 font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Delete Prosthesis' : 'Elimina Protesi'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
            >
              {isEn ? 'Cancel' : 'Annulla'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isEditMode ? (isEn ? 'Save Changes' : 'Salva Modifiche') : (isEn ? 'Create Prosthesis' : 'Crea Protesi')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
