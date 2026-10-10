'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Bounds, Center } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

const clay = new THREE.MeshStandardMaterial({ color: '#c4c4c4', roughness: 0.85 });

function ClayModel({ path }: { path: string }) {
  const { scene } = useGLTF(path);
  const model = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.material = clay;
    });
    return copy;
  }, [scene]);

  return <primitive object={model} />;
}

// Radians per second
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.2} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <Turntable>
            <Center>
              <ClayModel path={path} />
            </Center>
          </Turntable>
        </Bounds>
      </Suspense>
    </Canvas>
  );
}
