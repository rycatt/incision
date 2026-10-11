import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ModelPreview from './components/gallery/ModelPreview';

const FACTS = [
  { value: '12', label: 'organs' },
  { value: '5', label: 'body systems' },
  { value: '360°', label: 'rotation' },
];

export default function Home() {
  return (
    <main className="bg-app min-h-dvh text-ink-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-8 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
        <div>
          <h1 className="font-semibold font-display text-7xl leading-none tracking-tight sm:text-8xl">
            Incision
          </h1>
          <p className="font-display text-3xl text-ink-700 italic sm:text-4xl">
            Dissect everything. Harm nothing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Start dissecting
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="text-sm text-ink-600">No install. Runs in your browser.</span>
          </div>
        </div>

        <div>
          <Link
            href="/explore/frog"
            aria-label="Open the frog specimen"
            className="group panel block overflow-hidden rounded-[22px] transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs tracking-wide text-ink-600 uppercase">
              <span>Specimen 01</span>
              <span>Frog · Anatomical model</span>
            </div>
            <div className="bg-preview relative h-90 sm:h-105">
              <ModelPreview path="/models/AnatomicalFrog.glb" />
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm">
              <span className="text-ink-600">Open the specimen in the lab</span>
              <ArrowUpRight
                className="h-4 w-4 text-ink-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink-900"
                aria-hidden
              />
            </div>
          </Link>
          <dl className="mt-8 flex items-center justify-center   gap-10 border-t border-line pt-6">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd className="text-3xl font-semibold tracking-tight">{fact.value}</dd>
                <dd className="mt-1 font-mono text-xs tracking-wide text-ink-600 uppercase">
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
