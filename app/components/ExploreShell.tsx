'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import ModelGallery from './gallery/ModelGallery';
import EmptyWorkspace from './gallery/EmptyWorkspace';
import InfoPanel from './viewer/InfoPanel';
import Sidebar from './viewer/Sidebar';
import ModelViewer from './viewer/ModelViewer';
import { getModel } from '../data/models';
import useVisibility from '../lib/useVisibility';
import TourCard from './viewer/TourCard';
import { FALLBACK_PART, DEFAULT_TOUR } from '../data/defaults';
import useModelContent from '../lib/useModelContent';

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE = { duration: 0.45, ease: EASE };

export default function ExploreShell({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const model = segment ? getModel(segment) : undefined;
  const slug = model?.slug ?? null;

  const [selected, setSelected] = useState<string | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [meshes, setMeshes] = useState<string[]>([]);
  const { visibility, toggle, toggleGroup, reset } = useVisibility();
  const { content, ready: contentReady } = useModelContent(slug);
  const parts = content?.parts ?? {};
  const groups = content?.groups ?? [];
  const savedInfo = selected ? parts[selected] : undefined;
  const partTitle = selected ? savedInfo?.label ?? selected : null;
  const [stateSlug, setStateSlug] = useState(slug);
  const [viewerPath, setViewerPath] = useState(model?.path);
  const [galleryMounted, setGalleryMounted] = useState(!model);
  const [resetSignal, setResetSignal] = useState(0);
  const [mode, setMode] = useState<'tour' | 'explore'>('tour');
  const [tourIndex, setTourIndex] = useState(0);

  if (slug !== stateSlug) {
    setStateSlug(slug);
    setSelected(null);
    setMeshes([]);
    reset();
    setMode('tour');
    setTourIndex(0);
  }

  if (model && model.path !== viewerPath) {
    setViewerPath(model.path);
  }

  if (!model && !galleryMounted) {
    setGalleryMounted(true);
  }

  const tour = content?.tour.length ? content.tour : DEFAULT_TOUR;
  const tourStep = tour[tourIndex];
  const isLastStep = tourIndex === tour.length - 1;
  const touring = !!model && mode === 'tour';
  const organStep = !!tourStep?.targets.length;

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative h-dvh w-full overflow-hidden bg-app">
        <AnimatePresence>
          {touring && contentReady && (
            <motion.div
              key="tour-card"
              className={`pointer-events-none fixed inset-0 z-20 flex px-4 ${
                organStep
                  ? 'items-end justify-center pb-8 md:items-center md:justify-start md:pb-0 md:pl-6'
                  : 'items-end justify-center pb-8'
              }`}
            >
              <motion.div layout="position" transition={SLIDE}>
                <TourCard
                  step={tourStep}
                  index={tourIndex}
                  total={tour.length}
                  isLast={isLastStep}
                  onNext={() => setTourIndex((i) => Math.min(i + 1, tour.length - 1))}
                  onBack={() => setTourIndex((i) => Math.max(i - 1, 0))}
                  onSkip={() => setMode('explore')}
                  onFinish={() => setMode('explore')}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="absolute inset-0"
          style={{ pointerEvents: model && !touring ? 'auto' : 'none' }}
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
            onSelect={(id) => {
              setSelected(id);
              setSelectionCount((n) => n + 1);
            }}
            visibility={visibility}
            onMeshesLoaded={setMeshes}
            tourTargets={mode === 'tour' ? tourStep.targets : null}
            tourActive={mode === 'tour'}
          />
        </motion.div>

        {galleryMounted && (
          <motion.div
            className="fixed inset-y-4 left-4 z-10 w-[calc(100%-2rem)] max-w-104.5 sm:inset-y-6 sm:left-6"
            initial={false}
            animate={
              model
                ? { x: 'calc(-100% - 24px)' }
                : { x: 0 }
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
              initial={{ x: -80 }}
              animate={{ x: 0 }}
              exit={{ x: -80 }}
              transition={SLIDE}
            >
              <Link
                href="/explore"
                aria-label="Back to models"
                className="panel flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </motion.div>
          )}

          {model && !touring && (
            <motion.div
              key="sidebar"
              className="fixed top-6 right-6 z-10"
              initial={{ x: 'calc(100% + 24px)' }}
              animate={{ x: 0 }}
              exit={{ x: 'calc(100% + 24px)' }}
              transition={{ ...SLIDE, delay: 0.1 }}
            >
              <Sidebar
                meshes={meshes}
                parts={parts}
                groups={groups}
                visibility={visibility}
                onToggle={toggle}
                onToggleGroup={toggleGroup}
              />
            </motion.div>
          )}

          {model && !touring && (
            <motion.div
              key="reset"
              className="fixed right-6 bottom-6 z-10 flex items-center gap-3"
              initial={{ y: 96 }}
              animate={{ y: 0 }}
              exit={{ y: 96 }}
              transition={{ ...SLIDE, delay: 0.15 }}
            >
              <button
                type="button"
                aria-label="Reset view"
                onClick={() => {
                  setSelected(null);
                  setResetSignal((n) => n + 1);
                }}
                className="panel flex h-13 w-13 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-ink-100"
              >
                <RefreshCw className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {model && !touring && (
          <InfoPanel
            part={selected ? savedInfo ?? FALLBACK_PART : null}
            partId={`${selected}:${selectionCount}`}
            quizLabel={partTitle ?? ''}
            modelName={model.name}
            onClose={() => setSelected(null)}
          />
        )}

        {children}
      </main>
    </MotionConfig>
  );
}
