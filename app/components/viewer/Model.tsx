'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useBounds } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import {
  MODEL_CONFIG,
  GHOST_OPACITY,
  HIGHLIGHT_COLORS,
  HOVER_TINT,
  UNSELECTED_OPACITY,
  HOVER_SPEED,
} from '../../data/settings';
import { LAYERS, FADE_BAND, FADE_SPEED } from '../../data/layers';

const HOVER_COLOR = new THREE.Color(HIGHLIGHT_COLORS.hover);
const SCRATCH_COLOR = new THREE.Color();

function partOf(obj: THREE.Object3D | null): THREE.Object3D | null {
  let current = obj;
  while (current && !current.userData.isPart) current = current.parent;
  return current;
}

export default function Model({
  path,
  selected,
  onSelect,
  visibility,
  onMeshesLoaded,
  interactive = true
}: {
  path: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onMeshesLoaded: (names: string[]) => void;
  onSceneLoaded?: (s: THREE.Object3D) => void;
  interactive?: boolean;
}) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const parts = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.userData.isPart = true;
        meshes.push(obj);
      }
    });
    return meshes;
  }, [scene]);
  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
  const activeHover = interactive ? hovered : null;
  const bounds = useBounds();
  const homeDistance = useRef<number | null>(null);

  const fadeAtByName = useMemo(() => {
    const map = new Map<string, number>();
    LAYERS.forEach((layer) =>
      layer.members.forEach((name) => map.set(name, layer.fadeAt))
    );
    return map;
  }, []);

  useEffect(() => {
    if (!interactive) document.body.style.cursor = 'auto';
  }, [interactive]);

  useEffect(() => {
    const names: string[] = [];
    parts.forEach((obj) => {
      obj.userData.organId = obj.name;
      if (!obj.userData.originalMaterial) {
        obj.userData.originalMaterial = obj.material;
      }
      if (obj.name && obj.name.trim().length > 0) {
        names.push(obj.name);
      }
    });
    console.log('Mesh names in this GLB:', names);
    onMeshesLoaded(names);
  }, [parts]);

  useEffect(() => {
    const hasSelection = !!selected && parts.some((part) => part.name === selected);

    parts.forEach((obj) => {
      if (!obj.userData.ownedMaterial) {
        const src = (obj.userData.originalMaterial ?? obj.material) as THREE.Material;
        const owned = src.clone();
        if ('emissive' in owned) {
          const std = owned as THREE.MeshStandardMaterial;
          obj.userData.baseEmissive = std.emissive
            .clone()
            .multiplyScalar(std.emissiveIntensity ?? 1);
        }
        obj.userData.ownedMaterial = owned;
        obj.material = owned;
      }

      const id = obj.userData.organId as string;
      const isVisible = visibility[id] !== false;
      const isSelected = id === selected;
      const isHovered = activeHover?.userData.organId === id;

      obj.userData.baseOpacity = isVisible ? 1 : GHOST_OPACITY;
      obj.userData.selectTarget = isSelected ? 1 : 0;
      obj.userData.hoverTarget = isHovered && isVisible && !isSelected ? 1 : 0;
      obj.userData.dimTarget = hasSelection && !isSelected ? 1 : 0;
    });
  }, [parts, selected, activeHover, visibility]);

  useFrame(({ camera, controls }, delta) => {
    const target = (controls as OrbitControlsImpl | null)?.target;
    if (!target) return;

    homeDistance.current ??= bounds.refresh().getSize().distance;
    const zoom = camera.position.distanceTo(target) / homeDistance.current;

    parts.forEach((obj) => {
      if (!obj.userData.ownedMaterial) return;

      const mat = obj.userData.ownedMaterial as THREE.MeshStandardMaterial;
      const fadeAt = fadeAtByName.get(obj.userData.organId);
      const inSelection = obj.userData.selectTarget === 1 || obj.userData.dimTarget === 1;
      const goal =
        fadeAt === undefined || inSelection
          ? 1
          : THREE.MathUtils.smoothstep(zoom, fadeAt - FADE_BAND, fadeAt);
      const fade = THREE.MathUtils.damp(
        obj.userData.zoomFade ?? 1,
        goal,
        FADE_SPEED,
        delta
      );
      obj.userData.zoomFade = fade;

      const hoverMix = THREE.MathUtils.damp(
        obj.userData.hoverMix ?? 0,
        obj.userData.hoverTarget ?? 0,
        HOVER_SPEED,
        delta
      );
      obj.userData.hoverMix = hoverMix;

      const dimMix = THREE.MathUtils.damp(
        obj.userData.dimMix ?? 0,
        obj.userData.dimTarget ?? 0,
        HOVER_SPEED,
        delta
      );
      obj.userData.dimMix = dimMix;

      if ('emissive' in mat) {
        mat.emissive
          .copy(obj.userData.baseEmissive ?? SCRATCH_COLOR.setRGB(0, 0, 0))
          .add(SCRATCH_COLOR.copy(HOVER_COLOR).multiplyScalar(HOVER_TINT * hoverMix));
        mat.emissiveIntensity = 1;
      }

      const isSelected = obj.userData.selectTarget === 1;
      const dimOpacity = THREE.MathUtils.lerp(1, UNSELECTED_OPACITY, dimMix);
      const opacity = isSelected
        ? 1
        : (obj.userData.baseOpacity ?? 1) * fade * dimOpacity;
      const transparent = isSelected || opacity < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.opacity = opacity;
      mat.depthWrite = isSelected || !transparent;
      obj.renderOrder = isSelected ? 10 : 0;

      const shown = fade > 0.01;
      obj.visible = shown;
      obj.raycast = shown ? THREE.Mesh.prototype.raycast : () => {};
    });
  });

  return (
    <>
      <primitive
        object={scene}
        position={MODEL_CONFIG.position}
        rotation={MODEL_CONFIG.rotation}
        scale={MODEL_CONFIG.scale}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (!interactive) return;
          e.stopPropagation();
          const part = partOf(e.object);
          if (!part) return;
          const id = part.userData.organId;
          onSelect(id);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          if (!interactive) return;
          e.stopPropagation();
          setHovered(partOf(e.object));
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (!interactive) return;
          setHovered(null);
          document.body.style.cursor = 'auto';
        }}
      />
    </>
  );
}
