import { X } from 'lucide-react';

export type PartInfo = { label: string; description: string };

export default function InfoPanel({
  part,
  onClose,
}: {
  part: PartInfo | null;
  onClose: () => void;
}) {
  if (!part) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed top-24 left-6 z-10 w-[calc(100%-3rem)] max-w-80 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur transition duration-200 ease-out starting:-translate-x-2 starting:opacity-0"
    >
      <button
        onClick={onClose}
        aria-label="Close info panel"
        className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>

      <p className="text-xs font-medium tracking-widest text-blue-600 uppercase">
        Selected part
      </p>
      <h2 className="mt-2 pr-8 text-2xl font-bold text-slate-900">{part.label}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
        {part.description}
      </p>
    </aside>
  );
}
