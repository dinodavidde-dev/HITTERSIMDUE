import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Download,
  Printer,
  Edit2,
  Shield,
  Activity,
  Globe,
  Mail,
  Phone,
  Building2,
  RefreshCw,
  Sparkles,
  Users,
  Award,
  Wrench,
  UserCheck,
  Eye,
} from 'lucide-react';
import {
  AnyParticipant,
  ParticipantCategory,
  computeParticipantDataHash,
  generateParticipantQRCodeDataUrl,
  getParticipantPersonalPageUrl,
} from '../../utils/qrCodeUtils';
import { useCourse } from '../../context/CourseContext';
import { getTeamCodeName } from '../../utils/teamUtils';
import { getCountryFlag } from './MasterAnagraficaManager';

interface ParticipantQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: AnyParticipant | null;
  category: ParticipantCategory;
  onOpenEdit?: (person: AnyParticipant) => void;
}

export const ParticipantQRModal: React.FC<ParticipantQRModalProps> = ({
  isOpen,
  onClose,
  person,
  category,
  onOpenEdit,
}) => {
  const { language, teams, setCurrentTab, setSelectedDiscenteId, setSelectedFacultyId, setSelectedTechnicianId, setSelectedDirectorId, setSelectedRegiaId, setSelectedGuestId, setUserRole, userRole } = useCourse();
  const isEn = language === 'en';

  const [qrFormat, setQrFormat] = useState<'url' | 'vcard' | 'json'>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [payloadText, setPayloadText] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [justRegenerated, setJustRegenerated] = useState(false);

  // Find team if applicable
  const teamId = (person as any)?.teamId || (person as any)?.assignedTeamId;
  const matchedTeam = teamId ? teams.find((t) => t.id === teamId) : undefined;
  const teamName = matchedTeam ? getTeamCodeName(matchedTeam) : undefined;

  // Generate QR code whenever person, category, or format changes
  useEffect(() => {
    if (!isOpen || !person) return;

    let isMounted = true;
    setIsGenerating(true);

    generateParticipantQRCodeDataUrl(person, category, qrFormat, teamName, { size: 260 })
      .then((res) => {
        if (isMounted) {
          setQrDataUrl(res.dataUrl);
          setPayloadText(res.payload);
          setCurrentHash(res.hash);
          setIsGenerating(false);
          setJustRegenerated(true);
          const timer = setTimeout(() => setJustRegenerated(false), 2000);
          return () => clearTimeout(timer);
        }
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, person, category, qrFormat, teamName]);

  if (!isOpen || !person) return null;

  const badgeCode = (person as any).badgeCode || person.id;
  const directUrl = getParticipantPersonalPageUrl(person, category);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard error:', e);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-pass-${badgeCode.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}-${currentHash}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenPersonalPage = () => {
    // Navigate in-app or open in new tab
    if (category === 'discenti') {
      setSelectedDiscenteId(person.id);
      setCurrentTab('discente');
    } else if (category === 'faculty') {
      setSelectedFacultyId(person.id);
      setCurrentTab('faculty');
    } else if (category === 'tecnici') {
      setSelectedTechnicianId(person.id);
      setCurrentTab('tecnici');
    } else if (category === 'direttori') {
      setSelectedDirectorId(person.id);
      setUserRole('direttore');
      setCurrentTab('direttori');
    } else if (category === 'regia') {
      setSelectedRegiaId(person.id);
      setUserRole('regia');
      setCurrentTab('regia');
    } else if (category === 'ospiti') {
      setSelectedGuestId(person.id);
      setUserRole('ospite');
      setCurrentTab('public');
    }
    onClose();
  };

  const handlePrintBadge = () => {
    window.print();
  };

  // Color styling based on category
  const getCategoryStyles = () => {
    switch (category) {
      case 'discenti':
        return {
          border: 'border-cyan-500',
          bgHeader: 'bg-cyan-950/80',
          text: 'text-cyan-400',
          badgeBg: 'bg-cyan-500 text-black',
          label: isEn ? 'LEARNER // TRAUMA TEAM OPERATOR' : 'DISCENTE // TRAUMA TEAM OPERATOR',
          icon: Users,
        };
      case 'faculty':
        return {
          border: 'border-amber-500',
          bgHeader: 'bg-amber-950/80',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500 text-black',
          label: isEn ? 'FACULTY INSTRUCTOR // TRAUMA TUTOR' : 'FACULTY TUTOR // TRAUMA INSTRUCTOR',
          icon: Award,
        };
      case 'tecnici':
        return {
          border: 'border-pink-500',
          bgHeader: 'bg-pink-950/80',
          text: 'text-pink-400',
          badgeBg: 'bg-pink-500 text-black',
          label: isEn ? 'TECHNICAL TEAM // SIMULATION & MOULAGE' : 'TEAM TECNICO // SIMULATION & MOULAGE',
          icon: Wrench,
        };
      case 'direttori':
        return {
          border: 'border-yellow-500',
          bgHeader: 'bg-yellow-950/80',
          text: 'text-yellow-400',
          badgeBg: 'bg-yellow-500 text-black',
          label: isEn ? 'COURSE DIRECTION // MASTER DIRECTOR' : 'DIREZIONE DEL CORSO // MASTER DIRECTOR',
          icon: Shield,
        };
      case 'regia':
        return {
          border: 'border-purple-500',
          bgHeader: 'bg-purple-950/80',
          text: 'text-purple-400',
          badgeBg: 'bg-purple-500 text-black',
          label: isEn ? 'CONTROL ROOM // MISSION CONTROL' : 'CENTRALE REGIA // MISSION CONTROL',
          icon: Activity,
        };
      case 'ospiti':
      default:
        return {
          border: 'border-emerald-500',
          bgHeader: 'bg-emerald-950/80',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-500 text-black',
          label: isEn ? 'GUEST DELEGATION // VIP OBSERVER' : 'DELEGAZIONE OSPITE // VIP OBSERVER',
          icon: UserCheck,
        };
    }
  };

  const style = getCategoryStyles();
  const CategoryIcon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-neutral-950 border-2 ${style.border} w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative`}
      >
        {/* Top Header */}
        <div className={`p-4 ${style.bgHeader} border-b border-neutral-800 flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded ${style.badgeBg} font-black`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${style.badgeBg}`}>
                  {badgeCode}
                </span>
                <span className="text-xs font-mono font-bold text-neutral-300 tracking-wider uppercase">
                  {style.label}
                </span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mt-0.5">
                {person.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-700 transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Chiudi'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Dynamic Regeneration Notice Banner */}
        <div className="bg-neutral-900/90 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${justRegenerated ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-neutral-300 font-bold">
              {isEn ? 'LIVE ANAGRAFICA SYNC' : 'SINCRONIZZAZIONE ANAGRAFICA LIVE'}
            </span>
            <span className="text-neutral-500 hidden sm:inline">•</span>
            <span className="text-neutral-400 text-[11px] hidden sm:inline">
              {isEn ? 'Any profile edit regenerates this unique QR code automatically' : 'Qualsiasi modifica anagrafica rigenera automaticamente il QR'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-[10px]">HASH:</span>
            <span className="px-1.5 py-0.5 bg-black border border-neutral-800 text-orange-400 font-bold font-mono text-[10px] rounded">
              #{currentHash}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Left: High-Res QR Code Card */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-inner border-2 border-neutral-300 relative group">
              {justRegenerated && (
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded shadow animate-bounce flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {isEn ? 'UPDATED' : 'AGGIORNATO'}
                </div>
              )}

              {isGenerating ? (
                <div className="w-48 h-48 flex flex-col items-center justify-center text-neutral-600 font-mono text-xs gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-orange-500" />
                  <span>{isEn ? 'Regenerating QR...' : 'Rigenerazione QR...'}</span>
                </div>
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code Pass per ${person.name}`}
                  className="w-48 h-48 object-contain rounded"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-neutral-400">
                  {isEn ? 'QR Error' : 'Errore QR'}
                </div>
              )}

              <div className="w-full text-center mt-2 pt-2 border-t border-neutral-200">
                <span className="text-xs font-mono font-black text-black tracking-wider uppercase block">
                  {badgeCode}
                </span>
                <span className="text-[10px] font-mono text-neutral-600 truncate block">
                  {person.name}
                </span>
              </div>
            </div>

            {/* Right: Participant Credentials & Real-Time Data */}
            <div className="sm:col-span-7 space-y-3">
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5">
                  <span className="text-neutral-400 font-bold uppercase">{isEn ? 'ID / Badge:' : 'Matricola / Badge:'}</span>
                  <span className={`font-black ${style.text} text-sm`}>{badgeCode}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold">{isEn ? 'Operational Role:' : 'Ruolo Operativo:'}</span>
                  <span className="text-white font-bold text-right truncate max-w-[200px]">
                    {(person as any).role || (person as any).title || (isEn ? 'Operator' : 'Operatore')}
                  </span>
                </div>

                {teamName && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-bold">{isEn ? 'Assigned Team:' : 'Squadra Assegnata:'}</span>
                    <span className="px-2 py-0.5 bg-orange-950 border border-orange-700 text-orange-300 font-black rounded">
                      {teamName} ({isEn ? 'Team' : 'Sq.'} {teamId})
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold">{isEn ? 'Nationality:' : 'Nazionalità:'}</span>
                  <span className="text-white font-bold flex items-center gap-1">
                    <span>{getCountryFlag(person.nationality)}</span>
                    <span>{person.nationality || (isEn ? 'Italian' : 'Italiana')}</span>
                  </span>
                </div>

                {(person as any).organization && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-bold">{isEn ? 'Organization / Facility:' : 'Ente / Struttura:'}</span>
                    <span className="text-neutral-300 text-right truncate max-w-[200px]">
                      {(person as any).organization}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold">{isEn ? 'Contact Email:' : 'Email Contatto:'}</span>
                  <span className="text-neutral-300 truncate max-w-[200px]">
                    {person.email || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 font-bold">{isEn ? 'Emergency Phone:' : 'Telefono Emergenza:'}</span>
                  <span className="text-neutral-300">
                    {person.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Format Toggle Bar */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                  {isEn ? 'QR Data Format Encoding:' : 'Formato di Codifica QR:'}
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQrFormat('url')}
                    className={`px-2 py-1.5 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer ${
                      qrFormat === 'url'
                        ? 'bg-orange-500 text-black border-orange-400 font-black'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    🔗 {isEn ? 'Direct Link' : 'Link Diretto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrFormat('vcard')}
                    className={`px-2 py-1.5 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer ${
                      qrFormat === 'vcard'
                        ? 'bg-orange-500 text-black border-orange-400 font-black'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    🪪 MedPass vCard
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrFormat('json')}
                    className={`px-2 py-1.5 text-[10px] font-mono font-bold uppercase rounded border transition-colors cursor-pointer ${
                      qrFormat === 'json'
                        ? 'bg-orange-500 text-black border-orange-400 font-black'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    📋 {isEn ? 'Tactical JSON' : 'JSON Tattico'}
                  </button>
                </div>
              </div>

              {/* Raw Payload Preview */}
              <div className="bg-black/90 border border-neutral-800 p-2 rounded text-[10px] font-mono text-neutral-400 break-all max-h-16 overflow-y-auto">
                <span className="text-orange-400 font-bold block mb-0.5">{isEn ? 'Generated Payload:' : 'Payload Generato:'}</span>
                {payloadText}
              </div>
            </div>
          </div>

          {/* Direct URL Share Row */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400 font-bold flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                {isEn ? 'Direct Landing URL (QR Device Scan):' : 'URL di Atterraggio Diretto (Scansione Dispositivo QR):'}
              </span>
              <span className="text-neutral-500 text-[10px]">
                {isEn ? 'Instant Profile Loader' : 'Apre la pagina personale istantaneamente'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directUrl}
                className="flex-1 bg-neutral-950 border border-neutral-700 text-white font-mono text-xs px-3 py-1.5 rounded focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase rounded border border-neutral-600 flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? (isEn ? 'Copied!' : 'Copiato!') : (isEn ? 'Copy' : 'Copia')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {onOpenEdit && (
              <button
                type="button"
                onClick={() => {
                  onOpenEdit(person);
                  onClose();
                }}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white font-mono text-xs font-bold uppercase rounded border border-neutral-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isEn ? 'Edit profile and verify immediate QR regeneration' : 'Modifica anagrafica e verifica la rigenerazione immediata del QR'}
              >
                <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                <span>{isEn ? 'Edit Profile & Regenerate' : 'Modifica Anagrafica'}</span>
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleOpenPersonalPage}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-black uppercase rounded shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isEn ? 'View Personal Page' : 'Apri Pagina Personalizzata'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPNG}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase rounded border border-neutral-600 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? 'Download PNG' : 'Scarica PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintBadge}
              className="px-3.5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-black uppercase rounded shadow flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print Pass Badge' : 'Stampa Badge'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
