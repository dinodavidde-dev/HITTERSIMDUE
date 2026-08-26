import React, { useState } from 'react';
import { Mail, ShieldCheck, X, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { useCourse } from '../context/CourseContext';

interface EmailAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  targetPersonName?: string;
}

export const EmailAccessModal: React.FC<EmailAccessModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  targetPersonName = '',
}) => {
  const {
    language,
    discenti,
    faculty,
    technicians,
    directors,
    guests,
    setUserRole,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedGuestId,
  } = useCourse();
  const isEn = language === 'en';

  const [emailInput, setEmailInput] = useState(initialEmail);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleVerifyOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg(isEn ? 'Please enter a valid email address.' : 'Inserisci un indirizzo email valido.');
      return;
    }

    // Search across all personnel lists
    const foundDiscente = discenti.find((d) => d.email && d.email.toLowerCase() === cleanEmail);
    const foundFaculty = faculty.find((f) => f.email && f.email.toLowerCase() === cleanEmail);
    const foundTech = technicians.find((t) => t.email && t.email.toLowerCase() === cleanEmail);
    const foundDir = directors.find((dir) => dir.email && dir.email.toLowerCase() === cleanEmail);
    const foundGuest = guests.find((g) => g.email && g.email.toLowerCase() === cleanEmail);

    if (foundDiscente) {
      setSelectedDiscenteId(foundDiscente.id);
      setUserRole('discente');
      localStorage.setItem('trauma_verified_email', cleanEmail);
      setSuccessMsg(isEn ? `Welcome, ${foundDiscente.name} (Participant)` : `Benvenuto/a, ${foundDiscente.name} (Discente)`);
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    if (foundFaculty) {
      setSelectedFacultyId(foundFaculty.id);
      setUserRole('faculty');
      localStorage.setItem('trauma_verified_email', cleanEmail);
      setSuccessMsg(isEn ? `Welcome, ${foundFaculty.name} (Faculty Tutor)` : `Benvenuto/a, ${foundFaculty.name} (Tutor Faculty)`);
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    if (foundTech) {
      setSelectedTechnicianId(foundTech.id);
      setUserRole('tecnico');
      localStorage.setItem('trauma_verified_email', cleanEmail);
      setSuccessMsg(isEn ? `Welcome, ${foundTech.name} (Technician)` : `Benvenuto/a, ${foundTech.name} (Tecnico)`);
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    if (foundDir) {
      setSelectedDirectorId(foundDir.id);
      setUserRole('direttore');
      localStorage.setItem('trauma_verified_email', cleanEmail);
      setSuccessMsg(isEn ? `Welcome, ${foundDir.name} (Director)` : `Benvenuto/a, ${foundDir.name} (Direzione)`);
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    if (foundGuest) {
      setSelectedGuestId(foundGuest.id);
      setUserRole('ospite');
      localStorage.setItem('trauma_verified_email', cleanEmail);
      setSuccessMsg(isEn ? `Welcome, ${foundGuest.name} (Guest/VIP)` : `Benvenuto/a, ${foundGuest.name} (Ospite VIP)`);
      setTimeout(() => {
        onClose();
      }, 1200);
      return;
    }

    setErrorMsg(
      isEn
        ? 'Email not found in course registry. Please contact Course Direction or check the address.'
        : "Email non trovata nell'anagrafica del corso. Contatta la Regia o verifica l'indirizzo inserito."
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border-2 border-orange-500/60 max-w-md w-full p-6 shadow-2xl relative text-neutral-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500/20 border border-orange-500 flex items-center justify-center text-orange-400 font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight text-white">
              {isEn ? 'First Access Email Verification' : 'Verifica Email di Primo Accesso'}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              {targetPersonName
                ? `${isEn ? 'Verifying badge for' : 'Verifica badge per'} ${targetPersonName}`
                : isEn
                ? 'Enter your registered email to access your personal view'
                : 'Inserisci la tua email registrata per accedere alla visuale'}
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="uppercase">{successMsg}</p>
              <p className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                {isEn ? 'Redirecting to your dashboard...' : 'Reindirizzamento alla dashboard in corso...'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleVerifyOrLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-neutral-300 mb-1.5">
                {isEn ? 'Your Registered Email Address' : 'Indirizzo Email Registrato'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nome.cognome@traumasim.it"
                  className="w-full pl-10 pr-3 py-2.5 bg-neutral-950 border-2 border-neutral-700 text-sm font-mono text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                {isEn
                  ? 'Required only on your first access or when scanning your personal QR code pass.'
                  : 'Richiesto solo al primo accesso o alla prima scansione del QR code personale.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-black uppercase text-neutral-400 hover:text-white cursor-pointer"
              >
                {isEn ? 'Cancel' : 'Annulla'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-black uppercase tracking-wider bg-orange-500 hover:bg-neutral-100 text-black border-2 border-orange-500 hover:border-neutral-100 cursor-pointer flex items-center gap-2"
              >
                <span>{isEn ? 'Verify & Access' : 'Verifica & Accedi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
