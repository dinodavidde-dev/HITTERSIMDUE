import React from 'react';
import { SimulatorPatient } from '../types';
import { useCourse } from '../context/CourseContext';
import { getScenarioStatusInfo } from '../utils/scenarioStatusHelper';

interface ScenarioStatusBadgeProps {
  patient: SimulatorPatient;
  className?: string;
}

export const ScenarioStatusBadge: React.FC<ScenarioStatusBadgeProps> = ({ patient, className = '' }) => {
  const { activeDay, activeSlotIndex, evaluations, faculty, language } = useCourse();
  const isEn = language === 'en';
  const info = getScenarioStatusInfo(patient, activeDay, activeSlotIndex, evaluations, faculty);

  const getLocalizedStatusText = () => {
    if (!isEn) return info.text;
    switch (info.status) {
      case 'VALUTATO':
        return 'EVALUATED';
      case 'DA_VALUTARE':
        return 'TO EVALUATE';
      case 'IN_CORSO':
        return 'IN PROGRESS';
      case 'DA_FARE':
        return 'PENDING';
      default:
        return info.text;
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${info.dotColor}`} />
      <span className={info.badgeClass}>
        {getLocalizedStatusText()}
      </span>
    </div>
  );
};
