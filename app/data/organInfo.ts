import type { OrganInfo } from '../types/anatomy';

export const ORGAN_INFO: Record<string, OrganInfo> = {
  LOD3spShape: { label: 'Heart', description: 'Pumps blood through the body.' },
  Bench_Battens: { label: 'Liver', description: 'Processes nutrients and detoxifies the body.' },
  Bench_Floor_Glides: { label: 'Kidney', description: 'Filters waste from the blood.' },
  Bench_Brass_Buckles: { label: 'Lungs', description: 'Facilitates gas exchange for respiration.' },
  Bench_Slats: { label: 'Brain', description: 'Controls body functions and processes information.' },
};

export const FALLBACK: OrganInfo = {
  label: 'Unknown Part',
  description: 'No information has been added for this part yet.',
};
