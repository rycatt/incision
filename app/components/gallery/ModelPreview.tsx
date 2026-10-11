'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Bounds, Center, Environment } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ModelErrorBoundary, ModelLoader, OnLoaded } from '../viewer/ModelStatus';

function PreviewModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  const model = useMemo(() => scene.clone(true), [scene]);

  return <primitive object={model} />;
}

const SPIN_SPEED = 0.3;

function Turntable({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * SPIN_SPEED;
  });
  return <group ref={ref}>{children}</group>;
}

export default function ModelPreview({
  path,
  active = true,
}: {
  path: string;
  active?: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const loaded = loadedPath === path;

  return (
    <ModelErrorBoundary
      key={attempt}
      onRetry={() => {
        useGLTF.clear(path);
        setLoadedPath(null);
        setAttempt((n) => n + 1);
      }}
    >
      <div
        className={`h-full w-full transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <Canvas
          camera={{ position: [0, 1, 4], fov: 35 }}
          dpr={[1, 2]}
          frameloop={active ? 'always' : 'never'}
          style={{ pointerEvents: 'none' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <directionalLight position={[-3, 2, -4]} intensity={0.6} />
          <Environment preset="studio" environmentIntensity={0.6} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.5}>
              <Turntable>
                <Center>
                  <PreviewModel path={path} />
                </Center>
              </Turntable>
            </Bounds>
            <OnLoaded onLoad={() => setLoadedPath(path)} />
          </Suspense>
        </Canvas>
      </div>
      {!loaded && <ModelLoader />}
    </ModelErrorBoundary>
  );
}
