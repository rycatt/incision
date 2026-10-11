import type { ModelContent, OrganInfo, TourStep } from '../lib/types';

export const FALLBACK_PART: OrganInfo = {
  label: 'Unknown Part',
  description: 'No information has been added for this part yet.',
};

export const DEFAULT_TOUR: TourStep[] = [
  { title: 'Welcome', body: 'Explore the model below.', targets: [] },
];

export const EMPTY_CONTENT: ModelContent = { parts: {}, groups: [], tour: [] };
