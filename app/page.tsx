'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Layers, MessageSquare } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Guided Tour',
    body: 'Walk through each system step by step. The camera frames every part as you go, so you always know what you are looking at.',
  },
  {
    icon: Layers,
    title: 'Explore Freely',
    body: 'Toggle systems on and off, click any organ to read its details, and orbit the full model in 3D.',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    body: 'Ask questions about any part. Get plain-language answers grounded in the model you are looking at.',
  },
];

const TEAM = [
  { name: 'Full Name', role: 'Frontend' },
  { name: 'Full Name', role: '3D Modeling' },
  { name: 'Full Name', role: 'Backend' },
  { name: 'Full Name', role: 'UI / UX' },
];

const HACKATHON = {
  name: 'Hackathon Name',
  date: 'Month Year',
  location: 'City, State',
};

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      {/* Soft radial glow backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(120, 140, 255, 0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col px-6 pt-28 pb-20 sm:pt-36">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-6 flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium tracking-wide text-slate-600 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Interactive 3D Dissection
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="mb-4 max-w-3xl text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-7xl"
        >
          Incision
        </motion.h1>

        {/* Motto */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
          className="mb-8 text-xl italic text-slate-500 sm:text-2xl"
        >
          Dissect everything. Harm nothing.
        </motion.p>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-600"
        >
          A guided, interactive dissection lab. Walk through the frog system by
          system, then explore every organ in full 3D — click, rotate, and ask
          questions as you go.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="mb-24 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            Open the lab
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-sm text-slate-400">
            No install. Runs in your browser.
          </span>
        </motion.div>

        {/* Features */}
        <div className="mb-28 grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.2 + i * 0.05,
                }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 backdrop-blur"
              >
                <Icon className="mb-4 h-5 w-5 text-slate-700" />
                <h3 className="mb-2 text-base font-medium text-slate-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {f.body}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Team + Hackathon */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
          className="grid gap-10 border-t border-slate-200 pt-10 sm:grid-cols-2"
        >
          <div>
            <h2 className="mb-1 text-sm font-medium uppercase tracking-[0.15em] text-slate-400">
              Team
            </h2>
            <ul className="mt-4 space-y-2">
              {TEAM.map((m, i) => (
                <li
                  key={i}
                  className="flex items-baseline justify-between border-b border-slate-100 pb-2 text-sm last:border-none"
                >
                  <span className="text-slate-900">{m.name}</span>
                  <span className="text-slate-400">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-1 text-sm font-medium uppercase tracking-[0.15em] text-slate-400">
              Built At
            </h2>
            <p className="mt-4 text-lg font-medium text-slate-900">
              {HACKATHON.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {HACKATHON.date} · {HACKATHON.location}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}