import type { ReactNode } from 'react';
import ExploreShell from '../components/ExploreShell';

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return <ExploreShell>{children}</ExploreShell>;
}
