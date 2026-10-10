import type { ModelEntry } from '../types/anatomy';

export const MODELS: ModelEntry[] = [
  { slug: 'helmet', name: 'Helmet', category: 'Vertebrate', path: '/models/helmet.glb' },
  { slug: 'duck', name: 'Duck', category: 'Vertebrate', path: '/models/duck.glb' },
  { slug: 'bench', name: 'Bench', category: '3D Print', path: '/models/Bench.glb' },
];

export function getModel(slug: string) {
  return MODELS.find((model) => model.slug === slug);
}
