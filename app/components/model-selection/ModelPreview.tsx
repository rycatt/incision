'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Bounds, Center, Environment } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

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

export default function ModelPreview({ path }: { path: string }) {
  return (
    <Canvas
      camera={{ position: [0, 1, 4], fov: 35 }}
      dpr={[1, 2]}
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-3, 2, -4]} intensity={1} />
      <Environment preset="studio" />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.5}>
          <Turntable>
            <Center>
              <PreviewModel path={path} />
            </Center>
          </Turntable>
        </Bounds>
      </Suspense>
    </Canvas>
  );
}
