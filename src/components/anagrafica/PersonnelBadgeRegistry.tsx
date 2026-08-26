import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { useCourse } from '../../context/CourseContext';
import {
  Award,
  Building,
  Check,
  CheckSquare,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Filter,
  Globe,
  GraduationCap,
  Grid,
  Hash,
  List,
  Mail,
  Phone,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Square,
  Sparkles,
  UserCheck,
  Users,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { Director, Discente, Faculty, Guest, Team, Technician } from '../../types';
import { getCountryFlag } from './MasterAnagraficaManager';
import { getTeamCodeName } from '../../utils/teamUtils';

export type PersonCategory = 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite';

export interface UnifiedPerson {
  id: string;
  originalId: string;
  category: PersonCategory;
  categoryLabel: string;
  categoryColor: string;
  name: string;
  role: string;
  organization: string;
  nationality: string;
  phone: string;
  email: string;
  badgeCode: string;
  teamId?: number;
  teamName?: string;
  teamColor?: string;
  groupId?: string;
  assignedStations?: string[];
  specialty?: string;
  assignedDays?: number[];
  notes?: string;
  escortFaculty?: string;
  deepLink: string;
}

interface PersonnelBadgeRegistryProps {
  onEditEntity?: (category: PersonCategory, id: string) => void;
}

export const PersonnelBadgeRegistry: React.FC<PersonnelBadgeRegistryProps> = ({
  onEditEntity,
}) => {
  const {
    teams,
    discenti,
    faculty,
    technicians,
    directors,
    guests,
    activeDay,
  } = useCourse();

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | PersonCategory>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [nationalityFilter, setNationalityFilter] = useState<string>('ALL');

  // Selected persons for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [singlePrintPerson, setSinglePrintPerson] = useState<UnifiedPerson | null>(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);
  const [bulkPrintLayout, setBulkPrintLayout] = useState<'a4_cards' | 'badge_single' | 'attendance_sheet'>('a4_cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Map all figures into UnifiedPerson items
  const allPersonnel: UnifiedPerson[] = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://trauma-sim.app';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';

    const list: UnifiedPerson[] = [];

    // 1. Discenti (60)
    discenti.forEach((d) => {
      const team = teams.find((t) => t.id === d.teamId);
      list.push({
        id: `discente_${d.id}`,
        originalId: d.id,
        category: 'discente',
        categoryLabel: 'DISCENTE',
        categoryColor: '#f97316', // Orange
        name: d.name,
        role: d.role,
        organization: d.organization || 'Azienda Ospedaliera / 118',
        nationality: d.nationality || 'Italiana',
        phone: d.phone || 'Non indicato',
        email: d.email || `${d.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@soccorso.it`,
        badgeCode: d.badgeCode || `DISC-${d.teamId.toString().padStart(2, '0')}-${d.id}`,
        teamId: d.teamId,
        teamName: team ? getTeamCodeName(team) : getTeamCodeName(d.teamId),
        teamColor: team ? team.color : '#f97316',
        groupId: team ? team.groupId : 'A',
        notes: d.notes || d.experience,
        deepLink: `${origin}${path}?discente=${d.id}&badge=${d.badgeCode || d.id}`,
      });
    });

    // 2. Faculty / Docenti (12)
    faculty.forEach((f) => {
      const team = teams.find((t) => t.id === f.assignedTeamId);
      list.push({
        id: `faculty_${f.id}`,
        originalId: f.id,
        category: 'faculty',
        categoryLabel: 'FACULTY / ISTRUTTORE',
        categoryColor: '#10b981', // Emerald
        name: f.name,
        role: `${f.title} • ${f.specialty}`,
        organization: f.organization || 'Trauma Academy / Ospedale HUB',
        nationality: f.nationality || 'Italiana',
        phone: f.phone || 'Non indicato',
        email: f.email || `${f.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@traumafaculty.org`,
        badgeCode: f.badgeCode || `FAC-${f.assignedTeamId.toString().padStart(2, '0')}`,
        teamId: f.assignedTeamId,
        teamName: team ? `Tutor ${getTeamCodeName(team)}` : `Tutor ${getTeamCodeName(f.assignedTeamId)}`,
        teamColor: team ? team.color : '#10b981',
        groupId: team ? team.groupId : 'A',
        specialty: f.specialty,
        notes: f.notes,
        deepLink: `${origin}${path}?faculty=${f.id}&badge=${f.badgeCode || f.id}`,
      });
    });

    // 3. Tecnici (6)
    technicians.forEach((t) => {
      list.push({
        id: `tecnico_${t.id}`,
        originalId: t.id,
        category: 'tecnico',
        categoryLabel: 'STAFF TECNICO & MOULAGE',
        categoryColor: '#06b6d4', // Cyan
        name: t.name,
        role: t.specialty,
        organization: t.organization || 'Simulation Lab & Tech Team',
        nationality: t.nationality || 'Italiana',
        phone: t.phone || 'Non indicato',
        email: t.email || `${t.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@simlab.org`,
        badgeCode: t.badgeCode || `TEC-0${t.id}`,
        assignedStations: t.assignedStations,
        notes: `Postazioni assegnate: ${t.assignedStations.join(', ')}`,
        deepLink: `${origin}${path}?tecnico=${t.id}&badge=${t.badgeCode || t.id}`,
      });
    });

    // 4. Direzione (2)
    directors.forEach((dir) => {
      list.push({
        id: `direttore_${dir.id}`,
        originalId: dir.id,
        category: 'direttore',
        categoryLabel: 'DIREZIONE DEL CORSO',
        categoryColor: '#a855f7', // Purple
        name: dir.name,
        role: dir.title,
        organization: dir.organization || 'Direzione Trauma Sim / Trauma Center',
        nationality: dir.nationality || 'Italiana',
        phone: dir.phone || 'Non indicato',
        email: dir.email || `${dir.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@traumasim.org`,
        badgeCode: dir.badgeCode || `DIR-0${dir.id}`,
        notes: dir.notes || 'Coordinamento e supervisione scientifica',
        deepLink: `${origin}${path}?direttore=${dir.id}&badge=${dir.badgeCode || dir.id}`,
      });
    });

    // 5. Ospiti / VIP (5)
    guests.forEach((g) => {
      list.push({
        id: `ospite_${g.id}`,
        originalId: g.id,
        category: 'ospite',
        categoryLabel: 'OSPITE / DELEGAZIONE VIP',
        categoryColor: '#38bdf8', // Sky
        name: g.name,
        role: g.title,
        organization: g.organization,
        nationality: g.nationality || 'Italiana',
        phone: g.phone || 'Non indicato',
        email: g.email || `${g.name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@guest-delegation.org`,
        badgeCode: g.badgeCode || `VIP-0${g.id}`,
        assignedDays: g.assignedDays,
        escortFaculty: g.escortFaculty,
        notes: `Presenza Giorni: ${g.assignedDays.map((d) => `Day ${d}`).join(', ')} • Tutor: ${g.escortFaculty || 'Direzione'}`,
        deepLink: `${origin}${path}?guest=${g.id}&badge=${g.badgeCode || g.id}`,
      });
    });

    return list;
  }, [discenti, faculty, technicians, directors, guests, teams]);

  // Unique nationalities
  const nationalities = useMemo(() => {
    const set = new Set<string>();
    allPersonnel.forEach((p) => {
      if (p.nationality) set.add(p.nationality.trim());
    });
    return Array.from(set).sort();
  }, [allPersonnel]);

  // Filtered personnel
  const filteredPersonnel = useMemo(() => {
    return allPersonnel.filter((p) => {
      // Category filter
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) {
        return false;
      }
      // Team filter
      if (teamFilter !== 'ALL') {
        if (teamFilter.startsWith('team_')) {
          const tId = parseInt(teamFilter.replace('team_', ''), 10);
          if (p.teamId !== tId) return false;
        } else if (teamFilter.startsWith('group_')) {
          const gId = teamFilter.replace('group_', '');
          if (p.groupId !== gId) return false;
        }
      }
      // Nationality filter
      if (nationalityFilter !== 'ALL' && p.nationality !== nationalityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.role.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.badgeCode.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.teamName && p.teamName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allPersonnel, categoryFilter, teamFilter, nationalityFilter, searchQuery]);

  // Handle select all / clear
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredPersonnel.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPersonnel.map((p) => p.id)));
    }
  };

  const handleToggleSelectPerson = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyLink = (person: UnifiedPerson) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(person.deepLink);
      setCopiedId(person.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Export full personnel CSV with all data and QR link
  const handleExportFullCSV = () => {
    const headers = [
      'ID Univoco',
      'Categoria',
      'Codice Badge',
      'Nome e Cognome',
      'Ruolo / Qualifica',
      'Ente / Ospedale / Reparto',
      'Nazionalità',
      'Squadra Assegnata',
      'Gruppo',
      'Telefono',
      'Email',
      'Note / Competenze',
      'URL QR Accesso Diretto',
    ];

    const rows = filteredPersonnel.map((p) => [
      `"${p.id}"`,
      `"${p.categoryLabel}"`,
      `"${p.badgeCode}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.role.replace(/"/g, '""')}"`,
      `"${p.organization.replace(/"/g, '""')}"`,
      `"${p.nationality}"`,
      `"${p.teamName || 'N/D'}"`,
      `"${p.groupId || 'N/D'}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
      `"${p.deepLink}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ANAGRAFICA_MASTER_CORSO_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-neutral-950 border-4 border-neutral-100 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-orange-500 text-black text-xs font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-md">
                <QrCode className="w-4 h-4" />
                REGISTRO MASTER & STAMPA BADGE QR
              </span>
              <span className="text-xs text-neutral-300 font-mono font-bold px-2.5 py-0.5 bg-neutral-900 border border-neutral-700">
                TUTTE LE FIGURE COINVOLTE ({allPersonnel.length} ACCREDITATI)
              </span>
            </div>
            <h2 className="text-[17px] font-black text-white uppercase tracking-tighter leading-tight">
              Anagrafica Completa, Schede Personali & Generazione Tesserini QR
            </h2>
            <p className="text-[10px] text-neutral-300 font-medium leading-relaxed max-w-4xl">
              Visualizzazione di tutti gli operatori del corso (60 Discenti, 12 Faculty, 6 Tecnici, 2 Direttori, 5 Ospiti).
              Stampa tesserini singoli o massivi su formato A4 con QR-Code scansionabile da smartphone per check-in e accesso didattico immediato.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap text-[14px]">
            <button
              id="bulk-print-open-btn"
              onClick={() => setIsBulkPrintOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-neutral-100 hover:bg-orange-500 hover:text-black text-black font-black text-xs uppercase tracking-[0.15em] border-2 border-white transition-all cursor-pointer shadow-xl"
              title="Apri console di stampa multipla badge per fogli A4 o tesserini"
            >
              <Printer className="w-4 h-4 text-orange-600" />
              <span>STAMPA BADGE MASSIVA ({selectedIds.size > 0 ? selectedIds.size : filteredPersonnel.length})</span>
            </button>

            <button
              onClick={handleExportFullCSV}
              className="flex items-center gap-1.5 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-black uppercase tracking-wider border-2 border-neutral-700 transition-colors cursor-pointer"
              title="Esporta elenco completo con QR in formato CSV"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>ESPORTA CSV</span>
            </button>
          </div>
        </div>

        {/* Category Breakdown Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-neutral-800">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-neutral-100 text-black border-neutral-100 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">TUTTE LE FIGURE</div>
            <div className="text-xl font-black font-mono mt-0.5">{allPersonnel.length}</div>
            <div className="text-[9px] opacity-70">100% Accreditate</div>
          </button>

          <button
            onClick={() => setCategoryFilter('discente')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'discente'
                ? 'bg-orange-500 text-black border-orange-400 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-orange-500/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-orange-400">DISCENTI</div>
            <div className="text-xl font-black font-mono mt-0.5">{discenti.length}</div>
            <div className="text-[9px] text-neutral-400">12 Squadre (5/sq)</div>
          </button>

          <button
            onClick={() => setCategoryFilter('faculty')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'faculty'
                ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">FACULTY TUTOR</div>
            <div className="text-xl font-black font-mono mt-0.5">{faculty.length}</div>
            <div className="text-[9px] text-neutral-400">Docenti Scenari</div>
          </button>

          <button
            onClick={() => setCategoryFilter('tecnico')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'tecnico'
                ? 'bg-cyan-500 text-black border-cyan-400 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-cyan-500/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">STAFF TECNICO</div>
            <div className="text-xl font-black font-mono mt-0.5">{technicians.length}</div>
            <div className="text-[9px] text-neutral-400">Moulage & Hardware</div>
          </button>

          <button
            onClick={() => setCategoryFilter('direttore')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'direttore'
                ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-purple-500/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-purple-400">DIREZIONE</div>
            <div className="text-xl font-black font-mono mt-0.5">{directors.length}</div>
            <div className="text-[9px] text-neutral-400">Regia Generale</div>
          </button>

          <button
            onClick={() => setCategoryFilter('ospite')}
            className={`p-3 text-left border-2 transition-all cursor-pointer ${
              categoryFilter === 'ospite'
                ? 'bg-sky-500 text-black border-sky-400 font-black shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-sky-500/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">OSPITI & VIP</div>
            <div className="text-xl font-black font-mono mt-0.5">{guests.length}</div>
            <div className="text-[9px] text-neutral-400">Delegazioni</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per nome, qualifica, ente ospedaliero, codice badge, telefono..."
              className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border-2 border-neutral-700 text-xs font-medium text-white placeholder-neutral-500 focus:outline-hidden focus:border-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-2.5 bg-neutral-950 border-2 border-neutral-700 text-xs font-black uppercase text-white focus:outline-hidden"
            >
              <option value="ALL">TUTTE LE SQUADRE / POSTAZIONI</option>
              <optgroup label="Filtro per Gruppo">
                <option value="group_A">GRUPPO A (Squadre 1, 2, 3)</option>
                <option value="group_B">GRUPPO B (Squadre 4, 5, 6)</option>
                <option value="group_C">GRUPPO C (Squadre 7, 8, 9)</option>
                <option value="group_D">GRUPPO D (Squadre 10, 11, 12)</option>
              </optgroup>
              <optgroup label="Filtro per Singola Squadra">
                {teams.map((t) => (
                  <option key={t.id} value={`team_${t.id}`}>
                    {getTeamCodeName(t)} (Gr. {t.groupId})
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Nationality Filter */}
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="px-3 py-2.5 bg-neutral-950 border-2 border-neutral-700 text-xs font-black uppercase text-white focus:outline-hidden"
            >
              <option value="ALL">TUTTE LE NAZIONALITÀ ({nationalities.length})</option>
              {nationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {getCountryFlag(nat)} {nat}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-neutral-950 p-1 border-2 border-neutral-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
                title="Visualizzazione Schede Badge con QR"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
                }`}
                title="Visualizzazione Tabellare Dettagliata"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selection status and bulk action toolbar */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white font-bold cursor-pointer"
            >
              {selectedIds.size > 0 && selectedIds.size === filteredPersonnel.length ? (
                <CheckSquare className="w-4 h-4 text-orange-500" />
              ) : (
                <Square className="w-4 h-4 text-neutral-500" />
              )}
              <span>
                {selectedIds.size > 0
                  ? `Selezionati ${selectedIds.size} di ${filteredPersonnel.length}`
                  : `Seleziona tutti (${filteredPersonnel.length})`}
              </span>
            </button>

            {(categoryFilter !== 'ALL' || teamFilter !== 'ALL' || nationalityFilter !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('ALL');
                  setTeamFilter('ALL');
                  setNationalityFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-orange-400 hover:text-orange-300 font-bold underline flex items-center gap-1 cursor-pointer ml-2"
              >
                <RotateCcw className="w-3 h-3" />
                Azzera Filtri
              </button>
            )}
          </div>

          <div className="text-neutral-400 text-xs font-mono">
            Visualizzati <strong className="text-white">{filteredPersonnel.length}</strong> operatori su {allPersonnel.length}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: VISUAL BADGE GRID WITH LIVE QR CODES */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPersonnel.map((person) => {
            const isSelected = selectedIds.has(person.id);
            return (
              <PersonBadgeCard
                key={person.id}
                person={person}
                isSelected={isSelected}
                onToggleSelect={() => handleToggleSelectPerson(person.id)}
                onPrint={() => setSinglePrintPerson(person)}
                onCopyLink={() => handleCopyLink(person)}
                isCopied={copiedId === person.id}
              />
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: INDUSTRIAL MASTER DATA TABLE WITH QR ACTIONS */}
      {viewMode === 'table' && (
        <div className="bg-neutral-950 border-2 border-neutral-800 overflow-x-auto shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 border-b-2 border-neutral-700 text-neutral-300 uppercase font-black tracking-wider text-[11px]">
                <th className="p-3 w-10 text-center">
                  <button onClick={handleToggleSelectAll} className="cursor-pointer">
                    {selectedIds.size > 0 && selectedIds.size === filteredPersonnel.length ? (
                      <CheckSquare className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                </th>
                <th className="p-3">BADGE ID</th>
                <th className="p-3">FIGURA / CATEGORIA</th>
                <th className="p-3">NOME & COGNOME</th>
                <th className="p-3">RUOLO & ENTE</th>
                <th className="p-3">SQUADRA / ASSEGNAZIONE</th>
                <th className="p-3">NAZIONE</th>
                <th className="p-3">CONTATTI</th>
                <th className="p-3 text-right">AZIONI BADGE & QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredPersonnel.map((person) => {
                const isSelected = selectedIds.has(person.id);
                return (
                  <tr
                    key={person.id}
                    className={`hover:bg-neutral-900/80 transition-colors ${
                      isSelected ? 'bg-orange-950/20' : ''
                    }`}
                  >
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleSelectPerson(person.id)}
                        className="cursor-pointer text-neutral-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-orange-500" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-600" />
                        )}
                      </button>
                    </td>

                    <td className="p-3 font-mono font-bold text-white whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-700">
                        {person.badgeCode}
                      </span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                        style={{
                          backgroundColor: `${person.categoryColor}25`,
                          color: person.categoryColor,
                          border: `1px solid ${person.categoryColor}60`,
                        }}
                      >
                        {person.categoryLabel}
                      </span>
                    </td>

                    <td className="p-3 font-black text-white uppercase text-sm">
                      {person.name}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-neutral-200">{person.role}</div>
                      <div className="text-[11px] text-neutral-400 font-medium">{person.organization}</div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      {person.teamName ? (
                        <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-300">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: person.teamColor || '#f97316' }}
                          />
                          <span>{person.teamName}</span>
                          {person.groupId && (
                            <span className="text-[10px] text-neutral-500">(Gr. {person.groupId})</span>
                          )}
                        </div>
                      ) : person.assignedStations ? (
                        <span className="text-[11px] font-mono text-cyan-400">
                          {person.assignedStations.join(', ')}
                        </span>
                      ) : (
                        <span className="text-neutral-500 font-mono text-[11px]">Coordinamento Globale</span>
                      )}
                    </td>

                    <td className="p-3 whitespace-nowrap font-medium text-neutral-300">
                      <span>{getCountryFlag(person.nationality)}</span>{' '}
                      <span className="text-xs">{person.nationality}</span>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="text-[11px] font-mono text-neutral-300">{person.phone}</div>
                      <div className="text-[10px] text-neutral-500">{person.email}</div>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSinglePrintPerson(person)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-100 hover:text-black text-neutral-200 border border-neutral-700 text-xs font-black uppercase transition-colors cursor-pointer"
                          title="Visualizza e Stampa Badge Singolo"
                        >
                          <Printer className="w-3.5 h-3.5 text-orange-400" />
                          <span>BADGE & QR</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(person)}
                          className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                          title="Copia link diretto QR"
                        >
                          {copiedId === person.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* SINGLE PRINT / BADGE PREVIEW MODAL */}
      {singlePrintPerson && (
        <SingleBadgePrintModal
          person={singlePrintPerson}
          onClose={() => setSinglePrintPerson(null)}
        />
      )}

      {/* BULK PRINT MULTIPLE BADGES MODAL */}
      {isBulkPrintOpen && (
        <BulkBadgesPrintModal
          persons={
            selectedIds.size > 0
              ? allPersonnel.filter((p) => selectedIds.has(p.id))
              : filteredPersonnel
          }
          layout={bulkPrintLayout}
          setLayout={setBulkPrintLayout}
          onClose={() => setIsBulkPrintOpen(false)}
        />
      )}
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Individual Badge Card
// ==========================================
interface PersonBadgeCardProps {
  person: UnifiedPerson;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPrint: () => void;
  onCopyLink: () => void;
  isCopied: boolean;
}

const PersonBadgeCard: React.FC<PersonBadgeCardProps> = ({
  person,
  isSelected,
  onToggleSelect,
  onPrint,
  onCopyLink,
  isCopied,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      person.deepLink,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [person.deepLink]);

  const handleDownloadSingleQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${person.badgeCode}_${person.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div
      className={`bg-neutral-950 border-4 transition-all relative flex flex-col justify-between shadow-xl overflow-hidden ${
        isSelected ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Top Header Strip with Category and Badge Code */}
      <div
        className="px-4 py-2.5 flex items-center justify-between border-b-2"
        style={{
          backgroundColor: `${person.categoryColor}18`,
          borderColor: `${person.categoryColor}50`,
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSelect}
            className="cursor-pointer text-neutral-400 hover:text-white"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-neutral-600" />
            )}
          </button>
          <span
            className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
            style={{
              backgroundColor: person.categoryColor,
              color: '#000000',
            }}
          >
            {person.categoryLabel}
          </span>
        </div>

        <span className="font-mono text-xs font-black text-white px-2 py-0.5 bg-neutral-900 border border-neutral-700">
          {person.badgeCode}
        </span>
      </div>

      {/* Main Card Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        {/* Name and Role */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-black text-base uppercase text-white tracking-tight leading-tight">
              {person.name}
            </h3>
            <span className="text-xs flex-shrink-0 font-medium text-neutral-400">
              {getCountryFlag(person.nationality)} {person.nationality}
            </span>
          </div>

          <p className="text-xs font-bold text-orange-400 leading-snug">
            {person.role}
          </p>

          <p className="text-[11px] text-neutral-400 flex items-center gap-1 truncate font-medium">
            <Building className="w-3 h-3 text-neutral-500 flex-shrink-0" />
            <span className="truncate">{person.organization}</span>
          </p>
        </div>

        {/* Middle: QR Code + Assignment Pill */}
        <div className="flex items-center gap-4 bg-neutral-900/90 p-3 border-2 border-neutral-800">
          {/* QR Code Container */}
          <div className="bg-white p-1.5 flex-shrink-0 border border-neutral-300 shadow-sm">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Access ${person.name}`}
                className="w-20 h-20 object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-400">
                ...
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="space-y-1 text-xs flex-1 min-w-0">
            {person.teamName && (
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: person.teamColor || '#f97316' }}
                />
                <span className="font-mono font-bold text-white text-[11px] truncate">
                  {person.teamName}
                </span>
              </div>
            )}

            {person.groupId && (
              <div className="text-[10px] text-neutral-400 font-mono">
                GRUPPO OPERATIVO: <strong className="text-neutral-200">{person.groupId}</strong>
              </div>
            )}

            <div className="text-[10px] text-neutral-400 flex items-center gap-1 truncate font-mono">
              <Phone className="w-2.5 h-2.5 text-neutral-500 flex-shrink-0" />
              <span>{person.phone}</span>
            </div>

            <div className="text-[10px] text-neutral-400 flex items-center gap-1 truncate font-mono">
              <Mail className="w-2.5 h-2.5 text-neutral-500 flex-shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
          <button
            onClick={onPrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-100 hover:bg-orange-500 hover:text-black text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title="Apri finestra di stampa badge per questo operatore"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>STAMPA BADGE</span>
          </button>

          <button
            onClick={handleDownloadSingleQR}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
            title="Scarica immagine QR ad alta risoluzione"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
          </button>

          <button
            onClick={onCopyLink}
            className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
            title="Copia link web diretto per smartphone"
          >
            {isCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Single Badge Print Modal
// ==========================================
interface SingleBadgePrintModalProps {
  person: UnifiedPerson;
  onClose: () => void;
}

const SingleBadgePrintModal: React.FC<SingleBadgePrintModalProps> = ({
  person,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      person.deepLink,
      {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [person.deepLink]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadBadgeImage = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `BADGE_PASS_${person.badgeCode}_${person.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-950 border-4 border-neutral-100 max-w-lg w-full p-6 shadow-2xl space-y-5 text-white my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-orange-400" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              ANTEPRIMA STAMPA BADGE OPERATORE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE BADGE CONTAINER (Styled for on-screen & print) */}
        <div
          id="printable-single-badge"
          className="bg-white text-black p-6 border-4 border-black shadow-2xl relative space-y-4 max-w-md mx-auto"
        >
          {/* Badge Top Header */}
          <div className="flex items-center justify-between pb-3 border-b-4 border-black">
            <div>
              <div className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-neutral-600">
                CORSO AVANZATO TRAUMA SIM 2026
              </div>
              <div className="text-sm font-black uppercase tracking-tight text-black">
                ACCESSO & ACCREDITAMENTO
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-xs px-2 py-1 bg-black text-white">
                {person.badgeCode}
              </span>
            </div>
          </div>

          {/* Role Color Banner */}
          <div
            className="py-1.5 px-3 text-center font-black text-xs uppercase tracking-[0.2em]"
            style={{
              backgroundColor: person.categoryColor,
              color: '#000000',
              border: '2px solid #000000',
            }}
          >
            {person.categoryLabel}
          </div>

          {/* Person Credentials */}
          <div className="text-center space-y-1 py-1">
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              {person.name}
            </h2>
            <p className="text-xs font-bold text-neutral-800">
              {person.role}
            </p>
            <p className="text-[11px] font-semibold text-neutral-600">
              {person.organization} • {getCountryFlag(person.nationality)} {person.nationality}
            </p>
          </div>

          {/* Large Crisp QR Code */}
          <div className="bg-white p-3 border-2 border-black flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Badge ${person.name}`}
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 bg-neutral-100 flex items-center justify-center text-xs">
                Generazione QR in corso...
              </div>
            )}
            <div className="text-[9px] font-mono font-bold text-neutral-700 mt-2 uppercase tracking-widest text-center">
              SCANSIONE DIRETTA SMARTPHONE PER SCENARI & VALUTAZIONI
            </div>
          </div>

          {/* Additional details on bottom */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t-2 border-neutral-300">
            <div>
              <span className="text-neutral-500 uppercase block font-bold">ASSEGNAZIONE:</span>
              <strong className="text-black">{person.teamName || 'Cabina di Regia'}</strong>
            </div>
            <div>
              <span className="text-neutral-500 uppercase block font-bold">TELEFONO DI SERVIZIO:</span>
              <strong className="text-black">{person.phone}</strong>
            </div>
          </div>

          {/* Security stamp watermark */}
          <div className="pt-2 text-center text-[8px] font-mono text-neutral-500 uppercase tracking-widest border-t border-neutral-200">
            TRAUMA ACADEMY • PROTOCOLLO UFFICIALE • SECURITY ID #{person.badgeCode}
          </div>
        </div>

        {/* Actions Controls (hidden on physical print) */}
        <div className="flex items-center gap-3 pt-3 border-t-2 border-neutral-800 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>STAMPA SU CARTA / BADGE (CTRL+P)</span>
          </button>

          <button
            onClick={handleDownloadBadgeImage}
            className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-black uppercase tracking-wider border-2 border-neutral-700 transition-colors cursor-pointer"
            title="Scarica file QR in PNG"
          >
            <Download className="w-4 h-4 text-orange-400" />
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-black uppercase tracking-wider border-2 border-neutral-700 transition-colors cursor-pointer"
          >
            CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: Bulk Badges Print Modal
// ==========================================
interface BulkBadgesPrintModalProps {
  persons: UnifiedPerson[];
  layout: 'a4_cards' | 'badge_single' | 'attendance_sheet';
  setLayout: (layout: 'a4_cards' | 'badge_single' | 'attendance_sheet') => void;
  onClose: () => void;
}

const BulkBadgesPrintModal: React.FC<BulkBadgesPrintModalProps> = ({
  persons,
  layout,
  setLayout,
  onClose,
}) => {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate all QR codes asynchronously
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const generateAll = async () => {
      const results: Record<string, string> = {};
      for (const p of persons) {
        try {
          const url = await QRCode.toDataURL(p.deepLink, {
            width: 200,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          results[p.id] = url;
        } catch (e) {
          console.error('Error generating QR for', p.name, e);
        }
      }
      if (isMounted) {
        setQrMap(results);
        setIsGenerating(false);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
    };
  }, [persons]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-neutral-950 border-4 border-neutral-100 w-full max-w-6xl p-5 sm:p-7 shadow-2xl space-y-5 text-white my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar (no-print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-neutral-800 no-print">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-500 text-black font-black text-xs uppercase tracking-wider">
                STAMPA MASSIVA ACCREDITI
              </span>
              <span className="text-xs text-neutral-400 font-mono font-bold">
                {persons.length} BADGE SELEZIONATI
              </span>
            </div>
            <h3 className="font-black text-base uppercase tracking-tight text-white">
              Console Stampa Badges & Schede di Accreditamento
            </h3>
          </div>

          {/* Layout Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setLayout('a4_cards')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                layout === 'a4_cards'
                  ? 'bg-orange-500 text-black border-orange-400'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              Fogli A4 Tesserini (6 / pagina)
            </button>

            <button
              onClick={() => setLayout('attendance_sheet')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                layout === 'attendance_sheet'
                  ? 'bg-orange-500 text-black border-orange-400'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              Registro Firme & Check-In con QR
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-900 border-2 border-neutral-800">
          {isGenerating ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs text-neutral-400 font-bold uppercase tracking-wider">
                Generazione codici QR in corso ({Object.keys(qrMap).length} / {persons.length})...
              </p>
            </div>
          ) : (
            <>
              {/* LAYOUT 1: A4 Grid of Badges (6 badges per A4 page with cutting borders) */}
              {layout === 'a4_cards' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white text-black p-6 border-4 border-black">
                  {persons.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 border-2 border-dashed border-neutral-400 bg-white text-black flex flex-col justify-between space-y-3 page-break-inside-avoid shadow-xs relative"
                      style={{ minHeight: '320px' }}
                    >
                      {/* Badge Header */}
                      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                        <div>
                          <div className="text-[8px] font-mono font-black uppercase tracking-widest text-neutral-600">
                            TRAUMA SIM 2026
                          </div>
                          <div
                            className="px-1.5 py-0.2 text-[8px] font-black uppercase inline-block mt-0.5"
                            style={{
                              backgroundColor: p.categoryColor,
                              color: '#000000',
                            }}
                          >
                            {p.categoryLabel}
                          </div>
                        </div>
                        <span className="font-mono font-black text-[10px] px-1.5 py-0.5 bg-black text-white">
                          {p.badgeCode}
                        </span>
                      </div>

                      {/* Person Details */}
                      <div className="space-y-0.5 text-center">
                        <div className="font-black text-sm uppercase tracking-tight text-black truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-bold text-neutral-800 truncate">
                          {p.role}
                        </div>
                        <div className="text-[9px] font-semibold text-neutral-600 truncate">
                          {p.organization} • {getCountryFlag(p.nationality)} {p.nationality}
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="bg-white p-2 border border-black flex flex-col items-center justify-center my-1">
                        {qrMap[p.id] ? (
                          <img
                            src={qrMap[p.id]}
                            alt={`QR ${p.name}`}
                            className="w-28 h-28 object-contain"
                          />
                        ) : (
                          <div className="w-28 h-28 bg-neutral-100 flex items-center justify-center text-xs">
                            QR...
                          </div>
                        )}
                        <span className="text-[7px] font-mono font-bold text-neutral-700 uppercase tracking-wider mt-1">
                          SCANSIONA CON SMARTPHONE
                        </span>
                      </div>

                      {/* Bottom Info */}
                      <div className="text-[9px] font-mono flex items-center justify-between border-t border-neutral-300 pt-1 text-neutral-700">
                        <span className="truncate">{p.teamName || 'DIREZIONE'}</span>
                        <span className="font-bold">{p.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LAYOUT 2: Attendance & Check-in Master Table with QR */}
              {layout === 'attendance_sheet' && (
                <div className="bg-white text-black p-6 border-4 border-black space-y-4">
                  <div className="border-b-4 border-black pb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">
                        REGISTRO PRESENZE, ACCREDITO & CODICI QR
                      </h2>
                      <p className="text-xs text-neutral-700 font-medium">
                        Corso Avanzato Trauma Sim • Elenco Generale Ufficiale ({persons.length} Operatori Accreditati)
                      </p>
                    </div>
                    <div className="text-right text-xs font-mono font-bold">
                      DATA: __________________
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse border border-black">
                    <thead>
                      <tr className="bg-neutral-200 border-b-2 border-black text-black uppercase font-black text-[10px]">
                        <th className="p-2 border border-black w-8 text-center">#</th>
                        <th className="p-2 border border-black">BADGE</th>
                        <th className="p-2 border border-black">NOME & COGNOME</th>
                        <th className="p-2 border border-black">CATEGORIA / RUOLO</th>
                        <th className="p-2 border border-black">SQUADRA / ENTE</th>
                        <th className="p-2 border border-black">NAZIONE</th>
                        <th className="p-2 border border-black text-center w-20">QR CODE</th>
                        <th className="p-2 border border-black w-28 text-center">FIRMA ACCREDITO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black">
                      {persons.map((p, idx) => (
                        <tr key={p.id} className="page-break-inside-avoid text-[11px]">
                          <td className="p-2 border border-black text-center font-mono font-bold">{idx + 1}</td>
                          <td className="p-2 border border-black font-mono font-black">{p.badgeCode}</td>
                          <td className="p-2 border border-black font-black uppercase">{p.name}</td>
                          <td className="p-2 border border-black font-medium">
                            <span className="font-bold block text-[10px] uppercase text-neutral-800">{p.categoryLabel}</span>
                            <span className="text-neutral-700 text-[10px]">{p.role}</span>
                          </td>
                          <td className="p-2 border border-black">
                            <div className="font-bold text-[10px]">{p.teamName || 'Cabina di Regia'}</div>
                            <div className="text-[9px] text-neutral-600">{p.organization}</div>
                          </td>
                          <td className="p-2 border border-black whitespace-nowrap">
                            {getCountryFlag(p.nationality)} {p.nationality}
                          </td>
                          <td className="p-1 border border-black text-center">
                            {qrMap[p.id] ? (
                              <img
                                src={qrMap[p.id]}
                                alt={`QR ${p.name}`}
                                className="w-12 h-12 object-contain mx-auto"
                              />
                            ) : (
                              <span className="text-[8px]">QR</span>
                            )}
                          </td>
                          <td className="p-2 border border-black text-center text-neutral-400 font-mono text-[9px]">
                            _______________
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Print Button (no-print) */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-neutral-800 no-print flex-wrap">
          <div className="text-xs text-neutral-400">
            Suggerimento: Nella finestra di stampa seleziona <strong>"Salva come PDF"</strong> o la stampante fisica desiderata.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={isGenerating}
              className="flex items-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl"
            >
              <Printer className="w-4 h-4" />
              <span>AVVIA STAMPA ({persons.length} BADGE)</span>
            </button>

            <button
              onClick={onClose}
              className="py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-black uppercase tracking-wider border-2 border-neutral-700 cursor-pointer"
            >
              CHIUDI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
