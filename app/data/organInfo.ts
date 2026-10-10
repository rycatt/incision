import type { OrganInfo } from '../types/anatomy';

export const ORGAN_INFO: Record<string, OrganInfo> = {
  LOD3spShape: { label: 'Heart', description: 'Pumps blood through the body.' },
};

export const FALLBACK: OrganInfo = {
  label: 'Unknown Part',
  description: 'No information has been added for this part yet.',
};
