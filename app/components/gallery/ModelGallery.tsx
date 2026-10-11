import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ModelPreview from './ModelPreview';
import { MODELS } from '../../data/models';

export default function ModelGallery({ active = true }: { active?: boolean }) {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <header className="shrink-0 px-6 pt-6 pb-5">
        <h1 className="text-[28px] font-bold leading-tight text-neutral-900">
          Select a Model
        </h1>
        <p className="mt-2 text-lg text-neutral-500">
          Choose 3D model to explore its anatomy.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 pt-5 pb-6">
        {MODELS.map((model) => (
          <Link
            key={model.slug}
            href={`/explore/${model.slug}`}
            aria-label={`Explore the ${model.name.toLowerCase()} model`}
            className="group flex h-81.25 w-full max-w-92.5 shrink-0 flex-col overflow-hidden rounded-[14px] border border-brand/30 bg-white transition-all duration-200 hover:border-brand hover:shadow-lg hover:shadow-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <div className="h-[70%] bg-background">
              <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-110">
                <ModelPreview path={model.path} active={active} />
              </div>
            </div>

            <div className="flex h-[30%] items-center justify-between px-6">
              <div>
                <p className="text-lg font-bold text-neutral-900">{model.name}</p>
                <p className="text-sm text-neutral-500">{model.category}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/5 text-brand transition-colors group-hover:bg-brand/10">
                <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
