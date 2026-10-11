'use client';

import { motion } from 'motion/react';
import type { TourStep } from '../../lib/types';

const SLIDE = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

export default function TourCard({
    step,
    index,
    total,
    isLast,
    onNext,
    onSkip,
    onFinish,
  }: {
    step: TourStep;
    index: number;
    total: number;
    isLast: boolean;
    onNext: () => void;
    onSkip: () => void;
    onFinish: () => void;
  }) {
    return (
      <motion.div
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -40, opacity: 0 }}
        transition={SLIDE}
        className="w-80 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur border border-slate-200"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Step {index + 1} of {total}
          </span>
          {!isLast && (
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] text-slate-400 underline-offset-2 hover:text-slate-700 hover:underline"
            >
              Skip
            </button>
          )}
        </div>
  
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          {step.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          {step.body}
        </p>
  
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-4 bg-slate-900'
                    : 'w-1.5 bg-slate-300'
                }`}
              />
            ))}
          </div>
  
          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Next
            </button>
          )}
        </div>
      </motion.div>
    );
  }