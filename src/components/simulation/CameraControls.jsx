/**
 * Adaptive FairFlow - 3D Camera Controls & View Presets
 */

import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraControls({ cameraPreset = 'isometric', selectedVehicle = null }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    if (cameraPreset === 'isometric') {
      camera.position.set(38, 42, 38);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'topDown') {
      camera.position.set(0, 75, 0.1);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'north') {
      camera.position.set(0, 18, 42);
      controlsRef.current.target.set(0, 2, 0);
    } else if (cameraPreset === 'south') {
      camera.position.set(0, 18, -42);
      controlsRef.current.target.set(0, 2, 0);
    } else if (cameraPreset === 'east') {
      camera.position.set(42, 18, 0);
      controlsRef.current.target.set(0, 2, 0);
    } else if (cameraPreset === 'west') {
      camera.position.set(-42, 18, 0);
      controlsRef.current.target.set(0, 2, 0);
    } else if (cameraPreset === 'follow' && selectedVehicle) {
      camera.position.set(
        selectedVehicle.position.x + 8,
        selectedVehicle.position.y + 10,
        selectedVehicle.position.z + 12
      );
      controlsRef.current.target.set(
        selectedVehicle.position.x,
        selectedVehicle.position.y + 1,
        selectedVehicle.position.z
      );
    }
    controlsRef.current.update();
  }, [cameraPreset, selectedVehicle, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 - 0.05} // prevent going below ground
      minDistance={8}
      maxDistance={120}
    />
  );
}
