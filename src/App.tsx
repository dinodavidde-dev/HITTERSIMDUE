/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CourseProvider, useCourse } from './context/CourseContext';
import { Navbar } from './components/Navbar';
import { FreeAccessBanner } from './components/FreeAccessBanner';
import { CourseSuspensionBanner } from './components/CourseSuspensionBanner';
import { DirettoriView } from './components/views/DirettoriView';
import { RegiaView } from './components/views/RegiaView';
import { MasterView } from './components/views/MasterView';
import { OspiteView } from './components/views/OspiteView';
import { ProtesiCatalogView } from './components/views/ProtesiCatalogView';
import { ScenariMasterListView } from './components/views/ScenariMasterListView';
import { PublicTimelineView } from './components/views/PublicTimelineView';
import { DiscenteView } from './components/views/DiscenteView';
import { FacultyView } from './components/views/FacultyView';
import { TecniciView } from './components/views/TecniciView';
import { TruccoView } from './components/views/TruccoView';
import { TruccatorePersonalMobileView } from './components/views/TruccatorePersonalMobileView';
import { ActorPersonalView } from './components/views/ActorPersonalView';
import { RegiaAssetDashboardView } from './components/views/RegiaAssetDashboardView';

import { ErrorBoundary } from './components/common/ErrorBoundary';

