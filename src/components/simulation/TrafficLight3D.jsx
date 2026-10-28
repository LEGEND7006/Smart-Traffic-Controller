/**
 * Adaptive FairFlow - 3D Traffic Signal Assembly
 * No Drei Text — uses meshes only for maximum compatibility.
 */

import React from 'react';

export function TrafficLight3D({ position, rotation = [0, 0, 0], signal = 'RED', approach = 'NORTH' }) {
  const isRed    = signal === 'RED';
  const isYellow = signal === 'YELLOW';
  const isGreen  = signal === 'GREEN';

  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 5.0, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Arm */}
      <mesh position={[0.65, 4.8, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 1.3, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.75} />
      </mesh>

      {/* Housing */}
      <mesh position={[1.3, 4.8, 0]} castShadow>
        <boxGeometry args={[0.55, 1.75, 0.45]} />
        <meshStandardMaterial color="#0b1020" roughness={0.6} />
      </mesh>

      {/* Visors */}
      {[-0.54, 0, 0.54].map((yOff, i) => (
        <mesh key={i} position={[1.3, 4.8 + yOff, 0.24]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.36, 0.1, 0.18]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}

      {/* RED lamp */}
      <mesh position={[1.3, 5.34, 0.22]}>
        <sphereGeometry args={[0.155, 14, 14]} />
        <meshStandardMaterial
          color={isRed ? '#ff2b2b' : '#2a0a0a'}
          emissive={isRed ? '#ff2b2b' : '#000'}
          emissiveIntensity={isRed ? 4 : 0}
          roughness={0.2}
        />
      </mesh>
      {isRed && <pointLight position={[1.3, 5.34, 0.8]} intensity={10} distance={9} color="#ff2b2b" />}

      {/* YELLOW lamp */}
      <mesh position={[1.3, 4.8, 0.22]}>
        <sphereGeometry args={[0.155, 14, 14]} />
        <meshStandardMaterial
          color={isYellow ? '#ffb703' : '#2b1c00'}
          emissive={isYellow ? '#ffb703' : '#000'}
          emissiveIntensity={isYellow ? 4 : 0}
          roughness={0.2}
        />
      </mesh>
      {isYellow && <pointLight position={[1.3, 4.8, 0.8]} intensity={10} distance={9} color="#ffb703" />}

      {/* GREEN lamp */}
      <mesh position={[1.3, 4.26, 0.22]}>
        <sphereGeometry args={[0.155, 14, 14]} />
        <meshStandardMaterial
          color={isGreen ? '#00f59b' : '#003316'}
          emissive={isGreen ? '#00f59b' : '#000'}
          emissiveIntensity={isGreen ? 4 : 0}
          roughness={0.2}
        />
      </mesh>
      {isGreen && <pointLight position={[1.3, 4.26, 0.8]} intensity={10} distance={9} color="#00f59b" />}

      {/* Small label plate — colored box only (no Text) */}
      <mesh position={[1.3, 3.6, 0]}>
        <boxGeometry args={[0.7, 0.28, 0.06]} />
        <meshStandardMaterial
          color={isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#ef4444'}
          emissive={isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#ef4444'}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
