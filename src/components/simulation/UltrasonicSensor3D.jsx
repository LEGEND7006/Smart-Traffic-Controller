/**
 * Adaptive FairFlow - 3D HC-SR04 Ultrasonic Sensor Module
 * 
 * Accurately models physical roadside ultrasonic transducers with:
 * - Dual transmitter/receiver aluminium acoustic horns
 * - Detection status LED
 * - Dynamic 3D sonar cone/laser beam linking to detected vehicle
 * - Real-time centimeter distance billboard HUD
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';

export function UltrasonicSensor3D({ sensor, position, rotation = [0, 0, 0] }) {
  const pulseRef = useRef();
  const isDetected = sensor?.detected;
  const distanceCm = sensor?.distanceCm || 3200;
  const target = sensor?.beamTarget;

  useFrame((_, delta) => {
    if (pulseRef.current && isDetected) {
      pulseRef.current.rotation.z += delta * 4;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]} rotation={rotation}>
      {/* Roadside Stanchion / Mounting Pole */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>

      {/* Sensor Housing Bracket */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Blue Printed Circuit Board (HC-SR04 iconic PCB) */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.45, 0.22, 0.03]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>

      {/* Transmitter Barrel (T) */}
      <mesh position={[-0.12, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Receiver Barrel (R) */}
      <mesh position={[0.12, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.14, 16]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Status LED Indicator */}
      <mesh position={[0, 0.06, 0.1]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color={isDetected ? '#06b6d4' : '#10b981'}
          emissive={isDetected ? '#06b6d4' : '#10b981'}
          emissiveIntensity={3}
        />
      </mesh>

      {/* Floating 3D Telemetry Billboard */}
      <group position={[0, 0.5, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.4]} />
          <meshBasicMaterial color="#0f172a" opacity={0.85} transparent />
        </mesh>
        <Text
          position={[0, 0.07, 0.02]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          {sensor?.sensorId || 'HC-SR04'}
        </Text>
        <Text
          position={[0, -0.08, 0.02]}
          fontSize={0.16}
          color={isDetected ? '#06b6d4' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {isDetected ? `${distanceCm} cm` : 'CLEAR (>32m)'}
        </Text>
      </group>

      {/* Dynamic 3D Sonar Detection Beam / Laser to Target Vehicle */}
      {isDetected && target && (
        <group>
          {/* Cyan Vector Line to Detected Vehicle Front */}
          <Line
            points={[
              [0, 0, 0.2],
              [target.x - position.x, target.y - position.y, target.z - position.z]
            ]}
            color="#06b6d4"
            lineWidth={2.5}
            transparent
            opacity={0.85}
          />
          {/* Subtle translucent detection cone effect */}
          <mesh
            position={[
              (target.x - position.x) / 2,
              (target.y - position.y) / 2,
              (target.z - position.z) / 2
            ]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#06b6d4" opacity={0.4} transparent wireframe />
          </mesh>
        </group>
      )}
    </group>
  );
}
