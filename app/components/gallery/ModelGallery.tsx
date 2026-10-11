import Link from 'next/link';
import { ArrowUpRight, ChevronLeft } from 'lucide-react';
import ModelPreview from './ModelPreview';
import { MODELS } from '../../data/models';

export default function ModelGallery({
  active = true,
  onHover,
}: {
  active?: boolean;
  onHover?: (slug: string | null) => void;
}) {
  return (
    <aside className="panel-muted flex h-full flex-col overflow-hidden rounded-2xl">
      <header className="shrink-0 px-6 pt-6 pb-5">
        <Link
          href="/"
          aria-label="Back to home"
          className="panel mb-5 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[28px] font-bold leading-tight text-ink-900">
          Select a Model
        </h1>
        <p className="mt-2 text-lg text-ink-600">
          Choose 3D model to explore its anatomy.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pt-5 pb-6">
        {MODELS.map((model) => (
          <Link
            key={model.slug}
            href={`/explore/${model.slug}`}
            aria-label={`Explore the ${model.name.toLowerCase()} model`}
            onMouseEnter={() => onHover?.(model.slug)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(model.slug)}
            onBlur={() => onHover?.(null)}
            className="group bg-preview relative block h-81.25 w-full max-w-92.5 shrink-0 overflow-hidden rounded-[22px] ring-1 ring-ink-300 transition-shadow duration-200 hover:shadow-lg hover:shadow-ink-900/10 hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105">
              <ModelPreview path={model.path} active={active} />
            </div>

            <span className="panel absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full text-accent transition-colors group-hover:bg-accent-soft">
              <ArrowUpRight className="h-5 w-5" strokeWidth={2.25} aria-hidden />
            </span>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-ink-200 via-ink-100/70 to-transparent px-5 pt-20 pb-4">
              <p className="text-lg font-semibold text-ink-900">{model.name}</p>
              <p className="text-sm text-ink-600">{model.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
