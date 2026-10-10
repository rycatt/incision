'use client';

import { useState } from 'react';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';

const MODEL_CONFIG = {
  path: '/models/duck.glb',
  position: [0, -0.5, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number], 
  scale: 1,
};

function Model({ onMeshClick }: { onMeshClick: (name: string) => void }) {
  const gltf = useGLTF(MODEL_CONFIG.path);

  return (
    <primitive
      object={gltf.scene}
      position={MODEL_CONFIG.position}
      rotation={MODEL_CONFIG.rotation}
      scale={MODEL_CONFIG.scale}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onMeshClick(event.object.name || 'Unnamed mesh');
      }}
    />
  );
}

export default function Home() {
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {selectedMesh && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1,
            maxWidth: 'calc(100vw - 40p x)',
            padding: '12px 16px',
            border: '1px solid rgba(20, 30, 40, 0.16)',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.94)',
            color: '#17212b',
            fontSize: 14,
          }}
        >
          Mesh: {selectedMesh}
        </div>
      )}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <directionalLight position={[-3, 2, -4]} intensity={1} />
        <Environment preset="studio" />

          <Model onMeshClick={setSelectedMesh} />

        <OrbitControls />
      </Canvas>
    </div>
  );
}