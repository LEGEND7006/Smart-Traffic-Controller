/**
 * Adaptive FairFlow - 3D Vehicle Renderer
 * Supports Car, Bus, Truck, and Emergency Ambulance with animated strobes.
 * No Drei Text — label shown only in 2D overlay (VehicleDetailModal).
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { VEHICLE_TYPES } from '../../simulation/constants';

export function Vehicle3D({ vehicle, isSelected = false, onSelect }) {
  const strobeRef = useRef();
  const { type, position, yaw, length, width, height, color, isEmergency, id, speed } = vehicle;

  useFrame(({ clock }) => {
    if (!strobeRef.current || !isEmergency) return;
    const t = clock.getElapsedTime() * 12;
    const on = Math.sin(t) > 0;
    if (strobeRef.current.children[0]) strobeRef.current.children[0].material.emissiveIntensity = on ? 6 : 0.1;
    if (strobeRef.current.children[1]) strobeRef.current.children[1].material.emissiveIntensity = !on ? 6 : 0.1;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(id);
  };

  const brakeLight = speed < 0.3 ? 3 : 0.6;

  return (
    <group
      position={[position.x, 0, position.z]}
      rotation={[0, yaw, 0]}
      onClick={handleClick}
    >
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[width * 0.9, width * 1.25, 32]} />
          <meshBasicMaterial color="#06b6d4" side={2} />
        </mesh>
      )}

      {/* ── CAR ── */}
      {type === VEHICLE_TYPES.CAR && (
        <group position={[0, height / 2, 0]}>
          {/* Lower body */}
          <mesh castShadow>
            <boxGeometry args={[width, height * 0.52, length]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.45} />
          </mesh>
          {/* Cabin */}
          <mesh position={[0, height * 0.36, -length * 0.04]} castShadow>
            <boxGeometry args={[width * 0.84, height * 0.44, length * 0.54]} />
            <meshStandardMaterial color="#0a1225" roughness={0.15} metalness={0.85} />
          </mesh>
          {/* Front headlights */}
          <mesh position={[-width * 0.34, -0.05, length * 0.505]}>
            <boxGeometry args={[0.22, 0.1, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[width * 0.34, -0.05, length * 0.505]}>
            <boxGeometry args={[0.22, 0.1, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          {/* Taillights */}
          <mesh position={[-width * 0.34, -0.05, -length * 0.505]}>
            <boxGeometry args={[0.22, 0.1, 0.02]} />
            <meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={brakeLight} />
          </mesh>
          <mesh position={[width * 0.34, -0.05, -length * 0.505]}>
            <boxGeometry args={[0.22, 0.1, 0.02]} />
            <meshStandardMaterial color="#f00" emissive="#f00" emissiveIntensity={brakeLight} />
          </mesh>
          {/* Wheels */}
          {[-width * 0.52, width * 0.52].map((wx, i) =>
            [-length * 0.3, length * 0.3].map((wz, j) => (
              <mesh key={`w${i}${j}`} position={[wx, -height * 0.24, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.26, 0.26, 0.17, 12]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* ── BUS ── */}
      {type === VEHICLE_TYPES.BUS && (
        <group position={[0, height / 2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[width, height * 0.88, length]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.15} />
          </mesh>
          {/* Window strip */}
          <mesh position={[0, height * 0.12, 0]}>
            <boxGeometry args={[width + 0.02, height * 0.3, length * 0.84]} />
            <meshStandardMaterial color="#061018" roughness={0.1} />
          </mesh>
          {/* Headlights */}
          <mesh position={[-width * 0.36, -height * 0.22, length * 0.505]}>
            <boxGeometry args={[0.28, 0.16, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[width * 0.36, -height * 0.22, length * 0.505]}>
            <boxGeometry args={[0.28, 0.16, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          {/* Wheels */}
          {[-width * 0.52, width * 0.52].map((wx, i) =>
            [-length * 0.37, 0, length * 0.37].map((wz, j) => (
              <mesh key={`bw${i}${j}`} position={[wx, -height * 0.36, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.34, 0.34, 0.21, 12]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* ── TRUCK ── */}
      {type === VEHICLE_TYPES.TRUCK && (
        <group position={[0, height / 2, 0]}>
          {/* Cab */}
          <mesh position={[0, 0, length * 0.26]} castShadow>
            <boxGeometry args={[width, height * 0.8, length * 0.38]} />
            <meshStandardMaterial color="#475569" roughness={0.3} />
          </mesh>
          {/* Cargo container */}
          <mesh position={[0, height * 0.1, -length * 0.14]} castShadow>
            <boxGeometry args={[width * 0.95, height * 0.94, length * 0.64]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* Headlights */}
          <mesh position={[-width * 0.36, -height * 0.2, length * 0.455]}>
            <boxGeometry args={[0.24, 0.15, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[width * 0.36, -height * 0.2, length * 0.455]}>
            <boxGeometry args={[0.24, 0.15, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2.5} />
          </mesh>
          {/* Wheels */}
          {[-width * 0.52, width * 0.52].map((wx, i) =>
            [-length * 0.34, -length * 0.14, length * 0.3].map((wz, j) => (
              <mesh key={`tw${i}${j}`} position={[wx, -height * 0.35, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.34, 0.34, 0.22, 12]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* ── AMBULANCE ── */}
      {type === VEHICLE_TYPES.AMBULANCE && (
        <group position={[0, height / 2, 0]}>
          {/* White body */}
          <mesh castShadow>
            <boxGeometry args={[width, height * 0.75, length]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* Red livery stripe */}
          <mesh>
            <boxGeometry args={[width + 0.02, 0.28, length * 0.92]} />
            <meshStandardMaterial color="#dc2626" roughness={0.2} />
          </mesh>
          {/* Red cross — vertical */}
          <mesh position={[-width * 0.52, height * 0.08, 0]}>
            <boxGeometry args={[0.02, 0.42, 0.14]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
          </mesh>
          {/* Red cross — horizontal */}
          <mesh position={[-width * 0.52, height * 0.08, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.42]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
          </mesh>
          {/* Rear cross */}
          <mesh position={[width * 0.52, height * 0.08, 0]}>
            <boxGeometry args={[0.02, 0.42, 0.14]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[width * 0.52, height * 0.08, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.42]} />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
          </mesh>
          {/* Strobe lightbar */}
          <group ref={strobeRef} position={[0, height * 0.44, length * 0.1]}>
            <mesh position={[-0.28, 0, 0]}>
              <boxGeometry args={[0.28, 0.13, 0.2]} />
              <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={4} />
            </mesh>
            <mesh position={[0.28, 0, 0]}>
              <boxGeometry args={[0.28, 0.13, 0.2]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={4} />
            </mesh>
          </group>
          {/* Dynamic strobe point light */}
          {isEmergency && (
            <pointLight position={[0, height * 0.44 + 0.5, 0]} intensity={20} distance={16} color="#ef4444" />
          )}
          {/* Headlights */}
          <mesh position={[-width * 0.34, -0.05, length * 0.505]}>
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} />
          </mesh>
          <mesh position={[width * 0.34, -0.05, length * 0.505]}>
            <boxGeometry args={[0.24, 0.12, 0.02]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={3} />
          </mesh>
          {/* Wheels */}
          {[-width * 0.52, width * 0.52].map((wx, i) =>
            [-length * 0.31, length * 0.31].map((wz, j) => (
              <mesh key={`aw${i}${j}`} position={[wx, -height * 0.3, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.28, 0.28, 0.19, 12]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}
    </group>
  );
}
