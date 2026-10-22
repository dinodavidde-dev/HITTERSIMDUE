import React from 'react';
import { ActorProgressStatus } from '../../types';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';

export interface ActorProgressMetaItem {
  status: ActorProgressStatus;
  step: number;
  pct: number;
  labelIt: string;
  shortIt: string;
  labelEn: string;
  shortEn: string;
  badgeClass: string;
  barColorClass: string;
  activeBtnClass: string;
}

export const ACTOR_PROGRESS_ORDER: ActorProgressStatus[] = [
  'STANDBY',
  'IN_PREPARAZIONE',
  'PRONTO_T0',
  'IN_SCENARIO',
  'RESET_SMONTAGGIO',
];

export const ACTOR_PROGRESS_META: Record<ActorProgressStatus, ActorProgressMetaItem> = {
  STANDBY: {
    status: 'STANDBY',
    step: 1,
    pct: 20,
    labelIt: 'Standby / In Attesa',
    shortIt: 'Standby',
    labelEn: 'Standby / Waiting',
    shortEn: 'Standby',
    badgeClass: 'bg-neutral-900 text-neutral-300 border-neutral-700',
    barColorClass: 'bg-neutral-500',
    activeBtnClass: 'bg-neutral-700 text-white border-neutral-400',
  },
  IN_PREPARAZIONE: {
    status: 'IN_PREPARAZIONE',
    step: 2,
    pct: 50,
    labelIt: 'In Preparazione Trucco',
    shortIt: 'In Prep.',
    labelEn: 'In Makeup Prep',
    shortEn: 'In Prep',
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500',
    barColorClass: 'bg-amber-500',
    activeBtnClass: 'bg-amber-500 text-black border-amber-300 font-black',
  },
  PRONTO_T0: {
    status: 'PRONTO_T0',
    step: 3,
    pct: 100,
    labelIt: 'Pronto T0 (Allestito)',
    shortIt: 'Pronto T0',
    labelEn: 'Ready T0',
    shortEn: 'Ready T0',
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500',
    barColorClass: 'bg-emerald-500',
    activeBtnClass: 'bg-emerald-500 text-black border-emerald-300 font-black',
  },
  IN_SCENARIO: {
    status: 'IN_SCENARIO',
    step: 4,
    pct: 100,
    labelIt: 'In Scenario Attivo',
    shortIt: 'In Scenario',
    labelEn: 'In Active Scenario',
    shortEn: 'In Scenario',
    badgeClass: 'bg-cyan-950/90 text-cyan-200 border-cyan-400',
    barColorClass: 'bg-cyan-400',
    activeBtnClass: 'bg-cyan-500 text-black border-cyan-300 font-black',
  },
  RESET_SMONTAGGIO: {
    status: 'RESET_SMONTAGGIO',
    step: 5,
    pct: 100,
    labelIt: 'Reset / Smontaggio',
    shortIt: 'Reset',
    labelEn: 'Reset / Strike',
    shortEn: 'Reset',
    badgeClass: 'bg-purple-950/90 text-purple-200 border-purple-500',
    barColorClass: 'bg-purple-500',
    activeBtnClass: 'bg-purple-600 text-white border-purple-300 font-black',
  },
};

export const getStatusIcon = (status: ActorProgressStatus, className = 'w-3.5 h-3.5') => {
  switch (status) {
    case 'STANDBY':
      return <Clock className={className} />;
    case 'IN_PREPARAZIONE':
      return <Sparkles className={className} />;
    case 'PRONTO_T0':
      return <CheckCircle2 className={className} />;
    case 'IN_SCENARIO':
      return <Play className={className} />;
    case 'RESET_SMONTAGGIO':
      return <RotateCcw className={className} />;
  }
};

interface ActorProgressStatusControlProps {
  status?: ActorProgressStatus;
  updatedAt?: string;
  updatedBy?: string;
  onSelectStatus: (nextStatus: ActorProgressStatus) => void;
  compact?: boolean;
  isEn?: boolean;
}

