import React, { useState, useMemo } from 'react';
import { useCourse } from '../../context/CourseContext';
import {
  Discente,
  Faculty,
  Technician,
  Director,
  RegiaStaff,
  Guest,
} from '../../types';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Copy,
  Layers,
  ArrowRight,
  Database,
  Info,
} from 'lucide-react';

export type ImportCategory = 'discenti' | 'faculty' | 'tecnici' | 'direttori' | 'regia' | 'ospiti';

interface AnagraficaImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ImportCategory;
}

interface ParsedRecord {
  id?: string;
  badgeCode: string;
  name: string;
  roleOrTitle: string;
  teamOrStation: string;
  nationality: string;
  organization: string;
  phone: string;
  email: string;
  notes: string;
  isValid: boolean;
  warning?: string;
}

export const AnagraficaImportModal: React.FC<AnagraficaImportModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'discenti',
}) => {
  const {
    language,
    discenti,
    bulkUpdateDiscenti,
    faculty,
    bulkUpdateFaculty,
    technicians,
    bulkUpdateTechnicians,
    directors,
    bulkUpdateDirectors,
    regiaStaff,
    bulkUpdateRegiaStaff,
    guests,
    bulkUpdateGuests,
  } = useCourse();

  const isEn = language === 'en';

  const [category, setCategory] = useState<ImportCategory>(defaultCategory);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean / reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, defaultCategory]);

  // Template generators for copy/paste
  const getSampleTemplate = (cat: ImportCategory): string => {
    switch (cat) {
      case 'discenti':
        return [
          'BADGE\tNOME\tRUOLO\tSQUADRA\tNAZIONALITA\tENTE_OSPEDALE\tTELEFONO\tEMAIL\tNOTE',
          'DISC-01\tDott. Mario Rossi\tTeam Leader\t1\tItaliana\tOsp. Maggiore Bologna\t+39 333 1112233\tmario.rossi@sim.it\tEsperienza 118',
          'DISC-02\tDott.ssa Laura Bianchi\tOperatore\t1\tItaliana\tAOU Careggi Firenze\t+39 333 2223344\tlaura.b@sim.it\tSpecializzanda MEU',
          'DISC-03\tDott. Luca Verdi\tOperatore\t1\tSvizzera\tOspedale Civico Lugano\t+41 79 1234567\tluca.verdi@ticino.ch\tAnestesia e Rianimazione',
        ].join('\n');
      case 'faculty':
        return [
          'BADGE\tNOME\tTITOLO_SPECIALITA\tSQUADRA\tNAZIONALITA\tENTE_OSPEDALE\tTELEFONO\tEMAIL\tNOTE',
          'FAC-01\tDott. Andrea Conti\tAnestesista Rianimatore - TCCC Trainer\t1\tItaliana\tSan Camillo Roma\t+39 335 1234567\ta.conti@faculty.org\tSenior Instructor',
          'FAC-02\tDott.ssa Elena Moretti\tChirurgo d\'Urgenza - Damage Control\t2\tItaliana\tNiguarda Milano\t+39 335 2345678\te.moretti@faculty.org\tTrauma Team Leader',
        ].join('\n');
      case 'tecnici':
        return [
          'BADGE\tNOME\tSPECIALITA_POSTAZIONE\tPOSTAZIONE_ASSEGNATA\tNAZIONALITA\tTELEFONO\tEMAIL\tNOTE',
          'TECH-01\tMarco Silvestri\tSimMan 3G & TCCC Hardware\tAmbiente Tattico 1\tItaliana\t+39 340 1122334\tm.silvestri@tech.sim\tRegia Tattica',
          'TECH-02\tPaolo Galli\tShock Room & Telemetria\tBox Shock Room 1\tItaliana\t+39 340 2233445\tp.galli@tech.sim\tMonitor Defibrillatore',
        ].join('\n');
      case 'direttori':
        return [
          'BADGE\tNOME\tTITOLO\tNAZIONALITA\tENTE_OSPEDALE\tTELEFONO\tEMAIL\tNOTE',
          'DIR-01\tDott. Giorgio Valli\tDirettore del Corso - Head of Trauma\tItaliana\tCentro Regionale Trauma\t+39 338 9988776\tdir.valli@trauma.it\tDirezione Generale',
        ].join('\n');
      case 'regia':
        return [
          'BADGE\tNOME\tRUOLO\tNAZIONALITA\tENTE\tTELEFONO\tEMAIL\tNOTE',
          'REGIA-01\tIng. Roberto Fabbri\tCoordinatore Regia Centrale Audio/Video\tItaliana\tService Simulazione\t+39 347 1122339\tregia01@trauma.it\tMaster Console',
        ].join('\n');
      case 'ospiti':
        return [
          'BADGE\tNOME\tTITOLO\tNAZIONALITA\tENTE_ORGANIZZAZIONE\tGIORNI\tTELEFONO\tEMAIL\tNOTE',
          'OSP-01\tGen. Med. Dario Neri\tIspettore Generale Sanità Militare\tItaliana\tMinistero Difesa\tDay 2, Day 3\t+39 331 4455667\td.neri@difesa.it\tDelegazione Ufficiale',
        ].join('\n');
    }
  };

  const handleLoadSample = () => {
    setRawText(getSampleTemplate(category));
    setSuccessMessage(isEn ? 'Sample template loaded. Edit values or click Import.' : 'Template di esempio caricato. Modifica i valori o clicca Importa.');
  };

  // Parser: handles TSV (from Excel copy-paste), CSV (comma or semicolon), or JSON
  const parsedRecords: ParsedRecord[] = useMemo(() => {
    const text = rawText.trim();
    if (!text) return [];

    // Attempt JSON parse
    if (text.startsWith('[') && text.endsWith(']')) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) {
          return json.map((item, idx) => {
            const badge = String(item.badgeCode || item.badge || item.matricola || `ITEM-${idx + 1}`).trim();
            const name = String(item.name || item.nome || '').trim();
            const roleOrTitle = String(item.role || item.ruolo || item.title || item.titolo || item.specialty || '').trim();
            const teamOrStation = String(item.teamId || item.squadra || item.assignedTeamId || item.station || '').trim();
            const nationality = String(item.nationality || item.nazionalita || 'Italiana').trim();
            const organization = String(item.organization || item.ente || item.ospedale || '').trim();
            const phone = String(item.phone || item.telefono || '').trim();
            const email = String(item.email || item.mail || '').trim();
            const notes = String(item.notes || item.note || '').trim();
            const isValid = Boolean(name && name.length >= 2);
            return {
              id: item.id,
              badgeCode: badge,
              name,
              roleOrTitle,
              teamOrStation,
              nationality,
              organization,
              phone,
              email,
              notes,
              isValid,
              warning: !isValid ? (isEn ? 'Missing name' : 'Nome mancante') : undefined,
            };
          });
        }
      } catch (e) {
        // Fallback to table parsing
      }
    }

    // Split lines
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    // Detect delimiter on first line
    const firstLine = lines[0];
    let delimiter = '\t';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && (firstLine.split(';').length > firstLine.split(',').length)) delimiter = ';';
    else if (firstLine.includes(',')) delimiter = ',';

    const parseLine = (line: string): string[] => {
      if (delimiter === '\t') return line.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      // Regex CSV parse for quotes
      const res: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          res.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      res.push(current.trim());
      return res;
    };

    // Check if line 0 is a header
    const headerCols = parseLine(lines[0]).map((c) => c.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const isHeaderLine =
      headerCols.some((c) =>
        ['badge', 'nome', 'name', 'ruolo', 'role', 'matricola', 'squadra', 'team', 'titolo', 'specialita'].includes(c)
      );

    const dataLines = isHeaderLine ? lines.slice(1) : lines;

    // Detect column indexes if header present
    let colBadge = -1;
    let colName = -1;
    let colRole = -1;
    let colTeam = -1;
    let colNat = -1;
    let colOrg = -1;
    let colPhone = -1;
    let colEmail = -1;
    let colNotes = -1;

    if (isHeaderLine) {
      headerCols.forEach((col, idx) => {
        if (['badge', 'matricola', 'codice', 'id'].includes(col)) colBadge = idx;
        else if (['nome', 'name', 'cognome', 'nominativo', 'allievo', 'partecipante'].some((k) => col.includes(k))) colName = idx;
        else if (['ruolo', 'role', 'titolo', 'title', 'specialita', 'specializzazione', 'mansione'].some((k) => col.includes(k))) colRole = idx;
        else if (['squadra', 'team', 'postazione', 'station', 'box'].some((k) => col.includes(k))) colTeam = idx;
        else if (['nazionalita', 'nationality', 'nazione', 'paese'].some((k) => col.includes(k))) colNat = idx;
        else if (['ente', 'ospedale', 'organizzazione', 'organization', 'azienda', 'affiliation'].some((k) => col.includes(k))) colOrg = idx;
        else if (['telefono', 'phone', 'tel', 'cellulare'].some((k) => col.includes(k))) colPhone = idx;
        else if (['email', 'mail'].some((k) => col.includes(k))) colEmail = idx;
        else if (['note', 'notes', 'esperienza', 'experience'].some((k) => col.includes(k))) colNotes = idx;
      });
    }

    // Default column fallback if header was absent or incomplete
    if (colName === -1) colName = 1;
    if (colBadge === -1) colBadge = 0;
    if (colRole === -1) colRole = 2;
    if (colTeam === -1) colTeam = 3;
    if (colNat === -1) colNat = 4;
    if (colOrg === -1) colOrg = 5;
    if (colPhone === -1) colPhone = 6;
    if (colEmail === -1) colEmail = 7;
    if (colNotes === -1) colNotes = 8;

    return dataLines.map((line, idx) => {
      const parts = parseLine(line);
      const name = parts[colName] || '';
      const badge = parts[colBadge] || `${category.toUpperCase().slice(0, 4)}-${String(idx + 1).padStart(2, '0')}`;
      const roleOrTitle = parts[colRole] || '';
      const teamOrStation = parts[colTeam] || '';
      const nationality = parts[colNat] || 'Italiana';
      const organization = parts[colOrg] || '';
      const phone = parts[colPhone] || '';
      const email = parts[colEmail] || '';
      const notes = parts[colNotes] || '';

      const isValid = Boolean(name && name.length >= 2);
      let warning: string | undefined;
      if (!isValid) {
        warning = isEn ? 'Missing valid name' : 'Nome non valido';
      }

      return {
        badgeCode: badge.toUpperCase(),
        name,
        roleOrTitle,
        teamOrStation,
        nationality,
        organization,
        phone,
        email,
        notes,
        isValid,
        warning,
      };
    });
  }, [rawText, isEn, category]);

  const validCount = parsedRecords.filter((r) => r.isValid).length;
  const invalidCount = parsedRecords.filter((r) => !r.isValid).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setRawText(content);
        setSuccessMessage(isEn ? `File ${file.name} loaded.` : `File ${file.name} caricato.`);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedRecords.length === 0 || validCount === 0) {
      setErrorMessage(isEn ? 'No valid records to import.' : 'Nessun record valido da importare.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (category === 'discenti') {
        let updated: Discente[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const parsedTeam = parseInt(r.teamOrStation, 10);
            const teamId = !isNaN(parsedTeam) && parsedTeam >= 1 && parsedTeam <= 12 ? parsedTeam : Math.floor(idx / 6) + 1;
            const padNum = String(idx + 1).padStart(2, '0');
            return {
              id: r.id || `disc-${padNum}`,
              badgeCode: r.badgeCode || `DISC-${padNum}`,
              name: r.name,
              role: r.roleOrTitle.toLowerCase().includes('leader') ? 'Team Leader' : 'Operatore',
              teamId,
              nationality: r.nationality || 'Italiana',
              organization: r.organization,
              phone: r.phone,
              email: r.email,
              experience: r.notes,
            } as Discente;
          });
        } else {
          // Merge / Update existing
          const map = new Map<string, Discente>();
          discenti.forEach((d) => map.set(d.badgeCode.toUpperCase(), d));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key) || discenti.find((d) => d.id === r.id);
            const parsedTeam = parseInt(r.teamOrStation, 10);
            const teamId = !isNaN(parsedTeam) && parsedTeam >= 1 && parsedTeam <= 12
              ? parsedTeam
              : existing?.teamId || Math.floor(idx / 6) + 1;

            const merged: Discente = {
              id: existing?.id || `disc-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `DISC-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Discente',
              role: (r.roleOrTitle || existing?.role || 'Operatore').toLowerCase().includes('leader') ? 'Team Leader' : 'Operatore',
              teamId,
              nationality: r.nationality || existing?.nationality || 'Italiana',
              organization: r.organization || existing?.organization,
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              experience: r.notes || existing?.experience,
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateDiscenti(updated);
        setSuccessMessage(
          isEn
            ? `Successfully imported ${parsedRecords.length} learners into registry.`
            : `Importati con successo ${parsedRecords.length} discenti nell'anagrafica.`
        );
      } else if (category === 'faculty') {
        let updated: Faculty[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const parsedTeam = parseInt(r.teamOrStation, 10);
            const assignedTeamId = !isNaN(parsedTeam) && parsedTeam >= 1 && parsedTeam <= 12 ? parsedTeam : (idx % 12) + 1;
            const padNum = String(idx + 1).padStart(2, '0');
            return {
              id: r.id || `fac-${padNum}`,
              badgeCode: r.badgeCode || `FAC-${padNum}`,
              name: r.name,
              title: r.roleOrTitle || 'Docente Istruttore',
              specialty: r.roleOrTitle || 'Emergenza & Trauma',
              nationality: r.nationality || 'Italiana',
              assignedTeamId,
              organization: r.organization,
              phone: r.phone,
              email: r.email,
              notes: r.notes,
            } as Faculty;
          });
        } else {
          const map = new Map<string, Faculty>();
          faculty.forEach((f) => map.set(f.badgeCode.toUpperCase(), f));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key);
            const parsedTeam = parseInt(r.teamOrStation, 10);
            const assignedTeamId = !isNaN(parsedTeam) && parsedTeam >= 1 && parsedTeam <= 12
              ? parsedTeam
              : existing?.assignedTeamId || (idx % 12) + 1;

            const merged: Faculty = {
              id: existing?.id || `fac-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `FAC-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Faculty',
              title: r.roleOrTitle || existing?.title || 'Docente Istruttore',
              specialty: r.roleOrTitle || existing?.specialty || 'Emergenza & Trauma',
              nationality: r.nationality || existing?.nationality || 'Italiana',
              assignedTeamId,
              organization: r.organization || existing?.organization,
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              notes: r.notes || existing?.notes,
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateFaculty(updated);
        setSuccessMessage(
          isEn
            ? `Successfully updated ${parsedRecords.length} faculty members.`
            : `Aggiornati con successo ${parsedRecords.length} docenti faculty.`
        );
      } else if (category === 'tecnici') {
        let updated: Technician[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const padNum = String(idx + 1).padStart(2, '0');
            const stations = r.teamOrStation ? [r.teamOrStation] : ['Ambiente Tattico 1'];
            return {
              id: r.id || `tech-${padNum}`,
              badgeCode: r.badgeCode || `TECH-${padNum}`,
              name: r.name,
              specialty: r.roleOrTitle || 'Simulazione & Hardware',
              assignedStations: stations,
              nationality: r.nationality || 'Italiana',
              phone: r.phone,
              email: r.email,
              notes: r.notes,
            } as Technician;
          });
        } else {
          const map = new Map<string, Technician>();
          technicians.forEach((t) => map.set(t.badgeCode.toUpperCase(), t));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key);
            const stations = r.teamOrStation ? [r.teamOrStation] : existing?.assignedStations || ['Ambiente Tattico 1'];

            const merged: Technician = {
              id: existing?.id || `tech-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `TECH-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Tecnico',
              specialty: r.roleOrTitle || existing?.specialty || 'Simulazione & Hardware',
              assignedStations: stations,
              nationality: r.nationality || existing?.nationality || 'Italiana',
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              notes: r.notes || existing?.notes,
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateTechnicians(updated);
        setSuccessMessage(
          isEn
            ? `Successfully updated ${parsedRecords.length} technicians.`
            : `Aggiornati con successo ${parsedRecords.length} tecnici di simulazione.`
        );
      } else if (category === 'direttori') {
        let updated: Director[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const padNum = String(idx + 1).padStart(2, '0');
            return {
              id: r.id || `dir-${padNum}`,
              badgeCode: r.badgeCode || `DIR-${padNum}`,
              name: r.name,
              title: r.roleOrTitle || 'Direttore Corso',
              nationality: r.nationality || 'Italiana',
              organization: r.organization,
              phone: r.phone,
              email: r.email,
              notes: r.notes,
              isMaster: idx === 0,
            } as Director;
          });
        } else {
          const map = new Map<string, Director>();
          directors.forEach((d) => map.set(d.badgeCode.toUpperCase(), d));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key);
            const merged: Director = {
              id: existing?.id || `dir-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `DIR-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Direttore',
              title: r.roleOrTitle || existing?.title || 'Direttore Corso',
              nationality: r.nationality || existing?.nationality || 'Italiana',
              organization: r.organization || existing?.organization,
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              notes: r.notes || existing?.notes,
              isMaster: existing?.isMaster ?? (idx === 0),
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateDirectors(updated);
        setSuccessMessage(
          isEn
            ? `Successfully updated ${parsedRecords.length} directors.`
            : `Aggiornata con successo la Direzione del corso.`
        );
      } else if (category === 'regia') {
        let updated: RegiaStaff[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const padNum = String(idx + 1).padStart(2, '0');
            return {
              id: r.id || `regia-${padNum}`,
              badgeCode: r.badgeCode || `REGIA-${padNum}`,
              name: r.name,
              role: r.roleOrTitle || 'Staff Regia',
              title: r.roleOrTitle || 'Operatore Regia Audio/Video',
              nationality: r.nationality || 'Italiana',
              organization: r.organization,
              phone: r.phone,
              email: r.email,
              notes: r.notes,
            } as RegiaStaff;
          });
        } else {
          const map = new Map<string, RegiaStaff>();
          regiaStaff.forEach((r) => map.set(r.badgeCode.toUpperCase(), r));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key);
            const merged: RegiaStaff = {
              id: existing?.id || `regia-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `REGIA-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Staff Regia',
              role: r.roleOrTitle || existing?.role || 'Staff Regia',
              title: r.roleOrTitle || existing?.title || 'Operatore Regia',
              nationality: r.nationality || existing?.nationality || 'Italiana',
              organization: r.organization || existing?.organization,
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              notes: r.notes || existing?.notes,
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateRegiaStaff(updated);
        setSuccessMessage(
          isEn
            ? `Successfully updated ${parsedRecords.length} regia operators.`
            : `Aggiornato con successo lo staff di Regia.`
        );
      } else if (category === 'ospiti') {
        let updated: Guest[] = [];
        if (importMode === 'replace') {
          updated = parsedRecords.map((r, idx) => {
            const padNum = String(idx + 1).padStart(2, '0');
            return {
              id: r.id || `guest-${padNum}`,
              badgeCode: r.badgeCode || `OSP-${padNum}`,
              name: r.name,
              title: r.roleOrTitle || 'Ospite / VIP',
              organization: r.organization || 'Delegazione',
              nationality: r.nationality || 'Italiana',
              assignedDays: [2, 3],
              phone: r.phone,
              email: r.email,
              notes: r.notes,
            } as Guest;
          });
        } else {
          const map = new Map<string, Guest>();
          guests.forEach((g) => map.set(g.badgeCode.toUpperCase(), g));

          parsedRecords.forEach((r, idx) => {
            const key = r.badgeCode.toUpperCase();
            const existing = map.get(key);
            const merged: Guest = {
              id: existing?.id || `guest-${String(idx + 1).padStart(2, '0')}`,
              badgeCode: r.badgeCode || existing?.badgeCode || `OSP-${String(idx + 1).padStart(2, '0')}`,
              name: r.name || existing?.name || 'Ospite VIP',
              title: r.roleOrTitle || existing?.title || 'Osservatore',
              organization: r.organization || existing?.organization || 'Ente Ospite',
              nationality: r.nationality || existing?.nationality || 'Italiana',
              assignedDays: existing?.assignedDays || [2, 3],
              phone: r.phone || existing?.phone,
              email: r.email || existing?.email,
              notes: r.notes || existing?.notes,
            };
            map.set(merged.badgeCode.toUpperCase(), merged);
          });
          updated = Array.from(map.values());
        }

        await bulkUpdateGuests(updated);
        setSuccessMessage(
          isEn
            ? `Successfully updated ${parsedRecords.length} VIP guests.`
            : `Aggiornato con successo il registro ospiti e delegazioni.`
        );
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setErrorMessage(err?.message || (isEn ? 'Failed to commit import.' : 'Errore nel salvataggio dei dati importati.'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs font-mono">
      <div
        className="bg-neutral-950 border-4 border-neutral-700 w-full max-w-4xl text-neutral-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b-2 border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-orange-500 text-black font-black">
              <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base uppercase tracking-tight text-white flex items-center gap-2">
                <span>{isEn ? 'IMPORT DATA INTO PERSONNEL REGISTRY' : 'IMPORTAZIONE DATI ANAGRAFICA'}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 bg-orange-500 text-black uppercase">
                  CSV / EXCEL / TSV / JSON
                </span>
              </h2>
              <p className="text-[10px] text-neutral-400 font-sans">
                {isEn
                  ? 'Paste columns directly from Excel, Google Sheets, or upload CSV files to bulk compile personnel.'
                  : 'Incolla direttamente le celle copiate da Excel, Google Sheets o carica un file CSV per compilare in massa i dati.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Controls Bar: Category & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-900 p-3 border border-neutral-800 rounded-lg">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
                {isEn ? '1. Target Category to Populate:' : '1. Categoria Anagrafica di Destinazione:'}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ImportCategory);
                  setSuccessMessage(null);
                }}
                className="w-full bg-neutral-950 border border-neutral-700 p-2 text-neutral-100 font-bold focus:border-orange-500 outline-none"
              >
                <option value="discenti">DISCENTI ({discenti.length} Allievi • DISC-01..70)</option>
                <option value="faculty">FACULTY ({faculty.length} Tutor • FAC-01..12)</option>
                <option value="tecnici">TEAM TECNICO ({technicians.length} Operatori • TECH-01..12)</option>
                <option value="direttori">DIREZIONE ({directors.length} Direttori • DIR-01..)</option>
                <option value="regia">STAFF REGIA ({regiaStaff.length} Operatori • REGIA-01..)</option>
                <option value="ospiti">DELEGAZIONI & OSPITI ({guests.length} Ospiti • OSP-01..)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-neutral-400 block mb-1">
                {isEn ? '2. Compilation / Update Mode:' : '2. Modalità di Compilazione:'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 py-2 px-3 text-center border font-bold uppercase cursor-pointer transition-all ${
                    importMode === 'merge'
                      ? 'bg-orange-600 text-black border-orange-400 font-black'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {isEn ? 'Update / Merge by Badge' : 'Aggiorna / Unisci per Badge'}
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`flex-1 py-2 px-3 text-center border font-bold uppercase cursor-pointer transition-all ${
                    importMode === 'replace'
                      ? 'bg-amber-600 text-black border-amber-400 font-black'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {isEn ? 'Replace Entire List' : 'Sostituisci Intera Lista'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions & Template helpers */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold uppercase flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>{isEn ? 'Upload File (.csv / .tsv / .json)' : 'Carica File (.csv / .tsv / .json)'}</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold uppercase flex items-center gap-1.5 cursor-pointer"
                title={isEn ? 'Load sample data template' : 'Carica template di dati di prova'}
              >
                <Copy className="w-3.5 h-3.5 text-yellow-400" />
                <span>{isEn ? 'Load Sample Data' : 'Carica Template Esempio'}</span>
              </button>
            </div>

            <span className="text-[10px] text-neutral-500 font-mono">
              {parsedRecords.length} {isEn ? 'records detected' : 'righe rilevate'} ({validCount} {isEn ? 'valid' : 'valide'})
            </span>
          </div>

          {/* Text Area for Copy-Paste */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-300">
                {isEn ? '3. Paste Clipboard Content (Tab or Comma Separated):' : '3. Incolla Qui i Dati (Tabulazione da Excel o Virgole/Punto e virgola da CSV):'}
              </label>
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText('')}
                  className="text-[10px] text-neutral-500 hover:text-red-400 underline cursor-pointer"
                >
                  {isEn ? 'Clear' : 'Pulisci'}
                </button>
              )}
            </div>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              placeholder={`BADGE\tNOME\tRUOLO\tSQUADRA\tNAZIONALITA\tENTE\tTELEFONO\tEMAIL\tNOTE\nDISC-01\tDott. Mario Rossi\tTeam Leader\t1\tItaliana\tOspedale Maggiore\t+39 333 1112233\tmario.rossi@sim.it\tEsperienza 118...`}
              rows={6}
              className="w-full bg-neutral-950 border-2 border-neutral-800 focus:border-orange-500 p-2.5 font-mono text-[11px] text-neutral-200 outline-none placeholder:text-neutral-600 resize-y"
            />
          </div>

          {/* Table Preview of Parsed Records */}
          {parsedRecords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-neutral-300 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-400" />
                  <span>{isEn ? 'Import Preview Table' : 'Tabella Anteprima di Importazione'}</span>
                </span>
                {invalidCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-950 border border-red-700 text-red-300 text-[10px] font-bold">
                    ⚠️ {invalidCount} {isEn ? 'invalid rows' : 'righe con errori'}
                  </span>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto border border-neutral-800 bg-neutral-950">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-neutral-900 sticky top-0 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase font-black">
                    <tr>
                      <th className="p-2 w-10 text-center">#</th>
                      <th className="p-2">Badge</th>
                      <th className="p-2">Nome Completo</th>
                      <th className="p-2">Ruolo / Titolo</th>
                      <th className="p-2">Squadra / Post.</th>
                      <th className="p-2">Nazionalità</th>
                      <th className="p-2">Ente / Ospedale</th>
                      <th className="p-2">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {parsedRecords.map((r, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-neutral-900/60 ${
                          !r.isValid ? 'bg-red-950/20 text-red-200' : 'text-neutral-200'
                        }`}
                      >
                        <td className="p-2 text-center text-neutral-500 font-mono">{idx + 1}</td>
                        <td className="p-2 font-mono font-bold text-orange-400">{r.badgeCode}</td>
                        <td className="p-2 font-bold text-white">{r.name || '—'}</td>
                        <td className="p-2 text-neutral-300">{r.roleOrTitle || '—'}</td>
                        <td className="p-2 font-mono text-cyan-300">{r.teamOrStation || '—'}</td>
                        <td className="p-2">{r.nationality}</td>
                        <td className="p-2 text-neutral-400 truncate max-w-[120px]">{r.organization || '—'}</td>
                        <td className="p-2 font-mono">
                          {r.isValid ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>OK</span>
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1" title={r.warning}>
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              <span>{r.warning || 'ERRORE'}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Status Banners */}
          {successMessage && (
            <div className="p-3 bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 font-bold text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/90 border-2 border-red-500 text-red-200 font-bold text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-900 border-t-2 border-neutral-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span>
              {isEn
                ? 'Changes are committed immediately to the course state and offline cache.'
                : 'Le modifiche vengono scritte immediatamente nello stato del corso e sincronizzate in rete.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold uppercase transition-colors cursor-pointer"
            >
              {isEn ? 'Close' : 'Chiudi'}
            </button>

            <button
              type="button"
              onClick={handleCommitImport}
              disabled={isProcessing || parsedRecords.length === 0 || validCount === 0}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-black font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-orange-950/50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isEn ? 'Importing...' : 'Importazione in corso...'}</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>
                    {isEn ? `Apply Import (${validCount} rows)` : `Conferma Importazione (${validCount} righe)`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
