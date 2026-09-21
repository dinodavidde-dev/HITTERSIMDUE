import React from 'react';
import { SimulatorPatient } from '../types';
import { useCourse } from '../context/CourseContext';
import { getScenarioStatusInfo } from '../utils/scenarioStatusHelper';

interface ScenarioStatusBadgeProps {
  patient: SimulatorPatient;
  className?: string;
}

export const ScenarioStatusBadge: React.FC<ScenarioStatusBadgeProps> = ({ patient, className = '' }) => {
  const { activeDay, activeSlotIndex, evaluations, faculty } = useCourse();
  const info = getScenarioStatusInfo(patient, activeDay, activeSlotIndex, evaluations, faculty);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`w-2.5 h-2.5 rounded-full ${info.dotColor}`} />
      <span className={info.badgeClass}>
        {info.text}
      </span>
    </div>
  );
};
