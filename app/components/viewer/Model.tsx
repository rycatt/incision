'use client';

import { useState, useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MODEL_CONFIG, GHOST_OPACITY } from '../../config/model';

export default function Model({
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
  const gltf = useGLTF(MODEL_CONFIG.path);
  const [hovered, setHovered] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const names: string[] = [];
    gltf.scene.traverse((obj) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);

  useEffect(() => {
    gltf.scene.traverse((obj) => {
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

      const wasTransparent = mat.transparent;
      mat.transparent = !isVisible;
      mat.opacity = isVisible ? 1 : GHOST_OPACITY;
      mat.depthWrite = isVisible;
      if (wasTransparent !== mat.transparent) {
        mat.needsUpdate = true;
      }

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
  }, [gltf, selected, hovered, visibility]);

  return (
    <primitive
      object={gltf.scene}
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
