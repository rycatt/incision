import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ModelPreview from './ModelPreview';

const MODELS = [
  { name: 'Duck', category: 'Vertebrate', path: '/models/duck.glb', href: '/' },
  { name: 'Benchy', category: '3D Print', path: '/models/Benchy.glb', href: '/' },
];

export default function ModelGallery() {
  return (
    <main className="h-dvh overflow-hidden bg-neutral-100">
      <aside className="fixed inset-y-4 left-4 flex w-[calc(100%-2rem)] max-w-104.5 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl sm:inset-y-6 sm:left-6">
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
            key={model.path}
            href={model.href}
            aria-label={`Explore the ${model.name.toLowerCase()} model`}
            className="group flex h-81.25 w-full max-w-92.5 shrink-0 flex-col overflow-hidden rounded-[14px] border border-blue-300 bg-white transition-all duration-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="h-[70%] bg-neutral-50">
              <ModelPreview path={model.path} />
            </div>

            <div className="flex h-[30%] items-center justify-between px-6">
              <div>
                <p className="text-lg font-bold text-neutral-900">{model.name}</p>
                <p className="text-sm text-neutral-500">{model.category}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
              </span>
            </div>
          </Link>
          ))}
        </div>
      </aside>
    </main>
  );
}
