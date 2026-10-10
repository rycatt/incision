'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import { useState, useEffect, useRef, Suspense } from 'react';
import * as THREE from 'three';

const MODEL_CONFIG = {
  path: '/models/duck.glb',
  position: [0, 0, 0] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  scale: 1,
};

const ORGAN_INFO: Record<string, { label: string; description: string }> = {
  LOD3spShape:   { label: 'Heart',   description: 'Pumps blood through the body.' },
  
};

const FALLBACK = {
  label: 'Unknown Part',
  description: 'No information has been added for this part yet.',
};

function Model({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const gltf = useGLTF(MODEL_CONFIG.path);
  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.userData.organId = obj.name;
        if (!obj.userData.originalMaterial) {
          obj.userData.originalMaterial = obj.material;
        }
      }
    });
  }, [gltf]);

  useEffect(() => {
    const names: string[] = [];
    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) names.push(obj.name);
    });
    console.log('Mesh names in this GLB:', names);
  }, [gltf]);

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const id = obj.userData.organId;
      const isSelected = id === selected;
      const isHovered = hovered && id === hovered.userData.organId;

      if (isSelected || isHovered) {
        const mat = (obj.userData.originalMaterial as THREE.Material).clone();
        const std = mat as THREE.MeshStandardMaterial;
        if ('emissive' in std) {
          std.emissive = new THREE.Color(isSelected ? '#ffaa00' : '#66aaff');
          std.emissiveIntensity = isSelected ? 0.7 : 0.3;
        }
        obj.material = mat;
      } else {
        if (obj.material !== obj.userData.originalMaterial) {
          obj.material.dispose();
          obj.material = obj.userData.originalMaterial;
        }
      }
    });
  }, [gltf, selected, hovered]);

  return (
    <>
      <primitive
        object={gltf.scene}
        position={MODEL_CONFIG.position}
        rotation={MODEL_CONFIG.rotation}
        scale={MODEL_CONFIG.scale}
        onClick={(e: any) => {
          e.stopPropagation();
          const id = e.object.userData.organId;
          onSelect(id === selected ? null : id);
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          setHovered(e.object);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(null);
          document.body.style.cursor = 'auto';
        }}
      />
    </>
  );
}

function InfoPanel({
  organId,
  onClose,
}: {
  organId: string | null;
  onClose: () => void;
}) {
  if (!organId) return null;
  const info = ORGAN_INFO[organId] ?? FALLBACK;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 340,
        height: '100vh',
        background: 'rgba(15, 18, 28, 0.96)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: 28,
        overflowY: 'auto',
        zIndex: 10,
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          width: 28,
          height: 28,
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>

      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,170,0,0.8)',
          marginBottom: 8,
        }}
      >
        Selected
      </div>
      <h2 style={{ margin: '0 0 16px 0', fontSize: 24, fontWeight: 600 }}>
        {info.label}
      </h2>
      <p style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
        {info.description}
      </p>
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <h1
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 2,
          margin: 0,
          padding: '11px 16px',
          borderLeft: '4px solid #ff8b52',
          background: 'rgba(15, 18, 28, 0.94)',
          boxShadow: '0 8px 24px rgba(15, 18, 28, 0.2)',
          color: '#f5bd58',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        Beyond dissection
      </h1>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[3, 5, 4]} intensity={2} />
        <directionalLight position={[-3, 2, -4]} intensity={1} />
        <Environment preset="studio" />

        <Suspense fallback={null}>
          <Model selected={selected} onSelect={setSelected} />
        </Suspense>

        <OrbitControls />
      </Canvas>

      <InfoPanel organId={selected} onClose={() => setSelected(null)} />
    </div>
  );
}