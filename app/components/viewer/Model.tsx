'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useGLTF, useBounds } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { MODEL_CONFIG, GHOST_OPACITY } from '../../data/settings';
import { LAYERS, FADE_BAND, FADE_SPEED } from '../../data/layers';

export default function Model({
  path,
  selected,
  onSelect,
  visibility,
  onMeshesLoaded,
}: {
  path: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
  visibility: Record<string, boolean>;
  onMeshesLoaded: (names: string[]) => void;
}) {
  const gltf = useGLTF(path);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);
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
    const names: string[] = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.userData.organId = obj.name;
        if (!obj.userData.originalMaterial) {
          obj.userData.originalMaterial = obj.material;
        }
        if (obj.name && obj.name.trim().length > 0) {
          names.push(obj.name);
        }
      }
    });
    console.log('Mesh names in this GLB:', names);
    onMeshesLoaded(names);
  }, [scene]);

  useEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      if (!obj.userData.ownedMaterial) {
        const src = obj.userData.originalMaterial as THREE.Material;
        obj.userData.ownedMaterial = src.clone();
        obj.material = obj.userData.ownedMaterial;
      }

      const mat = obj.userData.ownedMaterial as THREE.MeshStandardMaterial;
      const id = obj.userData.organId as string;
      const isVisible = visibility[id] !== false;
      const isSelected = id === selected;
      const isHovered = hovered?.userData.organId === id;

      obj.userData.baseOpacity = isVisible ? 1 : GHOST_OPACITY;

      if ('emissive' in mat) {
        if (isSelected) {
          mat.emissive = new THREE.Color('#ffaa00');
          mat.emissiveIntensity = 0.7;
        } else if (isHovered && isVisible) {
          mat.emissive = new THREE.Color('#66aaff');
          mat.emissiveIntensity = 0.3;
        } else {
          mat.emissive = new THREE.Color(0x000000);
          mat.emissiveIntensity = 1;
        }
      }
    });
  }, [scene, selected, hovered, visibility]);

  useFrame(({ camera, controls }, delta) => {
    const target = (controls as OrbitControlsImpl | null)?.target;
    if (!target) return;

    homeDistance.current ??= bounds.refresh().getSize().distance;
    const zoom = camera.position.distanceTo(target) / homeDistance.current;

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh) || !obj.userData.ownedMaterial) return;

      const mat = obj.userData.ownedMaterial as THREE.MeshStandardMaterial;
      const fadeAt = fadeAtByName.get(obj.userData.organId);
      const goal =
        fadeAt === undefined
          ? 1
          : THREE.MathUtils.smoothstep(zoom, fadeAt - FADE_BAND, fadeAt);
      const fade = THREE.MathUtils.damp(
        obj.userData.zoomFade ?? 1,
        goal,
        FADE_SPEED,
        delta
      );
      obj.userData.zoomFade = fade;

      const opacity = (obj.userData.baseOpacity ?? 1) * fade;
      const transparent = opacity < 0.999;
      if (mat.transparent !== transparent) {
        mat.transparent = transparent;
        mat.needsUpdate = true;
      }
      mat.opacity = opacity;
      mat.depthWrite = !transparent;

      const shown = fade > 0.01;
      obj.visible = shown;
      obj.raycast = shown ? THREE.Mesh.prototype.raycast : () => {};
    });
  });

  return (
    <primitive
      object={scene}
      position={MODEL_CONFIG.position}
      rotation={MODEL_CONFIG.rotation}
      scale={MODEL_CONFIG.scale}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const id = e.object.userData.organId;
        onSelect(id === selected ? null : id);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(e.object);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = 'auto';
      }}
    />
  );
}
