import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import ModelPreview from './components/gallery/ModelPreview';

const FACTS = [
  { value: '12', label: 'organs' },
  { value: '5', label: 'body systems' },
  { value: '360°', label: 'rotation' },
];

const HALFTONE_W = 900;
const HALFTONE_H = 640;
const HALFTONE_STEP = 13;
const HALFTONE_MAX_R = 6.4;

function halftonePath() {
  let d = '';
  for (let row = 0; row * HALFTONE_STEP <= HALFTONE_H; row++) {
    const y = HALFTONE_H - row * HALFTONE_STEP;
    const offset = row % 2 ? HALFTONE_STEP / 2 : 0;
    for (let x = offset; x <= HALFTONE_W; x += HALFTONE_STEP) {
      const t = Math.hypot(x / HALFTONE_W, (HALFTONE_H - y) / HALFTONE_H);
      if (t >= 1) continue;
      const jitter = 0.75 + 0.5 * Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1);
      const r = HALFTONE_MAX_R * Math.pow(1 - t, 1.6) * jitter;
      if (r < 0.35) continue;
      const rr = r.toFixed(2);
      d += `M${(x - r).toFixed(1)} ${y}a${rr} ${rr} 0 1 0 ${(2 * r).toFixed(2)} 0a${rr} ${rr} 0 1 0 ${(-2 * r).toFixed(2)} 0`;
    }
  }
  return d;
}

const HALFTONE = halftonePath();

export default function Home() {
  return (
    <main className="bg-app relative min-h-dvh overflow-hidden text-ink-900">
      <svg
        aria-hidden
        viewBox={`0 0 ${HALFTONE_W} ${HALFTONE_H}`}
        preserveAspectRatio="xMinYMax slice"
        className="pointer-events-none absolute bottom-0 left-0 h-[70vh] w-[45vw] text-ink-900 opacity-[0.3]"
      >
        <path d={HALFTONE} fill="currentColor" />
      </svg>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pt-8 pb-20 lg:grid-cols-[1.05fr_1fr] lg:pt-14">
        <div>
          <h1 className="font-semibold font-display text-7xl leading-none tracking-tight sm:text-8xl">
            Incision
          </h1>
          <p className="font-display text-3xl text-ink-700 italic sm:text-4xl">
            Dissect anything. Harm nothing.
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
