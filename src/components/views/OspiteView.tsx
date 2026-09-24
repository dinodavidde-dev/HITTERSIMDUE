import React from 'react';
import { PublicTimelineView } from './PublicTimelineView';

/**
 * Visuale per partecipanti classificati come Ospiti.
 * Come da direttiva operativa, ai partecipanti classificati come ospiti
 * viene mostrata semplicemente la visuale pubblica (PublicTimelineView).
 */
export const OspiteView: React.FC = () => {
  return <PublicTimelineView />;
};
