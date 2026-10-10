'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center, Bounds, useBounds } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Model from './Model';

const ZOOM_AMOUNT = 0.75;
const SMOOTHING = 4;

function FocusOnSelect({ selected }: { selected: string | null }) {
  const bounds = useBounds();
  const get = useThree((s) => s.get);
  const hasControls = useThree((s) => s.controls !== null);
  const goal = useRef<{ target: THREE.Vector3; position: THREE.Vector3 } | null>(null);
  const framed = useRef(false);

  useEffect(() => {
    const { camera, scene } = get();
    const controls = get().controls as OrbitControlsImpl | null;
    if (!controls) return;

    const modelBox = bounds.refresh().getSize().box.clone();
    let targetBox = modelBox;

    const part = selected ? scene.getObjectByName(selected) : undefined;
    if (part) {
      const partBox = new THREE.Box3().setFromObject(part);
      targetBox = new THREE.Box3(
        modelBox.min.clone().lerp(partBox.min, ZOOM_AMOUNT),
        modelBox.max.clone().lerp(partBox.max, ZOOM_AMOUNT)
      );
    }

    const { center, distance } = bounds.refresh(targetBox).getSize();
    const direction = camera.position.clone().sub(controls.target).normalize();
    const position = center.clone().addScaledVector(direction, distance);

    if (!framed.current) {
      camera.near = distance / 100;
      camera.far = distance * 100;
      camera.updateProjectionMatrix();
      camera.position.copy(position);
      controls.target.copy(center);
      controls.update();
      framed.current = true;
      return;
    }

    goal.current = { target: center, position };
  }, [selected, bounds, get, hasControls]);

  useEffect(() => {
    const controls = get().controls as OrbitControlsImpl | null;
    if (!controls) return;
    const stop = () => {
      goal.current = null;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [get, hasControls]);

  useFrame(({ camera, controls: c }, delta) => {
    const g = goal.current;
    const controls = c as OrbitControlsImpl | null;
    if (!g || !controls) return;

    const k = 1 - Math.exp(-SMOOTHING * delta);
    controls.target.lerp(g.target, k);
    camera.position.lerp(g.position, k);
    controls.update();

    if (
      camera.position.distanceToSquared(g.position) < 1e-8 &&
      controls.target.distanceToSquared(g.target) < 1e-8
    ) {
      goal.current = null;
    }
  });

  return null;
}

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
    <Canvas camera={{ position: [0, 0, 5], fov: 30 }} gl={{ antialias: true }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-3, 2, -4]} intensity={1} />
      <Environment preset="studio" />

      <Suspense fallback={null}>
        <Bounds margin={1.2}>
          <Center>
            <Model
              selected={selected}
              onSelect={onSelect}
              visibility={visibility}
              onMeshesLoaded={onMeshesLoaded}
            />
          </Center>
          <FocusOnSelect selected={selected} />
        </Bounds>
      </Suspense>

      <OrbitControls makeDefault />
    </Canvas>
  );
}
