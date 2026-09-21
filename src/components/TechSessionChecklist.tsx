import React from 'react';
import { useCourse } from '../context/CourseContext';
import { CheckCircle2, Clock, Wrench, Shield, Users, Sparkles, Check } from 'lucide-react';

export const TechSessionChecklist: React.FC = () => {
  const {
    technicians,
    selectedTechnicianId,
    activeDay,
    simulatorPatients,
    updateTechChecklist,
    language,
  } = useCourse();

  const isEn = language === 'en';

  const currentTech =
    technicians.find((t) => t.id === selectedTechnicianId) ||
    technicians[0] || {
      id: 'tech-1',
      name: 'Silvia Rossi',
      specialty: 'Moulage & Protesi',
      badgeCode: 'TECH-01',
      assignedStations: ['Ambiente Tattico 1', 'Box Shock Room 1'],
    };

  const techNum = parseInt(currentTech.id.replace(/\D/g, '')) || 1;
  
  // Calculate assigned patients for this technician (Day 2: 1-12, Day 3: 13-24)
  const assignedPatientIds = activeDay === 2 
    ? [((techNum - 1) % 12) + 1, ((techNum - 1 + 3) % 12) + 1]
    : [((techNum - 1) % 12) + 13, ((techNum - 1 + 3) % 12) + 13];

  const assignedPatients = simulatorPatients.filter((p) => assignedPatientIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-pink-400 uppercase font-black tracking-widest">
            CHECKLIST TECNICA INTEGRATA • PROTESI, MOULAGE & SCENARI ASSEGNATI
          </span>
          <span className="px-2.5 py-1 bg-neutral-950 text-neutral-300 border border-neutral-700 font-mono text-xs font-bold">
            {currentTech.name} ({currentTech.badgeCode}) - Giorno {activeDay}
          </span>
        </div>
        <h3 className="text-base font-black text-white uppercase">
          Assegnazioni di Protesi, Moulage e Verifiche Tecniche Pre/Post Sessione
        </h3>
        <p className="text-xs text-neutral-400">
          Tabella di controllo operativa allineata al Catalogo Protesi & Moulage e ai 24 Scenari Ufficiali del Corso.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {assignedPatients.map((patient) => {
          const checklist = patient.techChecklist || { preDone: false, intraDone: false, postDone: false };
          return (
            <div key={patient.id} className="bg-neutral-900 border-2 border-neutral-800 hover:border-pink-500/50 transition-all p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-pink-600 text-white font-mono font-black text-xs">
                    PAZIENTE #{patient.id}
                  </span>
                  <div>
                    <h4 className="font-black text-white text-base uppercase">
                      {patient.scenarioCode} • Giorno {patient.day} ({patient.period})
                    </h4>
                    <p className="text-xs text-pink-300 font-mono">
                      Postazione: {patient.groupExtraAssigned ? `Gruppo ${patient.groupExtraAssigned}` : 'Shock Room / TCCC'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-neutral-950 text-neutral-300 border border-neutral-700 text-xs font-mono font-bold">
                    {patient.simulatori || 'Manichino Alta Fedeltà'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-mono text-pink-400 uppercase font-black block">
                    PROTESI & MOULAGE ASSOCIATI (DAL CATALOGO):
                  </span>
                  <p className="text-xs text-white font-bold">{patient.moulageProtesi || 'Protesi standard con sanguinamento pulsante'}</p>
                  <p className="text-[11px] text-neutral-400">
                    <strong>Dinamica lesioni:</strong> {patient.dinamicaDelleLesioni || patient.lesioni?.join(', ')}
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-3">
                  <span className="text-[10px] font-mono text-pink-400 uppercase font-black block">
                    VERIFICHE TECNICHE DI SESSIONE:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateTechChecklist(patient.id, 'preDone', !checklist.preDone)}
                      className={`p-2 text-center text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                        checklist.preDone
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <span className="block text-[9px] font-mono text-neutral-400">1. PREPARAZIONE</span>
                      {checklist.preDone ? '✓ PRONTO' : 'DA FARE'}
                    </button>

                    <button
                      onClick={() => updateTechChecklist(patient.id, 'intraDone', !checklist.intraDone)}
                      className={`p-2 text-center text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                        checklist.intraDone
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <span className="block text-[9px] font-mono text-neutral-400">2. GESTIONE</span>
                      {checklist.intraDone ? '✓ LIVE OK' : 'IN CORSO'}
                    </button>

                    <button
                      onClick={() => updateTechChecklist(patient.id, 'postDone', !checklist.postDone)}
                      className={`p-2 text-center text-[11px] font-bold uppercase transition-all cursor-pointer border ${
                        checklist.postDone
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                      }`}
                    >
                      <span className="block text-[9px] font-mono text-neutral-400">3. RIORDINO</span>
                      {checklist.postDone ? '🟢 LUCE VERDE' : 'RESET'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
