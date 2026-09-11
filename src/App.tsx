/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CourseProvider, useCourse } from './context/CourseContext';
import { Navbar } from './components/Navbar';
import { PublicSharedView } from './components/views/PublicSharedView';
import { DiscenteView } from './components/views/DiscenteView';
import { TecnicoView } from './components/views/TecnicoView';
import { FacultyView } from './components/views/FacultyView';
import { DirettoreView } from './components/views/DirettoreView';
import { RegiaView } from './components/views/RegiaView';
import { OspiteView } from './components/views/OspiteView';
import { ScenariCatalogView } from './components/views/ScenariCatalogView';
import { NightScenarioView } from './components/views/NightScenarioView';
import { ProtesiCatalogView } from './components/views/ProtesiCatalogView';
import { CourseScheduleGateCard } from './components/CourseScheduleGateCard';
import { CoursePreStartCountdown } from './components/CoursePreStartCountdown';
import { StartupAccessModal } from './components/StartupAccessModal';
import { Activity, ShieldCheck, HeartPulse, Clock } from 'lucide-react';

const CourseMainContent: React.FC = () => {
  const {
    userRole,
    setUserRole,
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    isCourseStarted,
    setIsSimulationModalOpen,
    timeRemainingMs,
    courseStartSchedule,
    language,
  } = useCourse();
  const [currentTab, setCurrentTab] = useState<string>('main');

  const totalSeconds = Math.floor(timeRemainingMs / 1000);
  const isGateActive = courseStartSchedule.isGateEnabled;

  const isCurrentViewUnlocked = () => {
    if (userRole === 'direttore' || userRole === 'regia') return true; // Director & Regia always active
    if (userRole === 'tecnico') {
      return !isGateActive || isCourseStarted || totalSeconds <= 3600; // Technician active 1 hour before
    }
    // Other views active 30 minutes before
    return !isGateActive || isCourseStarted || totalSeconds <= 1800;
  };

  const [isStartupModalOpen, setIsStartupModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    const badge = params.get('badge') || params.get('qr') || '';
    const isRegia = params.has('regia') || params.get('role') === 'regia' || badge.toUpperCase().includes('REGIA');
    if (isRegia) return true;

    const hasQrParams =
      params.has('discente') ||
      params.has('faculty') ||
      params.has('tecnico') ||
      params.has('technician') ||
      params.has('direttore') ||
      params.has('director') ||
      params.has('ospite') ||
      params.has('guest') ||
      params.has('badge') ||
      params.has('qr') ||
      (params.has('role') && params.has('id'));
    // If accessed via QR / badge / specific profile parameter, do NOT show Startup Modal (directly set role & profile)
    return !hasQrParams;
  });

  const isRegiaQrStartup = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const badge = params.get('badge') || params.get('qr') || '';
    return params.has('regia') || params.get('role') === 'regia' || badge.toUpperCase().includes('REGIA');
  }, []);

  // Check URL parameters for instant unique QR Code direct navigation (?discente=... , ?faculty=... , ?tecnico=... , ?direttore=... , ?ospite=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const discenteParam = params.get('discente');
      const facultyParam = params.get('faculty');
      const tecnicoParam = params.get('tecnico') || params.get('technician');
      const direttoreParam = params.get('direttore') || params.get('director');
      const regiaParam = params.get('regia');
      const ospiteParam = params.get('ospite') || params.get('guest');
      const idParam = params.get('id');
      const badgeParam = params.get('badge') || params.get('qr');
      const roleParam = params.get('role');

      if (discenteParam || (roleParam === 'discente' && idParam)) {
        const targetId = discenteParam || idParam;
        const found = discenti.find(
          (d) => d.id === targetId || d.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedDiscenteId(found.id);
          setUserRole('discente');
        }
      } else if (facultyParam || (roleParam === 'faculty' && idParam)) {
        const targetId = facultyParam || idParam;
        const found = faculty.find(
          (f) => f.id === targetId || f.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedFacultyId(found.id);
          setUserRole('faculty');
        }
      } else if (tecnicoParam || (roleParam === 'tecnico' && idParam)) {
        const targetId = tecnicoParam || idParam;
        const found = technicians.find(
          (t) => t.id === targetId || t.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedTechnicianId(found.id);
          setUserRole('tecnico');
        }
      } else if (direttoreParam || (roleParam === 'direttore' && idParam)) {
        const targetId = direttoreParam || idParam;
        const found = directors.find(
          (d) => d.id === targetId || d.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedDirectorId(found.id);
          setUserRole('direttore');
        }
      } else if (regiaParam || (roleParam === 'regia' && idParam)) {
        const targetId = regiaParam || idParam;
        const found = regiaStaff.find(
          (r) => r.id === targetId || r.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedRegiaId(found.id);
          setUserRole('regia');
        }
      } else if (ospiteParam || (roleParam === 'ospite' && idParam)) {
        const targetId = ospiteParam || idParam;
        const found = guests.find(
          (g) => g.id === targetId || g.badgeCode?.toLowerCase() === targetId?.toLowerCase()
        );
        if (found) {
          setSelectedGuestId(found.id);
          setUserRole('ospite');
        }
      } else if (badgeParam) {
        // Search across all lists by badgeCode
        const foundDisc = discenti.find((d) => d.badgeCode?.toLowerCase() === badgeParam.toLowerCase());
        const foundFac = faculty.find((f) => f.badgeCode?.toLowerCase() === badgeParam.toLowerCase());
        const foundTech = technicians.find((t) => t.badgeCode?.toLowerCase() === badgeParam.toLowerCase());
        const foundDir = directors.find((d) => d.badgeCode?.toLowerCase() === badgeParam.toLowerCase());
        const foundRegia = regiaStaff.find((r) => r.badgeCode?.toLowerCase() === badgeParam.toLowerCase());
        const foundGuest = guests.find((g) => g.badgeCode?.toLowerCase() === badgeParam.toLowerCase());

        if (foundDisc) {
          setSelectedDiscenteId(foundDisc.id);
          setUserRole('discente');
        } else if (foundFac) {
          setSelectedFacultyId(foundFac.id);
          setUserRole('faculty');
        } else if (foundTech) {
          setSelectedTechnicianId(foundTech.id);
          setUserRole('tecnico');
        } else if (foundDir) {
          setSelectedDirectorId(foundDir.id);
          setUserRole('direttore');
        } else if (foundRegia) {
          setSelectedRegiaId(foundRegia.id);
          setUserRole('regia');
        } else if (foundGuest) {
          setSelectedGuestId(foundGuest.id);
          setUserRole('ospite');
        }
      } else if (roleParam) {
        if (['discente', 'faculty', 'tecnico', 'direttore', 'regia', 'ospite', 'public'].includes(roleParam)) {
          setUserRole(roleParam as any);
        }
      }
    }
  }, [
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setUserRole,
  ]);

  const renderActiveView = () => {
    if (currentTab === 'schedule_gate') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-black text-white uppercase">
                {language === 'en' ? 'Sync & Start Countdown Control' : 'Sincronizzazione Start & Countdown'}
              </h2>
            </div>
            <button
              onClick={() => setCurrentTab('main')}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono uppercase rounded cursor-pointer"
            >
              {language === 'en' ? '← Back to Dashboard' : '← Torna alla Dashboard'}
            </button>
          </div>
          <CourseScheduleGateCard />
        </div>
      );
    }

    if (!isCurrentViewUnlocked()) {
      return <CoursePreStartCountdown />;
    }

    if (userRole === 'tecnico') {
      if (currentTab === 'catalog') {
        return <ScenariCatalogView onOpenProtesi={() => setCurrentTab('protesi')} />;
      }
      if (currentTab === 'protesi') {
        return <ProtesiCatalogView />;
      }
      if (currentTab === 'night') {
        return <NightScenarioView />;
      }
    }

    // Main Role-based View
    switch (userRole) {
      case 'discente':
        return <DiscenteView />;
      case 'tecnico':
        return <TecnicoView />;
      case 'faculty':
        return <FacultyView />;
      case 'direttore':
        return <DirettoreView />;
      case 'regia':
        return <RegiaView />;
      case 'ospite':
        return <OspiteView />;
      case 'public':
      default:
        return <PublicSharedView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Main Simulation Navigation & Control Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Dynamic Content Body - Fluid & Adaptive across Mobile, Tablet, and Desktop */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 pt-3 sm:pt-6 pb-12 transition-all">
        {renderActiveView()}
      </main>

      {/* Trauma Center Footer - Responsive on all screen sizes */}
      <footer className="border-t-4 border-neutral-900 bg-neutral-950 py-5 sm:py-6 text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-orange-500 text-black flex items-center justify-center font-black">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-neutral-300 tracking-wider uppercase">
                TRAUMA SIM DIRECTOR
              </span>
              <span className="text-neutral-500 ml-2 font-mono">
                // ADVANCED TRAUMA MANAGEMENT DAY 02 & DAY 03
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span className="font-bold text-neutral-300">60 DISCENTI • 12 SQUADRE • 4 GRUPPI</span>
            <span>|</span>
            <span className="text-orange-400 font-bold uppercase tracking-wider">REAL-TIME MULTI-SCREEN SYNC</span>
          </div>
        </div>
      </footer>

      {/* Startup Access Gateway Modal */}
      <StartupAccessModal
        isOpen={isStartupModalOpen}
        directors={directors}
        regiaStaff={regiaStaff}
        initialMode={isRegiaQrStartup ? 'master_or_regia_select' : 'choice'}
        onSelectPublic={() => {
          setUserRole('public');
          setIsStartupModalOpen(false);
        }}
        onSelectDirector={(directorId) => {
          if (directorId) {
            setSelectedDirectorId(directorId);
          }
          setUserRole('direttore');
          setIsStartupModalOpen(false);
        }}
        onSelectMaster={() => {
          const masterDir = directors.find((d) => d.isMaster) || directors[0];
          if (masterDir) {
            setSelectedDirectorId(masterDir.id);
          }
          setUserRole('direttore');
          setIsStartupModalOpen(false);
        }}
        onSelectRegia={(regiaId) => {
          if (regiaId) {
            setSelectedRegiaId(regiaId);
          } else if (regiaStaff[0]) {
            setSelectedRegiaId(regiaStaff[0].id);
          }
          setUserRole('regia');
          setIsStartupModalOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <CourseProvider>
      <CourseMainContent />
    </CourseProvider>
  );
}
