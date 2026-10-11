import { Box } from 'lucide-react';
import ModelPreview from './ModelPreview';
import type { ModelEntry } from '../../lib/types';

export default function EmptyWorkspace({
  preview,
  showPreview,
}: {
  preview: ModelEntry | null;
  showPreview: boolean;
}) {
  return (
    <section className="relative h-full">
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-500 ${
          showPreview ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-line">
          <Box className="h-14 w-14 text-ink-400" strokeWidth={1.25} aria-hidden />
        </div>
        <h2 className="mt-8 text-2xl font-semibold text-ink-900">
          Your 3D workspace is ready
        </h2>
        <p className="mt-2 text-base text-ink-600">
          Select a model to load the viewer.
        </p>
      </div>

      {preview && (
        <div
          aria-hidden={!showPreview}
          className={`absolute inset-0 transition-opacity duration-500 ${
            showPreview ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ModelPreview path={preview.path} active={showPreview} />
          <div className="absolute inset-x-0 bottom-12 text-center">
            <p className="text-2xl font-semibold text-ink-900">{preview.name}</p>
            <p className="mt-1 text-sm text-ink-600">Click to start dissecting</p>
          </div>
        </div>
      )}
    </section>
  );
}
