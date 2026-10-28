/**
 * Adaptive FairFlow - Overhead RFID Interrogation Gantry
 * Uses only Three.js primitives — no Drei Text.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RFID_ZONES } from '../../simulation/constants';

export function RFIDReader3D({ reader, approach = 'NORTH' }) {
  const zoneRef = useRef();
  const scanRef = useRef();
  const isActive = reader?.active || false;
  const zone = RFID_ZONES[approach];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (zoneRef.current) {
      zoneRef.current.material.opacity = isActive
        ? 0.45 + Math.sin(t * 8) * 0.25
        : 0.10 + Math.sin(t * 1.5) * 0.04;
    }
    if (scanRef.current) {
      scanRef.current.material.emissiveIntensity = isActive
        ? 2 + Math.sin(t * 8) * 1.5
        : 0.4;
    }
  });

  // Zone dimensions
  const isNS = approach === 'NORTH' || approach === 'SOUTH';
  const zoneCX = (zone.minX + zone.maxX) / 2;
  const zoneCZ = (zone.minZ + zone.maxZ) / 2;
  const zoneW  = Math.abs(zone.maxX - zone.minX);
  const zoneL  = Math.abs(zone.maxZ - zone.minZ);

  // Gantry position (near entry end of zone)
  const gx = isNS ? zoneCX : (approach === 'EAST' ? zone.minX + 4 : zone.maxX - 4);
  const gz = isNS ? (approach === 'NORTH' ? zone.minZ + 4 : zone.maxZ - 4) : zoneCZ;
  const gRot = isNS ? [0, 0, 0] : [0, Math.PI / 2, 0];

  return (
    <group>
      {/* Road surface scan zone */}
      <mesh ref={zoneRef} rotation={[-Math.PI / 2, 0, 0]} position={[zoneCX, 0.03, zoneCZ]}>
        <planeGeometry args={[zoneW, zoneL]} />
        <meshBasicMaterial
          color={isActive ? '#f59e0b' : '#38bdf8'}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Gantry structure */}
      <group position={[gx, 0, gz]} rotation={gRot}>
        {/* Left leg */}
        <mesh position={[-3.0, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Right leg */}
        <mesh position={[3.0, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Crossbar */}
        <mesh position={[0, 6.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 6.2, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* Scanner panel */}
        <mesh ref={scanRef} position={[0, 5.75, 0]}>
          <boxGeometry args={[2.2, 0.4, 0.32]} />
          <meshStandardMaterial
            color={isActive ? '#f59e0b' : '#0f172a'}
            emissive={isActive ? '#f59e0b' : '#06b6d4'}
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>

        {/* Active indicator stripe */}
        {isActive && (
          <mesh position={[0, 5.4, 0]}>
            <boxGeometry args={[2.0, 0.1, 0.34]} />
            <meshBasicMaterial color="#f59e0b" />
          </mesh>
        )}
      </group>
    </group>
  );
}
