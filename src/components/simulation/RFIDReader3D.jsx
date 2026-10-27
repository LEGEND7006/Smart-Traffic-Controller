/**
 * Adaptive FairFlow - 3D Overhead RFID Interrogation Gantry & Zone
 * 
 * Simulates intelligent highway RFID readers with:
 * - Structural overhead gantry across approach corridors
 * - Interrogation antenna arrays
 * - Translucent illuminated road-surface RF scan zones
 * - Pulsing RF authentication state upon emergency vehicle passage
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { RFID_ZONES } from '../../simulation/constants';

export function RFIDReader3D({ reader, approach = 'NORTH' }) {
  const pulseRef = useRef();
  const isActive = reader?.active;
  const tag = reader?.readingTag;
  const zone = RFID_ZONES[approach];

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = clock.getElapsedTime();
      pulseRef.current.material.opacity = isActive 
        ? 0.5 + Math.sin(t * 8) * 0.25 
        : 0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  // Calculate zone center and size
  let zoneCenterX, zoneCenterZ, zoneWidth, zoneLength, gantryPos, gantryRot;

  if (approach === 'NORTH') {
    zoneCenterX = (zone.minX + zone.maxX) / 2;
    zoneCenterZ = (zone.minZ + zone.maxZ) / 2;
    zoneWidth = Math.abs(zone.maxX - zone.minX);
    zoneLength = Math.abs(zone.maxZ - zone.minZ);
    gantryPos = [zoneCenterX, 0, zone.minZ + 3];
    gantryRot = [0, 0, 0];
  } else if (approach === 'SOUTH') {
    zoneCenterX = (zone.minX + zone.maxX) / 2;
    zoneCenterZ = (zone.minZ + zone.maxZ) / 2;
    zoneWidth = Math.abs(zone.maxX - zone.minX);
    zoneLength = Math.abs(zone.maxZ - zone.minZ);
    gantryPos = [zoneCenterX, 0, zone.maxZ - 3];
    gantryRot = [0, 0, 0];
  } else if (approach === 'EAST') {
    zoneCenterX = (zone.minX + zone.maxX) / 2;
    zoneCenterZ = (zone.minZ + zone.maxZ) / 2;
    zoneWidth = Math.abs(zone.maxZ - zone.minZ);
    zoneLength = Math.abs(zone.maxX - zone.minX);
    gantryPos = [zone.minX + 3, 0, zoneCenterZ];
    gantryRot = [0, Math.PI / 2, 0];
  } else { // WEST
    zoneCenterX = (zone.minX + zone.maxX) / 2;
    zoneCenterZ = (zone.minZ + zone.maxZ) / 2;
    zoneWidth = Math.abs(zone.maxZ - zone.minZ);
    zoneLength = Math.abs(zone.maxX - zone.minX);
    gantryPos = [zone.maxX - 3, 0, zoneCenterZ];
    gantryRot = [0, Math.PI / 2, 0];
  }

  return (
    <group>
      {/* Road Surface RFID Interrogation Field / Zone */}
      <mesh
        ref={pulseRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[zoneCenterX, 0.03, zoneCenterZ]}
      >
        <planeGeometry args={[zoneWidth, zoneLength]} />
        <meshBasicMaterial
          color={isActive ? '#f59e0b' : '#38bdf8'}
          transparent
          opacity={isActive ? 0.6 : 0.15}
        />
      </mesh>

      {/* RFID Gantry Structure */}
      <group position={gantryPos} rotation={gantryRot}>
        {/* Left Leg */}
        <mesh position={[-3.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Right Leg */}
        <mesh position={[3.2, 3.2, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 6.4, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>
        {/* Crossbar Truss */}
        <mesh position={[0, 6.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 6.6, 8]} />
          <meshStandardMaterial color="#334155" metalness={0.7} />
        </mesh>

        {/* RFID Transceiver Array Panel */}
        <mesh position={[0, 5.8, 0]} castShadow>
          <boxGeometry args={[2.4, 0.45, 0.35]} />
          <meshStandardMaterial
            color={isActive ? '#f59e0b' : '#0f172a'}
            emissive={isActive ? '#f59e0b' : '#0284c7'}
            emissiveIntensity={isActive ? 3.0 : 0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Floating RFID Scanner HUD */}
        <group position={[0, 7.2, 0]}>
          <Text
            fontSize={0.24}
            color={isActive ? '#fbbf24' : '#94a3b8'}
            anchorX="center"
            anchorY="middle"
          >
            {isActive ? `RFID DETECTED: [${tag}]` : `RFID ZONE [${approach}]`}
          </Text>
        </group>
      </group>
    </group>
  );
}
