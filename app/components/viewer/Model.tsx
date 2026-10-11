'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useBounds } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree } from 'three-mesh-bvh';
import {
  MODEL_CONFIG,
  GHOST_OPACITY,
  HIGHLIGHT_COLORS,
  HOVER_TINT,
  UNSELECTED_OPACITY,
  HOVER_SPEED,
} from '../../data/settings';
import { LAYERS, FADE_BAND, FADE_SPEED } from '../../data/layers';
import type { Layer } from '../../lib/types';

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
  interactive = true,
  focusParts = null,
}: {
  path: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onMeshesLoaded: (names: string[]) => void;
  onSceneLoaded?: (s: THREE.Object3D) => void;
  interactive?: boolean;
  focusParts?: string[] | null;
}) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const parts = useMemo(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.userData.isPart = true;
        if (!obj.geometry.boundsTree) computeBoundsTree.call(obj.geometry);
        meshes.push(obj);
      }
    });
    return meshes;
  }, [scene]);
  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
  const activeHover = interactive ? hovered : null;
  const bounds = useBounds();
  const homeDistance = useRef<number | null>(null);

  const layerByName = useMemo(() => {
    const map = new Map<string, Layer>();
    LAYERS.forEach((layer) => layer.members.forEach((name) => map.set(name, layer)));
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
    const focus = selected ? [selected] : focusParts ?? [];
    const hasFocus = focus.some((name) => parts.some((part) => part.name === name));

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
      const isSelected = focus.includes(id);
      const isHovered = activeHover?.userData.organId === id;

      obj.userData.baseOpacity = isVisible ? 1 : GHOST_OPACITY;
      obj.userData.layerVisible = isVisible;
      obj.userData.selectTarget = isSelected ? 1 : 0;
      obj.userData.hoverTarget = isHovered && isVisible && !isSelected ? 1 : 0;
      obj.userData.dimTarget = hasFocus && !isSelected ? 1 : 0;
    });
  }, [parts, selected, focusParts, activeHover, visibility]);

  useFrame(({ camera, controls }, delta) => {
    const target = (controls as OrbitControlsImpl | null)?.target;
    if (!target) return;

    homeDistance.current ??= bounds.refresh().getSize().distance;
    const zoom = camera.position.distanceTo(target) / homeDistance.current;

    parts.forEach((obj) => {
      if (!obj.userData.ownedMaterial) return;

      const mat = obj.userData.ownedMaterial as THREE.MeshStandardMaterial;
      const layer = layerByName.get(obj.userData.organId);
      const inSelection = obj.userData.selectTarget === 1 || obj.userData.dimTarget === 1;
      const goal =
        layer === undefined || inSelection
          ? 1
          : THREE.MathUtils.smoothstep(zoom, layer.fadeAt - FADE_BAND, layer.fadeAt);
      const fade = THREE.MathUtils.damp(
        obj.userData.zoomFade ?? 1,
        goal,
        FADE_SPEED,
        delta
      );
      obj.userData.zoomFade = fade;
      const zoomOpacity = THREE.MathUtils.lerp(layer?.minOpacity ?? 0, 1, fade);

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
        : (obj.userData.baseOpacity ?? 1) * zoomOpacity * dimOpacity;
      const transparent = isSelected || opacity < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.opacity = opacity;
      mat.depthWrite = isSelected || !transparent;
      obj.renderOrder = isSelected ? 10 : 0;

      const shown = zoomOpacity > 0.01;
      const clickable = shown && fade > 0.5 && obj.userData.dimTarget !== 1;
      obj.visible = shown;
      obj.raycast = clickable && obj.userData.layerVisible !== false
        ? acceleratedRaycast
        : () => {};
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
