import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Activity,
  Award,
  Check,
  Download,
  Edit2,
  FileSpreadsheet,
  Filter,
  Globe,
  Mail,
  Phone,
  Plus,
  Printer,
  QrCode,
  Radio,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Director, Discente, Faculty, Guest, RegiaStaff, Team, Technician } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';
import { ParticipantQRModal } from './ParticipantQRModal';
import { PersonnelBadgeRegistry } from './PersonnelBadgeRegistry';

export const getCountryFlag = (nationality: string = ''): string => {
  const norm = nationality.toLowerCase().trim();
  if (norm.includes('ital')) return '🇮🇹';
  if (norm.includes('svizz') || norm.includes('swiss')) return '🇨🇭';
  if (norm.includes('tedesc') || norm.includes('german')) return '🇩🇪';
  if (norm.includes('franc') || norm.includes('french')) return '🇫🇷';
  if (norm.includes('spagn') || norm.includes('span')) return '🇪🇸';
  if (norm.includes('brit') || norm.includes('uk') || norm.includes('inghil')) return '🇬🇧';
  if (norm.includes('austr')) return '🇦🇹';
  if (norm.includes('belg')) return '🇧🇪';
  if (norm.includes('statunit') || norm.includes('usa') || norm.includes('americ')) return '🇺🇸';
  if (norm.includes('canad')) return '🇨🇦';
  if (norm.includes('oland') || norm.includes('netherland')) return '🇳🇱';
  if (norm.includes('portog')) return '🇵🇹';
  return '🌐';
};

export const NATIONALITY_PRESETS = [
  'Italiana',
  'Svizzera',
  'Tedesca',
  'Francese',
  'Spagnola',
  'Britannica',
  'Austriaca',
  'Belga',
  'Statunitense',
  'Canadese',
];

interface MasterAnagraficaManagerProps {
  initialSection?: 'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti';
}

