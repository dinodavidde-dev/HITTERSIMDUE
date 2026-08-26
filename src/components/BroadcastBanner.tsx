import React from 'react';
import { useCourse } from '../context/CourseContext';
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Flame, Info, X } from 'lucide-react';
import { AlertType } from '../types';

export const BroadcastBanner: React.FC = () => {
  const { latestAlert, dismissAlert } = useCourse();

  if (!latestAlert || !latestAlert.active) {
    return null;
  }

  const getAlertStyles = (type: AlertType) => {
    switch (type) {
      case 'emergency':
        return {
          bg: 'bg-red-600 text-white border-b-4 border-neutral-100 shadow-2xl',
          badge: 'bg-black text-white font-black uppercase tracking-widest px-2 py-0.5 border border-white',
          icon: <Flame className="w-5 h-5 text-white animate-pulse" />,
        };
      case 'warning':
        return {
          bg: 'bg-orange-500 text-black border-b-4 border-black shadow-2xl',
          badge: 'bg-black text-white font-black uppercase tracking-widest px-2 py-0.5',
          icon: <AlertTriangle className="w-5 h-5 text-black" />,
        };
      case 'phase_change':
        return {
          bg: 'bg-neutral-100 text-black border-b-4 border-orange-500 shadow-2xl',
          badge: 'bg-orange-500 text-black font-black uppercase tracking-widest px-2 py-0.5',
          icon: <Bell className="w-5 h-5 text-black animate-bounce" />,
        };
      case 'pause':
        return {
          bg: 'bg-neutral-900 text-neutral-100 border-b-4 border-neutral-100 shadow-2xl',
          badge: 'bg-neutral-100 text-black font-black uppercase tracking-widest px-2 py-0.5',
          icon: <CheckCircle2 className="w-5 h-5 text-orange-400" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-neutral-900 text-white border-b-4 border-orange-500 shadow-2xl',
          badge: 'bg-orange-500 text-black font-black uppercase tracking-widest px-2 py-0.5',
          icon: <Info className="w-5 h-5 text-orange-400" />,
        };
    }
  };

  const style = getAlertStyles(latestAlert.type);

  return (
    <div
      id="broadcast-banner"
      className={`sticky top-0 z-50 px-4 py-3.5 transition-all duration-300 ${style.bg}`}
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="p-2.5 bg-black/20 flex-shrink-0">
            {style.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black tracking-[0.2em] uppercase text-[10px] px-2.5 py-0.5 bg-black text-white">
                BROADCAST {latestAlert.timestamp}
              </span>
              <span className={`text-[10px] ${style.badge}`}>
                DA: {latestAlert.senderName}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-black/20 font-mono font-bold uppercase">
                TARGET: {latestAlert.targetGroups.join(', ')}
              </span>
            </div>
            <h4 className="font-black text-base sm:text-lg uppercase tracking-tight truncate mt-0.5">
              {latestAlert.title}
            </h4>
            <p className="text-xs sm:text-sm font-semibold opacity-95 line-clamp-2">
              {latestAlert.message}
            </p>
          </div>
        </div>

        <button
          id="dismiss-broadcast-btn"
          onClick={() => dismissAlert(latestAlert.id)}
          className="p-2 hover:bg-black/30 text-current transition-colors flex-shrink-0 cursor-pointer"
          title="Chiudi avviso"
          aria-label="Chiudi avviso"
        >
          <X className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
