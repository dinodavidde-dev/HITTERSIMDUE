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
  Plus,
  Edit2,
  Trash2,
  X,
  UserPlus,
} from 'lucide-react';
import { Discente, Faculty, Technician, Director, Guest, Team } from '../../types';
import { getTeamCodeName } from '../../utils/teamUtils';

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
    addDiscente,
    updateDiscente,
    deleteDiscente,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    addTechnician,
    updateTechnician,
    deleteTechnician,
    addDirector,
    updateDirector,
    deleteDirector,
    addGuest,
    updateGuest,
    deleteGuest,
  } = useCourse();

  const isEn = language === 'en';

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [qrCodesCache, setQrCodesCache] = useState<Record<string, string>>({});

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ category: 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite'; id: string } | null>(null);

  // Form Fields State
  const [formCategory, setFormCategory] = useState<'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite'>('discente');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formTeamId, setFormTeamId] = useState<number>(1);
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

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
        role: dir.role || 'Direttore Corso',
        organization: dir.organization || 'Direzione Trauma Center',
        badgeCode: dir.badgeCode || `DIR-0${dir.id}`,
        loginUrl: `${origin}${pathname}?direttore=${dir.id}&badge=${dir.badgeCode || dir.id}`,
      });
    });

    // 5. Guests / VIP
    guests.forEach((g) => {
      list.push({
        id: `ospite_${g.id}`,
        originalId: g.id,
        category: 'ospite',
        categoryLabel: isEn ? 'GUEST / VIP' : 'OSPITE / VIP',
        categoryColor: '#ec4899', // Pink
        name: g.name,
        role: g.title || 'Ospite / Osservatore',
        organization: g.organization || 'Autorità / Esterno',
        badgeCode: g.badgeCode || `VIP-0${g.id}`,
        loginUrl: `${origin}${pathname}?ospite=${g.id}&badge=${g.badgeCode || g.id}`,
      });
    });

    return list;
  }, [discenti, faculty, technicians, directors, guests, teams, origin, pathname, isEn]);

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
    } else if (p.category === 'ospite') {
      setSelectedGuestId(p.originalId);
      setUserRole('ospite');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormCategory('discente');
    setFormName('');
    setFormRole('Medico in Formazione');
    setFormOrg('Azienda Ospedaliera');
    setFormBadge(`DISC-${Date.now().toString().slice(-4)}`);
    setFormTeamId(1);
    setFormSpecialty('Chirurgia Generale');
    setFormPhone('+39 333 0000000');
    setFormEmail('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: LoginPersonItem) => {
    setEditingItem({ category: p.category, id: p.originalId });
    setFormCategory(p.category);
    setFormName(p.name);
    setFormRole(p.role);
    setFormOrg(p.organization);
    setFormBadge(p.badgeCode);
    
    if (p.category === 'discente') {
      const disc = discenti.find((d) => d.id === p.originalId);
      if (disc) {
        setFormTeamId(disc.teamId);
        setFormSpecialty(disc.specialty || '');
        setFormPhone(disc.phone || '');
        setFormEmail(disc.email || '');
      }
    } else if (p.category === 'faculty') {
      const fac = faculty.find((f) => f.id === p.originalId);
      if (fac) {
        setFormTeamId(fac.assignedTeamId);
        setFormSpecialty(fac.specialty || '');
        setFormPhone(fac.phone || '');
        setFormEmail(fac.email || '');
      }
    } else if (p.category === 'tecnico') {
      const tech = technicians.find((t) => t.id === p.originalId);
      if (tech) {
        setFormSpecialty(tech.specialty || '');
        setFormPhone(tech.phone || '');
        setFormEmail(tech.email || '');
      }
    } else if (p.category === 'direttore') {
      const dir = directors.find((d) => d.id === p.originalId);
      if (dir) {
        setFormPhone(dir.phone || '');
        setFormEmail(dir.email || '');
      }
    } else if (p.category === 'ospite') {
      const osp = guests.find((g) => g.id === p.originalId);
      if (osp) {
        setFormPhone(osp.phone || '');
        setFormEmail(osp.email || '');
      }
    }

    setIsModalOpen(true);
  };

  const handleSavePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      // Update existing
      if (editingItem.category === 'discente') {
        updateDiscente(editingItem.id, {
          name: formName,
          role: formRole,
          organization: formOrg,
          badgeCode: formBadge,
          teamId: Number(formTeamId),
          specialty: formSpecialty,
          phone: formPhone,
          email: formEmail,
        });
      } else if (editingItem.category === 'faculty') {
        updateFaculty(editingItem.id, {
          name: formName,
          title: formRole.split('•')[0]?.trim() || 'Dr.',
          specialty: formSpecialty || formRole,
          organization: formOrg,
          badgeCode: formBadge,
          assignedTeamId: Number(formTeamId),
          phone: formPhone,
          email: formEmail,
        });
      } else if (editingItem.category === 'tecnico') {
        updateTechnician(editingItem.id, {
          name: formName,
          specialty: formRole,
          organization: formOrg,
          badgeCode: formBadge,
          phone: formPhone,
          email: formEmail,
        });
      } else if (editingItem.category === 'direttore') {
        updateDirector(editingItem.id, {
          name: formName,
          title: 'Prof. / Dr.',
          role: formRole,
          organization: formOrg,
          badgeCode: formBadge,
          phone: formPhone,
          email: formEmail,
        });
      } else if (editingItem.category === 'ospite') {
        updateGuest(editingItem.id, {
          name: formName,
          title: formRole,
          organization: formOrg,
          badgeCode: formBadge,
          phone: formPhone,
          email: formEmail,
        });
      }
    } else {
      // Add new
      if (formCategory === 'discente') {
        addDiscente({
          name: formName,
          role: formRole || 'Medico in Formazione',
          teamId: Number(formTeamId),
          nationality: 'Italiana',
          specialty: formSpecialty || 'Chirurgia',
          organization: formOrg || 'Azienda Ospedaliera',
          badgeCode: formBadge || `DISC-${formTeamId}-${Date.now().toString().slice(-3)}`,
          phone: formPhone,
          email: formEmail,
        });
      } else if (formCategory === 'faculty') {
        addFaculty({
          name: formName,
          title: 'Dr.',
          specialty: formSpecialty || 'Chirurgia d\'Urgenza',
          nationality: 'Italiana',
          assignedTeamId: Number(formTeamId),
          organization: formOrg || 'Trauma Academy',
          badgeCode: formBadge || `FAC-${Date.now().toString().slice(-3)}`,
          phone: formPhone || '+39 333 1111111',
          email: formEmail,
        });
      } else if (formCategory === 'tecnico') {
        addTechnician({
          name: formName,
          assignedStations: ['Shock Room 1', 'SimLab'],
          specialty: formRole || 'Simulazione & Moulage',
          nationality: 'Italiana',
          organization: formOrg || 'Simulation Lab',
          badgeCode: formBadge || `TEC-${Date.now().toString().slice(-3)}`,
          phone: formPhone || '+39 333 2222222',
          email: formEmail,
        });
      } else if (formCategory === 'direttore') {
        addDirector({
          name: formName,
          title: 'Prof.',
          role: formRole || 'Direttore del Corso',
          nationality: 'Italiana',
          organization: formOrg || 'Direzione Trauma Center',
          badgeCode: formBadge || `DIR-${Date.now().toString().slice(-3)}`,
          phone: formPhone || '+39 333 3333333',
          email: formEmail,
        });
      } else if (formCategory === 'ospite') {
        addGuest({
          name: formName,
          title: formRole || 'Osservatore / VIP',
          organization: formOrg || 'Autorità Esterna',
          nationality: 'Italiana',
          assignedDays: [2, 3],
          badgeCode: formBadge || `VIP-${Date.now().toString().slice(-3)}`,
          phone: formPhone,
          email: formEmail,
        });
      }
    }

    setIsModalOpen(false);
  };

  const handleDeletePerson = (p: LoginPersonItem) => {
    if (window.confirm(isEn ? `Are you sure you want to delete ${p.name}?` : `Sei sicuro di voler eliminare ${p.name}?`)) {
      if (p.category === 'discente') deleteDiscente(p.originalId);
      else if (p.category === 'faculty') deleteFaculty(p.originalId);
      else if (p.category === 'tecnico') deleteTechnician(p.originalId);
      else if (p.category === 'direttore') deleteDirector(p.originalId);
      else if (p.category === 'ospite') deleteGuest(p.originalId);
    }
  };

  return (
    <div className="bg-neutral-950 border-2 border-yellow-500/60 p-5 sm:p-6 shadow-2xl space-y-6 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
            <QrCode className="w-3.5 h-3.5" />
            {isEn ? 'ROLE-BASED LOGIN QR CODE & PERSONNEL MANAGER' : 'GESTIONE ANAGRAFICA & QR CODE LOGIN'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {isEn ? 'Personnel QR Links & Anagrafica Editor' : 'Anagrafica Personale & QR di Accesso'}
          </h3>
          <p className="text-xs text-neutral-400">
            {isEn
              ? 'Manage personnel records across all 5 roles, generate direct QR login links, and instantly authorize sessions.'
              : 'Gestisci l\'anagrafica di tutte le figure, genera QR code di accesso rapido e testa i ruoli istantaneamente.'}
          </p>
        </div>

        {/* Add New Person Button */}
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isEn ? 'Add Personnel / Guest' : 'Aggiungi Persona / Ospite'}</span>
        </button>
      </div>

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
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
            onClick={() => setSelectedCategory('direttore')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'direttore'
                ? 'bg-purple-500 text-black border-purple-300'
                : 'bg-neutral-900 text-purple-400 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isEn ? 'Directors' : 'Direttori'} ({directors.length})
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
          <button
            onClick={() => setSelectedCategory('ospite')}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
              selectedCategory === 'ospite'
                ? 'bg-pink-500 text-black border-pink-300'
                : 'bg-neutral-900 text-pink-400 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isEn ? 'Guests / VIP' : 'Ospiti / VIP'} ({guests.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search name, role, badge code...' : 'Cerca nome, ruolo, badge...'}
            className="w-full bg-neutral-900 border border-neutral-700 pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-yellow-500 font-medium"
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
              {/* Top Category Badge & Actions */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span
                  className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black"
                  style={{ backgroundColor: p.categoryColor }}
                >
                  {p.categoryLabel}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-yellow-400 px-2 py-0.5 bg-neutral-950 border border-neutral-700">
                    {p.badgeCode}
                  </span>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    title={isEn ? 'Edit person' : 'Modifica anagrafica'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePerson(p)}
                    className="p-1 bg-neutral-800 hover:bg-red-900/50 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    title={isEn ? 'Delete person' : 'Elimina persona'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Name & Role */}
              <div className="space-y-1">
                <h4 className="font-black text-sm text-white uppercase tracking-tight line-clamp-1">
                  {p.name}
                </h4>
                <p className="text-xs font-bold text-neutral-300 line-clamp-1">
                  {p.role}
                </p>
                <p className="text-[11px] text-neutral-400 line-clamp-1">
                  {p.organization}
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border-2 border-yellow-500 w-full max-w-lg p-6 space-y-6 shadow-2xl relative text-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-yellow-400" />
                <span>
                  {editingItem
                    ? isEn ? 'Edit Personnel Record' : 'Modifica Anagrafica Personale'
                    : isEn ? 'Add New Personnel / Guest' : 'Aggiungi Nuovo Personale / Ospite'}
                </span>
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-4">
              {/* Category Selector (Only when adding) */}
              {!editingItem && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">
                    {isEn ? 'Role Category' : 'Categoria Ruolo'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                  >
                    <option value="direttore">{isEn ? 'Course Director (Direttore)' : 'Direttore Corso'}</option>
                    <option value="discente">{isEn ? 'Learner (Discente)' : 'Discente'}</option>
                    <option value="faculty">{isEn ? 'Instructor (Faculty)' : 'Istruttore / Faculty'}</option>
                    <option value="tecnico">{isEn ? 'Technician (Tecnico)' : 'Tecnico & Moulage'}</option>
                    <option value="ospite">{isEn ? 'Guest / VIP (Ospite)' : 'Ospite / VIP'}</option>
                  </select>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  {isEn ? 'Full Name' : 'Nome e Cognome'} *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="es. Dr. Mario Rossi"
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                />
              </div>

              {/* Role / Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  {isEn ? 'Role / Specialty / Title' : 'Ruolo / Specializzazione / Titolo'}
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  placeholder="es. Medico Urgences / Chirurgo"
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                />
              </div>

              {/* Organization */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  {isEn ? 'Organization / Hospital' : 'Ente / Ospedale / Istituzione'}
                </label>
                <input
                  type="text"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  placeholder="es. Policlinico Universitario"
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                />
              </div>

              {/* Badge Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-neutral-400">
                  {isEn ? 'Badge Code ID' : 'Codice Badge ID'}
                </label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="es. DISC-1-01 o VIP-01"
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                />
              </div>

              {/* Team ID (for discente / faculty) */}
              {(formCategory === 'discente' || formCategory === 'faculty') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">
                    {isEn ? 'Assigned Team (1-12)' : 'Squadra Assegnata (1-12)'}
                  </label>
                  <select
                    value={formTeamId}
                    onChange={(e) => setFormTeamId(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id}. {t.name} ({isEn ? 'Group' : 'Gruppo'} {t.groupId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">{isEn ? 'Phone' : 'Telefono'}</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+39 ..."
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-neutral-400">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-xs text-white font-medium focus:outline-hidden focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs uppercase cursor-pointer transition-all"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs uppercase cursor-pointer transition-all shadow-lg"
                >
                  {editingItem ? (isEn ? 'Save Changes' : 'Salva Modifiche') : (isEn ? 'Add Record' : 'Aggiungi')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