import { Activity, ShieldCheck, HeartPulse, Clock, ArrowLeft, Minimize2, Compass } from 'lucide-react';
import { OfflineReadOnlyBanner } from './components/offline/OfflineReadOnlyBanner';
import { OfflinePreloadProgress } from './components/offline/OfflinePreloadProgress';
import { QuickRollbackToast } from './components/schedule/QuickRollbackToast';
import { AuditLogPanel } from './components/schedule/AuditLogPanel';
import { IntentReviewPanel } from './components/offline/IntentReviewPanel';
import { CourseStartGateAuthorizationModal } from './components/common/CourseStartGateAuthorizationModal';
import { ScenarioBlockConfirmationModal } from './components/regia/ScenarioBlockConfirmationModal';
import { MacroBlockStandbyIndicator } from './components/common/MacroBlockStandbyIndicator';
import { TacticalMapModal } from './components/common/TacticalMapModal';
import { resolveParticipantByQuery, isParticipantMatch } from './utils/qrCodeUtils';

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
    makeupArtists,
    actors,
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
    timeRemainingMs,
    courseStartSchedule,
    language,
    currentTab,
    setCurrentTab,
    setOpenedByRole,
    openedByRole,
    navigateBack,
    setIsAreaDiscentiModalOpen,
    isFullscreenMode,
    toggleFullscreenMode,
    timerSeconds,
    activeDay,
    activeSlotIndex,
    isAuditLogOpen,
    setIsAuditLogOpen,
    isIntentReviewOpen,
    setIsIntentReviewOpen,
    activeRollbackToast,
    dismissRollbackToast,
    rollbackScheduleModification,
    isTacticalMapOpen,
    setIsTacticalMapOpen,
  } = useCourse();

  const [selectedMakeupArtistId, setSelectedMakeupArtistId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('truccatore') || (params.get('view') === 'truccatore' ? (params.get('id') || params.get('badge')) : null);
      if (target) return target;
    }
    return null;
  });
  const [selectedActorId, setSelectedActorId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const target = params.get('attore') || (params.get('view') === 'attore' ? (params.get('id') || params.get('badge')) : null);
      if (target) return target;
    }
    return null;
  });

  const lastProcessedSearchRef = useRef<string | null>(null);

  // Check URL parameters for instant unique QR Code direct navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentSearch = window.location.search;

      // STRICT ANCHORING: Initial URL routing runs strictly ONCE on mount.
      // Once handled, subsequent re-renders, participant updates or background Firestore syncs
      // must NEVER overwrite currentTab or kick the user out of Regia (or any active tab)!
      // Avoid re-processing if URL parameters have not changed
      if (lastProcessedSearchRef.current === currentSearch) {
        return;
      }
      lastProcessedSearchRef.current = currentSearch;

      const params = new URLSearchParams(currentSearch);
      const fromParam = params.get('from') || params.get('openedBy') || params.get('source');
      const isFromAdmin = fromParam === 'regia' || fromParam === 'direttore' || fromParam === 'master';
      if (isFromAdmin) {
        setOpenedByRole(fromParam as 'regia' | 'direttore' | 'master');
      }

      // Check if student arrived via Free Access direct link / Emergency QR
      const freeAccessParam =
        params.get('free_access') === '1' ||
        params.get('freeAccess') === 'true' ||
        params.get('mode') === 'free_access' ||
        params.get('accesso') === 'libero';

      if (freeAccessParam) {
        setCurrentTab('public');
        setIsAreaDiscentiModalOpen(true);
      }

      const discenteParam = params.get('discente') || params.get('student');
      const facultyParam = params.get('faculty') || params.get('tutor');
      const techParam = params.get('tecnico') || params.get('technician') || params.get('tech');
      const direttoreParam = params.get('direttore') || params.get('director');
      const regiaParam = params.get('regia');
      const guestParam = params.get('ospite') || params.get('guest');
      const idParam = params.get('id');
      const badgeParam = params.get('badge') || params.get('matricola') || params.get('code');
      const roleParam = params.get('role');
      const viewParam = (params.get('view') || params.get('public') || '').toLowerCase();

      const hasPersonalParam = Boolean(
        discenteParam ||
        facultyParam ||
        techParam ||
        direttoreParam ||
        regiaParam ||
        guestParam ||
        idParam ||
        badgeParam ||
        params.get('attore') ||
        params.get('truccatore')
      );

      // 1. Check explicit view or role parameter
      const isPublicViewParam =
        !hasPersonalParam &&
        (viewParam === 'public' ||
          viewParam === 'pubblico' ||
          viewParam === 'ospite' ||
          params.get('public') === 'true' ||
          params.get('public') === '1');

      if (isPublicViewParam) {
        setCurrentTab('public');
        if (!roleParam) {
          setUserRole('ospite');
        }
      } else if (!viewParam && !roleParam && !hasPersonalParam) {
        // Cold-start default ONLY: never overwrite currentTab if user has selected another view
        if (!currentTab || currentTab === 'public') {
          setCurrentTab('public');
          if (!isFromAdmin && !roleParam) {
            setUserRole('ospite');
          }
        }
        return;
      } else if (viewParam === 'discente' || viewParam === 'student' || roleParam === 'discente' || discenteParam) {
        setCurrentTab('discente');
        setUserRole(isFromAdmin ? (fromParam as any) : 'discente');
        const target = discenteParam || idParam || badgeParam;
        if (target) {
          const found = discenti.find((d) => isParticipantMatch(d, target));
          if (found) setSelectedDiscenteId(found.id);
          else setSelectedDiscenteId(target);
        }
      } else if (viewParam === 'faculty' || viewParam === 'tutor' || roleParam === 'faculty' || facultyParam) {
        setCurrentTab('faculty');
        setUserRole(isFromAdmin ? (fromParam as any) : 'faculty');
        const target = facultyParam || idParam || badgeParam;
        if (target) {
          const found = faculty.find((f) => isParticipantMatch(f, target));
          if (found) {
            setSelectedFacultyId(found.id);
            if (found.assignedTeamId) setActiveFacultyTeamId(found.assignedTeamId);
          } else {
            setSelectedFacultyId(target);
          }
        }
      } else if (
        viewParam === 'tecnici' ||
        viewParam === 'tecnico' ||
        viewParam === 'technician' ||
        viewParam === 'tech' ||
        roleParam === 'tecnico' ||
        techParam
      ) {
        setCurrentTab('tecnici');
        setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
        const target = techParam || idParam || badgeParam;
        if (target) {
          const found = technicians.find((t) => isParticipantMatch(t, target));
          if (found) setSelectedTechnicianId(found.id);
          else setSelectedTechnicianId(target);
        }
      } else if (viewParam === 'attore' || params.get('attore') || roleParam === 'attore') {
        setCurrentTab('attore');
        setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
        const actorParam = params.get('attore');
        const target = actorParam || idParam || badgeParam;
        if (target) {
          const found = (actors || []).find((a) => isParticipantMatch(a, target));
          if (found) setSelectedActorId(found.id);
          else setSelectedActorId(target);
        }
      } else if (viewParam === 'truccatore' || params.get('truccatore')) {
        setCurrentTab('truccatore');
        setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
        const truccatoreParam = params.get('truccatore');
        const target = truccatoreParam || idParam || badgeParam;
        if (target) {
          const found = (makeupArtists || []).find((m) => isParticipantMatch(m, target));
          if (found) setSelectedMakeupArtistId(found.id);
          else setSelectedMakeupArtistId(target);
        }
      } else if (viewParam === 'trucco' || viewParam === 'moulage') {
        setCurrentTab('trucco');
        setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
      } else if (
        viewParam === 'master' ||
        roleParam === 'master' ||
        params.get('master') ||
        params.get('pin') === '251201' ||
        params.get('code') === '251201'
      ) {
        setCurrentTab('master');
        setUserRole('master');
      } else if (viewParam === 'direttori' || viewParam === 'director' || roleParam === 'direttore' || direttoreParam) {
        setCurrentTab('direttori');
        setUserRole('direttore');
        const target = direttoreParam || idParam || badgeParam;
        if (target) {
          const found = directors.find((d) => isParticipantMatch(d, target));
          if (found) setSelectedDirectorId(found.id);
          else setSelectedDirectorId(target);
        }
      } else if (viewParam === 'regia' || roleParam === 'regia' || regiaParam) {
        setCurrentTab('regia');
        setUserRole('regia');
        const target = regiaParam || idParam || badgeParam;
        if (target) {
          const found = regiaStaff.find((r) => isParticipantMatch(r, target));
          if (found) setSelectedRegiaId(found.id);
          else setSelectedRegiaId(target);
        }
      } else if (viewParam === 'regia_asset' || viewParam === 'asset') {
        setCurrentTab('regia_asset');
        setUserRole('regia');
      } else if (viewParam === 'ospite' || viewParam === 'guest' || roleParam === 'ospite' || guestParam) {
        // Guests are classified to simply view the public timeline
        setCurrentTab('public');
        setUserRole(isFromAdmin ? (fromParam as any) : 'ospite');
        const target = guestParam || idParam || badgeParam;
        if (target) {
          const found = guests.find((g) => isParticipantMatch(g, target));
          if (found) setSelectedGuestId(found.id);
        }
      }

      // 2. If badgeParam or idParam was supplied without viewParam, resolve participant automatically
      if (!viewParam && (badgeParam || idParam)) {
        const query = (badgeParam || idParam)!;

        // Check Discenti
        const foundDisc = discenti.find((d) => isParticipantMatch(d, query));
        if (foundDisc) {
          setSelectedDiscenteId(foundDisc.id);
          setCurrentTab('discente');
          setUserRole('discente');
          return;
        }

        // Check Faculty
        const foundFac = faculty.find((f) => isParticipantMatch(f, query));
        if (foundFac) {
          setSelectedFacultyId(foundFac.id);
          if (foundFac.assignedTeamId) setActiveFacultyTeamId(foundFac.assignedTeamId);
          setCurrentTab('faculty');
          setUserRole('faculty');
          return;
        }

        // Check Technicians
        const foundTech = technicians.find((t) => isParticipantMatch(t, query));
        if (foundTech) {
          setSelectedTechnicianId(foundTech.id);
          setCurrentTab('tecnici');
          setUserRole('tecnico');
          return;
        }

        // Check Directors
        const foundDir = directors.find((d) => isParticipantMatch(d, query));
        if (foundDir) {
          setSelectedDirectorId(foundDir.id);
          setCurrentTab('direttori');
          setUserRole('direttore');
          return;
        }

        // Check Regia
        const foundReg = regiaStaff.find((r) => isParticipantMatch(r, query));
        if (foundReg) {
          setSelectedRegiaId(foundReg.id);
          setCurrentTab('regia');
          setUserRole('regia');
          return;
        }

        // Check Makeup Artists
        const foundTruc = (makeupArtists || []).find((m) => isParticipantMatch(m, query));
        if (foundTruc) {
          setSelectedMakeupArtistId(foundTruc.id);
          setCurrentTab('truccatore');
          setUserRole('tecnico');
          return;
        }

        // Check Actors (ATT-01 .. ATT-08 / ACT-01 .. ACT-08)
        const foundActor = (actors || []).find((a) => isParticipantMatch(a, query));
        if (foundActor) {
          setSelectedActorId(foundActor.id);
          setCurrentTab('attore');
          setUserRole(isFromAdmin ? (fromParam as any) : 'tecnico');
          return;
        }

        // Check Guests - Simply show the public view
        const foundGuest = guests.find((g) => isParticipantMatch(g, query));
        if (foundGuest) {
          setSelectedGuestId(foundGuest.id);
          setCurrentTab('public');
          setUserRole('ospite');
          return;
        }
      }
    }
  }, [
    discenti,
    faculty,
    technicians,
    makeupArtists,
    actors,
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

  // Handle dynamic in-app URL navigation, popstate or external scan events without reload
  useEffect(() => {
    const handleUrlChange = () => {
      lastProcessedSearchRef.current = null;
      if (typeof window !== 'undefined') {
        const currentSearch = window.location.search;
        if (currentSearch) {
          const params = new URLSearchParams(currentSearch);
          const q =
            params.get('badge') ||
            params.get('id') ||
            params.get('discente') ||
            params.get('faculty') ||
            params.get('tecnico') ||
            params.get('attore') ||
            params.get('truccatore');
          if (q) {
            const resolved = resolveParticipantByQuery(q, {
              discenti,
              faculty,
              technicians,
              directors,
              regiaStaff,
              guests,
              teams,
              makeupArtists,
              actors,
            });
            if (resolved) {
              const { person, category, team } = resolved;
              if (category === 'discenti') {
                setSelectedDiscenteId(person.id);
                setCurrentTab('discente');
                setUserRole('discente');
              } else if (category === 'faculty') {
                setSelectedFacultyId(person.id);
                if (team?.id || (person as any).assignedTeamId) {
                  setActiveFacultyTeamId(team?.id || (person as any).assignedTeamId);
                }
                setCurrentTab('faculty');
                setUserRole('faculty');
              } else if (category === 'tecnici') {
                setSelectedTechnicianId(person.id);
                setCurrentTab('tecnici');
                setUserRole('tecnico');
              } else if (category === 'attori') {
                setSelectedActorId(person.id);
                setCurrentTab('attore');
                setUserRole('tecnico');
              } else if (category === 'truccatori') {
                setSelectedMakeupArtistId(person.id);
                setCurrentTab('truccatore');
                setUserRole('tecnico');
              } else if (category === 'direttori') {
                setSelectedDirectorId(person.id);
                setCurrentTab('direttori');
                setUserRole('direttore');
              } else if (category === 'regia') {
                setSelectedRegiaId(person.id);
                setCurrentTab('regia');
                setUserRole('regia');
              } else if (category === 'ospiti') {
                setSelectedGuestId(person.id);
                setCurrentTab('public');
                setUserRole('ospite');
              }
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('trauma_qr_navigate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('trauma_qr_navigate', handleUrlChange);
    };
  }, [
    discenti,
    faculty,
    technicians,
    directors,
    regiaStaff,
    guests,
    teams,
    makeupArtists,
    actors,
    setCurrentTab,
    setUserRole,
    setSelectedDiscenteId,
    setSelectedFacultyId,
    setSelectedTechnicianId,
    setSelectedDirectorId,
    setSelectedRegiaId,
    setSelectedGuestId,
    setActiveFacultyTeamId,
  ]);

  const renderActiveView = () => {
    if (currentTab === 'master') return <MasterView />;
    if (currentTab === 'public') return <PublicTimelineView />;
    if (currentTab === 'discente') return <DiscenteView />;
    if (currentTab === 'faculty') return <FacultyView />;
    if (currentTab === 'tecnici') return <TecniciView />;
    if (currentTab === 'regia') return <RegiaView />;
    if (currentTab === 'direttori') return <DirettoriView />;
    if (currentTab === 'ospite') return <PublicTimelineView />;
    if (currentTab === 'scenari' || currentTab === 'catalog') return <ScenariMasterListView />;
    if (currentTab === 'protesi') return <ProtesiCatalogView />;
    if (currentTab === 'attore') {
      return <ActorPersonalView actorId={selectedActorId} />;
    }
    if (currentTab === 'truccatore') {
      return (
        <TruccatorePersonalMobileView
          artistId={selectedMakeupArtistId || undefined}
          onExitStandalone={() => setCurrentTab('trucco')}
        />
      );
    }
    if (currentTab === 'trucco' || currentTab === 'moulage') return <TruccoView />;
    if (currentTab === 'regia_asset' || currentTab === 'asset') return <RegiaAssetDashboardView />;

    // Main Role-based View
    switch (userRole) {
      case 'master':
        return <MasterView />;
      case 'regia':
        return <RegiaView />;
      case 'ospite':
        return <PublicTimelineView />;
      case 'direttore':
      default:
        return <DirettoriView />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Real-time Suspension Emergency Banner (Highest Priority) */}
      <CourseSuspensionBanner />

      {/* Origin Banner when view is opened in a new window from Master, Regia or Direzione (Hidden in Fullscreen Mode) */}
      {!isFullscreenMode && openedByRole && (
        <div className="bg-amber-500 text-black px-3 sm:px-6 py-1.5 font-mono text-xs font-bold flex items-center justify-between border-b-2 border-amber-600 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-amber-400 text-[10px] font-black uppercase">
              {openedByRole === 'master'
                ? '★ FINESTRA APERTA DA MASTER'
                : openedByRole === 'regia'
                ? 'FINESTRA APERTA DA REGIA'
                : 'FINESTRA APERTA DA DIREZIONE'}
            </span>
            <span className="hidden sm:inline text-neutral-900 text-[11px]">
              {language === 'en'
                ? 'Dedicated window opened for multi-screen monitoring & station operations.'
                : 'Finestra indipendente per monitoraggio multi-schermo e supporto postazione.'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={navigateBack}
              className="px-2.5 py-1 bg-black hover:bg-neutral-800 text-white rounded font-black text-[11px] uppercase tracking-wider cursor-pointer flex items-center gap-1 transition-colors shadow-sm"
              title={
                openedByRole === 'master'
                  ? (language === 'en' ? 'Back to Master' : 'Torna al Master')
                  : openedByRole === 'regia'
                  ? (language === 'en' ? 'Back to Regia' : 'Torna alla Regia')
                  : (language === 'en' ? 'Back to Directors' : 'Torna ai Direttori')
              }
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>
                {openedByRole === 'master'
                  ? (language === 'en' ? 'Back to Master' : 'Torna al Master')
                  : openedByRole === 'regia'
                  ? (language === 'en' ? 'Back to Regia' : 'Torna alla Regia')
                  : (language === 'en' ? 'Back to Directors' : 'Torna ai Direttori')}
              </span>
            </button>
            <button
              onClick={() => window.close()}
              className="px-2 py-1 bg-neutral-900/15 hover:bg-neutral-900/30 text-black rounded text-[11px] font-bold uppercase cursor-pointer"
              title={language === 'en' ? 'Close window' : 'Chiudi questa finestra'}
            >
              ✕ {language === 'en' ? 'Close' : 'Chiudi'}
            </button>
          </div>
        </div>
      )}

      {/* Main Simulation Navigation & Control Bar (Hidden in Fullscreen or in Truccatore/Actor Mobile Standalone View) */}
      {!isFullscreenMode && currentTab !== 'truccatore' && currentTab !== 'attore' && (
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      {/* Floating Exit Fullscreen Control for Training Rooms */}
      {isFullscreenMode && (
        <div className="fixed top-3 right-3 z-[60] flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-950/90 border border-neutral-700 rounded-lg font-mono text-xs font-bold text-neutral-200 shadow-xl backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-400 font-black">
              {language === 'en' ? `D${activeDay}/S${activeSlotIndex + 1}` : `G${activeDay}/F${activeSlotIndex + 1}`}
            </span>
            <span className="text-neutral-600">|</span>
            <span className="tabular-nums text-white font-black">
              T-{String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}
            </span>
          </div>

          <button
            type="button"
            id="floating-tactical-map-btn"
            onClick={() => setIsTacticalMapOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950/90 hover:bg-emerald-500 text-emerald-400 hover:text-black border-2 border-emerald-500/80 hover:border-emerald-300 rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-2xl backdrop-blur-md transition-all cursor-pointer opacity-85 hover:opacity-100 group"
            title={language === 'en' ? 'Open Tactical Combat Map & Blueprint' : 'Apri Mappa Tattica Operativa e Comprensorio'}
          >
            <Compass className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400 group-hover:text-black" />
            <span>{language === 'en' ? 'MAP' : 'MAPPA'}</span>
          </button>

          <button
            type="button"
            id="floating-exit-fullscreen-btn"
            onClick={toggleFullscreenMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950/90 hover:bg-orange-500 text-amber-400 hover:text-black border-2 border-amber-500/80 hover:border-orange-300 rounded-lg font-mono text-xs font-black uppercase tracking-wider shadow-2xl backdrop-blur-md transition-all cursor-pointer opacity-85 hover:opacity-100 group"
            title={
              language === 'en'
                ? 'Exit Fullscreen Mode (or press ESC)'
                : 'Esci dalla Modalità Schermo Intero (oppure premi ESC)'
            }
          >
            <Minimize2 className="w-3.5 h-3.5 stroke-[2.5] group-hover:scale-110 transition-transform" />
            <span>{language === 'en' ? 'EXIT FULLSCREEN' : 'ESCI SCHERMO INTERO'}</span>
            <span className="hidden md:inline-block px-1.5 py-0.2 bg-neutral-900 group-hover:bg-black/20 text-[9px] text-neutral-400 group-hover:text-black rounded border border-neutral-700 group-hover:border-black/30">
              ESC
            </span>
          </button>
        </div>
      )}

      {/* Offline Status & Stale Data Banner */}
      <OfflineReadOnlyBanner />
      <OfflinePreloadProgress />

      {/* Scenario Block Active Standby Indicator (Classrooms, Learners & Tutors) */}
      <div className="max-w-[1920px] mx-auto w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-1">
        <MacroBlockStandbyIndicator />
      </div>

      {/* Free Direct Access Banner (Visible ONLY in Public View when not in Fullscreen Mode) */}
      {!isFullscreenMode && (currentTab === 'public' || currentTab === 'ospite') && <FreeAccessBanner />}

      {/* Dynamic Content Body - Fluid & Adaptive across Mobile, Tablet, and Desktop (Expanded in Fullscreen Mode) */}
      <main
        className={
          isFullscreenMode
            ? 'flex-1 w-full max-w-full mx-auto px-2 sm:px-4 md:px-6 pt-3 pb-6 transition-all'
            : 'flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 pb-12 transition-all'
        }
      >
        <ErrorBoundary>
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      {/* Trauma Center Footer - Hidden in Fullscreen Mode or Truccatore/Actor Standalone Mobile Mode */}
      {!isFullscreenMode && currentTab !== 'truccatore' && currentTab !== 'attore' && (
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
                  {language === 'en' ? '// ADVANCED TRAUMA MANAGEMENT DAY 02 & DAY 03' : '// GESTIONE AVANZATA TRAUMA DAY 02 & DAY 03'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
              <span className="font-bold text-neutral-300">
                {language === 'en' ? '70 TRAINEES • 12 TEAMS • 4 GROUPS' : '70 DISCENTI • 12 SQUADRE • 4 GRUPPI'}
              </span>
              <span>|</span>
              <span className="text-orange-400 font-bold uppercase tracking-wider">
                {language === 'en' ? 'REAL-TIME MULTI-SCREEN SYNC' : 'SINCRONIZZAZIONE SCHERMI REAL-TIME'}
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* Quick Rollback Toast Notification (Active 60s following schedule modification) */}
      {activeRollbackToast?.visible && (
        <QuickRollbackToast
          description={activeRollbackToast.description}
          onRollback={rollbackScheduleModification}
          onDismiss={dismissRollbackToast}
        />
      )}

      {/* Global Audit Log Drawer */}
      <AuditLogPanel isOpen={isAuditLogOpen} onClose={() => setIsAuditLogOpen(false)} />

      {/* Offline Intent Review Panel (for Regia / Master to review proposals made during offline operations) */}
      <IntentReviewPanel isOpen={isIntentReviewOpen} onClose={() => setIsIntentReviewOpen(false)} />

      {/* Regia Gate Expiration Priority Modal (Blocks start until explicit authorization) */}
      <CourseStartGateAuthorizationModal />

      {/* Regia Scenario Macro-Block Start Confirmation Modal (Prompts at start of each 90-min block) */}
      <ScenarioBlockConfirmationModal />

      {/* Interactive Tactical Combat Map Multi-Layer Modal */}
      <TacticalMapModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="Visuale Pubblica • Trauma Sim HITTER">
      <CourseProvider>
        <CourseMainContent />
      </CourseProvider>
    </ErrorBoundary>
  );
}
