'use client';

import { Suspense, useEffect, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center, Bounds, Grid, useBounds, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import Model from './Model';
import { ModelErrorBoundary, ModelLoader, OnLoaded } from './ModelStatus';

const ZOOM_AMOUNT = 1;
const SMOOTHING = 4;
const FLY_IN_DISTANCE = 2.5;
const DEFAULT_DIRECTION = new THREE.Vector3(0, 0, 1);
const FLOOR_GAP = 0.0;

function GridFloor({ target }: { target: RefObject<THREE.Group | null> }) {
  const ref = useRef<THREE.Mesh>(null);
  const placed = useRef(false);

  useFrame(() => {
    if (placed.current || !target.current || !ref.current) return;
    const box = new THREE.Box3().setFromObject(target.current);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const height = box.max.y - box.min.y;
    ref.current.position.set(center.x, box.min.y - height * FLOOR_GAP, center.z);
    ref.current.visible = true;
    placed.current = true;
  });

  return (
    <Grid
      ref={ref}
      visible={false}
      raycast={() => null}
      infiniteGrid
      cellSize={0.35}
      cellThickness={0.9}
      cellColor="#94a3b8"
      sectionSize={1}
      sectionThickness={1.3}
      sectionColor="#64748b"
      fadeDistance={9}
      fadeStrength={2.5}
      fadeFrom={0}
    />
  );
}

function FocusOnSelect({
  selected,
  resetSignal,
  tourTargets,
  tourActive, 
}: {
  selected: string | null;
  resetSignal: number;
  tourTargets: string[] | null;
  tourActive: boolean;
}) {
  const bounds = useBounds();
  const get = useThree((s) => s.get);
  const hasControls = useThree((s) => s.controls !== null);
  const goal = useRef<{ target: THREE.Vector3; position: THREE.Vector3 } | null>(null);
  const framed = useRef(false);
  const lastReset = useRef(resetSignal);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [scene, setScene] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const { camera, scene } = get();
    const controls = get().controls as OrbitControlsImpl | null;
    if (!controls) return;

    const modelBox = bounds.refresh().getSize().box.clone();
    let targetBox = modelBox;

    const focusNames = tourActive ? (tourTargets ?? []) : selected ? [selected] : [];
    const partBox = new THREE.Box3();
    focusNames.forEach((name) => {
      const part = scene.getObjectByName(name);
      if (part) partBox.expandByObject(part);
    });

    if (!partBox.isEmpty()) {
      targetBox = new THREE.Box3(
        modelBox.min.clone().lerp(partBox.min, ZOOM_AMOUNT),
        modelBox.max.clone().lerp(partBox.max, ZOOM_AMOUNT)
      );
    }

    const { center, distance } = bounds.refresh(targetBox).getSize();
    const isReset = resetSignal !== lastReset.current;
    lastReset.current = resetSignal;
    const direction = isReset
      ? DEFAULT_DIRECTION.clone()
      : camera.position.clone().sub(controls.target).normalize();
    const position = center.clone().addScaledVector(direction, distance);

    if (!framed.current) {
      camera.near = distance / 100;
      camera.far = distance * FLY_IN_DISTANCE * 100;
      camera.updateProjectionMatrix();
      camera.position.copy(center).addScaledVector(direction, distance * FLY_IN_DISTANCE);
      controls.target.copy(center);
      controls.update();
      framed.current = true;
    }

    goal.current = { target: center, position };
  }, [selected, resetSignal, tourTargets, tourActive, bounds, get, hasControls]);

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
    const offset = camera.position.clone().sub(controls.target);
    const goalOffset = g.position.clone().sub(g.target);
    const turn = new THREE.Quaternion().setFromUnitVectors(
      offset.clone().normalize(),
      goalOffset.clone().normalize()
    );
    const direction = offset
      .clone()
      .normalize()
      .applyQuaternion(new THREE.Quaternion().slerp(turn, k));
    const length = THREE.MathUtils.lerp(offset.length(), goalOffset.length(), k);

    controls.target.lerp(g.target, k);
    camera.position.copy(controls.target).addScaledVector(direction, length);
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
  path,
  active,
  resetSignal,
  selected,
  onSelect,
  visibility,
  onMeshesLoaded,
  tourTargets,
  tourActive,
}: {
  path?: string;
  active: boolean;
  resetSignal: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onMeshesLoaded: (names: string[]) => void;
  tourTargets: string[] | null;
  tourActive: boolean;
}) {
  const [attempt, setAttempt] = useState(0);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  const loading = !!path && loadedPath !== path;

  return (
    <ModelErrorBoundary
      key={attempt}
      onRetry={() => {
        if (path) useGLTF.clear(path);
        setLoadedPath(null);
        setAttempt((n) => n + 1);
      }}
    >
      <div
        className={`h-full w-full transition-opacity duration-700 ease-out ${loading ? 'opacity-0' : 'opacity-100'}`}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 30 }}
          gl={{ antialias: true }}
          frameloop={active ? 'always' : 'demand'}
          style={{ pointerEvents: tourActive ? 'none' : 'auto' }}
          onPointerMissed={() => {
            if (!tourActive) onSelect(null);
          }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <directionalLight position={[-3, 2, -4]} intensity={0.6} />
          <Environment preset="studio" environmentIntensity={0.6} />

          {path && (
            <Suspense key={path} fallback={null}>
              <Bounds margin={1.2}>
                <Center ref={modelRef}>
                  <Model
                    path={path}
                    selected={selected}
                    onSelect={onSelect}
                    visibility={visibility}
                    onMeshesLoaded={onMeshesLoaded}
                    interactive={!tourActive}
                    focusParts={tourActive ? tourTargets : null}
                  />
                </Center>
                <FocusOnSelect
                  selected={selected}
                  resetSignal={resetSignal}
                  tourTargets={tourTargets}
                  tourActive={tourActive}
                />
              </Bounds>
              <GridFloor target={modelRef} />
              <OnLoaded onLoad={() => setLoadedPath(path)} />
            </Suspense>
          )}

          <OrbitControls makeDefault enabled={!tourActive} zoomSpeed={1.8} />
        </Canvas>
      </div>
      {loading && <ModelLoader />}
    </ModelErrorBoundary>
  );
}
