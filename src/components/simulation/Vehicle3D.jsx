/**
 * Adaptive FairFlow - 3D Vehicle Renderer
 * 
 * Supports distinct 3D models for:
 * - Sedan Cars
 * - City Transit Buses
 * - Freight Logistics Trucks
 * - Emergency Priority Ambulances (with synchronized strobe lightbars and RFID transponder)
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { VEHICLE_TYPES } from '../../simulation/constants';

export function Vehicle3D({ vehicle, isSelected = false, onSelect }) {
  const strobeRef = useRef();
  const { type, position, yaw, length, width, height, color, isEmergency, id } = vehicle;

  // Strobe animation for ambulance emergency beacon
  useFrame(({ clock }) => {
    if (strobeRef.current && isEmergency) {
      const t = clock.getElapsedTime() * 12;
      const strobe = Math.sin(t) > 0;
      strobeRef.current.children[0].material.emissiveIntensity = strobe ? 5 : 0.2;
      strobeRef.current.children[1].material.emissiveIntensity = !strobe ? 5 : 0.2;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(id);
  };

  return (
    <group
      position={[position.x, 0, position.z]}
      rotation={[0, yaw, 0]}
      onClick={handleClick}
      cursor="pointer"
    >
      {/* Selection Ring Indicator */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[width * 0.9, width * 1.2, 32]} />
          <meshBasicMaterial color="#06b6d4" side={2} />
        </mesh>
      )}

      {/* Floating ID Tag when selected */}
      {isSelected && (
        <group position={[0, height + 1.2, 0]}>
          <mesh>
            <planeGeometry args={[1.6, 0.45]} />
            <meshBasicMaterial color="#0284c7" opacity={0.9} transparent />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle">
            {`${id} (${(vehicle.speed * 3.6).toFixed(0)} km/h)`}
          </Text>
        </group>
      )}

      {/* --- CAR MODEL --- */}
      {type === VEHICLE_TYPES.CAR && (
        <group position={[0, height / 2, 0]}>
          {/* Main Lower Body */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[width, height * 0.5, length]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Cabin / Windows */}
          <mesh castShadow position={[0, height * 0.35, -length * 0.05]}>
            <boxGeometry args={[width * 0.85, height * 0.45, length * 0.55]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Headlights (Facing -Z in local space) */}
          <mesh position={[-width * 0.35, -0.05, length * 0.51]}>
            <boxGeometry args={[0.25, 0.12, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          <mesh position={[width * 0.35, -0.05, length * 0.51]}>
            <boxGeometry args={[0.25, 0.12, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
          </mesh>
          {/* Taillights */}
          <mesh position={[-width * 0.35, -0.05, -length * 0.51]}>
            <boxGeometry args={[0.25, 0.12, 0.02]} />
            <meshStandardMaterial
              color="#ff2222"
              emissive="#ff2222"
              emissiveIntensity={vehicle.speed < 0.5 ? 3 : 0.8}
            />
          </mesh>
          <mesh position={[width * 0.35, -0.05, -length * 0.51]}>
            <boxGeometry args={[0.25, 0.12, 0.02]} />
            <meshStandardMaterial
              color="#ff2222"
              emissive="#ff2222"
              emissiveIntensity={vehicle.speed < 0.5 ? 3 : 0.8}
            />
          </mesh>
          {/* Wheels */}
          {[-width * 0.5, width * 0.5].map((wx, i) =>
            [-length * 0.3, length * 0.3].map((wz, j) => (
              <mesh
                key={`wheel-${i}-${j}`}
                position={[wx, -height * 0.25, wz]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* --- BUS MODEL --- */}
      {type === VEHICLE_TYPES.BUS && (
        <group position={[0, height / 2, 0]}>
          {/* Main Bus Monocoque Chassis */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[width, height * 0.85, length]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Tinted Panoramic Windows */}
          <mesh position={[0, height * 0.1, 0]}>
            <boxGeometry args={[width + 0.02, height * 0.32, length * 0.85]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} />
          </mesh>
          {/* Roof AC Units */}
          <mesh position={[0, height * 0.45, 0]}>
            <boxGeometry args={[width * 0.6, 0.25, length * 0.3]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
          {/* Headlights */}
          <mesh position={[-width * 0.38, -height * 0.2, length * 0.51]}>
            <boxGeometry args={[0.3, 0.18, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[width * 0.38, -height * 0.2, length * 0.51]}>
            <boxGeometry args={[0.3, 0.18, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
          </mesh>
          {/* Wheels (6 Wheels for Bus) */}
          {[-width * 0.5, width * 0.5].map((wx, i) =>
            [-length * 0.38, 0, length * 0.38].map((wz, j) => (
              <mesh
                key={`bwheel-${i}-${j}`}
                position={[wx, -height * 0.35, wz]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.36, 0.36, 0.22, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* --- TRUCK MODEL --- */}
      {type === VEHICLE_TYPES.TRUCK && (
        <group position={[0, height / 2, 0]}>
          {/* Driver Cab */}
          <mesh castShadow receiveShadow position={[0, 0, length * 0.25]}>
            <boxGeometry args={[width, height * 0.8, length * 0.4]} />
            <meshStandardMaterial color="#475569" roughness={0.3} />
          </mesh>
          {/* Cargo Freight Container */}
          <mesh castShadow receiveShadow position={[0, height * 0.1, -length * 0.15]}>
            <boxGeometry args={[width * 0.96, height * 0.95, length * 0.65]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
          {/* Headlights */}
          <mesh position={[-width * 0.38, -height * 0.2, length * 0.46]}>
            <boxGeometry args={[0.25, 0.16, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[width * 0.38, -height * 0.2, length * 0.46]}>
            <boxGeometry args={[0.25, 0.16, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.5} />
          </mesh>
          {/* Wheels */}
          {[-width * 0.5, width * 0.5].map((wx, i) =>
            [-length * 0.35, -length * 0.15, length * 0.3].map((wz, j) => (
              <mesh
                key={`twheel-${i}-${j}`}
                position={[wx, -height * 0.35, wz]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.36, 0.36, 0.24, 12]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* --- AMBULANCE EMERGENCY MODEL --- */}
      {type === VEHICLE_TYPES.AMBULANCE && (
        <group position={[0, height / 2, 0]}>
          {/* Ambulance Body (Pure White) */}
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[width, height * 0.75, length]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} />
          </mesh>
          {/* Red Livery Stripes on sides */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width + 0.02, 0.3, length * 0.9]} />
            <meshStandardMaterial color="#ef4444" roughness={0.2} />
          </mesh>
          {/* Red Cross Decal Representation */}
          <mesh position={[-width * 0.51, height * 0.1, 0]}>
            <boxGeometry args={[0.02, 0.45, 0.15]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[-width * 0.51, height * 0.1, 0]}>
            <boxGeometry args={[0.02, 0.15, 0.45]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[width * 0.51, height * 0.1, 0]}>
            <boxGeometry args={[0.02, 0.45, 0.15]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>
          <mesh position={[width * 0.51, height * 0.1, 0]}>
            <boxGeometry args={[0.02, 0.15, 0.45]} />
            <meshBasicMaterial color="#dc2626" />
          </mesh>

          {/* Roof Strobe Lightbar */}
          <group ref={strobeRef} position={[0, height * 0.45, length * 0.1]}>
            {/* Left Red Strobe */}
            <mesh position={[-0.3, 0, 0]}>
              <boxGeometry args={[0.3, 0.15, 0.2]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={4} />
            </mesh>
            {/* Right Blue Strobe */}
            <mesh position={[0.3, 0, 0]}>
              <boxGeometry args={[0.3, 0.15, 0.2]} />
              <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={4} />
            </mesh>
            {/* Siren Strobe Point Light */}
            {isEmergency && (
              <pointLight position={[0, 0.3, 0]} intensity={15} distance={14} color="#ef4444" />
            )}
          </group>

          {/* Headlights */}
          <mesh position={[-width * 0.35, -0.05, length * 0.51]}>
            <boxGeometry args={[0.25, 0.14, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
          </mesh>
          <mesh position={[width * 0.35, -0.05, length * 0.51]}>
            <boxGeometry args={[0.25, 0.14, 0.02]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
          </mesh>

          {/* Wheels */}
          {[-width * 0.5, width * 0.5].map((wx, i) =>
            [-length * 0.32, length * 0.32].map((wz, j) => (
              <mesh
                key={`awheel-${i}-${j}`}
                position={[wx, -height * 0.3, wz]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <cylinderGeometry args={[0.3, 0.3, 0.2, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.9} />
              </mesh>
            ))
          )}
        </group>
      )}
    </group>
  );
}
