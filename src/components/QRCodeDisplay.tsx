import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Discente, Team, Faculty } from '../types';
import { useCourse } from '../context/CourseContext';
import { translateRoleOrSpecialty } from '../i18n/medicalTerms';

interface QRCodeDisplayProps {
  discente?: Discente;
  faculty?: Faculty;
  tecnico?: any;
  technician?: any;
  direttore?: any;
  director?: any;
  ospite?: any;
  guest?: any;
  role?: 'discente' | 'faculty' | 'tecnico' | 'direttore' | 'ospite';
  personId?: string;
  value?: string;
  title?: string;
  subtitle?: string;
  badgeCode?: string;
  nationality?: string;
  team?: Team;
  size?: number;
  showCard?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  discente,
  faculty,
  tecnico,
  technician,
  direttore,
  director,
  ospite,
  guest,
  role,
  personId,
  value,
  title,
  subtitle,
  badgeCode,
  nationality,
  team,
  size = 200,
  showCard = false,
}) => {
  const { language } = useCourse();
  const isEn = language === 'en';

  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://trauma-sim.app';

  const resolvedTecnico = tecnico || technician;
  const resolvedDirettore = direttore || director;
  const resolvedOspite = ospite || guest;

  // Compute unique effective access URL safely for every personalized view / QR code
  const accessUrl = value
    ? value
    : discente
    ? `${origin}?discente=${discente.id}&badge=${discente.badgeCode || discente.id}`
    : faculty
    ? `${origin}?faculty=${faculty.id}&badge=${faculty.badgeCode || faculty.id}`
    : resolvedTecnico
    ? `${origin}?tecnico=${resolvedTecnico.id}&badge=${resolvedTecnico.badgeCode || resolvedTecnico.id}`
    : resolvedDirettore
    ? `${origin}?direttore=${resolvedDirettore.id}&badge=${resolvedDirettore.badgeCode || resolvedDirettore.id}`
    : resolvedOspite
    ? `${origin}?ospite=${resolvedOspite.id}&badge=${resolvedOspite.badgeCode || resolvedOspite.id}`
    : role && personId
    ? `${origin}?role=${role}&id=${personId}`
    : typeof window !== 'undefined'
    ? window.location.href
    : 'https://trauma-sim.app';

  const displayName = discente?.name || title || (isEn ? 'PARTICIPANT PASS' : 'PASS PARTECIPANTE');
  const displayBadgeCode = discente?.badgeCode || badgeCode || (discente ? `DISC-${discente.id}` : 'QR-PASS');
  const rawRole = discente?.role || subtitle || (isEn ? 'Participant' : 'Partecipante');
  const displayRole = translateRoleOrSpecialty(rawRole, language);
  const displayNationality = discente?.nationality || nationality || 'IT';

  useEffect(() => {
    QRCode.toDataURL(
      accessUrl,
      {
        width: size * 2,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [accessUrl, size]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(accessUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    const safeFilename = `QR_PASS_${displayBadgeCode}_${displayName.replace(/\s+/g, '_')}.png`;
    a.download = safeFilename;
    a.click();
  };

  if (!showCard) {
    return (
      <div className="flex flex-col items-center gap-2">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code ${displayName}`}
            className="border-2 border-white bg-white p-1 rounded-sm shadow-md"
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className="flex items-center justify-center bg-neutral-900 border border-neutral-700 animate-pulse"
            style={{ width: size, height: size }}
          >
            <QrCode className="w-8 h-8 text-neutral-600" />
          </div>
        )}
        <span className="font-mono text-xs font-black text-orange-400">
          {displayBadgeCode}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 border-4 border-neutral-100 p-5 shadow-2xl text-neutral-100 max-w-sm w-full mx-auto relative overflow-hidden">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-neutral-800">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: team?.color || '#f97316' }}
          />
          <span className="text-[10px] font-black uppercase tracking-widest bg-orange-500 text-black px-2 py-0.5">
            TRAUMA PASS 2026
          </span>
        </div>
        <span className="font-mono text-xs font-black text-white px-2 py-0.5 bg-neutral-900 border border-neutral-700">
          {displayBadgeCode}
        </span>
      </div>

      {/* Participant info */}
      <div className="py-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-black text-base uppercase text-white tracking-tight truncate">
            {displayName}
          </h4>
          <span className="text-xs text-neutral-400 flex-shrink-0">🌍 {displayNationality}</span>
        </div>
        <p className="text-xs font-bold text-orange-400">{displayRole}</p>
        {team ? (
          <p className="text-[11px] text-neutral-400 font-mono">
            {team.name} ({isEn ? 'GROUP' : 'GRUPPO'} {team.groupId})
          </p>
        ) : discente?.teamId ? (
          <p className="text-[11px] text-neutral-400 font-mono">
            {isEn ? 'Team #' : 'Squadra #'}{discente.teamId}
          </p>
        ) : null}
        {faculty && (
          <p className="text-[10px] text-emerald-400 font-medium">
            {isEn ? 'Assigned Tutor: ' : 'Tutor Assegnato: '}{faculty.name}
          </p>
        )}
      </div>

      {/* QR Code Image */}
      <div className="my-2 p-3 bg-white flex flex-col items-center justify-center border-2 border-neutral-300">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Access for ${displayName}`}
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
            {isEn ? 'Generating QR...' : 'Generazione QR...'}
          </div>
        )}
        <span className="text-[9px] font-mono font-bold text-neutral-700 mt-1 uppercase tracking-wider">
          {isEn ? 'SCAN WITH SMARTPHONE FOR DIRECT ACCESS' : 'SCANSIONA DA SMARTPHONE PER ACCESSO DIRETTO'}
        </span>
      </div>

      {/* Direct Link Actions */}
      <div className="pt-3 border-t-2 border-neutral-800 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-orange-400" />}
            <span>{copied ? (isEn ? 'LINK COPIED!' : 'LINK COPIATO!') : (isEn ? 'COPY LINK' : 'COPIA LINK')}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
            title={isEn ? 'Download QR image for print' : 'Scarica immagine QR per la stampa'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isEn ? 'DOWNLOAD' : 'SCARICA'}</span>
          </button>
        </div>

        <p className="text-[10px] text-neutral-500 text-center font-mono truncate">
          {accessUrl}
        </p>
      </div>
    </div>
  );
};

