export type OrganInfo = { label: string; description: string };

export type Group = { id: string; label: string; members: string[] };

export type Layer = { members: string[]; fadeAt: number };

export type ModelEntry = { slug: string; name: string; category: string; path: string };
