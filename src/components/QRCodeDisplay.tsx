import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Discente, Team, Faculty, Technician, Director, Guest } from '../types';
import { Award, Building2, Mail, Phone, Shield, User, Globe, Download, Printer } from 'lucide-react';

interface QRCodeDisplayProps {
  value?: string;
  discente?: Discente;
  team?: Team;
  faculty?: Faculty;
  technician?: Technician;
  director?: Director;
  guest?: Guest;
  size?: number;
  showCard?: boolean;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  discente,
  team,
  faculty,
  technician,
  director,
  guest,
  size = 160,
  showCard = false,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Determine target link or value
  const targetValue = value || (() => {
    if (discente) return `https://trauma-sim.med/discente?id=${discente.id}&badge=${discente.badgeCode || 'DISC'}`;
    if (faculty) return `https://trauma-sim.med/faculty?id=${faculty.id}&badge=${faculty.badgeCode || 'FAC'}`;
    if (technician) return `https://trauma-sim.med/technician?id=${technician.id}&badge=${technician.badgeCode || 'TEC'}`;
    if (director) return `https://trauma-sim.med/director?id=${director.id}&badge=${director.badgeCode || 'DIR'}`;
    if (guest) return `https://trauma-sim.med/guest?id=${guest.id}&badge=${guest.badgeCode || 'OSP'}`;
    return 'https://trauma-sim.med';
  })();

  const title = discente?.name || faculty?.name || technician?.name || director?.name || guest?.name || 'Tactical Trauma Pass';
  const subtitle = discente 
    ? `${discente.group} • ${team?.name || 'Squadra'} • ${discente.role}`
    : faculty 
    ? `Faculty Tutor • ${faculty.specialty || 'TCCC & Trauma'}`
    : technician
    ? `Technical Staff • ${technician.role}`
    : director
    ? `Course Director`
    : guest
    ? `Official Guest • ${guest.organization}`
    : 'Authorized Personnel';

  const badgeCode = discente?.badgeCode || faculty?.badgeCode || technician?.badgeCode || director?.badgeCode || guest?.badgeCode || 'PASS-01';

  useEffect(() => {
    QRCode.toDataURL(targetValue, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [targetValue, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `badge-${badgeCode.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!showCard) {
    return (
      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg shadow border border-neutral-200">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="QR Code" style={{ width: size, height: size }} className="object-contain" />
        ) : (
          <div style={{ width: size, height: size }} className="flex items-center justify-center text-xs text-neutral-400 font-mono">
            Generating QR...
          </div>
        )}
        <span className="text-[10px] font-mono text-neutral-600 mt-1 font-bold">{badgeCode}</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-orange-500 rounded-xl p-5 shadow-2xl text-white max-w-sm mx-auto space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-mono font-black uppercase tracking-wider text-orange-400">
            TACTICAL PASS BADGE
          </span>
        </div>
        <span className="px-2 py-0.5 bg-orange-500 text-black font-mono text-[10px] font-black">
          {badgeCode}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center space-y-2 py-2">
        <div className="bg-white p-3 rounded-lg shadow-inner">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt={title} style={{ width: size, height: size }} className="object-contain" />
          ) : (
            <div style={{ width: size, height: size }} className="flex items-center justify-center text-xs text-neutral-400 font-mono">
              Loading...
            </div>
          )}
        </div>
        <div className="text-center">
          <h4 className="text-base font-black text-white tracking-tight">{title}</h4>
          <p className="text-xs text-orange-400 font-mono font-bold mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
        <button
          onClick={handleDownload}
          className="py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold uppercase rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-orange-400" />
          <span>Save PNG</span>
        </button>
        <button
          onClick={() => window.print()}
          className="py-2 bg-orange-500 hover:bg-orange-400 text-black font-mono text-xs font-black uppercase rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Pass</span>
        </button>
      </div>
    </div>
  );
};
