import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const FOV_FALLBACK = 50;
const FIT_MULTIPLIER = 1.55;
const LERP_SPEED = 2.5;
const VIEW_DIRECTION = new THREE.Vector3(0, 0.2, 1).normalize();

export default function useTourCamera(
  scene: THREE.Object3D | null,
  targets: string[] | null,
  controlsRef: React.RefObject<OrbitControlsImpl | null>,
  enabled: boolean,
) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const hasTarget = useRef(false);

  useEffect(() => {
    if (!scene || !enabled) {
      hasTarget.current = false;
      return;
    }

    const box = new THREE.Box3();

    if (targets && targets.length > 0) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && targets.includes(obj.name)) {
          obj.updateWorldMatrix(true, false);
          box.expandByObject(obj);
        }
      });
      if (box.isEmpty()) box.setFromObject(scene);
    } else {
      box.setFromObject(scene);
    }

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const center = sphere.center.clone();
    const radius = Math.max(sphere.radius, 0.001);

    const fov =
      camera instanceof THREE.PerspectiveCamera ? camera.fov : FOV_FALLBACK;
    const distance =
      (radius * FIT_MULTIPLIER) / Math.tan((fov * Math.PI) / 360);

    targetLook.current.copy(center);
    targetPos.current.copy(center).addScaledVector(VIEW_DIRECTION, distance);
    hasTarget.current = true;
  }, [scene, targets, enabled, camera]);

  useFrame((_, delta) => {
    if (!hasTarget.current) return;
    const t = Math.min(delta * LERP_SPEED, 1);
    camera.position.lerp(targetPos.current, t);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(targetLook.current, t);
      controls.update();
    }
  });
}