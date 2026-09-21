/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CourseProvider, useCourse } from './context/CourseContext';
import { Navbar } from './components/Navbar';
import { CourseSuspensionBanner } from './components/CourseSuspensionBanner';
import { DirettoriView } from './components/views/DirettoriView';
import { RegiaView } from './components/views/RegiaView';
import { OspiteView } from './components/views/OspiteView';
import { ProtesiCatalogView } from './components/views/ProtesiCatalogView';
import { ScenariMasterListView } from './components/views/ScenariMasterListView';
import { PublicTimelineView } from './components/views/PublicTimelineView';
import { DiscenteView } from './components/views/DiscenteView';
import { FacultyView } from './components/views/FacultyView';
import { TecniciView } from './components/views/TecniciView';

import { SimulationQuickFloatingBar } from './components/SimulationQuickFloatingBar';

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
    teams,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setActiveFacultyTeamId,
    setActiveTechPatientId,
    isCourseStarted,
    setIsSimulationModalOpen,
    timeRemainingMs,
    courseStartSchedule,
    language,
    currentTab,
    setCurrentTab,
    setOpenedByRole,
  } = useCourse();

  // Check URL parameters for instant unique QR Code direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from') || params.get('openedBy') || params.get('source');
      const isFromAdmin = fromParam === 'regia' || fromParam === 'direttore';
      if (isFromAdmin) {
        setOpenedByRole(fromParam as 'regia' | 'direttore');
      }

      const discenteParam = params.get('discente') || params.get('student');
      const facultyParam = params.get('faculty') || params.get('tutor');
      const techParam = params.get('tecnico') || params.get('technician') || params.get('tech');
      const direttoreParam = params.get('direttore') || params.get('director');
      const regiaParam = params.get('regia');
      const guestParam = params.get('ospite') || params.get('guest');
      const idParam = params.get('id');
      const badgeParam = params.get('badge') || params.get('qr');
      const roleParam = params.get('role');
      const viewParam = params.get('view') || params.get('public');

      // 1. Check explicit view or role parameter
      if (viewParam === 'public' || viewParam === 'true') {
        setCurrentTab('public');
      } else if (!viewParam && !roleParam && !discenteParam && !facultyParam && !techParam && !direttoreParam && !regiaParam && !guestParam && !idParam && !badgeParam) {
        // Default directly to Public View
        setCurrentTab('public');
      } else if (viewParam === 'discente' || viewParam === 'student' || roleParam === 'discente' || discenteParam) {
        setCurrentTab('discente');
        setUserRole(isFromAdmin ? (fromParam as any) : 'discente');
        const target = discenteParam || idParam || badgeParam;
        if (target) {
          const found = discenti.find(
            (d) => d.id.toLowerCase() === target.toLowerCase() || d.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) setSelectedDiscenteId(found.id);
        }
      } else if (viewParam === 'faculty' || viewParam === 'tutor' || roleParam === 'faculty' || facultyParam) {
        setCurrentTab('faculty');
        setUserRole(isFromAdmin ? (fromParam as any) : 'faculty');
        const target = facultyParam || idParam || badgeParam;
        if (target) {
          const found = faculty.find(
            (f) => f.id.toLowerCase() === target.toLowerCase() || f.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) {
            setSelectedFacultyId(found.id);
            if (found.assignedTeamId) setActiveFacultyTeamId(found.assignedTeamId);
          }
        }
      } else if (viewParam === 'tecnici' || viewParam === 'tech' || roleParam === 'tecnico' || techParam) {
        setCurrentTab('tecnici');
        setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
        const target = techParam || idParam || badgeParam;
        if (target) {
          const found = technicians.find(
            (t) => t.id.toLowerCase() === target.toLowerCase() || t.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) setSelectedTechnicianId(found.id);
        }
      } else if (viewParam === 'direttori' || viewParam === 'director' || roleParam === 'direttore' || direttoreParam) {
        setCurrentTab('direttori');
        setUserRole('direttore');
        const target = direttoreParam || idParam || badgeParam;
        if (target) {
          const found = directors.find(
            (d) => d.id.toLowerCase() === target.toLowerCase() || d.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) setSelectedDirectorId(found.id);
        }
      } else if (viewParam === 'regia' || roleParam === 'regia' || regiaParam) {
        setCurrentTab('regia');
        setUserRole('regia');
        const target = regiaParam || idParam || badgeParam;
        if (target) {
          const found = regiaStaff.find(
            (r) => r.id.toLowerCase() === target.toLowerCase() || r.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) setSelectedRegiaId(found.id);
        }
      } else if (viewParam === 'ospite' || viewParam === 'guest' || roleParam === 'ospite' || guestParam) {
        setCurrentTab('ospite');
        setUserRole(isFromAdmin ? (fromParam as any) : 'ospite');
        const target = guestParam || idParam || badgeParam;
        if (target) {
          const found = guests.find(
            (g) => g.id.toLowerCase() === target.toLowerCase() || g.badgeCode?.toLowerCase() === target.toLowerCase()
          );
          if (found) setSelectedGuestId(found.id);
        }
      }

      // 2. If badgeParam or idParam was supplied without viewParam, resolve participant automatically
      if (!viewParam && (badgeParam || idParam)) {
        const query = (badgeParam || idParam)!.toLowerCase();

        // Check Discenti
        const foundDisc = discenti.find((d) => d.badgeCode?.toLowerCase() === query || d.id.toLowerCase() === query);
        if (foundDisc) {
          setSelectedDiscenteId(foundDisc.id);
          setCurrentTab('discente');
          setUserRole('discente');
          return;
        }

        // Check Faculty
        const foundFac = faculty.find((f) => f.badgeCode?.toLowerCase() === query || f.id.toLowerCase() === query);
        if (foundFac) {
          setSelectedFacultyId(foundFac.id);
          if (foundFac.assignedTeamId) setActiveFacultyTeamId(foundFac.assignedTeamId);
          setCurrentTab('faculty');
          setUserRole('faculty');
          return;
        }

        // Check Technicians
        const foundTech = technicians.find((t) => t.badgeCode?.toLowerCase() === query || t.id.toLowerCase() === query);
        if (foundTech) {
          setSelectedTechnicianId(foundTech.id);
          setCurrentTab('tecnici');
          setUserRole('tecnico');
          return;
        }

        // Check Directors
        const foundDir = directors.find((d) => d.badgeCode?.toLowerCase() === query || d.id.toLowerCase() === query);
        if (foundDir) {
          setSelectedDirectorId(foundDir.id);
          setCurrentTab('direttori');
          setUserRole('direttore');
          return;
        }

        // Check Regia
        const foundReg = regiaStaff.find((r) => r.badgeCode?.toLowerCase() === query || r.id.toLowerCase() === query);
        if (foundReg) {
          setSelectedRegiaId(foundReg.id);
          setCurrentTab('regia');
          setUserRole('regia');
          return;
        }

        // Check Guests
        const foundGuest = guests.find((g) => g.badgeCode?.toLowerCase() === query || g.id.toLowerCase() === query);
        if (foundGuest) {
          setSelectedGuestId(foundGuest.id);
          setCurrentTab('ospite');
          setUserRole('ospite');
          return;
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
    setActiveFacultyTeamId,
    setUserRole,
    setCurrentTab,
  ]);

  const renderActiveView = () => {
    if (currentTab === 'public') return <PublicTimelineView />;
    if (currentTab === 'discente') return <DiscenteView />;
    if (currentTab === 'faculty') return <FacultyView />;
    if (currentTab === 'tecnici') return <TecniciView />;
    if (currentTab === 'regia') return <RegiaView />;
    if (currentTab === 'direttori') return <DirettoriView />;
    if (currentTab === 'ospite') return <OspiteView />;
    if (currentTab === 'scenari' || currentTab === 'catalog') return <ScenariMasterListView />;
    if (currentTab === 'protesi') return <ProtesiCatalogView />;

    // Main Role-based View
    switch (userRole) {
      case 'regia':
        return <RegiaView />;
      case 'ospite':
        return <OspiteView />;
      case 'direttore':
      default:
        return <DirettoriView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Real-time Suspension Emergency Banner (Highest Priority) */}
      <CourseSuspensionBanner />


      {/* Main Simulation Navigation & Control Bar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Dynamic Content Body - Fluid & Adaptive across Mobile, Tablet, and Desktop */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 pb-12 transition-all">
        {renderActiveView()}
      </main>

      {/* Floating Simulation Quick Bar when acceleration is active */}
      <SimulationQuickFloatingBar onOpenFullModal={() => setIsSimulationModalOpen(true)} />

      {/* Trauma Center Footer - Responsive on all screen sizes */}
      <footer className="border-t-4 border-neutral-900 bg-neutral-950 py-4 sm:py-6 text-xs text-neutral-500 mt-auto">
        <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
            <span className="font-bold text-neutral-300">
              {language === 'en' ? '60 TRAINEES • 12 TEAMS • 4 GROUPS' : '60 DISCENTI • 12 SQUADRE • 4 GRUPPI'}
            </span>
            <span>|</span>
            <span className="text-orange-400 font-bold uppercase tracking-wider">REAL-TIME MULTI-SCREEN SYNC</span>
          </div>
        </div>
      </footer>


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
