import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { useCourse } from '../../context/CourseContext';
import {
  QrCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  Search,
  UserCheck,
  ShieldCheck,
  Users,
  Wrench,
  GraduationCap,
  LogIn,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Discente, Faculty, Technician, Team } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';
import { translateRoleOrSpecialty } from '../../i18n/medicalTerms';

interface LoginPersonItem {
  id: string;
  originalId: string;
  category: 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite';
  categoryLabel: string;
  categoryColor: string;
  name: string;
  role: string;
  organization: string;
  badgeCode: string;
  teamName?: string;
  loginUrl: string;
}

export const DirectorQRLoginGenerator: React.FC = () => {
  const {
    language,
    discenti,
    faculty,
    technicians,
    directors,
    guests,
    teams,
    setUserRole,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedGuestId,
  } = useCourse();

  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'discente' | 'faculty' | 'tecnico' | 'direttore'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [qrCodesCache, setQrCodesCache] = useState<Record<string, string>>({});

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trauma-sim.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Build unified list of personnel for QR login generation
  const personnelList: LoginPersonItem[] = useMemo(() => {
    const list: LoginPersonItem[] = [];

    // 1. Discenti
    discenti.forEach((d) => {
      const team = teams.find((t) => t.id === d.teamId);
      list.push({
        id: `discente_${d.id}`,
        originalId: d.id,
        category: 'discente',
        categoryLabel: isEn ? 'LEARNER' : 'DISCENTE',
        categoryColor: '#f97316', // Orange
        name: d.name,
        role: d.role,
        organization: d.organization || 'Azienda Ospedaliera',
        badgeCode: d.badgeCode || `DISC-${d.teamId}-${d.id}`,
        teamName: team ? getTeamCodeName(team) : getTeamCodeName(d.teamId),
        loginUrl: `${origin}${pathname}?discente=${d.id}&badge=${d.badgeCode || d.id}`,
      });
    });

    // 2. Faculty
    faculty.forEach((f) => {
      const team = teams.find((t) => t.id === f.assignedTeamId);
      list.push({
        id: `faculty_${f.id}`,
        originalId: f.id,
        category: 'faculty',
        categoryLabel: isEn ? 'FACULTY' : 'ISTRUTTORE / FACULTY',
        categoryColor: '#10b981', // Emerald
        name: f.name,
        role: `${f.title} • ${f.specialty}`,
        organization: f.organization || 'Trauma Academy',
        badgeCode: f.badgeCode || `FAC-0${f.id}`,
        teamName: team ? `Tutor ${getTeamCodeName(team)}` : undefined,
        loginUrl: `${origin}${pathname}?faculty=${f.id}&badge=${f.badgeCode || f.id}`,
      });
    });

    // 3. Technicians
    technicians.forEach((t) => {
      list.push({
        id: `tecnico_${t.id}`,
        originalId: t.id,
        category: 'tecnico',
        categoryLabel: isEn ? 'TECHNICIAN' : 'TECNICO & MOULAGE',
        categoryColor: '#06b6d4', // Cyan
        name: t.name,
        role: t.specialty,
        organization: t.organization || 'Simulation Lab',
        badgeCode: t.badgeCode || `TEC-0${t.id}`,
        teamName: `Postazioni: ${t.assignedStations.join(', ')}`,
        loginUrl: `${origin}${pathname}?tecnico=${t.id}&badge=${t.badgeCode || t.id}`,
      });
    });

    // 4. Directors
    directors.forEach((dir) => {
      list.push({
        id: `direttore_${dir.id}`,
        originalId: dir.id,
        category: 'direttore',
        categoryLabel: isEn ? 'DIRECTOR' : 'DIRETTORE CORSO',
        categoryColor: '#a855f7', // Purple
        name: dir.name,
        role: dir.role,
        organization: dir.organization || 'Direzione Trauma Center',
        badgeCode: dir.badgeCode || `DIR-0${dir.id}`,
        loginUrl: `${origin}${pathname}?direttore=${dir.id}&badge=${dir.badgeCode || dir.id}`,
      });
    });

    return list;
  }, [discenti, faculty, technicians, directors, teams, origin, pathname, isEn]);

  // Filtered list
  const filteredPersonnel = useMemo(() => {
    return personnelList.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.badgeCode.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          (p.teamName && p.teamName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [personnelList, selectedCategory, searchQuery]);

  // Generate QR code data URLs for filtered list
  useEffect(() => {
    filteredPersonnel.forEach((p) => {
      if (!qrCodesCache[p.id]) {
        QRCode.toDataURL(
          p.loginUrl,
          {
            width: 200,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'H',
          },
          (err, url) => {
            if (!err && url) {
              setQrCodesCache((prev) => ({ ...prev, [p.id]: url }));
            }
          }
        );
      }
    });
  }, [filteredPersonnel, qrCodesCache]);

  const handleCopyLink = (p: LoginPersonItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(p.loginUrl);
      setCopiedUrlId(p.id);
      setTimeout(() => setCopiedUrlId(null), 2500);
    }
  };

  const handleDownloadQR = (p: LoginPersonItem) => {
    const dataUrl = qrCodesCache[p.id];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_LOGIN_${p.badgeCode}_${p.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handleInstantLogin = (p: LoginPersonItem) => {
    if (p.category === 'discente') {
      setSelectedDiscenteId(p.originalId);
      setUserRole('discente');
    } else if (p.category === 'faculty') {
      setSelectedFacultyId(p.originalId);
      setUserRole('faculty');
    } else if (p.category === 'tecnico') {
      setSelectedTechnicianId(p.originalId);
      setUserRole('tecnico');
    } else if (p.category === 'direttore') {
      setSelectedDirectorId(p.originalId);
      setUserRole('direttore');
    }
  };

  return (
    <div className="bg-neutral-950 border-2 border-yellow-500/60 p-5 sm:p-6 shadow-2xl space-y-6 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <QrCode className="w-3.5 h-3.5" />
            {isEn ? 'ROLE-BASED LOGIN QR CODE GENERATOR' : 'GENERATORE QR CODE LOGIN RUOLO'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {isEn ? 'Direct QR Login Links & Badging Console' : 'Link Diretti QR di Accesso & Console Badge'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isEn
              ? 'Scan or copy personalized deep-link URLs for Discenti, Faculty, and Technicians to instantly authorize role-based sessions.'
              : 'Scansiona o copia gli URL di accesso personalizzati per Discenti, Faculty e Tecnici per abilitare il login immediato basato sul ruolo.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-yellow-500 text-black border-yellow-300'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isEn ? 'All Roles' : 'Tutti'} ({personnelList.length})
          </button>
          <button
            onClick={() => setSelectedCategory('discente')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'discente'
                ? 'bg-orange-500 text-black border-orange-300'
                : 'bg-neutral-900 text-orange-400 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isEn ? 'Learners' : 'Discenti'} ({discenti.length})
          </button>
          <button
            onClick={() => setSelectedCategory('faculty')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'faculty'
                ? 'bg-emerald-500 text-black border-emerald-300'
                : 'bg-neutral-900 text-emerald-400 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            Faculty ({faculty.length})
          </button>
          <button
            onClick={() => setSelectedCategory('tecnico')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'tecnico'
                ? 'bg-cyan-500 text-black border-cyan-300'
                : 'bg-neutral-900 text-cyan-400 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isEn ? 'Techs' : 'Tecnici'} ({technicians.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isEn ? 'Search by name, role, badge code, or team...' : 'Cerca per nome, ruolo, codice badge o squadra...'}
          className="w-full bg-neutral-900 border border-neutral-700 pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-yellow-500 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Personnel QR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[650px] overflow-y-auto pr-1">
        {filteredPersonnel.map((p) => {
          const qrUrl = qrCodesCache[p.id];
          const isCopied = copiedUrlId === p.id;

          return (
            <div
              key={p.id}
              className="bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-600 p-4 space-y-3 flex flex-col justify-between transition-all shadow-lg relative group"
            >
              {/* Top Category Badge */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span
                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black"
                  style={{ backgroundColor: p.categoryColor }}
                >
                  {p.categoryLabel}
                </span>
                <span className="font-mono text-xs font-black text-yellow-400 px-2 py-0.5 bg-neutral-950 border border-neutral-700">
                  {p.badgeCode}
                </span>
              </div>

              {/* Name & Role */}
              <div className="space-y-1">
                <h4 className="font-black text-sm text-white uppercase tracking-tight line-clamp-1">
                  {p.name}
                </h4>
                <p className="text-xs font-bold text-neutral-300 line-clamp-1">
                  {p.role}
                </p>
                {p.teamName && (
                  <p className="text-[11px] font-mono font-bold text-orange-400">
                    {p.teamName}
                  </p>
                )}
              </div>

              {/* QR Code Display Container */}
              <div className="flex items-center gap-3 bg-neutral-950 p-3 border border-neutral-800">
                <div className="bg-white p-1 rounded-xs flex-shrink-0">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR ${p.name}`} className="w-24 h-24 object-contain" />
                  ) : (
                    <div className="w-24 h-24 bg-neutral-200 animate-pulse flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-neutral-400 block truncate" title={p.loginUrl}>
                    {p.loginUrl}
                  </span>

                  <div className="flex flex-col gap-1 pt-1">
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(p)}
                      className={`w-full py-1.5 px-2 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? (isEn ? 'Copied!' : 'Copiato!') : (isEn ? 'Copy Link' : 'Copia Link')}</span>
                    </button>

                    {/* Download QR PNG */}
                    <button
                      onClick={() => handleDownloadQR(p)}
                      className="w-full py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{isEn ? 'Download QR' : 'Scarica QR'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Test Login Button */}
              <button
                onClick={() => handleInstantLogin(p)}
                className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                title={isEn ? 'Switch instantly to this role view for testing' : 'Passa istantaneamente alla vista di questo utente per test'}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? 'Test Login as this User' : 'Testa Login come Utente'}</span>
              </button>
            </div>
          );
        })}

        {filteredPersonnel.length === 0 && (
          <div className="col-span-full py-12 text-center text-neutral-500 font-mono text-xs uppercase">
            {isEn ? 'No personnel found matching your search criteria.' : 'Nessun personale trovato con i criteri di ricerca.'}
          </div>
        )}
      </div>
    </div>
  );
};
