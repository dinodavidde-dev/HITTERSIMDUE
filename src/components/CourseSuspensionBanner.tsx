import React, { useState } from 'react';
import { useCourse } from '../context/CourseContext';
import { AlertOctagon, Bell, Play, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export const CourseSuspensionBanner: React.FC = () => {
  const { language, suspensionInfo, resumeCourse, userRole, facultyAuthSession } = useCourse();
  const isEn = language === 'en';
  const [isConfirmingResume, setIsConfirmingResume] = useState(false);

  if (!suspensionInfo.isSuspended) {
    return null;
  }

  const canResume = userRole === 'direttore' || (userRole === 'faculty' && facultyAuthSession.isAuthorized);

  const handleResumeClick = () => {
    const actor = userRole === 'direttore' ? (isEn ? 'Course Direction' : 'Direzione Corso') : (facultyAuthSession.facultyName || 'Faculty');
    resumeCourse(actor);
    setIsConfirmingResume(false);
  };

  return (
    <div
      id="course-suspension-emergency-banner"
      className="bg-red-600 border-b-4 border-black text-white px-4 py-3 shadow-2xl sticky top-0 z-50 animate-pulse"
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black text-red-500 border-2 border-white flex-shrink-0 animate-bounce">
            <AlertOctagon className="w-6 h-6 stroke-[3]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-black text-white font-black text-[11px] uppercase tracking-widest px-2.5 py-0.5 border border-white">
                🔴 {isEn ? 'COURSE TEMPORARILY SUSPENDED' : 'CORSO TEMPORANEAMENTE SOSPESO'}
              </span>
              {suspensionInfo.suspendedAt && (
                <span className="bg-black/40 text-yellow-300 font-mono text-xs font-black px-2 py-0.5">
                  {isEn ? 'STOP AT ' : 'STOP ORE '}{suspensionInfo.suspendedAt}
                </span>
              )}
              {suspensionInfo.suspendedBy && (
                <span className="text-[11px] font-bold text-white/90">
                  {isEn ? 'BY: ' : 'DA: '}{suspensionInfo.suspendedBy}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base font-black tracking-tight mt-0.5 text-white">
              {suspensionInfo.reason || (isEn ? 'Field activities suspended for educational/organizational alignment. Remain at your stations.' : 'Attività sul campo sospese per allineamento didattico/organizzativo. Rimanere nelle proprie postazioni.')}
            </p>
            <p className="text-xs font-semibold text-white/80">
              {isEn ? 'All teams, instructors and technicians must wait for instructions before resuming simulations.' : 'Tutte le squadre, docenti e tecnici devono attendere istruzioni prima di riprendere le simulazioni.'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        {canResume && (
          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto justify-end">
            {!isConfirmingResume ? (
              <button
                id="banner-resume-course-btn"
                onClick={() => setIsConfirmingResume(true)}
                className="w-full md:w-auto px-4 py-2 bg-black hover:bg-neutral-900 text-yellow-300 hover:text-white font-black text-xs uppercase tracking-widest border-2 border-white transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                title={isEn ? 'Unlock and resume course activities' : 'Sblocca e riprendi le attività del corso'}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isEn ? 'RESUME COURSE' : 'RIPRENDI CORSO'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-black p-1 border border-white">
                <span className="text-xs font-black text-yellow-300 px-2 uppercase">
                  {isEn ? 'Confirm resume?' : 'Confermi ripartenza?'}
                </span>
                <button
                  id="banner-confirm-resume-btn"
                  onClick={handleResumeClick}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  {isEn ? 'Yes, Resume' : 'Sì, Ripartenza'}
                </button>
                <button
                  onClick={() => setIsConfirmingResume(false)}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'Annulla'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
