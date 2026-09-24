import React, { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import { QrCode, Shield, UserCheck, Users, Wrench, Building2, ExternalLink } from 'lucide-react';

export const DirectorQRLoginGenerator: React.FC = () => {
  const { language, discenti, faculty, technicians, directors, guests } = useCourse();
  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'ospiti'>('faculty');

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-yellow-500/80 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-mono font-black uppercase">
              {isEn ? 'QR LOGIN & DIRECT ACCESS' : 'QR LOGIN & ACCESSO DIRETTO'}
            </span>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
            {isEn ? 'Direct Role Access & QR Links' : 'Accesso Rapido Ruoli & Link QR'}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(['discenti', 'faculty', 'tecnici', 'direttori', 'ospiti'] as const).map(cat => {
            const labelMap: Record<string, string> = {
              discenti: isEn ? 'Participants' : 'Discenti',
              faculty: 'Faculty',
              tecnici: isEn ? 'Technicians' : 'Tecnici',
              direttori: isEn ? 'Directors' : 'Direttori',
              ospiti: isEn ? 'Guests' : 'Ospiti',
            };
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono font-black uppercase transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-yellow-500 text-black'
                    : 'bg-neutral-950 text-neutral-300 border border-neutral-700 hover:text-white'
                }`}
              >
                {labelMap[cat] || cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 p-4">
        <p className="text-xs text-neutral-400 font-mono mb-4">
          {isEn ? 'Select any user below to open their direct view instantly or simulate login.' : 'Seleziona qualsiasi utente qui sotto per aprire istantaneamente la vista dedicata o simulare l\'accesso.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {selectedCategory === 'faculty' && faculty.map(f => (
            <div key={f.id} className="bg-neutral-950 border border-neutral-800 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-yellow-400 font-bold">{f.badgeCode || 'FAC'}</span>
                <h4 className="text-sm font-black text-white">{f.name}</h4>
                <p className="text-[11px] text-neutral-400">{f.specialty}</p>
              </div>
              <a
                href={`?role=faculty&id=${f.id}`}
                className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {selectedCategory === 'discenti' && discenti.map(d => (
            <div key={d.id} className="bg-neutral-950 border border-neutral-800 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-orange-400 font-bold">{d.badgeCode || 'DISC'}</span>
                <h4 className="text-sm font-black text-white">{d.name}</h4>
                <p className="text-[11px] text-neutral-400">Team #{d.teamId} • {d.role}</p>
              </div>
              <a
                href={`?role=discente&id=${d.id}`}
                className="p-2 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {selectedCategory === 'tecnici' && technicians.map(t => (
            <div key={t.id} className="bg-neutral-950 border border-neutral-800 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{t.badgeCode || 'TEC'}</span>
                <h4 className="text-sm font-black text-white">{t.name}</h4>
                <p className="text-[11px] text-neutral-400">{t.specialty}</p>
              </div>
              <a
                href={`?role=tecnico&id=${t.id}`}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {selectedCategory === 'direttori' && directors.map(dir => (
            <div key={dir.id} className="bg-neutral-950 border border-neutral-800 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-red-400 font-bold">{dir.badgeCode || 'DIR'}</span>
                <h4 className="text-sm font-black text-white">{dir.name}</h4>
                <p className="text-[11px] text-neutral-400">{dir.title}</p>
              </div>
              <a
                href={`?role=direttore&id=${dir.id}`}
                className="p-2 bg-red-500 hover:bg-red-400 text-white font-black text-xs flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {selectedCategory === 'ospiti' && guests.map(g => (
            <div key={g.id} className="bg-neutral-950 border border-neutral-800 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{g.badgeCode || 'OSP'}</span>
                <h4 className="text-sm font-black text-white">{g.name}</h4>
                <p className="text-[11px] text-neutral-400">{g.organization}</p>
              </div>
              <a
                href={`?view=public&role=ospite&id=${g.id}`}
                className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
