import type { Group } from '../types/anatomy';

// Fill `members` with the exact mesh names from your GLB (as they appear
// in the console log "Mesh names in this GLB").
// Groups with empty members arrays are hidden in the sidebar.
export const GROUPS: Group[] = [
  { id: 'digestive',  label: 'Digestive System',  members: ['Bench_Battens', 'Bench_Floor_Glides'] },
  { id: 'circulatory', label: 'Circulatory System', members: [] },
  { id: 'respiratory', label: 'Respiratory System', members: [] },
  { id: 'urogenital',  label: 'Urogenital System',  members: [] },
  { id: 'skeletal',    label: 'Skeletal System',    members: [] },
  { id: 'external',    label: 'External Anatomy',   members: [] },
  // Example once you have names:
  // { id: 'digestive', label: 'Digestive System', members: ['Liver', 'Stomach', 'SmallIntestine'] },
];
