import { Box } from 'lucide-react';

export default function EmptyWorkspace() {
  return (
    <section className="fixed inset-y-0 right-0 left-110.5 hidden flex-col items-center justify-center px-8 text-center md:flex">
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-slate-300 lg:h-32 lg:w-32">
        <Box className="h-14 w-14 text-slate-400" strokeWidth={1.25} aria-hidden />
      </div>
      <h2 className="mt-8 text-2xl font-semibold text-slate-800">
        Your 3D workspace is ready
      </h2>
      <p className="mt-2 text-base text-slate-500">
        Select a model to load the viewer.
      </p>
    </section>
  );
}
