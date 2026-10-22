import React, { useEffect } from 'react';
import { useCourse } from '../../context/CourseContext';
import { ResponsiveTacticalMap } from './ResponsiveTacticalMap';

export { ResponsiveTacticalMap };

export const TacticalMapModal: React.FC = () => {
  const { isTacticalMapOpen, setIsTacticalMapOpen } = useCourse();

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    if (!isTacticalMapOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTacticalMapOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTacticalMapOpen, setIsTacticalMapOpen]);

  if (!isTacticalMapOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mappa Tattica Comprensorio"
      className="fixed inset-0 z-[120] bg-neutral-950 flex flex-col select-none overflow-hidden animate-fadeIn"
    >
      <ResponsiveTacticalMap onClose={() => setIsTacticalMapOpen(false)} />
    </div>
  );
};
