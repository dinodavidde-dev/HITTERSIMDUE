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
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { Director, Discente, Faculty, Guest, Team, Technician } from '../../types';
import { QRCodeDisplay } from '../QRCodeDisplay';
import { PersonnelBadgeRegistry } from './PersonnelBadgeRegistry';
import { TeamAssignmentDragDropBoard } from './TeamAssignmentDragDropBoard';
import { getTeamCodeName } from '../../utils/teamUtils';

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

export const MasterAnagraficaManager: React.FC = () => {
  const {
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
    guests,
    updateGuest,
    addGuest,
    deleteGuest,
  } = useCourse();

  const [activeSection, setActiveSection] = useState<'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'ospiti' | 'squadre' | 'qr_registry'>('discenti');
  const [searchQuery, setSearchQuery] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');

  // Modals state for editing & QR view
  const [editingDiscente, setEditingDiscente] = useState<Discente | null>(null);
  const [viewingQrDiscente, setViewingQrDiscente] = useState<Discente | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [editingDir, setEditingDir] = useState<Director | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // Modals state for adding new
  const [isAddingDiscente, setIsAddingDiscente] = useState(false);
  const [isAddingFaculty, setIsAddingFaculty] = useState(false);
  const [isAddingTech, setIsAddingTech] = useState(false);
  const [isAddingDir, setIsAddingDir] = useState(false);
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
  const totalPersonnel = discenti.length + faculty.length + technicians.length + directors.length + guests.length;

  const nationalityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const all = [
      ...discenti.map((d) => d.nationality || 'Italiana'),
      ...faculty.map((f) => f.nationality || 'Italiana'),
      ...technicians.map((t) => t.nationality || 'Italiana'),
      ...directors.map((d) => d.nationality || 'Italiana'),
      ...guests.map((g) => g.nationality || 'Italiana'),
    ];
    all.forEach((n) => {
      const clean = n.trim() || 'Non specificata';
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return counts;
  }, [discenti, faculty, technicians, directors, guests]);

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
                GESTIONE ACCREDITI & RUOLI CORSO
              </span>
              <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold">
                TOTALE OPERATORI: {totalPersonnel}
              </span>
            </div>
            <h2 className="text-[17px] font-black text-white uppercase tracking-tight mt-1 leading-tight">
              ANAGRAFICA MASTER DEL PERSONALE & OSPITI
            </h2>
            <p className="text-[10px] text-neutral-400 max-w-3xl mt-1 leading-relaxed">
              Gestione, compilazione e modifica completa dei dati anagrafici, nazionalità, ruoli operativi, contatti e squadre per Discenti (60), Faculty (12), Staff Tecnico (6), Direzione (2) e Delegazioni Ospiti/VIP (5).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveSection('qr_registry')}
              className="px-4 py-2.5 bg-orange-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-orange-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
              title="Visualizza e stampa tutti i tesserini badge con QR Code per ogni figura"
            >
              <QrCode className="w-4 h-4" />
              STAMPA BADGE & QR ({discenti.length + faculty.length + technicians.length + directors.length + guests.length})
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-100 hover:text-black text-white border-2 border-neutral-700 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              title="Esporta foglio completo CSV con tutte le anagrafiche e nazionalità"
            >
              <Download className="w-4 h-4 text-orange-400" />
              ESPORTA REGISTRO (CSV)
            </button>
          </div>
        </div>

        {/* NATIONALITY PILLS BREAKDOWN */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
              Riepilogo Nazionalità Partecipanti ({Object.keys(nationalityBreakdown).length} Nazioni)
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
                AZZERA FILTRO NAZIONE (MOSTRA TUTTI)
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
          1. DISCENTI OPERATIVI ({discenti.length})
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
          2. FACULTY ISTRUTTORI ({faculty.length})
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
          3. TECNICI & LAB MOULAGE ({technicians.length})
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
          4. DIREZIONE DEL CORSO ({directors.length})
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
          5. ANAGRAFICA OSPITI & VIP ({guests.length})
        </button>

        <button
          onClick={() => setActiveSection('squadre')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'squadre'
              ? 'bg-neutral-100 text-black border-neutral-100'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-red-400" />
          6. SQUADRE & DRAG-AND-DROP ({teams.length})
        </button>

        <button
          onClick={() => setActiveSection('qr_registry')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
            activeSection === 'qr_registry'
              ? 'bg-orange-500 text-black border-orange-400 font-black'
              : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4 text-orange-400" />
          7. BADGE & QR PASS COMPLETO ({discenti.length + faculty.length + technicians.length + directors.length + guests.length})
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
            placeholder="Cerca per nome, ruolo, ente di appartenenza o badge..."
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
            <option value="ALL">TUTTE LE NAZIONALITÀ</option>
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
              <option value="ALL">TUTTI I GRUPPI</option>
              <option value="A">GRUPPO A (SQ. 1-3)</option>
              <option value="B">GRUPPO B (SQ. 4-6)</option>
              <option value="C">GRUPPO C (SQ. 7-9)</option>
              <option value="D">GRUPPO D (SQ. 10-12)</option>
            </select>
          )}

          {/* Add button based on active section */}
          {activeSection === 'discenti' && (
            <button
              onClick={() => setIsAddingDiscente(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-orange-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              NUOVO DISCENTE
            </button>
          )}
          {activeSection === 'faculty' && (
            <button
              onClick={() => setIsAddingFaculty(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-emerald-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              NUOVO DOCENTE FACULTY
            </button>
          )}
          {activeSection === 'tecnici' && (
            <button
              onClick={() => setIsAddingTech(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-amber-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              NUOVO TECNICO LAB
            </button>
          )}
          {activeSection === 'direttori' && (
            <button
              onClick={() => setIsAddingDir(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-purple-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              NUOVO MEMBRO DIREZIONE
            </button>
          )}
          {activeSection === 'ospiti' && (
            <button
              onClick={() => setIsAddingGuest(true)}
              className="px-4 py-2 bg-cyan-500 hover:bg-neutral-100 hover:text-black text-black border-2 border-cyan-500 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
              COMPILA NUOVO OSPITE / VIP
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: DISCENTI LIST */}
      {activeSection === 'discenti' && (
        <div className="bg-neutral-900 border-2 border-neutral-800 overflow-hidden">
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center text-xs font-bold text-neutral-400">
            <span>Visualizzati {filteredDiscenti.length} discenti su {discenti.length} registrati</span>
            <span className="text-orange-400 font-mono">5 Operatori per Squadra (12 Squadre)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-200">
              <thead className="bg-neutral-900 text-neutral-400 uppercase font-black text-[10px] tracking-wider border-b-2 border-neutral-800">
                <tr>
                  <th className="p-3"># BADGE</th>
                  <th className="p-3">NOME & COGNOME</th>
                  <th className="p-3">NAZIONALITÀ</th>
                  <th className="p-3">RUOLO TEAM</th>
                  <th className="p-3">SQUADRA & GRP</th>
                  <th className="p-3">ENTE / OSPEDALE</th>
                  <th className="p-3">TELEFONO / EMAIL</th>
                  <th className="p-3 text-right">AZIONI</th>
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
                          <span>{disc.nationality || 'Italiana'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-orange-400 font-bold font-mono text-[11px]">
                        {disc.role}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-neutral-950 text-neutral-200 border border-neutral-700 font-mono font-bold text-[10px]">
                          SQ. {disc.teamId} (GRP {team?.groupId})
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
                            onClick={() => setViewingQrDiscente(disc)}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-orange-500 hover:text-black text-orange-400 border border-neutral-700 hover:border-orange-500 transition-colors cursor-pointer text-xs font-black uppercase flex items-center gap-1"
                            title="Visualizza e genera QR Pass per questo partecipante"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR PASS</span>
                          </button>
                          <button
                            onClick={() => setEditingDiscente(disc)}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-100 hover:text-black text-neutral-300 border border-neutral-700 transition-colors cursor-pointer text-xs font-black uppercase"
                            title="Modifica scheda anagrafica discente"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Sei sicuro di voler eliminare ${disc.name} dal corso?`)) {
                                deleteDiscente(disc.id);
                              }
                            }}
                            className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                            title="Elimina"
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
                        DOCENTE FACULTY
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                        <span>{getCountryFlag(f.nationality)}</span>
                        <span>{f.nationality || 'Italiana'}</span>
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white uppercase mt-1">{f.name}</h4>
                    <p className="text-xs text-neutral-400 font-medium">{f.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingFaculty(f)}
                      className="p-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-black text-emerald-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Modifica faculty"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare il docente ${f.name}?`)) {
                          deleteFaculty(f.id);
                        }
                      }}
                      className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Specializzazione:</span>
                    <span className="font-bold text-white text-right">{f.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Ente / Ospedale:</span>
                    <span className="text-neutral-200 text-right">{f.organization || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Squadra Tutorata:</span>
                    <span className="font-mono font-bold text-orange-400">
                      {assignedTeam ? `${getTeamCodeName(assignedTeam)} (GRP ${assignedTeam.groupId})` : getTeamCodeName(f.assignedTeamId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Telefono:</span>
                    <span className="font-mono text-neutral-300">{f.phone}</span>
                  </div>
                  {f.email && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Email:</span>
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
                      TECNICO / MOULAGE STAFF
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <span>{getCountryFlag(t.nationality)}</span>
                      <span>{t.nationality || 'Italiana'}</span>
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white uppercase mt-1">{t.name}</h4>
                  <p className="text-xs text-amber-400 font-bold">{t.specialty}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTech(t)}
                    className="p-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-neutral-700 transition-colors cursor-pointer"
                    title="Modifica tecnico"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminare il tecnico ${t.name}?`)) {
                        deleteTechnician(t.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Postazioni Assegnate:</span>
                  <span className="font-mono font-bold text-white text-right">{t.assignedStations.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ente / Lab:</span>
                  <span className="text-neutral-300 text-right">{t.organization || 'SimCenter Lab'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Telefono / Radio:</span>
                  <span className="font-mono text-neutral-300">{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Email:</span>
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
            <div key={d.id} className="bg-neutral-900 border-2 border-neutral-800 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-700 text-[10px] font-black uppercase">
                      DIREZIONE DEL CORSO
                    </span>
                    <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <span>{getCountryFlag(d.nationality)}</span>
                      <span>{d.nationality || 'Italiana'}</span>
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase mt-1">{d.name}</h4>
                  <p className="text-xs text-purple-400 font-bold">{d.title}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingDir(d)}
                    className="p-1.5 bg-neutral-800 hover:bg-purple-500 hover:text-black text-purple-400 border border-neutral-700 transition-colors cursor-pointer"
                    title="Modifica dati direttore"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Eliminare ${d.name} dalla direzione?`)) {
                        deleteDirector(d.id);
                      }
                    }}
                    className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Ente / Ospedale:</span>
                  <span className="text-white font-medium">{d.organization || 'Ospedale Niguarda Trauma Center'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Canale Radio / Tel:</span>
                  <span className="font-mono font-bold text-white">{d.phone}</span>
                </div>
                {d.email && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Email Ufficiale:</span>
                    <span className="font-mono text-neutral-300">{d.email}</span>
                  </div>
                )}
                {d.notes && (
                  <div className="pt-1 text-[11px] text-neutral-400 border-t border-neutral-800">
                    <span className="font-bold text-neutral-300">Note: </span>
                    {d.notes}
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
                        OSPITE / VIP
                      </span>
                      <span className="px-2 py-0.5 bg-neutral-950 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                        <span>{getCountryFlag(g.nationality)}</span>
                        <span>{g.nationality || 'Italiana'}</span>
                      </span>
                    </div>
                    <h4 className="text-base font-black text-white uppercase mt-1">{g.name}</h4>
                    <p className="text-xs text-cyan-400 font-bold">{g.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingGuest(g)}
                      className="p-1.5 bg-neutral-800 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Modifica ospite"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Eliminare l'ospite ${g.name}?`)) {
                          deleteGuest(g.id);
                        }
                      }}
                      className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-white text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Ente / Istituzione:</span>
                    <span className="font-bold text-white text-right">{g.organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Badge Accreditamento:</span>
                    <span className="font-mono font-bold text-cyan-400">{g.badgeCode || 'VIP'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Giornate di Presenza:</span>
                    <span className="font-mono text-neutral-200">
                      {g.assignedDays.map((d) => `Giorno ${d}`).join(', ')}
                    </span>
                  </div>
                  {g.escortFaculty && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Faculty Accompagnatore:</span>
                      <span className="text-orange-400 font-bold text-right">{g.escortFaculty}</span>
                    </div>
                  )}
                  {g.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Recapito:</span>
                      <span className="font-mono text-neutral-300">{g.phone}</span>
                    </div>
                  )}
                  {g.notes && (
                    <div className="pt-2 text-[11px] text-neutral-400 border-t border-neutral-800">
                      <span className="font-bold text-neutral-300">Obiettivo Osservazione: </span>
                      {g.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: SQUADRE & DRAG AND DROP */}
      {activeSection === 'squadre' && (
        <TeamAssignmentDragDropBoard
          teams={teams}
          faculty={faculty}
          discenti={discenti}
          updateDiscente={updateDiscente}
          updateFaculty={updateFaculty}
          updateTeam={updateTeam}
        />
      )}

      {/* SECTION 7: BADGE & QR PASS REGISTRY */}
      {activeSection === 'qr_registry' && (
        <div className="space-y-4">
          <PersonnelBadgeRegistry />
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. DISCENTE EDIT / ADD MODAL */}
      {(editingDiscente || isAddingDiscente) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-950 border-4 border-neutral-100 p-6 sm:p-8 max-w-lg w-full text-neutral-100 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-800">
              <h3 className="font-black text-lg text-white uppercase tracking-tight">
                {editingDiscente ? `MODIFICA ANAGRAFICA: ${editingDiscente.name}` : 'COMPILA NUOVO PARTECIPANTE DISCENTE'}
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
                  updateDiscente(editingDiscente.id, editingDiscente);
                  setEditingDiscente(null);
                } else {
                  addDiscente(newDiscente);
                  setIsAddingDiscente(false);
                }
              }}
              className="space-y-3.5 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome e Cognome *</label>
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
                  placeholder="Es. Dr. Luca De Angeli"
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Nazionalità *</span>
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
                  placeholder="Es. Italiana, Svizzera, Spagnola, Tedesca..."
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ruolo Operativo nel Trauma Team *</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Squadra Assegnata</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Badge ID</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ente / Ospedale</label>
                  <input
                    type="text"
                    value={editingDiscente ? editingDiscente.organization || '' : newDiscente.organization || ''}
                    onChange={(e) =>
                      editingDiscente
                        ? setEditingDiscente({ ...editingDiscente, organization: e.target.value })
                        : setNewDiscente({ ...newDiscente, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                    placeholder="Es. DEA Niguarda"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Telefono</label>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Email Istituzionale</label>
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
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingDiscente ? 'SALVA MODIFICHE' : 'REGISTRA DISCENTE'}
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
                {editingFaculty ? `MODIFICA DOCENTE FACULTY: ${editingFaculty.name}` : 'COMPILA NUOVO DOCENTE FACULTY'}
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
                  updateFaculty(editingFaculty.id, editingFaculty);
                  setEditingFaculty(null);
                } else {
                  addFaculty(newFaculty);
                  setIsAddingFaculty(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome e Titolo Accademico *</label>
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
                  placeholder="Es. Prof. Dott. Mario Rossi"
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Nazionalità *</span>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Qualifica Didattica</label>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Specializzazione Clinica *</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Squadra Assegnata</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Telefono Diretto</label>
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
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-neutral-100 text-black border-2 border-emerald-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingFaculty ? 'SALVA DOCENTE' : 'REGISTRA DOCENTE'}
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
                {editingTech ? `MODIFICA TECNICO LAB: ${editingTech.name}` : 'COMPILA NUOVO TECNICO MOULAGE'}
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
                  updateTechnician(editingTech.id, editingTech);
                  setEditingTech(null);
                } else {
                  addTechnician(newTech);
                  setIsAddingTech(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome e Cognome *</label>
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
                  <span>Nazionalità *</span>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Specialità Tecnica & Protesi *</label>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Postazioni Assegnate (separate da virgola)</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Telefono / Radio</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ente / Laboratorio</label>
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
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-neutral-100 text-black border-2 border-amber-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingTech ? 'SALVA TECNICO' : 'REGISTRA TECNICO'}
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
                {editingDir ? `MODIFICA DIREZIONE: ${editingDir.name}` : 'COMPILA NUOVO MEMBRO DIREZIONE'}
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
                  updateDirector(editingDir.id, editingDir);
                  setEditingDir(null);
                } else {
                  addDirector(newDir);
                  setIsAddingDir(false);
                }
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome e Titolo *</label>
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
                  <span>Nazionalità *</span>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ruolo Direttivo *</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Canale Radio / Telefono</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ente / Ospedale</label>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDir(null);
                    setIsAddingDir(false);
                  }}
                  className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-purple-500 hover:bg-neutral-100 text-black border-2 border-purple-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingDir ? 'SALVA DIREZIONE' : 'REGISTRA MEMBRO'}
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
                {editingGuest ? `MODIFICA OSPITE / VIP: ${editingGuest.name}` : 'COMPILA ANAGRAFICA OSPITE & DELEGAZIONE'}
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
                  updateGuest(editingGuest.id, editingGuest);
                  setEditingGuest(null);
                } else {
                  addGuest(newGuest);
                  setIsAddingGuest(false);
                }
              }}
              className="space-y-3.5 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome e Titolo *</label>
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
                  placeholder="Es. Col. Med. Hans Gruber / Delegato Croce Rossa"
                />
              </div>

              {/* NAZIONALITA */}
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Nazionalità *</span>
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
                  placeholder="Es. Tedesca, Svizzera, Britannica, Francese..."
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Qualifica / Ruolo *</label>
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
                    placeholder="Es. Auditor Medico NATO"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Ente / Istituzione *</label>
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
                    placeholder="Es. NATO MilMed COE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Codice Badge / VIP Pass</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Faculty Accompagnatore</label>
                  <select
                    value={editingGuest ? editingGuest.escortFaculty || '' : newGuest.escortFaculty || ''}
                    onChange={(e) =>
                      editingGuest
                        ? setEditingGuest({ ...editingGuest, escortFaculty: e.target.value })
                        : setNewGuest({ ...newGuest, escortFaculty: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-cyan-500"
                  >
                    <option value="">Nessun Accompagnatore Diretto</option>
                    {directors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} (Direzione)
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Telefono / Radio</label>
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
                  <label className="block uppercase tracking-wider text-neutral-400 mb-1">Email</label>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Note & Obiettivi Osservazione</label>
                <textarea
                  rows={2}
                  value={editingGuest ? editingGuest.notes || '' : newGuest.notes || ''}
                  onChange={(e) =>
                    editingGuest
                      ? setEditingGuest({ ...editingGuest, notes: e.target.value })
                      : setNewGuest({ ...newGuest, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-xs font-medium text-white focus:outline-hidden focus:border-cyan-500"
                  placeholder="Es. Valutazione standard damage control surgery e maxiemergenza..."
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
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-neutral-100 text-black border-2 border-cyan-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  {editingGuest ? 'SALVA MODIFICHE OSPITE' : 'REGISTRA OSPITE / VIP'}
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
            <h3 className="font-black text-lg text-white uppercase tracking-tight">MODIFICA SQUADRA #{editingTeam.id}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateTeam(editingTeam.id, editingTeam);
                setEditingTeam(null);
              }}
              className="space-y-3 text-xs font-bold"
            >
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Nome Squadra</label>
                <input
                  type="text"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Gruppo Logistico (A, B, C, D)</label>
                <select
                  value={editingTeam.groupId}
                  onChange={(e) => setEditingTeam({ ...editingTeam, groupId: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                  className="w-full px-3 py-2 bg-neutral-900 border-2 border-neutral-700 text-sm font-bold text-white focus:outline-hidden focus:border-orange-500"
                >
                  <option value="A">GRUPPO A</option>
                  <option value="B">GRUPPO B</option>
                  <option value="C">GRUPPO C</option>
                  <option value="D">GRUPPO D</option>
                </select>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Docente Faculty Assegnato</label>
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
                <label className="block uppercase tracking-wider text-neutral-400 mb-1">Note Operative Squadra</label>
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
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 cursor-pointer font-bold"
                >
                  SALVA SQUADRA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* QR PASS MODAL FOR SELECTED DISCENTE */}
      {viewingQrDiscente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setViewingQrDiscente(null)}
              className="absolute -top-10 right-0 text-neutral-300 hover:text-white font-black text-xs uppercase px-3 py-1 bg-neutral-900 border border-neutral-700 cursor-pointer flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>CHIUDI BADGE</span>
            </button>
            <QRCodeDisplay
              discente={viewingQrDiscente}
              team={teams.find((t) => t.id === viewingQrDiscente.teamId)}
              faculty={faculty.find((f) => f.assignedTeamId === viewingQrDiscente.teamId)}
              size={220}
              showCard={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
