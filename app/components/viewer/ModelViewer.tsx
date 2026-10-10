'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Model from './Model';

export default function ModelViewer({
  selected,
  onSelect,
  visibility,
  onMeshesLoaded,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onMeshesLoaded: (names: string[]) => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 3 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-3, 2, -4]} intensity={1} />
      <Environment preset="studio" />

      <Suspense fallback={null}>
        <Model
          selected={selected}
          onSelect={onSelect}
          visibility={visibility}
          onMeshesLoaded={onMeshesLoaded}
        />
      </Suspense>

      <OrbitControls />
    </Canvas>
  );
}
