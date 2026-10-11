export type OrganInfo = { label: string; description: string };

export type Group = { id: string; label: string; members: string[] };

export type Layer = { members: string[]; fadeAt: number; minOpacity?: number };

export type ModelEntry = { slug: string; name: string; category: string; path: string };

export type TourStep = {
  title: string;
  body: string;
  targets: string[];
};

export type ChatMessage = { role: 'user' | 'model'; text: string };

export type ModelContent = {
  parts: Record<string, OrganInfo>;
  groups: Group[];
  tour: TourStep[];
};
