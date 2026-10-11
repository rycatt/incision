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
    onBack,
    onSkip,
    onFinish,
  }: {
    step: TourStep;
    index: number;
    total: number;
    isLast: boolean;
    onNext: () => void;
    onBack: () => void;
    onSkip: () => void;
    onFinish: () => void;
  }) {
    return (
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={SLIDE}
        className="panel pointer-events-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-600">
            Step {index + 1} of {total}
          </span>
          {!isLast && (
            <button
              type="button"
              onClick={onSkip}
              className="cursor-pointer text-[11px] text-ink-600 underline-offset-2 hover:text-ink-900 hover:underline"
            >
              Skip
            </button>
          )}
        </div>
  
        <h3 className="mb-2 text-lg font-semibold text-ink-900">
          {step.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-ink-900">
          {step.body}
        </p>
  
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-4 bg-accent'
                    : 'w-1.5 bg-ink-300'
                }`}
              />
            ))}
          </div>
  
          <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-lg cursor-pointer bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Next
            </button>
          )}
          </div>
        </div>
      </motion.div>
    );
  }