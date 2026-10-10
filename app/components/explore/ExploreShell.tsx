'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import ModelGallery from '../model-selection/ModelGallery';
import EmptyWorkspace from '../model-selection/EmptyWorkspace';
import InfoPanel from '../panel/InfoPanel';
import Sidebar from '../sidebar/Sidebar';
import ModelViewer from '../viewer/ModelViewer';
import { getModel } from '../../data/models';
import { ORGAN_INFO, FALLBACK } from '../../data/organInfo';
import useVisibility from '../../hooks/useVisibility';

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE = { duration: 0.45, ease: EASE };

export default function ExploreShell({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const model = segment ? getModel(segment) : undefined;
  const slug = model?.slug ?? null;

  const [selected, setSelected] = useState<string | null>(null);
  const [meshes, setMeshes] = useState<string[]>([]);
  const { visibility, toggle, toggleGroup, reset } = useVisibility();
  const [stateSlug, setStateSlug] = useState(slug);
  const [viewerPath, setViewerPath] = useState(model?.path);
  const [galleryMounted, setGalleryMounted] = useState(!model);
  const [resetSignal, setResetSignal] = useState(0);

  if (slug !== stateSlug) {
    setStateSlug(slug);
    setSelected(null);
    setMeshes([]);
    reset();
  }

  if (model && model.path !== viewerPath) {
    setViewerPath(model.path);
  }

  if (!model && !galleryMounted) {
    setGalleryMounted(true);
  }

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative h-dvh w-full overflow-hidden bg-background">
        <motion.div
          className="absolute inset-0"
          style={{ pointerEvents: model ? 'auto' : 'none' }}
          animate={{ opacity: model ? 1 : 0 }}
          transition={SLIDE}
          onAnimationComplete={() => {
            if (!model) setViewerPath(undefined);
          }}
        >
          <ModelViewer
            path={viewerPath}
            active={!!model}
            resetSignal={resetSignal}
            selected={selected}
            onSelect={setSelected}
            visibility={visibility}
            onMeshesLoaded={setMeshes}
          />
        </motion.div>

        {galleryMounted && (
          <motion.div
            className="fixed inset-y-4 left-4 z-10 w-[calc(100%-2rem)] max-w-104.5 sm:inset-y-6 sm:left-6"
            initial={false}
            animate={
              model
                ? { x: 'calc(-100% - 24px)', opacity: 0 }
                : { x: 0, opacity: 1 }
            }
            transition={SLIDE}
            inert={!!model}
            style={{ pointerEvents: model ? 'none' : 'auto' }}
          >
            <ModelGallery active={!model} />
          </motion.div>
        )}

        <AnimatePresence initial={false}>

          {!model && (
            <motion.div
              key="workspace"
              className="pointer-events-none fixed inset-y-0 right-0 left-110.5 hidden md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SLIDE}
            >
              <EmptyWorkspace />
            </motion.div>
          )}

          {model && (
            <motion.div
              key="back"
              className="fixed top-6 left-6 z-10"
              initial={{ x: -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -80, opacity: 0 }}
              transition={SLIDE}
            >
              <Link
                href="/explore"
                aria-label="Back to models"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-600 shadow-md backdrop-blur transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </motion.div>
          )}

          {model && (
            <motion.div
              key="sidebar"
              className="fixed top-6 right-6 z-10"
              initial={{ x: 'calc(100% + 24px)', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 'calc(100% + 24px)', opacity: 0 }}
              transition={{ ...SLIDE, delay: 0.1 }}
            >
              <Sidebar
                meshes={meshes}
                visibility={visibility}
                onToggle={toggle}
                onToggleGroup={toggleGroup}
              />
            </motion.div>
          )}

          {model && (
            <motion.div
              key="reset"
              className="fixed right-6 bottom-6 z-10"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ ...SLIDE, delay: 0.15 }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setResetSignal((n) => n + 1);
                }}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-full bg-white px-4 py-4 text-slate-700 backdrop-blur transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <RefreshCw className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {model && (
          <InfoPanel
            part={selected ? ORGAN_INFO[selected] ?? FALLBACK : null}
            onClose={() => setSelected(null)}
          />
        )}

        {children}
      </main>
    </MotionConfig>
  );
}
