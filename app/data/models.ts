import type { ModelEntry } from '../lib/types';

export const MODELS: ModelEntry[] = [
  { slug: 'helmet', name: 'Helmet', category: 'Vertebrate', path: '/models/helmet.glb' },
  { slug: 'duck', name: 'Duck', category: 'Vertebrate', path: '/models/duck.glb' },
  { slug: 'gallbladder', name: 'Gallbladder', category: 'organ', path: '/models/Galblader.glb' },
  { slug: 'bench', name: 'Bench', category: 'organ', path: '/models/Bench.glb' },
];

export function getModel(slug: string) {
  return MODELS.find((model) => model.slug === slug);
}
