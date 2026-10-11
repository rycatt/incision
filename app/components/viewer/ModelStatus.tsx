'use client';

import { Component, useEffect, type MouseEvent, type ReactNode } from 'react';
import { useProgress } from '@react-three/drei';

export function ModelLoader() {
  const { progress } = useProgress();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3"
    >
      <span
        aria-hidden
        className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-accent"
      />
      <p className="text-sm text-ink-600">
        Loading model…{' '}
        <span className="font-mono text-xs tabular-nums text-ink-500">{Math.round(progress)}%</span>
      </p>
    </div>
  );
}

export function OnLoaded({ onLoad }: { onLoad: () => void }) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);
  return null;
}

export class ModelErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.onRetry();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="absolute inset-0 flex items-center justify-center p-6">
        <div className="panel pointer-events-auto flex flex-col items-center gap-3 rounded-xl px-5 py-4 text-center">
          <p className="text-sm text-ink-700">Couldn&apos;t load the model.</p>
          <button
            type="button"
            onClick={this.retry}
            className="cursor-pointer rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
