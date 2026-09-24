import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useCourse } from '../../context/CourseContext';
import {
  Printer,
  Search,
  Users,
  Award,
  Wrench,
  Shield,
  Radio,
  UserCheck,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  computeParticipantDataHash,
  getParticipantPersonalPageUrl,
  ParticipantCategory,
  AnyParticipant,
} from '../../utils/qrCodeUtils';
import { ParticipantQRModal } from './ParticipantQRModal';

interface RegistryItem {
  id: string;
  name: string;
  badgeCode: string;
  category: ParticipantCategory;
  roleTitle: string;
  email?: string;
  phone?: string;
  teamId?: number;
  raw: AnyParticipant;
}

export const PersonnelBadgeRegistry: React.FC = () => {
  const {
    language,
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    teams,
    setCurrentTab,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setUserRole,
  } = useCourse();

  const isEn = language === 'en';

  const [filterType, setFilterType] = useState<'all' | 'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrMap, setQrMap] = useState<Record<string, { dataUrl: string; hash: string; url: string }>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPersonForModal, setSelectedPersonForModal] = useState<{
    person: AnyParticipant;
    category: ParticipantCategory;
  } | null>(null);

  // Compile all personnel records reactively
  const allPersonnel: RegistryItem[] = [
    ...discenti.map((d) => ({
      id: d.id,
      name: d.name,
      badgeCode: d.badgeCode || d.id,
      category: 'discenti' as const,
      roleTitle: d.role || (isEn ? 'Trauma Team Operator' : 'Operatore Trauma Team'),
      email: d.email,
      phone: d.phone,
      teamId: d.teamId,
      raw: d,
    })),
    ...faculty.map((f) => ({
      id: f.id,
      name: f.name,
      badgeCode: f.badgeCode || f.id,
      category: 'faculty' as const,
      roleTitle: f.title || f.specialty || (isEn ? 'Faculty Instructor' : 'Faculty Tutor'),
      email: f.email,
      phone: f.phone,
      teamId: f.assignedTeamId,
      raw: f,
    })),
    ...technicians.map((t) => ({
      id: t.id,
      name: t.name,
      badgeCode: t.badgeCode || t.id,
      category: 'tecnici' as const,
      roleTitle: t.specialty || (isEn ? 'Simulation Technician' : 'Tecnico Simulazione'),
      email: t.phone,
      phone: t.phone,
      raw: t,
    })),
    ...directors.map((dir) => ({
      id: dir.id,
      name: dir.name,
      badgeCode: dir.badgeCode || dir.id,
      category: 'direttori' as const,
      roleTitle: dir.title || (isEn ? 'Course Director' : 'Direttore Corso'),
      phone: dir.phone,
      raw: dir,
    })),
    ...regiaStaff.map((r) => ({
      id: r.id,
      name: r.name,
      badgeCode: r.badgeCode || r.id,
      category: 'regia' as const,
      roleTitle: `${r.title} (${r.role})`,
      phone: r.phone,
      raw: r,
    })),
    ...guests.map((g) => ({
      id: g.id,
      name: g.name,
      badgeCode: g.badgeCode || g.id,
      category: 'ospiti' as const,
      roleTitle: g.title || (isEn ? 'Guest / VIP Observer' : 'Ospite / VIP Observer'),
      email: g.email,
      phone: g.phone,
      raw: g,
    })),
  ];

  const filtered = allPersonnel.filter((p) => {
    if (filterType !== 'all' && p.category !== filterType) return false;
    if (
      searchTerm &&
      !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.badgeCode.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Re-generate QR codes dynamically when anagrafica arrays change or filter changes
  useEffect(() => {
    let isMounted = true;

    const generateAllQrs = async () => {
      const results: Record<string, { dataUrl: string; hash: string; url: string }> = {};

      for (const p of filtered) {
        const hash = computeParticipantDataHash(p.raw, p.category);
        const url = getParticipantPersonalPageUrl(p.raw, p.category);

        try {
          const dataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: 'M',
            color: { dark: '#000000', light: '#ffffff' },
          });
          results[p.id] = { dataUrl, hash, url };
        } catch (e) {
          console.error('Error generating QR for', p.name, e);
        }
      }

      if (isMounted) {
        setQrMap(results);
      }
    };

    generateAllQrs();

    return () => {
      isMounted = false;
    };
  }, [
    filtered.length,
    searchTerm,
    filterType,
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
  ]);

  const handleCopyLink = async (p: RegistryItem) => {
    const directUrl = getParticipantPersonalPageUrl(p.raw, p.category);
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Clipboard error', err);
    }
  };

  const handleNavigateToPage = (p: RegistryItem) => {
    if (p.category === 'discenti') {
      setSelectedDiscenteId(p.id);
      setCurrentTab('discente');
    } else if (p.category === 'faculty') {
      setSelectedFacultyId(p.id);
      setCurrentTab('faculty');
    } else if (p.category === 'tecnici') {
      setSelectedTechnicianId(p.id);
      setCurrentTab('tecnici');
    } else if (p.category === 'direttori') {
      setSelectedDirectorId(p.id);
      setUserRole('direttore');
      setCurrentTab('direttori');
    } else if (p.category === 'regia') {
      setSelectedRegiaId(p.id);
      setUserRole('regia');
      setCurrentTab('regia');
    } else if (p.category === 'ospiti') {
      setSelectedGuestId(p.id);
      setUserRole('ospite');
      setCurrentTab('public');
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-neutral-900 border-2 border-orange-500 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-orange-500 text-black text-xs font-mono font-black uppercase">
              {isEn ? 'LIVE BADGE & QR REGISTRY' : 'REGISTRO GENERALE BADGE & QR'}
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {isEn ? 'Auto-Regenerated from Anagrafica' : 'Rigenerazione Dinamica Attiva'}
            </span>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
            {isEn ? 'Tactical QR Passes & Personalized Participant Links' : 'QR Pass Personali & Collegamenti Diretti Partecipanti'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-2xl mt-0.5">
            {isEn
              ? 'Each badge contains a unique URL and cryptographic hash. Scanning the QR opens that participant\'s individual dashboard instantly.'
              : 'Ogni QR Pass contiene l\'URL diretto e l\'impronta dei dati dell\'anagrafica. La scansione apre all\'istante la scheda operativa e il cronoprogramma del partecipante.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>{isEn ? 'PRINT ALL BADGES' : 'STAMPA TUTTI I BADGE'}</span>
          </button>
        </div>
      </div>

      {/* Filters and Category Tabs */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {(
            [
              { key: 'all', label: isEn ? `ALL (${allPersonnel.length})` : `TUTTI (${allPersonnel.length})`, icon: Users },
              { key: 'discenti', label: isEn ? `LEARNERS (${discenti.length})` : `DISCENTI (${discenti.length})`, icon: Users },
              { key: 'faculty', label: `FACULTY (${faculty.length})`, icon: Award },
              { key: 'tecnici', label: isEn ? `TECH (${technicians.length})` : `TECNICI (${technicians.length})`, icon: Wrench },
              { key: 'direttori', label: isEn ? `DIRECT. (${directors.length})` : `DIREZ. (${directors.length})`, icon: Shield },
              { key: 'regia', label: isEn ? `CONTROL (${regiaStaff.length})` : `REGIA (${regiaStaff.length})`, icon: Radio },
              { key: 'ospiti', label: isEn ? `GUESTS (${guests.length})` : `OSPITI (${guests.length})`, icon: UserCheck },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterType === tab.key
                    ? 'bg-orange-500 text-black font-black'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isEn ? 'Search name or badge...' : 'Cerca matricola o nome...'}
            className="w-full bg-neutral-950 border border-neutral-700 text-white text-xs font-mono pl-9 pr-3 py-2 outline-none focus:border-orange-500 font-bold"
          />
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p) => {
          const qrInfo = qrMap[p.id];
          const isCopied = copiedId === p.id;

          const getCardColor = () => {
            switch (p.category) {
              case 'discenti':
                return 'border-cyan-800 hover:border-cyan-500';
              case 'faculty':
                return 'border-amber-800 hover:border-amber-500';
              case 'tecnici':
                return 'border-pink-800 hover:border-pink-500';
              case 'direttori':
                return 'border-yellow-800 hover:border-yellow-500';
              case 'regia':
                return 'border-purple-800 hover:border-purple-500';
              default:
                return 'border-emerald-800 hover:border-emerald-500';
            }
          };

          return (
            <div
              key={p.id}
              className={`bg-neutral-900 border-2 ${getCardColor()} p-3.5 space-y-2.5 flex flex-col justify-between shadow-lg transition-all`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800 pb-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-orange-400 font-black uppercase tracking-wider block">
                    {p.category.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-black text-white truncate">{p.name}</h4>
                  <p className="text-[11px] text-neutral-400 truncate">{p.roleTitle}</p>
                </div>
                <span className="px-2 py-0.5 bg-neutral-950 border border-neutral-700 text-xs font-mono font-bold text-neutral-200 flex-shrink-0">
                  {p.badgeCode}
                </span>
              </div>

              {/* QR Image Box */}
              <div
                onClick={() => setSelectedPersonForModal({ person: p.raw, category: p.category })}
                className="flex flex-col items-center justify-center p-2.5 bg-white rounded border border-neutral-300 cursor-pointer group relative shadow-inner"
                title={isEn ? 'Click to view full QR Pass and options' : 'Clicca per ingrandire il QR Pass e le opzioni avanzate'}
              >
                {qrInfo?.dataUrl ? (
                  <img
                    src={qrInfo.dataUrl}
                    alt={`QR Code Pass per ${p.name}`}
                    className="w-28 h-28 object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-28 h-28 flex flex-col items-center justify-center text-[10px] text-neutral-600 font-mono gap-1">
                    <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                    <span>{isEn ? 'Generating...' : 'Generazione...'}</span>
                  </div>
                )}

                <div className="w-full text-center mt-1 flex items-center justify-between px-1 text-[9px] font-mono text-neutral-600 border-t border-neutral-200 pt-1">
                  <span className="font-bold text-black">{p.badgeCode}</span>
                  <span className="text-neutral-500">#{qrInfo?.hash || 'SYNC'}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleNavigateToPage(p)}
                  className="w-full py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 hover:border-cyan-500 text-[11px] font-black font-mono uppercase flex items-center justify-center gap-1.5 rounded transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span>{isEn ? 'Open Personal View' : 'Apri Pagina Personale'}</span>
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPersonForModal({ person: p.raw, category: p.category })}
                    className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 rounded transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3 h-3 text-orange-400" />
                    <span>{isEn ? 'Pass Details' : 'Dettagli Pass'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(p)}
                    className="py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1 rounded transition-colors cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopied ? (isEn ? 'Copied!' : 'Copiato!') : (isEn ? 'Copy Link' : 'Copia Link')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for In-Depth Badge View */}
      {selectedPersonForModal && (
        <ParticipantQRModal
          isOpen={!!selectedPersonForModal}
          onClose={() => setSelectedPersonForModal(null)}
          person={selectedPersonForModal.person}
          category={selectedPersonForModal.category}
        />
      )}
    </div>
  );
};
