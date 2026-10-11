import { X } from 'lucide-react';
import type { OrganInfo } from '../../lib/types';
import PartQuiz from './PartQuiz';

export default function InfoPanel({
  part,
  partId,
  quizLabel,
  modelName,
  onClose,
}: {
  part: OrganInfo | null;
  partId: string;
  quizLabel: string;
  modelName: string;
  onClose: () => void;
}) {
  if (!part) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-1/2 left-6 z-10 max-h-[calc(100dvh-10rem)] w-[calc(100%-3rem)] max-w-80 -translate-y-1/2 overflow-y-auto rounded-2xl panel p-6 transition duration-200 ease-out starting:-translate-x-2 starting:opacity-0"
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

      {part.functions && part.functions.length > 0 && (
        <section className="mt-5 border-t border-line pt-5">
          <h3 className="text-base font-semibold text-ink-900">Key functions</h3>
          <ul className="mt-2.5 space-y-2">
            {part.functions.map((fn) => (
              <li key={fn} className="flex gap-3 text-[15px] leading-snug text-ink-700">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {fn}
              </li>
            ))}
          </ul>
        </section>
      )}

      <PartQuiz key={`${modelName}:${partId}`} modelName={modelName} partLabel={quizLabel} />
    </aside>
  );
}
