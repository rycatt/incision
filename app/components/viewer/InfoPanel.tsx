import { X } from 'lucide-react';
import type { OrganInfo } from '../../lib/types';

export default function InfoPanel({
  part,
  onClose,
}: {
  part: OrganInfo | null;
  onClose: () => void;
}) {
  if (!part) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-24 left-6 z-10 max-h-[calc(100dvh-12.5rem)] w-[calc(100%-3rem)] max-w-80 overflow-y-auto rounded-2xl panel p-6 transition duration-200 ease-out starting:-translate-x-2 starting:opacity-0 md:top-64 md:max-h-[calc(100dvh-17rem)]"
    >
      <button
        onClick={onClose}
        aria-label="Close info panel"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
      >
        <X className="h-4 w-4 cursor-pointer" />
      </button>

      <p className="text-xs font-medium tracking-widest text-accent uppercase">
        Selected part
      </p>
      <h2 className="mt-2 pr-8 text-2xl font-bold text-ink-900">{part.label}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
        {part.description}
      </p>
    </aside>
  );
}
