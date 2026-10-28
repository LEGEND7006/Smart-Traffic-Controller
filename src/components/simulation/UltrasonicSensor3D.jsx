/**
 * Adaptive FairFlow - HC-SR04 Ultrasonic Sensor 3D Module
 * Uses only Three.js primitives — no Drei Text, no Drei Line.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function UltrasonicSensor3D({ sensor, position, rotation = [0, 0, 0] }) {
  const scanRef = useRef();
  const isDetected = sensor?.detected || false;
  const target = sensor?.beamTarget;

  // Pulse the scanner ring when active
  useFrame(({ clock }) => {
    if (!scanRef.current) return;
    const t = clock.getElapsedTime();
    scanRef.current.material.opacity = isDetected
      ? 0.55 + Math.sin(t * 10) * 0.3
      : 0.15 + Math.sin(t * 2) * 0.05;
  });

  return (
    <group position={[position.x, position.y, position.z]} rotation={rotation}>
      {/* Mounting pole */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      {/* Housing */}
      <mesh>
        <boxGeometry args={[0.48, 0.32, 0.14]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Blue PCB */}
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[0.44, 0.20, 0.025]} />
        <meshStandardMaterial color="#0369a1" roughness={0.4} />
      </mesh>

      {/* Transmitter horn (left) */}
      <mesh position={[-0.11, 0, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.12, 14]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Receiver horn (right) */}
      <mesh position={[0.11, 0, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.12, 14]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Status LED */}
      <mesh position={[0, 0.055, 0.095]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshStandardMaterial
          color={isDetected ? '#06b6d4' : '#10b981'}
          emissive={isDetected ? '#06b6d4' : '#10b981'}
          emissiveIntensity={3}
        />
      </mesh>

      {/* Scanning ring (animated) */}
      <mesh ref={scanRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.24]}>
        <torusGeometry args={[0.18, 0.02, 8, 20]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
      </mesh>

      {/* Detection beam line — drawn as a thin stretched box toward target */}
      {isDetected && target && (() => {
        const dx = target.x - position.x;
        const dy = (target.y || 0) - position.y;
        const dz = target.z - position.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (len < 0.1) return null;
        const mx = dx / 2, my = dy / 2, mz = dz / 2;
        // angle of the beam
        const angleY = Math.atan2(dx, dz);
        const angleX = -Math.asin(dy / len);
        return (
          <mesh position={[mx, my, mz]} rotation={[angleX, angleY, 0]}>
            <boxGeometry args={[0.04, 0.04, len]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.75} />
          </mesh>
        );
      })()}

      {/* Target contact sphere */}
      {isDetected && target && (
        <mesh position={[target.x - position.x, (target.y || 0) - position.y, target.z - position.z]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.45} wireframe />
        </mesh>
      )}
    </group>
  );
}
