import type { ModelEntry } from '../lib/types';

export const MODELS: ModelEntry[] = [
  { slug: 'frog', name: 'Frog', category: 'Amphibian', path: '/models/AnatomicalFrog.glb' },
];

export function getModel(slug: string) {
  return MODELS.find((model) => model.slug === slug);
}
