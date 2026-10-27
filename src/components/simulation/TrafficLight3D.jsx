/**
 * Adaptive FairFlow - 3D Traffic Signal Assembly
 * 
 * Accurately models a triple-aspect traffic light fixture with physical visors,
 * emissive state-driven lamps, and approach indicators.
 */

import React from 'react';
import { Text } from '@react-three/drei';

export function TrafficLight3D({ position, rotation = [0, 0, 0], signal = 'RED', approach = 'NORTH' }) {
  const isRed = signal === 'RED';
  const isYellow = signal === 'YELLOW';
  const isGreen = signal === 'GREEN';

  const redEmissive = isRed ? '#ff1e1e' : '#220000';
  const yellowEmissive = isYellow ? '#ffb703' : '#2b1c00';
  const greenEmissive = isGreen ? '#00f59b' : '#002613';

  return (
    <group position={position} rotation={rotation}>
      {/* Supporting Mast / Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 5.0, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Horizontal boom arm extending over curb */}
      <mesh position={[0.7, 4.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.4, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Signal Housing (Dark Matte Box) */}
      <mesh position={[1.4, 4.8, 0]} castShadow>
        <boxGeometry args={[0.6, 1.8, 0.5]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* Visors / Cowls */}
      {[-0.55, 0, 0.55].map((yOffset, i) => (
        <mesh key={`visor-${i}`} position={[1.4, 4.8 + yOffset, 0.26]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.38, 0.12, 0.22]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}

      {/* Red Lamp */}
      <mesh position={[1.4, 5.35, 0.24]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={isRed ? '#ff2b2b' : '#330808'}
          emissive={redEmissive}
          emissiveIntensity={isRed ? 4.5 : 0.2}
          roughness={0.2}
        />
      </mesh>
      {isRed && (
        <pointLight position={[1.4, 5.35, 0.8]} intensity={8} distance={10} color="#ff2b2b" />
      )}

      {/* Yellow Lamp */}
      <mesh position={[1.4, 4.8, 0.24]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={isYellow ? '#ffb703' : '#332400'}
          emissive={yellowEmissive}
          emissiveIntensity={isYellow ? 4.5 : 0.2}
          roughness={0.2}
        />
      </mesh>
      {isYellow && (
        <pointLight position={[1.4, 4.8, 0.8]} intensity={8} distance={10} color="#ffb703" />
      )}

      {/* Green Lamp */}
      <mesh position={[1.4, 4.25, 0.24]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color={isGreen ? '#00f59b' : '#003319'}
          emissive={greenEmissive}
          emissiveIntensity={isGreen ? 4.5 : 0.2}
          roughness={0.2}
        />
      </mesh>
      {isGreen && (
        <pointLight position={[1.4, 4.25, 0.8]} intensity={8} distance={10} color="#00f59b" />
      )}

      {/* Direction & Status Plate */}
      <group position={[1.4, 3.6, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.35, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.2}
          color={isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#ef4444'}
          anchorX="center"
          anchorY="middle"
        >
          {`${approach} [${signal}]`}
        </Text>
      </group>
    </group>
  );
}