export const MasterAnagraficaManager: React.FC<MasterAnagraficaManagerProps> = ({ initialSection = 'discenti' }) => {
  const {
    language,
    teams,
    updateTeam,
    discenti,
    updateDiscente,
    addDiscente,
    deleteDiscente,
    faculty,
    updateFaculty,
    addFaculty,
    deleteFaculty,
    technicians,
    updateTechnician,
    addTechnician,
    deleteTechnician,
    directors,
    updateDirector,
    addDirector,
    deleteDirector,
    regiaStaff,
    updateRegiaStaff,
    addRegiaStaff,
    deleteRegiaStaff,
    guests,
    updateGuest,
    addGuest,
    deleteGuest,
  } = useCourse();

  const isEn = language === 'en';

  const [activeSection, setActiveSection] = useState<'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti' | 'badges'>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');

  // QR Pass Modal state
  const [selectedPersonForQr, setSelectedPersonForQr] = useState<{
    person: any;
    category: 'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti';
  } | null>(null);

  // Modals state for editing
  const [editingDiscente, setEditingDiscente] = useState<Discente | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [editingDir, setEditingDir] = useState<Director | null>(null);
  const [editingRegia, setEditingRegia] = useState<RegiaStaff | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Modals state for adding new
  const [isAddingDiscente, setIsAddingDiscente] = useState(false);
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [isAddingDir, setIsAddingDir] = useState(false);
  const [isAddingRegia, setIsAddingRegia] = useState(false);
  const [isAddingGuest, setIsAddingGuest] = useState(false);

  // Form states for new entities
  const [newDiscente, setNewDiscente] = useState<Omit<Discente, 'id'>>({
    name: '',
    role: 'Team Leader / Medico Emergenza',
    teamId: 1,
    nationality: 'Italiana',
    phone: '+39 340 0000000',
    email: '',
    experience: 'DEA II Livello / 118',
    organization: 'Ospedale Regionale',
    badgeCode: `DISC-${discenti.length + 1}`,
    notes: '',
  });

  const [newFaculty, setNewFaculty] = useState<Omit<Faculty, 'id'>>({
    name: '',
    title: 'Faculty Squadra',
    specialty: 'Medicina d\'Emergenza & TCCC',
    nationality: 'Italiana',
    assignedTeamId: 1,
    phone: '+39 347 0000000',
    email: '',
    organization: 'AOU Trauma Center',
    badgeCode: `FAC-${faculty.length + 1}`,
    notes: '',
  });

  const [newTech, setNewTech] = useState<Omit<Technician, 'id'>>({
    name: '',
    assignedStations: ['Postazione 1', 'Skills Lab'],
    specialty: 'Moulage, simulatori biologici e idraulica',
    nationality: 'Italiana',
    phone: '+39 333 0000000',
    email: '',
    organization: 'SimCenter Lab',
    badgeCode: `TECH-0${technicians.length + 1}`,
    notes: '',
  });

  const [newDir, setNewDir] = useState<Omit<Director, 'id'>>({
    name: '',
    title: 'Direttore del Corso & Coordinatore Didattico',
    nationality: 'Italiana',
    phone: '+39 340 0000000',
    email: '',
    organization: 'Trauma Academy',
    badgeCode: `DIR-0${directors.length + 1}`,
    notes: '',
    isMaster: false,
  });

  const [newRegia, setNewRegia] = useState<Omit<RegiaStaff, 'id'>>({
    name: '',
    role: 'Regia Master Control',
    title: 'Capo Centrale Regia & Mission Control',
    nationality: 'Italiana',
    phone: '+39 335 9900111',
    email: '',
    organization: 'Central Control Room / Trauma Academy',
    badgeCode: `REGIA-${regiaStaff.length + 1}`,
    notes: 'Accesso Master totale e coordinamento sala',
    isMaster: false,
  });

  const [newGuest, setNewGuest] = useState<Omit<Guest, 'id'>>({
    name: '',
    title: 'Osservatore Istituzionale / Auditor',
    organization: 'Organizzazione Internazionale / Ministero',
    nationality: 'Italiana',
    assignedDays: [2, 3],
    phone: '+39 333 0000000',
    email: '',
    badgeCode: `VIP-0${guests.length + 1}`,
    escortFaculty: 'Dott. Marco Valenti',
    notes: 'Audit didattico e protocolli di soccorso',
  });

  // Calculate statistics
  const totalPersonnel = discenti.length + faculty.length + technicians.length + directors.length + regiaStaff.length + guests.length;

  const nationalityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const all = [
      ...discenti.map((d) => d.nationality || 'Italiana'),
      ...faculty.map((f) => f.nationality || 'Italiana'),
      ...technicians.map((t) => t.nationality || 'Italiana'),
      ...directors.map((d) => d.nationality || 'Italiana'),
      ...regiaStaff.map((r) => r.nationality || 'Italiana'),
      ...guests.map((g) => g.nationality || 'Italiana'),
    ];
    all.forEach((n) => {
      const clean = n.trim() || 'Non specificata';
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return counts;
  }, [discenti, faculty, technicians, directors, regiaStaff, guests]);

  const uniqueNationalities = Object.keys(nationalityBreakdown).sort();

  // Filtered lists
  const filteredDiscenti = useMemo(() => {
    return discenti.filter((d) => {
      const matchQ =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.organization && d.organization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.badgeCode && d.badgeCode.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchNat = nationalityFilter === 'ALL' || d.nationality === nationalityFilter;
      const team = teams.find((t) => t.id === d.teamId);
      const matchGrp = groupFilter === 'ALL' || team?.groupId === groupFilter;
      return matchQ && matchNat && matchGrp;
    });
  }, [discenti, searchQuery, nationalityFilter, groupFilter, teams]);

  const filteredFaculty = useMemo(() => {
    return faculty.filter((f) => {
      const matchQ =
        !searchQuery ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.organization && f.organization.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchNat = nationalityFilter === 'ALL' || f.nationality === nationalityFilter;
      return matchQ && matchNat;
    });
  }, [faculty, searchQuery, nationalityFilter]);

  const filteredTechnicians = useMemo(() => {
    return technicians.filter((t) => {
      const matchQ =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedStations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchNat = nationalityFilter === 'ALL' || t.nationality === nationalityFilter;
      return matchQ && matchNat;
    });
  }, [technicians, searchQuery, nationalityFilter]);

  const filteredDirectors = useMemo(() => {
    return directors.filter((d) => {
      const matchQ =
        !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNat = nationalityFilter === 'ALL' || d.nationality === nationalityFilter;
      return matchQ && matchNat;
    });
  }, [directors, searchQuery, nationalityFilter]);

  const filteredRegiaStaff = useMemo(() => {
    return regiaStaff.filter((r) => {
      const matchQ =
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.organization && r.organization.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchNat = nationalityFilter === 'ALL' || r.nationality === nationalityFilter;
      return matchQ && matchNat;
    });
  }, [regiaStaff, searchQuery, nationalityFilter]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchQ =
        !searchQuery ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.organization.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNat = nationalityFilter === 'ALL' || g.nationality === nationalityFilter;
      return matchQ && matchNat;
    });
  }, [guests, searchQuery, nationalityFilter]);

  // Export full master registry as CSV
  const handleExportCSV = () => {
    const rows = [
      ['TIPO_RUOLO', 'ID', 'BADGE', 'NOME_COGNOME', 'NAZIONALITA', 'RUOLO_TITOLO', 'SQUADRA_POSTAZIONE', 'ENTE_OSPEDALE', 'TELEFONO', 'EMAIL', 'NOTE'],
    ];

    directors.forEach((d) => {
      rows.push(['DIREZIONE', d.id, d.badgeCode || '', d.name, d.nationality || 'Italiana', d.title, 'Comando Corso', d.organization || '', d.phone || '', d.email || '', d.notes || '']);
    });
    regiaStaff.forEach((r) => {
      rows.push(['REGIA', r.id, r.badgeCode || '', r.name, r.nationality || 'Italiana', `${r.title} - ${r.role}`, 'Central Control Room', r.organization || '', r.phone || '', r.email || '', r.notes || '']);
    });
    faculty.forEach((f) => {
      rows.push(['FACULTY', f.id, f.badgeCode || '', f.name, f.nationality || 'Italiana', f.title, getTeamCodeName(f.assignedTeamId), f.organization || '', f.phone || '', f.email || '', f.notes || '']);
    });
    technicians.forEach((t) => {
      rows.push(['TECNICO', t.id, t.badgeCode || '', t.name, t.nationality || 'Italiana', t.specialty, t.assignedStations.join('; '), t.organization || '', t.phone || '', t.email || '', t.notes || '']);
    });
    guests.forEach((g) => {
      rows.push(['OSPITE_VIP', g.id, g.badgeCode || '', g.name, g.nationality || 'Italiana', g.title, `Giorni: ${g.assignedDays.join(', ')}`, g.organization, g.phone || '', g.email || '', g.notes || '']);
    });
    discenti.forEach((disc) => {
      rows.push(['DISCENTE', disc.id, disc.badgeCode || '', disc.name, disc.nationality || 'Italiana', disc.role, getTeamCodeName(disc.teamId), disc.organization || '', disc.phone || '', disc.email || '', disc.experience || '']);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registro_anagrafica_master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER HERO & STATS BANNER */}
      <div className="bg-neutral-900 border-2 border-neutral-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-950 text-orange-400 border border-orange-700 text-[10px] font-black uppercase tracking-wider">
                {isEn ? 'COURSE ACCREDITATION & ROLES MANAGEMENT' : 'GESTIONE ACCREDITI & RUOLI CORSO'}
              </span>
              <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold">
                {isEn ? 'TOTAL PERSONNEL:' : 'TOTALE OPERATORI:'} {totalPersonnel}
              </span>
            </div>
            <h2 className="text-[17px] font-black text-white uppercase tracking-tight mt-1 leading-tight">
              {isEn ? 'MASTER PERSONNEL & GUESTS DIRECTORY' : 'ANAGRAFICA MASTER DEL PERSONALE & OSPITI'}
            </h2>
            <p className="text-[10px] text-neutral-400 max-w-3xl mt-1 leading-relaxed">
              {isEn
                ? 'Comprehensive management and editing of personal records, nationalities, operational roles, contacts and teams for Learners (60), Faculty (12), Technical Staff (6), Direction (2) and Guest/VIP Delegations (5).'
                : 'Gestione, compilazione e modifica completa dei dati anagrafici, nazionalità, ruoli operativi, contatti e squadre per Discenti (60), Faculty (12), Staff Tecnico (6), Direzione (2) e Delegazioni Ospiti/VIP (5).'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-100 hover:text-black text-white border-2 border-neutral-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              title={isEn ? 'Export complete CSV sheet with all records and nationalities' : 'Esporta foglio completo CSV con tutte le anagrafiche e nazionalità'}
            >
              <Download className="w-4 h-4 text-orange-400" />
              {isEn ? 'EXPORT DIRECTORY (CSV)' : 'ESPORTA REGISTRO (CSV)'}
            </button>
          </div>
        </div>

        {/* NATIONALITY PILLS BREAKDOWN */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              {isEn ? `Participant Nationalities Breakdown (${Object.keys(nationalityBreakdown).length} Nations)` : `Riepilogo Nazionalità Partecipanti (${Object.keys(nationalityBreakdown).length} Nazioni)`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(nationalityBreakdown).map(([nat, count]) => (
              <button
                key={nat}
                onClick={() => setNationalityFilter(nationalityFilter === nat ? 'ALL' : nat)}
                className={`px-2.5 py-1 text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  nationalityFilter === nat
                    ? 'bg-orange-500 text-black border-orange-400 font-black'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                <span>{getCountryFlag(nat)}</span>
                <span>{nat}</span>
                <span className="px-1.5 py-0.2 bg-black/40 text-neutral-200 text-[10px] rounded-xs font-mono">
                  {count}
                </span>
              </button>
            ))}
            {nationalityFilter !== 'ALL' && (
              <button
                onClick={() => setNationalityFilter('ALL')}
                className="px-2 py-1 text-xs text-orange-400 hover:text-white border border-orange-500/50 bg-neutral-950 font-black uppercase cursor-pointer"
              >
                {isEn ? 'RESET NATIONALITY FILTER (SHOW ALL)' : 'AZZERA FILTRO NAZIONE (MOSTRA TUTTI)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-SECTIONS NAVIGATION */}
      <div className="flex items-center gap-2 border-b-2 border-neutral-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSection('discenti')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'discenti'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-orange-400" />
          {isEn ? '1. OPERATIONAL LEARNERS' : '1. DISCENTI OPERATIVI'} ({discenti.length})
        </button>

        <button
          onClick={() => setActiveSection('faculty')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'faculty'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          {isEn ? '2. FACULTY INSTRUCTORS' : '2. FACULTY ISTRUTTORI'} ({faculty.length})
        </button>

        <button
          onClick={() => setActiveSection('tecnici')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'tecnici'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" />
          {isEn ? '3. TECHS & MOULAGE LAB' : '3. TECNICI & LAB MOULAGE'} ({technicians.length})
        </button>

        <button
          onClick={() => setActiveSection('direttori')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'direttori'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          {isEn ? '4. COURSE DIRECTION' : '4. DIREZIONE DEL CORSO'} ({directors.length})
        </button>

        <button
          onClick={() => setActiveSection('regia')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'regia'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4 text-pink-400" />
          {isEn ? 'MISSION CONTROL & REGIA' : 'REGIA & MISSION CONTROL'} ({regiaStaff.length})
        </button>

        <button
          onClick={() => setActiveSection('ospiti')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'ospiti'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-cyan-400" />
          {isEn ? '5. GUESTS & VIP DIRECTORY' : '5. ANAGRAFICA OSPITI & VIP'} ({guests.length})
        </button>

        <button
          onClick={() => setActiveSection('badges')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'badges'
              ? 'bg-orange-500 text-black border-orange-400 shadow-md font-black'
              : 'bg-neutral-900 text-orange-400 border-orange-500/40 hover:text-white hover:border-orange-500'
          }`}
        >
          <QrCode className="w-4 h-4" />
          {isEn ? 'QR PASS & BADGE REGISTRY' : 'REGISTRO QR PASS & BADGE'} ({totalPersonnel})
        </button>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 border border-neutral-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search by name, role, organization or badge...' : 'Cerca per nome, ruolo, ente di appartenenza o badge...'}
            className="w-full pl-9 pr-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Nationality filter dropdown */}
          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-black uppercase text-white focus:outline-hidden"
          >
            <option value="ALL">{isEn ? 'ALL NATIONALITIES' : 'TUTTE LE NAZIONALITÀ'}</option>
            {uniqueNationalities.map((nat) => (
              <option key={nat} value={nat}>
                {getCountryFlag(nat)} {nat} ({nationalityBreakdown[nat]})
              </option>
            ))}
          </select>

          {/* Group filter for discenti */}
          {activeSection === 'discenti' && (
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-black uppercase text-white focus:outline-hidden"
            >
              <option value="ALL">{isEn ? 'ALL GROUPS' : 'TUTTI I GRUPPI'}</option>
              <option value="A">{isEn ? 'GROUP A (TEAMS 1-3)' : 'GRUPPO A (SQ. 1-3)'}</option>
              <option value="B">{isEn ? 'GROUP B (TEAMS 4-6)' : 'GRUPPO B (SQ. 4-6)'}</option>
              <option value="C">{isEn ? 'GROUP C (TEAMS 7-9)' : 'GRUPPO C (SQ. 7-9)'}</option>
              <option value="D">{isEn ? 'GROUP D (TEAMS 10-12)' : 'GRUPPO D (SQ. 10-12)'}</option>
            </select>
          )}

          {/* Add button based on active section */}
          {activeSection === 'discenti' && (
            <button
              onClick={() => setIsAddingDiscente(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'NEW LEARNER' : 'NUOVO DISCENTE'}
            </button>
          )}
          {activeSection === 'faculty' && (
            <button
              onClick={() => setIsAddingFaculty(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-emerald-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'NEW FACULTY INSTRUCTOR' : 'NUOVO DOCENTE FACULTY'}
            </button>
          )}
          {activeSection === 'tecnici' && (
            <button
              onClick={() => setIsAddingTech(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-amber-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'NEW LAB TECH' : 'NUOVO TECNICO LAB'}
            </button>
          )}
          {activeSection === 'direttori' && (
            <button
              onClick={() => setIsAddingDir(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-purple-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'NEW DIRECTION MEMBER' : 'NUOVO MEMBRO DIREZIONE'}
            </button>
          )}
          {activeSection === 'regia' && (
            <button
              onClick={() => setIsAddingRegia(true)}
              className="px-4 py-2 bg-pink-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-pink-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'NEW CONTROL ROOM MEMBER' : 'NUOVO MEMBRO REGIA'}
            </button>
          )}
          {activeSection === 'ospiti' && (
            <button
              onClick={() => setIsAddingGuest(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-cyan-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              {isEn ? 'REGISTER NEW GUEST / VIP' : 'COMPILA NUOVO OSPITE / VIP'}
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: DISCENTI TABLE */}
      {activeSection === 'discenti' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 overflow-hidden">
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center text-xs font-bold text-neutral-400">
            <span>
              {isEn
                ? `Showing ${filteredDiscenti.length} learners out of ${discenti.length} registered`
                : `Visualizzati ${filteredDiscenti.length} discenti su ${discenti.length} registrati`}
            </span>
            <span className="text-orange-400 font-mono">
              {isEn ? '5 Operators per Team (12 Teams)' : '5 Operatori per Squadra (12 Squadre)'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-200">
              <thead className="bg-neutral-900 text-neutral-400 uppercase font-black text-[10px] tracking-wider border-b-2 border-neutral-800">
                <tr>
                  <th className="p-3"># {isEn ? 'BADGE' : 'BADGE'}</th>
                  <th className="p-3">{isEn ? 'FULL NAME' : 'NOME & COGNOME'}</th>
                  <th className="p-3">{isEn ? 'NATIONALITY' : 'NAZIONALITÀ'}</th>
                  <th className="p-3">{isEn ? 'TEAM ROLE' : 'RUOLO TEAM'}</th>
                  <th className="p-3">{isEn ? 'TEAM & GRP' : 'SQUADRA & GRP'}</th>
                  <th className="p-3">{isEn ? 'ORGANIZATION / HOSPITAL' : 'ENTE / OSPEDALE'}</th>
                  <th className="p-3">{isEn ? 'PHONE / EMAIL' : 'TELEFONO / EMAIL'}</th>
                  <th className="p-3 text-right">{isEn ? 'ACTIONS' : 'AZIONI'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 font-medium">
                {filteredDiscenti.map((disc, idx) => {
                  const team = teams.find((t) => t.id === disc.teamId);
                  return (
                    <tr key={disc.id} className="hover:bg-neutral-800/60 transition-colors">
                      <td className="p-3 font-mono text-neutral-400 font-bold">
                        <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-orange-400 text-[10px]">
                          {disc.badgeCode || `DISC-${idx + 1}`}
                        </span>
                      </td>
                      <td className="p-3 font-black text-white uppercase text-sm">
                        {disc.name}
                      </td>
                      <td className="p-3 font-mono font-bold text-neutral-200">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-[11px]">
                          <span>{getCountryFlag(disc.nationality)}</span>
                          <span>{disc.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                        </span>
                      </td>
                      <td className="p-3 text-orange-400 font-bold font-mono text-[11px]">
                        {disc.role}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-200 border border-neutral-700 font-mono font-bold text-[10px]">
                          {isEn ? `TEAM ${disc.teamId}` : `SQ. ${disc.teamId}`} (GRP {team?.groupId})
                        </span>
                      </td>
                      <td className="p-3 text-neutral-300 text-[11px]">
                        {disc.organization || disc.experience || '—'}
                      </td>
                      <td className="p-3 font-mono text-neutral-400 text-[10px]">
                        <div>{disc.phone}</div>
                        {disc.email && <div className="text-neutral-400">{disc.email}</div>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPersonForQr({ person: disc, category: 'discenti' })}
                            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 hover:border-cyan-500 transition-colors cursor-pointer text-xs font-black uppercase flex items-center gap-1"
                            title={isEn ? 'View unique QR Code Pass and personalized page' : 'Visualizza QR Code Pass univoco e pagina personalizzata'}
                          >
                            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                            QR PASS
                          </button>
                          <button
                            onClick={() => setEditingDiscente(disc)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-100 hover:text-black text-neutral-300 border border-neutral-700 transition-colors cursor-pointer text-xs font-black uppercase"
                            title={isEn ? 'Edit learner profile' : 'Modifica scheda anagrafica discente'}
                          >
                            <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                            {isEn ? 'EDIT' : 'EDIT'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(isEn ? `Are you sure you want to remove ${disc.name} from the course?` : `Sei sicuro di voler eliminare ${disc.name} dal corso?`)) {
                                deleteDiscente(disc.id);
                              }
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                            title={isEn ? 'Delete' : 'Elimina'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: FACULTY LIST */}
      {activeSection === 'faculty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((f) => {
            const assignedTeam = teams.find((t) => t.id === f.assignedTeamId);
            return (
              <div key={f.id} className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3 relative">
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-black uppercase">
                        {isEn ? 'FACULTY INSTRUCTOR' : 'DOCENTE FACULTY'}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                        <span>{getCountryFlag(f.nationality)}</span>
                        <span>{f.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white uppercase mt-1">{f.name}</h4>
                    <p className="text-xs text-neutral-400 font-medium">{f.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPersonForQr({ person: f, category: 'faculty' })}
                      className="p-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'View Faculty QR Code Pass' : 'Visualizza QR Code Pass Faculty'}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingFaculty(f)}
                      className="p-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'Edit faculty' : 'Modifica faculty'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(isEn ? `Delete instructor ${f.name}?` : `Eliminare il docente ${f.name}?`)) {
                          deleteFaculty(f.id);
                        }
                      }}
                      className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'Delete' : 'Elimina'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Specialization:' : 'Specializzazione:'}</span>
                    <span className="font-bold text-white text-right">{f.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Organization / Hospital:' : 'Ente / Ospedale:'}</span>
                    <span className="text-neutral-200 text-right">{f.organization || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Tutored Team:' : 'Squadra Tutorata:'}</span>
                    <span className="font-mono font-bold text-orange-400">
                      {assignedTeam ? `${getTeamCodeName(assignedTeam)} (GRP ${assignedTeam.groupId})` : getTeamCodeName(f.assignedTeamId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Phone:' : 'Telefono:'}</span>
                    <span className="font-mono text-neutral-300">{f.phone}</span>
                  </div>
                  {f.email && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{isEn ? 'Email:' : 'Email:'}</span>
                      <span className="font-mono text-neutral-400 text-[11px]">{f.email}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 3: TECNICI LIST */}
      {activeSection === 'tecnici' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechnicians.map((t) => (
            <div key={t.id} className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-black uppercase">
                      {isEn ? 'TECHNICIAN / MOULAGE STAFF' : 'TECNICO / MOULAGE STAFF'}
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <span>{getCountryFlag(t.nationality)}</span>
                      <span>{t.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white uppercase mt-1">{t.name}</h4>
                  <p className="text-xs text-amber-400 font-bold">{t.specialty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPersonForQr({ person: t, category: 'tecnici' })}
                    className="p-1.5 bg-neutral-800 hover:bg-pink-500 hover:text-black text-pink-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'View Technician QR Code Pass' : 'Visualizza QR Code Pass Tecnico'}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingTech(t)}
                    className="p-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Edit technician' : 'Modifica tecnico'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isEn ? `Delete technician ${t.name}?` : `Eliminare il tecnico ${t.name}?`)) {
                        deleteTechnician(t.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Delete' : 'Elimina'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Organization / Lab:' : 'Ente / Lab:'}</span>
                  <span className="text-neutral-300 text-right">{t.organization || 'SimCenter Lab'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Phone / Radio:' : 'Telefono / Radio:'}</span>
                  <span className="font-mono text-neutral-300">{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Email:' : 'Email:'}</span>
                    <span className="font-mono text-neutral-400 text-[11px]">{t.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 4: DIRETTORI LIST */}
      {activeSection === 'direttori' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredDirectors.map((d) => (
            <div key={d.id} className={`bg-neutral-900 border-2 ${d.isMaster ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-neutral-800'} p-5 space-y-3`}>
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-black uppercase">
                      {isEn ? 'COURSE DIRECTION' : 'DIREZIONE DEL CORSO'}
                    </span>
                    {d.isMaster ? (
                      <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span>{isEn ? '★ MASTER DIRECTOR (FULL ACCESS)' : '★ DIRETORE MASTER (ACCESSO TOTALE)'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => updateDirector(d.id, { isMaster: true })}
                        className="px-2 py-0.5 bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        title={isEn ? 'Designate as Master Director with full access' : 'Designa come Direttore Master con accesso totale'}
                      >
                        {isEn ? 'Designate Master' : 'Designa Master'}
                      </button>
                    )}
                    <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <span>{getCountryFlag(d.nationality)}</span>
                      <span>{d.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase mt-1">{d.name}</h4>
                  <p className="text-xs text-purple-400 font-bold">{d.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPersonForQr({ person: d, category: 'direttori' })}
                    className="p-1.5 bg-neutral-800 hover:bg-yellow-500 hover:text-black text-yellow-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'View Director QR Code Pass' : 'Visualizza QR Code Pass Direttore'}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingDir(d)}
                    className="p-1.5 bg-neutral-800 hover:bg-purple-500 hover:text-black text-purple-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Edit director details' : 'Modifica dati direttore'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isEn ? `Remove ${d.name} from direction?` : `Eliminare ${d.name} dalla direzione?`)) {
                        deleteDirector(d.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Delete' : 'Elimina'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Organization / Hospital:' : 'Ente / Ospedale:'}</span>
                  <span className="text-white font-medium">{d.organization || 'Ospedale Niguarda Trauma Center'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Radio Channel / Phone:' : 'Canale Radio / Tel:'}</span>
                  <span className="font-mono font-bold text-white">{d.phone}</span>
                </div>
                {d.email && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Official Email:' : 'Email Ufficiale:'}</span>
                    <span className="font-mono text-neutral-300">{d.email}</span>
                  </div>
                )}
                {d.notes && (
                  <div className="pt-1 text-[11px] text-neutral-400 border-t border-neutral-800">
                    <span className="font-bold text-neutral-300">{isEn ? 'Notes: ' : 'Note: '}</span>
                    {d.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION REGIA & MISSION CONTROL */}
      {activeSection === 'regia' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegiaStaff.map((r) => (
            <div key={r.id} className={`bg-neutral-900 border-2 ${r.isMaster ? 'border-pink-500 shadow-lg shadow-pink-500/10' : 'border-neutral-800'} p-5 space-y-3`}>
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-pink-950 text-pink-300 border border-pink-700 text-[10px] font-black uppercase">
                      {isEn ? 'CONTROL ROOM & MISSION CONTROL' : 'REGIA & MISSION CONTROL'}
                    </span>
                    {r.isMaster ? (
                      <span className="px-2 py-0.5 bg-pink-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <span>{isEn ? '★ MASTER CONTROL (FULL ACCESS)' : '★ REGIA MASTER (ACCESSO TOTALE)'}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => updateRegiaStaff(r.id, { isMaster: true })}
                        className="px-2 py-0.5 bg-neutral-800 hover:bg-pink-500 hover:text-black text-pink-400 border border-pink-500/40 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        title={isEn ? 'Designate as Master Control with full access' : 'Designa come Regia Master con accesso totale'}
                      >
                        {isEn ? 'Designate Master' : 'Designa Master'}
                      </button>
                    )}
                    <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <span>{getCountryFlag(r.nationality)}</span>
                      <span>{r.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase mt-1">{r.name}</h4>
                  <p className="text-xs text-pink-400 font-bold">{r.title} — {r.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPersonForQr({ person: r, category: 'regia' })}
                    className="p-1.5 bg-neutral-800 hover:bg-purple-500 hover:text-black text-purple-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'View Control Room QR Code Pass' : 'Visualizza QR Code Pass Regia'}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingRegia(r)}
                    className="p-1.5 bg-neutral-800 hover:bg-pink-500 hover:text-black text-pink-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Edit control room member' : 'Modifica dati regia'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(isEn ? `Remove ${r.name} from control room?` : `Eliminare ${r.name} dalla regia?`)) {
                        deleteRegiaStaff(r.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                    title={isEn ? 'Delete' : 'Elimina'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Organization / Facility:' : 'Ente / Struttura:'}</span>
                  <span className="text-white font-medium">{r.organization || 'Control Room / Trauma Academy'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Badge ID:' : 'Badge ID:'}</span>
                  <span className="font-mono font-bold text-pink-400">{r.badgeCode || 'REGIA-01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">{isEn ? 'Phone / Radio:' : 'Telefono / Radio:'}</span>
                  <span className="font-mono font-bold text-white">{r.phone}</span>
                </div>
                {r.email && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Email:' : 'Email:'}</span>
                    <span className="font-mono text-neutral-300">{r.email}</span>
                  </div>
                )}
                {r.notes && (
                  <div className="pt-1 text-[11px] text-neutral-400 border-t border-neutral-800">
                    <span className="font-bold text-neutral-300">{isEn ? 'Notes: ' : 'Note: '}</span>
                    {r.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 5: OSPITI & VIP / OSSERVATORI */}
      {activeSection === 'ospiti' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuests.map((g) => (
              <div key={g.id} className="bg-neutral-900 border-2 border-neutral-800 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-black uppercase">
                        {isEn ? 'GUEST / VIP' : 'OSPITE / VIP'}
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                        <span>{getCountryFlag(g.nationality)}</span>
                        <span>{g.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white uppercase mt-1">{g.name}</h4>
                    <p className="text-xs text-cyan-400 font-bold">{g.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPersonForQr({ person: g, category: 'ospiti' })}
                      className="p-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'View Guest QR Code Pass' : 'Visualizza QR Code Pass Ospite'}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingGuest(g)}
                      className="p-1.5 bg-neutral-800 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'Edit guest' : 'Modifica ospite'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(isEn ? `Delete guest ${g.name}?` : `Eliminare l'ospite ${g.name}?`)) {
                          deleteGuest(g.id);
                        }
                      }}
                      className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                      title={isEn ? 'Delete' : 'Elimina'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Organization / Institution:' : 'Ente / Istituzione:'}</span>
                    <span className="font-bold text-white text-right">{g.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Accreditation Badge:' : 'Badge Accreditamento:'}</span>
                    <span className="font-mono font-bold text-cyan-400">{g.badgeCode || 'VIP'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{isEn ? 'Presence Days:' : 'Giornate di Presenza:'}</span>
                    <span className="font-mono text-neutral-200">
                      {g.assignedDays.map((d) => (isEn ? `Day ${d}` : `Giorno ${d}`)).join(', ')}
                    </span>
                  </div>
                  {g.escortFaculty && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{isEn ? 'Escort Faculty:' : 'Faculty Accompagnatore:'}</span>
                      <span className="text-orange-400 font-bold text-right">{g.escortFaculty}</span>
                    </div>
                  )}
                  {g.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">{isEn ? 'Phone / Contact:' : 'Recapito:'}</span>
                      <span className="font-mono text-neutral-300">{g.phone}</span>
                    </div>
                  )}
                  {g.notes && (
                    <div className="pt-2 text-[11px] text-neutral-400 border-t border-neutral-800">
                      <span className="font-bold text-neutral-300">{isEn ? 'Observation Objective: ' : 'Obiettivo Osservazione: '}</span>
                      {g.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: BADGES & QR PASS REGISTRY */}
      {activeSection === 'badges' && (
        <PersonnelBadgeRegistry />
      )}

      {/* ================= MODALS ================= */}

      {/* 1. DISCENTE EDIT / ADD MODAL */}
      {(editingDiscente || isAddingDiscente) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingDiscente
                  ? (isEn ? `EDIT PROFILE: ${editingDiscente.name}` : `MODIFICA ANAGRAFICA: ${editingDiscente.name}`)
                  : (isEn ? 'REGISTER NEW LEARNER PARTICIPANT' : 'COMPILA NUOVO PARTECIPANTE DISCENTE')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingDiscente(null);
                  setIsAddingDiscente(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingDiscente) {
                  const updated = { ...editingDiscente, updatedAt: new Date().toISOString() };
                  updateDiscente(editingDiscente.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingDiscente.id) {
                    setSelectedPersonForQr({ person: updated, category: 'discenti' });
                  }
                  setEditingDiscente(null);
                } else {
                  addDiscente(newDiscente);
                  setIsAddingDiscente(false);
                }
              }}
              className="space-y-3.5 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Full Name *' : 'Nome e Cognome *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingDiscente ? editingDiscente.name : newDiscente.name}
                  onChange={(e) =>
                    editingDiscente
                      ? setEditingDiscente({ ...editingDiscente, name: e.target.value })
                      : setNewDiscente({ ...newDiscente, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                  placeholder={isEn ? 'e.g. Dr. Luca De Angeli' : 'Es. Dr. Luca De Angeli'}
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-orange-400 font-mono">
                    {getCountryFlag(editingDiscente ? editingDiscente.nationality : newDiscente.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingDiscente ? editingDiscente.nationality : newDiscente.nationality}
                  onChange={(e) =>
                    editingDiscente
                      ? setEditingDiscente({ ...editingDiscente, nationality: e.target.value })
                      : setNewDiscente({ ...newDiscente, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500 mb-1.5"
                  placeholder={isEn ? 'e.g. Italian, Swiss, Spanish, German...' : 'Es. Italiana, Svizzera, Spagnola, Tedesca...'}
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingDiscente
                          ? setEditingDiscente({ ...editingDiscente, nationality: preset })
                          : setNewDiscente({ ...newDiscente, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* RUOLO OPERATIVO */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Operational Role in Trauma Team *' : 'Ruolo Operativo nel Trauma Team *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingDiscente ? editingDiscente.role : newDiscente.role}
                  onChange={(e) =>
                    editingDiscente
                      ? setEditingDiscente({ ...editingDiscente, role: e.target.value })
                      : setNewDiscente({ ...newDiscente, role: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500 mb-1"
                />
                <div className="flex flex-wrap gap-1">
                  {[
                    'Team Leader / Coordinatore',
                    'Airway Doctor / Gestione Vie Aeree',
                    'Circulation & REBOA Specialist',
                    'Procedural Surgeon / Toracotomia',
                    'Nurse / Accessi Vascolari & Farmaci',
                    'Scribe & Timekeeper / SBAR Logger',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingDiscente
                          ? setEditingDiscente({ ...editingDiscente, role: preset })
                          : setNewDiscente({ ...newDiscente, role: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {preset.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Assigned Team' : 'Squadra Assegnata'}
                  </label>
                  <select
                    value={editingDiscente ? editingDiscente.teamId : newDiscente.teamId}
                    onChange={(e) =>
                      editingDiscente
                        ? setEditingDiscente({ ...editingDiscente, teamId: Number(e.target.value) })
                        : setNewDiscente({ ...newDiscente, teamId: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {getTeamCodeName(t)} (GRP {t.groupId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Badge ID' : 'Badge ID'}
                  </label>
                  <input
                    type="text"
                    value={editingDiscente ? editingDiscente.badgeCode || '' : newDiscente.badgeCode || ''}
                    onChange={(e) =>
                      editingDiscente
                        ? setEditingDiscente({ ...editingDiscente, badgeCode: e.target.value })
                        : setNewDiscente({ ...newDiscente, badgeCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Organization / Hospital' : 'Ente / Ospedale'}
                  </label>
                  <input
                    type="text"
                    value={editingDiscente ? editingDiscente.organization || '' : newDiscente.organization || ''}
                    onChange={(e) =>
                      editingDiscente
                        ? setEditingDiscente({ ...editingDiscente, organization: e.target.value })
                        : setNewDiscente({ ...newDiscente, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                    placeholder={isEn ? 'e.g. Trauma Center Niguarda' : 'Es. DEA Niguarda'}
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Phone' : 'Telefono'}
                  </label>
                  <input
                    type="text"
                    value={editingDiscente ? editingDiscente.phone || '' : newDiscente.phone || ''}
                    onChange={(e) =>
                      editingDiscente
                        ? setEditingDiscente({ ...editingDiscente, phone: e.target.value })
                        : setNewDiscente({ ...newDiscente, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Institutional Email' : 'Email Istituzionale'}
                </label>
                <input
                  type="email"
                  value={editingDiscente ? editingDiscente.email || '' : newDiscente.email || ''}
                  onChange={(e) =>
                    editingDiscente
                      ? setEditingDiscente({ ...editingDiscente, email: e.target.value })
                      : setNewDiscente({ ...newDiscente, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-orange-500"
                  placeholder="operatore@ospedale.it"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDiscente(null);
                    setIsAddingDiscente(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingDiscente
                    ? (isEn ? 'SAVE CHANGES' : 'SALVA MODIFICHE')
                    : (isEn ? 'REGISTER LEARNER' : 'REGISTRA DISCENTE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FACULTY EDIT / ADD MODAL */}
      {(editingFaculty || isAddingFaculty) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingFaculty
                  ? (isEn ? `EDIT FACULTY INSTRUCTOR: ${editingFaculty.name}` : `MODIFICA DOCENTE FACULTY: ${editingFaculty.name}`)
                  : (isEn ? 'REGISTER NEW FACULTY INSTRUCTOR' : 'COMPILA NUOVO DOCENTE FACULTY')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingFaculty(null);
                  setIsAddingFaculty(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingFaculty) {
                  const updated = { ...editingFaculty, updatedAt: new Date().toISOString() };
                  updateFaculty(editingFaculty.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingFaculty.id) {
                    setSelectedPersonForQr({ person: updated, category: 'faculty' });
                  }
                  setEditingFaculty(null);
                } else {
                  addFaculty(newFaculty);
                  setIsAddingFaculty(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Name and Academic Title *' : 'Nome e Titolo Accademico *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingFaculty ? editingFaculty.name : newFaculty.name}
                  onChange={(e) =>
                    editingFaculty
                      ? setEditingFaculty({ ...editingFaculty, name: e.target.value })
                      : setNewFaculty({ ...newFaculty, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500"
                  placeholder={isEn ? 'e.g. Prof. Dr. Mario Rossi' : 'Es. Prof. Dott. Mario Rossi'}
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-emerald-400 font-mono">
                    {getCountryFlag(editingFaculty ? editingFaculty.nationality : newFaculty.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingFaculty ? editingFaculty.nationality : newFaculty.nationality}
                  onChange={(e) =>
                    editingFaculty
                      ? setEditingFaculty({ ...editingFaculty, nationality: e.target.value })
                      : setNewFaculty({ ...newFaculty, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500 mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingFaculty
                          ? setEditingFaculty({ ...editingFaculty, nationality: preset })
                          : setNewFaculty({ ...newFaculty, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Academic Qualification' : 'Qualifica Didattica'}
                </label>
                <input
                  type="text"
                  required
                  value={editingFaculty ? editingFaculty.title : newFaculty.title}
                  onChange={(e) =>
                    editingFaculty
                      ? setEditingFaculty({ ...editingFaculty, title: e.target.value })
                      : setNewFaculty({ ...newFaculty, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Clinical Specialization *' : 'Specializzazione Clinica *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingFaculty ? editingFaculty.specialty : newFaculty.specialty}
                  onChange={(e) =>
                    editingFaculty
                      ? setEditingFaculty({ ...editingFaculty, specialty: e.target.value })
                      : setNewFaculty({ ...newFaculty, specialty: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Assigned Team' : 'Squadra Assegnata'}
                  </label>
                  <select
                    value={editingFaculty ? editingFaculty.assignedTeamId : newFaculty.assignedTeamId}
                    onChange={(e) =>
                      editingFaculty
                        ? setEditingFaculty({ ...editingFaculty, assignedTeamId: Number(e.target.value) })
                        : setNewFaculty({ ...newFaculty, assignedTeamId: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {getTeamCodeName(t)} (GRP {t.groupId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Direct Phone' : 'Telefono Diretto'}
                  </label>
                  <input
                    type="text"
                    value={editingFaculty ? editingFaculty.phone : newFaculty.phone}
                    onChange={(e) =>
                      editingFaculty
                        ? setEditingFaculty({ ...editingFaculty, phone: e.target.value })
                        : setNewFaculty({ ...newFaculty, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingFaculty(null);
                    setIsAddingFaculty(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-neutral-100 text-black border-2 border-emerald-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingFaculty
                    ? (isEn ? 'SAVE FACULTY' : 'SALVA DOCENTE')
                    : (isEn ? 'REGISTER FACULTY' : 'REGISTRA DOCENTE')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. TECNICO EDIT / ADD MODAL */}
      {(editingTech || isAddingTech) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingTech
                  ? (isEn ? `EDIT LAB TECHNICIAN: ${editingTech.name}` : `MODIFICA TECNICO LAB: ${editingTech.name}`)
                  : (isEn ? 'REGISTER NEW MOULAGE TECHNICIAN' : 'COMPILA NUOVO TECNICO MOULAGE')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingTech(null);
                  setIsAddingTech(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingTech) {
                  const updated = { ...editingTech, updatedAt: new Date().toISOString() };
                  updateTechnician(editingTech.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingTech.id) {
                    setSelectedPersonForQr({ person: updated, category: 'tecnici' });
                  }
                  setEditingTech(null);
                } else {
                  addTechnician(newTech);
                  setIsAddingTech(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Full Name *' : 'Nome e Cognome *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingTech ? editingTech.name : newTech.name}
                  onChange={(e) =>
                    editingTech
                      ? setEditingTech({ ...editingTech, name: e.target.value })
                      : setNewTech({ ...newTech, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-amber-400 font-mono">
                    {getCountryFlag(editingTech ? editingTech.nationality : newTech.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingTech ? editingTech.nationality : newTech.nationality}
                  onChange={(e) =>
                    editingTech
                      ? setEditingTech({ ...editingTech, nationality: e.target.value })
                      : setNewTech({ ...newTech, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500 mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingTech
                          ? setEditingTech({ ...editingTech, nationality: preset })
                          : setNewTech({ ...newTech, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Technical Specialty & Moulage *' : 'Specialità Tecnica & Protesi *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingTech ? editingTech.specialty : newTech.specialty}
                  onChange={(e) =>
                    editingTech
                      ? setEditingTech({ ...editingTech, specialty: e.target.value })
                      : setNewTech({ ...newTech, specialty: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Assigned Stations (comma-separated)' : 'Postazioni Assegnate (separate da virgola)'}
                </label>
                <input
                  type="text"
                  value={editingTech ? editingTech.assignedStations.join(', ') : newTech.assignedStations.join(', ')}
                  onChange={(e) => {
                    const arr = e.target.value.split(',').map((s) => s.trim());
                    if (editingTech) setEditingTech({ ...editingTech, assignedStations: arr });
                    else setNewTech({ ...newTech, assignedStations: arr });
                  }}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Phone / Radio' : 'Telefono / Radio'}
                  </label>
                  <input
                    type="text"
                    value={editingTech ? editingTech.phone : newTech.phone}
                    onChange={(e) =>
                      editingTech
                        ? setEditingTech({ ...editingTech, phone: e.target.value })
                        : setNewTech({ ...newTech, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Organization / Lab' : 'Ente / Laboratorio'}
                  </label>
                  <input
                    type="text"
                    value={editingTech ? editingTech.organization || '' : newTech.organization || ''}
                    onChange={(e) =>
                      editingTech
                        ? setEditingTech({ ...editingTech, organization: e.target.value })
                        : setNewTech({ ...newTech, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTech(null);
                    setIsAddingTech(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-neutral-100 text-black border-2 border-amber-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingTech
                    ? (isEn ? 'SAVE TECHNICIAN' : 'SALVA TECNICO')
                    : (isEn ? 'REGISTER TECHNICIAN' : 'REGISTRA TECNICO')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DIREZIONE EDIT / ADD MODAL */}
      {(editingDir || isAddingDir) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingDir
                  ? (isEn ? `EDIT DIRECTION: ${editingDir.name}` : `MODIFICA DIREZIONE: ${editingDir.name}`)
                  : (isEn ? 'REGISTER NEW COURSE DIRECTION MEMBER' : 'COMPILA NUOVO MEMBRO DIREZIONE')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingDir(null);
                  setIsAddingDir(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingDir) {
                  const updated = { ...editingDir, updatedAt: new Date().toISOString() };
                  updateDirector(editingDir.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingDir.id) {
                    setSelectedPersonForQr({ person: updated, category: 'direttori' });
                  }
                  setEditingDir(null);
                } else {
                  addDirector(newDir);
                  setIsAddingDir(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Name and Title *' : 'Nome e Titolo *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingDir ? editingDir.name : newDir.name}
                  onChange={(e) =>
                    editingDir
                      ? setEditingDir({ ...editingDir, name: e.target.value })
                      : setNewDir({ ...newDir, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-purple-400 font-mono">
                    {getCountryFlag(editingDir ? editingDir.nationality : newDir.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingDir ? editingDir.nationality : newDir.nationality}
                  onChange={(e) =>
                    editingDir
                      ? setEditingDir({ ...editingDir, nationality: e.target.value })
                      : setNewDir({ ...newDir, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-purple-500 mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingDir
                          ? setEditingDir({ ...editingDir, nationality: preset })
                          : setNewDir({ ...newDir, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Director Role *' : 'Ruolo Direttivo *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingDir ? editingDir.title : newDir.title}
                  onChange={(e) =>
                    editingDir
                      ? setEditingDir({ ...editingDir, title: e.target.value })
                      : setNewDir({ ...newDir, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Radio Channel / Phone' : 'Canale Radio / Telefono'}
                  </label>
                  <input
                    type="text"
                    value={editingDir ? editingDir.phone : newDir.phone}
                    onChange={(e) =>
                      editingDir
                        ? setEditingDir({ ...editingDir, phone: e.target.value })
                        : setNewDir({ ...newDir, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Organization / Hospital' : 'Ente / Ospedale'}
                  </label>
                  <input
                    type="text"
                    value={editingDir ? editingDir.organization || '' : newDir.organization || ''}
                    onChange={(e) =>
                      editingDir
                        ? setEditingDir({ ...editingDir, organization: e.target.value })
                        : setNewDir({ ...newDir, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-neutral-900 border border-neutral-700">
                <input
                  type="checkbox"
                  id="isMasterDirectorCheckbox"
                  checked={editingDir ? !!editingDir.isMaster : !!newDir.isMaster}
                  onChange={(e) =>
                    editingDir
                      ? setEditingDir({ ...editingDir, isMaster: e.target.checked })
                      : setNewDir({ ...newDir, isMaster: e.target.checked })
                  }
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="isMasterDirectorCheckbox" className="text-xs uppercase font-bold text-amber-400 cursor-pointer">
                  {isEn ? 'Grant Full Access Master Director (isMaster)' : 'Concedi Accesso Totale Direttore Master (isMaster)'}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDir(null);
                    setIsAddingDir(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-purple-500 hover:bg-neutral-100 text-black border-2 border-purple-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingDir
                    ? (isEn ? 'SAVE DIRECTION' : 'SALVA DIREZIONE')
                    : (isEn ? 'REGISTER MEMBER' : 'REGISTRA MEMBRO')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGIA EDIT / ADD MODAL */}
      {(editingRegia || isAddingRegia) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingRegia
                  ? (isEn ? `EDIT CONTROL ROOM: ${editingRegia.name}` : `MODIFICA REGIA: ${editingRegia.name}`)
                  : (isEn ? 'REGISTER NEW CONTROL ROOM & MISSION CONTROL MEMBER' : 'COMPILA NUOVO MEMBRO REGIA & MISSION CONTROL')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingRegia(null);
                  setIsAddingRegia(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingRegia) {
                  const updated = { ...editingRegia, updatedAt: new Date().toISOString() };
                  updateRegiaStaff(editingRegia.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingRegia.id) {
                    setSelectedPersonForQr({ person: updated, category: 'regia' });
                  }
                  setEditingRegia(null);
                } else {
                  addRegiaStaff(newRegia);
                  setIsAddingRegia(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Full Name *' : 'Nome e Cognome *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingRegia ? editingRegia.name : newRegia.name}
                  onChange={(e) =>
                    editingRegia
                      ? setEditingRegia({ ...editingRegia, name: e.target.value })
                      : setNewRegia({ ...newRegia, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-pink-500"
                  placeholder={isEn ? 'e.g. Marco Regia, Eng.' : 'Es. Ing. Marco Regia'}
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-pink-400 font-mono">
                    {getCountryFlag(editingRegia ? editingRegia.nationality : newRegia.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingRegia ? editingRegia.nationality : newRegia.nationality}
                  onChange={(e) =>
                    editingRegia
                      ? setEditingRegia({ ...editingRegia, nationality: e.target.value })
                      : setNewRegia({ ...newRegia, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-pink-500 mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingRegia
                          ? setEditingRegia({ ...editingRegia, nationality: preset })
                          : setNewRegia({ ...newRegia, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Role / Function *' : 'Ruolo / Funzione *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRegia ? editingRegia.role : newRegia.role}
                    onChange={(e) =>
                      editingRegia
                        ? setEditingRegia({ ...editingRegia, role: e.target.value })
                        : setNewRegia({ ...newRegia, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Title / Qualification' : 'Titolo / Qualifica'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRegia ? editingRegia.title : newRegia.title}
                    onChange={(e) =>
                      editingRegia
                        ? setEditingRegia({ ...editingRegia, title: e.target.value })
                        : setNewRegia({ ...newRegia, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Phone / Radio' : 'Telefono / Radio'}
                  </label>
                  <input
                    type="text"
                    value={editingRegia ? editingRegia.phone : newRegia.phone}
                    onChange={(e) =>
                      editingRegia
                        ? setEditingRegia({ ...editingRegia, phone: e.target.value })
                        : setNewRegia({ ...newRegia, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Badge ID' : 'Badge ID'}
                  </label>
                  <input
                    type="text"
                    value={editingRegia ? editingRegia.badgeCode || '' : newRegia.badgeCode || ''}
                    onChange={(e) =>
                      editingRegia
                        ? setEditingRegia({ ...editingRegia, badgeCode: e.target.value })
                        : setNewRegia({ ...newRegia, badgeCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Organization / Facility' : 'Ente / Ospedale'}
                </label>
                <input
                  type="text"
                  value={editingRegia ? editingRegia.organization || '' : newRegia.organization || ''}
                  onChange={(e) =>
                    editingRegia
                      ? setEditingRegia({ ...editingRegia, organization: e.target.value })
                      : setNewRegia({ ...newRegia, organization: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRegia(null);
                    setIsAddingRegia(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-pink-500 hover:bg-neutral-100 text-black border-2 border-pink-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingRegia
                    ? (isEn ? 'SAVE CONTROL ROOM' : 'SALVA REGIA')
                    : (isEn ? 'REGISTER MEMBER' : 'REGISTRA MEMBRO')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. GUEST / OSPITE EDIT / ADD MODAL */}
      {(editingGuest || isAddingGuest) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingGuest
                  ? (isEn ? `EDIT GUEST / VIP: ${editingGuest.name}` : `MODIFICA OSPITE / VIP: ${editingGuest.name}`)
                  : (isEn ? 'REGISTER GUEST & DELEGATION' : 'COMPILA ANAGRAFICA OSPITE & DELEGAZIONE')}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingGuest(null);
                  setIsAddingGuest(false);
                }}
                className="text-neutral-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingGuest) {
                  const updated = { ...editingGuest, updatedAt: new Date().toISOString() };
                  updateGuest(editingGuest.id, updated);
                  if (selectedPersonForQr && selectedPersonForQr.person.id === editingGuest.id) {
                    setSelectedPersonForQr({ person: updated, category: 'ospiti' });
                  }
                  setEditingGuest(null);
                } else {
                  addGuest(newGuest);
                  setIsAddingGuest(false);
                }
              }}
              className="space-y-3.5 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Name and Title *' : 'Nome e Titolo *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest ? editingGuest.name : newGuest.name}
                  onChange={(e) =>
                    editingGuest
                      ? setEditingGuest({ ...editingGuest, name: e.target.value })
                      : setNewGuest({ ...newGuest, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500"
                  placeholder={isEn ? 'e.g. Col. Dr. Hans Gruber / Red Cross Delegate' : 'Es. Col. Med. Hans Gruber / Delegato Croce Rossa'}
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>{isEn ? 'Nationality *' : 'Nazionalità *'}</span>
                  <span className="text-cyan-400 font-mono">
                    {getCountryFlag(editingGuest ? editingGuest.nationality : newGuest.nationality)}
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editingGuest ? editingGuest.nationality : newGuest.nationality}
                  onChange={(e) =>
                    editingGuest
                      ? setEditingGuest({ ...editingGuest, nationality: e.target.value })
                      : setNewGuest({ ...newGuest, nationality: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500 mb-1.5"
                  placeholder={isEn ? 'e.g. German, Swiss, British, French...' : 'Es. Tedesca, Svizzera, Britannica, Francese...'}
                />
                <div className="flex flex-wrap gap-1">
                  {NATIONALITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        editingGuest
                          ? setEditingGuest({ ...editingGuest, nationality: preset })
                          : setNewGuest({ ...newGuest, nationality: preset })
                      }
                      className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700 cursor-pointer"
                    >
                      {getCountryFlag(preset)} {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Qualification / Role *' : 'Qualifica / Ruolo *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingGuest ? editingGuest.title : newGuest.title}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, title: e.target.value })
                        : setNewGuest({ ...newGuest, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500"
                    placeholder={isEn ? 'e.g. NATO Medical Auditor' : 'Es. Auditor Medico NATO'}
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Organization / Institution *' : 'Ente / Istituzione *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingGuest ? editingGuest.organization : newGuest.organization}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, organization: e.target.value })
                        : setNewGuest({ ...newGuest, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500"
                    placeholder={isEn ? 'e.g. NATO MilMed COE' : 'Es. NATO MilMed COE'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Badge Code / VIP Pass' : 'Codice Badge / VIP Pass'}
                  </label>
                  <input
                    type="text"
                    value={editingGuest ? editingGuest.badgeCode || '' : newGuest.badgeCode || ''}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, badgeCode: e.target.value })
                        : setNewGuest({ ...newGuest, badgeCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-cyan-500"
                    placeholder="VIP-01"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Escort Faculty' : 'Faculty Accompagnatore'}
                  </label>
                  <select
                    value={editingGuest ? editingGuest.escortFaculty || '' : newGuest.escortFaculty || ''}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, escortFaculty: e.target.value })
                        : setNewGuest({ ...newGuest, escortFaculty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="">{isEn ? 'No Direct Escort' : 'Nessun Accompagnatore Diretto'}</option>
                    {directors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} ({isEn ? 'Direction' : 'Direzione'})
                      </option>
                    ))}
                    {faculty.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} (Faculty)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Phone / Radio' : 'Telefono / Radio'}
                  </label>
                  <input
                    type="text"
                    value={editingGuest ? editingGuest.phone || '' : newGuest.phone || ''}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, phone: e.target.value })
                        : setNewGuest({ ...newGuest, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                    {isEn ? 'Email' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={editingGuest ? editingGuest.email || '' : newGuest.email || ''}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, email: e.target.value })
                        : setNewGuest({ ...newGuest, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-mono font-bold text-white focus:outline-hidden focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Notes & Observation Objectives' : 'Note & Obiettivi Osservazione'}
                </label>
                <textarea
                  rows={2}
                  value={editingGuest ? editingGuest.notes || '' : newGuest.notes || ''}
                  onChange={(e) =>
                    editingGuest
                      ? setEditingGuest({ ...editingGuest, notes: e.target.value })
                      : setNewGuest({ ...newGuest, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-cyan-500"
                  placeholder={isEn ? 'e.g. Assessment of damage control surgery and disaster response standards...' : 'Es. Valutazione standard damage control surgery e maxiemergenza...'}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGuest(null);
                    setIsAddingGuest(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-neutral-100 text-black border-2 border-cyan-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingGuest
                    ? (isEn ? 'SAVE GUEST CHANGES' : 'SALVA MODIFICHE OSPITE')
                    : (isEn ? 'REGISTER GUEST / VIP' : 'REGISTRA OSPITE / VIP')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. TEAM EDIT MODAL */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-md w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <h3 className="font-black text-lg text-white uppercase tracking-tight">
              {isEn ? `EDIT TEAM #${editingTeam.id}` : `MODIFICA SQUADRA #${editingTeam.id}`}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTeam(editingTeam.id, editingTeam);
                setEditingTeam(null);
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Team Name' : 'Nome Squadra'}
                </label>
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Logistic Group (A, B, C, D)' : 'Gruppo Logistico (A, B, C, D)'}
                </label>
                <select
                  value={editingTeam.groupId}
                  onChange={(e) => setEditingTeam({ ...editingTeam, groupId: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                >
                  <option value="A">{isEn ? 'GROUP A' : 'GRUPPO A'}</option>
                  <option value="B">{isEn ? 'GROUP B' : 'GRUPPO B'}</option>
                  <option value="C">{isEn ? 'GROUP C' : 'GRUPPO C'}</option>
                  <option value="D">{isEn ? 'GROUP D' : 'GRUPPO D'}</option>
                </select>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Assigned Faculty Instructor' : 'Docente Faculty Assegnato'}
                </label>
                <select
                  value={editingTeam.facultyId}
                  onChange={(e) => setEditingTeam({ ...editingTeam, facultyId: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.specialty})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">
                  {isEn ? 'Team Operational Notes' : 'Note Operative Squadra'}
                </label>
                <textarea
                  rows={2}
                  value={editingTeam.notes || ''}
                  onChange={(e) => setEditingTeam({ ...editingTeam, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {isEn ? 'SAVE TEAM' : 'SALVA SQUADRA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL PARTICIPANT QR MODAL */}
      {selectedPersonForQr && (
        <ParticipantQRModal
          isOpen={!!selectedPersonForQr}
          onClose={() => setSelectedPersonForQr(null)}
          person={selectedPersonForQr.person}
          category={selectedPersonForQr.category}
          onOpenEdit={(p) => {
            if (selectedPersonForQr.category === 'discenti') setEditingDiscente(p as Discente);
            else if (selectedPersonForQr.category === 'faculty') setEditingFaculty(p as Faculty);
            else if (selectedPersonForQr.category === 'tecnici') setEditingTech(p as Technician);
            else if (selectedPersonForQr.category === 'direttori') setEditingDir(p as Director);
            else if (selectedPersonForQr.category === 'regia') setEditingRegia(p as RegiaStaff);
            else if (selectedPersonForQr.category === 'ospiti') setEditingGuest(p as Guest);
          }}
        />
      )}
    </div>
  );
};