export const ActorProgressStatusControl: React.FC<ActorProgressStatusControlProps> = ({
  status = 'STANDBY',
  updatedAt,
  updatedBy,
  onSelectStatus,
  compact = false,
  isEn = false,
}) => {
  const currentMeta = ACTOR_PROGRESS_META[status] || ACTOR_PROGRESS_META.STANDBY;

  if (compact) {
    return (
      <div
        className="space-y-1.5 pt-1.5 border-t border-neutral-800/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className={`px-1.5 py-0.5 text-[9px] font-black uppercase border flex items-center gap-1 ${currentMeta.badgeClass}`}
          >
            {getStatusIcon(currentMeta.status, 'w-2.5 h-2.5')}
            <span>{isEn ? currentMeta.shortEn : currentMeta.shortIt}</span>
          </span>
          {updatedAt && (
            <span className="text-[9px] text-neutral-500 tabular-nums">{updatedAt}</span>
          )}
        </div>

        {/* 5-Step Segmented Bar */}
        <div className="grid grid-cols-5 gap-0.5 h-1.5 bg-neutral-900">
          {ACTOR_PROGRESS_ORDER.map((st, idx) => {
            const active = idx < currentMeta.step;
            return (
              <div
                key={st}
                className={`h-full transition-colors ${
                  active ? currentMeta.barColorClass : 'bg-neutral-800'
                }`}
              />
            );
          })}
        </div>

        {/* Quick 5-Button Selector */}
        <div className="grid grid-cols-5 gap-0.5">
          {ACTOR_PROGRESS_ORDER.map((st) => {
            const meta = ACTOR_PROGRESS_META[st];
            const isSelected = st === status;
            return (
              <button
                key={st}
                type="button"
                onClick={() => onSelectStatus(st)}
                title={isEn ? meta.labelEn : meta.labelIt}
                className={`py-1 px-0.5 text-[9px] font-bold border transition-colors cursor-pointer truncate ${
                  isSelected
                    ? meta.activeBtnClass
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {isEn ? meta.shortEn : meta.shortIt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 border border-neutral-800 p-2.5 space-y-2 font-mono">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[10px] text-neutral-400 uppercase font-bold">
          {isEn ? 'Actor Progress Status (5 Stages):' : 'Stato Avanzamento Attore (5 Fasi):'}
        </span>

        <span
          className={`px-2 py-0.5 text-[10px] font-black uppercase border flex items-center gap-1 ${currentMeta.badgeClass}`}
        >
          {getStatusIcon(currentMeta.status, 'w-3 h-3')}
          <span>
            {currentMeta.step}/5 • {isEn ? currentMeta.labelEn : currentMeta.labelIt}
          </span>
        </span>
      </div>

      {/* 5-Stage Visual Stepper Bar */}
      <div className="grid grid-cols-5 gap-1 h-2 bg-neutral-900 p-0.5">
        {ACTOR_PROGRESS_ORDER.map((st, idx) => {
          const isReached = idx < currentMeta.step;
          return (
            <div
              key={st}
              className={`h-full transition-colors ${
                isReached ? currentMeta.barColorClass : 'bg-neutral-800'
              }`}
            />
          );
        })}
      </div>

      {/* 5 Interactive Buttons for Makeup Artists */}
      <div className="grid grid-cols-5 gap-1">
        {ACTOR_PROGRESS_ORDER.map((st) => {
          const meta = ACTOR_PROGRESS_META[st];
          const isSelected = st === status;
          return (
            <button
              key={st}
              type="button"
              onClick={() => onSelectStatus(st)}
              className={`py-1.5 px-1 text-[10px] font-bold border transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                isSelected
                  ? meta.activeBtnClass
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-pink-500/60 hover:text-white'
              }`}
            >
              {getStatusIcon(st, 'w-3 h-3')}
              <span className="truncate max-w-full">{isEn ? meta.shortEn : meta.shortIt}</span>
            </button>
          );
        })}
      </div>

      {/* Timestamp & Author Metadata */}
      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5 border-t border-neutral-900">
        <span>
          {status === 'PRONTO_T0'
            ? '✓ Checklist Paziente & Regia CH-3 Sincronizzate'
            : 'Clicca "Pronto T0" per validare checklist e avvisare Regia'}
        </span>
        {(updatedAt || updatedBy) && (
          <span className="tabular-nums text-neutral-300">
            {updatedBy ? `${updatedBy.split('•')[0].trim()} ` : ''}
            {updatedAt ? `@ ${updatedAt}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};
