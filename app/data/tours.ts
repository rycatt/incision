export type TourStep = {
  title: string;
  body: string;
  targets: string[];
};

export const TOURS: Record<string, TourStep[]> = {
  frog: [
    { title: 'Welcome', body: '...', targets: [] },
    { title: 'External Anatomy', body: '...', targets: ['Skin'] },
    { title: 'Digestive System', body: '...', targets: ['Liver', 'Stomach'] },
  ],
};

export const DEFAULT_TOUR: TourStep[] = [
  { title: 'Welcome', body: 'Explore the model below.', targets: [] },
];