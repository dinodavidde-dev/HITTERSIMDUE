import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { AnyParticipant, ParticipantCategory, getParticipantPersonalPageUrl } from '../../utils/qrCodeUtils';
import { getPersonDisplayDetails, LabelSizeOption } from '../../utils/thermalLabelGenerator';

export interface PrintLabelContainerProps {
  person: AnyParticipant;
  category?: ParticipantCategory;
  teamName?: string;
  qrDataUrl?: string;
  rotated?: boolean;
  className?: string;
  id?: string;
  widthMm?: number;
  heightMm?: number;
  size?: LabelSizeOption;
}

/**
 * Componente per la stampa e anteprima di etichette termoadesive HITTER.
 * Supporta formati standard (40x30, 50x30, 50x25, 60x40, Custom mm):
 * - Layout ad adattamento automatico (orizzontale se W/H >= 1.25, verticale se < 1.25)
 * - Rotazione CSS di 90 gradi a destra (landscape su rotolo verticale)
 * - Margini ridotti rigorosamente a 1mm (padding: 1mm)
 * - QR code ad alta scansione e Nome grande + Matricola leggibili
 */
export const PrintLabelContainer: React.FC<PrintLabelContainerProps> = ({
  person,
  category = 'discenti',
  teamName,
  qrDataUrl,
  rotated = false,
  className = '',
  id,
  widthMm: propWidthMm,
  heightMm: propHeightMm,
  size = '40x30',
}) => {
  const [internalQr, setInternalQr] = useState<string>(qrDataUrl || '');

  // Resolve standard dimensions if not explicitly provided as props
  let widthMm = propWidthMm;
  let heightMm = propHeightMm;

  if (!widthMm || !heightMm) {
    switch (size) {
      case '50x30':
        widthMm = 50;
        heightMm = 30;
        break;
      case '50x25':
        widthMm = 50;
        heightMm = 25;
        break;
      case '60x40':
        widthMm = 60;
        heightMm = 40;
        break;
      case '50x80':
        widthMm = 50;
        heightMm = 80;
        break;
      case '40x30':
      default:
        widthMm = 40;
        heightMm = 30;
        break;
    }
  }

  const isHorizontal = widthMm / heightMm >= 1.25;
  const qrBoxDimension = Math.max(14, heightMm - 2);

  const display = getPersonDisplayDetails(person, category, teamName);
  const targetUrl = getParticipantPersonalPageUrl(person, category);

  useEffect(() => {
    if (qrDataUrl) {
      setInternalQr(qrDataUrl);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(targetUrl, {
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    })
      .then((url) => {
        if (isMounted) setInternalQr(url);
      })
      .catch((err) => {
        console.error('Error generating QR in PrintLabelContainer:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrDataUrl, targetUrl]);

  return (
    <div
      id={id}
      className={`print-label-container ${!rotated ? 'no-rotate' : ''} ${!isHorizontal ? 'flex-col' : ''} ${className}`}
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        padding: '1mm',
        boxSizing: 'border-box',
        transform: rotated ? 'rotate(90deg)' : 'none',
        transformOrigin: 'center center',
      }}
    >
      {isHorizontal ? (
        <>
          {/* QR Code a sinistra */}
          <div
            className="print-label-qr"
            style={{ width: `${qrBoxDimension}mm`, height: `${qrBoxDimension}mm` }}
          >
            {internalQr ? (
              <img src={internalQr} alt={`QR Code ${display.badgeCode}`} />
            ) : (
              <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center text-[8px] font-mono">
                QR...
              </div>
            )}
          </div>

          {/* Nome e Matricola leggibili a destra */}
          <div
            className="print-label-details"
            style={{ height: `${qrBoxDimension}mm` }}
          >
            {/* Matricola (Badge Code) in blocco nero ad alto contrasto */}
            <div className="print-label-badge">
              {display.badgeCode}
            </div>

            {/* Nome del Partecipante a grande leggibilità */}
            <div className="print-label-name" title={display.name}>
              {display.name}
            </div>

            {/* Ruolo / Squadra secondario sintetico */}
            {display.roleTitle && (
              <div className="print-label-sub">
                {display.roleTitle}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Layout Verticale: Matricola e Nome in alto, QR centrato in basso */}
          <div className="w-full flex items-center justify-between gap-1 overflow-hidden">
            <span className="print-label-badge text-[9pt] px-1.5 py-0.5">
              {display.badgeCode}
            </span>
            <span className="print-label-name text-[9pt] truncate text-right flex-1">
              {display.name}
            </span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center my-0.5 overflow-hidden">
            {internalQr ? (
              <img
                src={internalQr}
                alt={`QR Code ${display.badgeCode}`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-neutral-200 animate-pulse flex items-center justify-center text-[8px] font-mono">
                QR...
              </div>
            )}
          </div>

          {display.roleTitle && (
            <div className="print-label-sub text-center w-full truncate">
              {display.roleTitle}
            </div>
          )}
        </>
      )}
    </div>
  );
};
