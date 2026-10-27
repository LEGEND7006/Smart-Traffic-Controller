/**
 * Adaptive FairFlow - 3D Urban Road Network & Smart City Environment
 * 
 * Generates an urban four-way intersection with:
 * - Dual-lane asphalt roadways
 * - Stop lines, lane dividers, zebra crossings
 * - Sidewalks and urban curbs
 * - Surrounding city buildings, modern streetlights, and directional road markers
 */

import React from 'react';
import { Text } from '@react-three/drei';
import { ROAD_GEOMETRY } from '../../simulation/constants';

const { roadWidth, stopDistance, roadHalfLength } = ROAD_GEOMETRY;

export function RoadNetwork({ dayNightMode = 'night' }) {
  const isNight = dayNightMode === 'night';
  const groundColor = isNight ? '#070b14' : '#1e293b';
  const asphaltColor = isNight ? '#131b2e' : '#2d3748';
  const curbColor = isNight ? '#26344d' : '#4a5568';
  const markingColor = '#f8fafc';
  const yellowLineColor = '#f59e0b';
  const buildingColor = isNight ? '#111827' : '#334155';
  const windowColor = isNight ? '#06b6d4' : '#94a3b8';

  return (
    <group>
      {/* Terrain Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={groundColor} roughness={0.9} />
      </mesh>

      {/* Subtle terrain grid lines */}
      <gridHelper args={[160, 40, isNight ? '#1e293b' : '#475569', isNight ? '#0f172a' : '#334155']} position={[0, -0.04, 0]} />

      {/* North-South Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadHalfLength * 2]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.7} />
      </mesh>

      {/* East-West Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[roadHalfLength * 2, roadWidth]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.7} />
      </mesh>

      {/* Road Curbs / Sidewalks (Four corner quadrants) */}
      {[
        { x: -roadHalfLength / 2 - roadWidth / 2, z: -roadHalfLength / 2 - roadWidth / 2 },
        { x: roadHalfLength / 2 + roadWidth / 2, z: -roadHalfLength / 2 - roadWidth / 2 },
        { x: -roadHalfLength / 2 - roadWidth / 2, z: roadHalfLength / 2 + roadWidth / 2 },
        { x: roadHalfLength / 2 + roadWidth / 2, z: roadHalfLength / 2 + roadWidth / 2 }
      ].map((corner, i) => (
        <group key={`corner-${i}`} position={[corner.x, 0.15, corner.z]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[roadHalfLength - roadWidth, 0.3, roadHalfLength - roadWidth]} />
            <meshStandardMaterial color={curbColor} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Yellow Center Dividing Lines (Double dashed) */}
      {/* North Road Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, (roadHalfLength + stopDistance) / 2]}>
        <planeGeometry args={[0.25, roadHalfLength - stopDistance]} />
        <meshBasicMaterial color={yellowLineColor} />
      </mesh>
      {/* South Road Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -(roadHalfLength + stopDistance) / 2]}>
        <planeGeometry args={[0.25, roadHalfLength - stopDistance]} />
        <meshBasicMaterial color={yellowLineColor} />
      </mesh>
      {/* East Road Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(roadHalfLength + stopDistance) / 2, 0.02, 0]}>
        <planeGeometry args={[roadHalfLength - stopDistance, 0.25]} />
        <meshBasicMaterial color={yellowLineColor} />
      </mesh>
      {/* West Road Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(roadHalfLength + stopDistance) / 2, 0.02, 0]}>
        <planeGeometry args={[roadHalfLength - stopDistance, 0.25]} />
        <meshBasicMaterial color={yellowLineColor} />
      </mesh>

      {/* Solid White Stop Lines */}
      {/* North Stop Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-roadWidth / 4, 0.025, stopDistance]}>
        <planeGeometry args={[roadWidth / 2, 0.6]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* South Stop Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadWidth / 4, 0.025, -stopDistance]}>
        <planeGeometry args={[roadWidth / 2, 0.6]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* East Stop Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stopDistance, 0.025, roadWidth / 4]}>
        <planeGeometry args={[0.6, roadWidth / 2]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* West Stop Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-stopDistance, 0.025, -roadWidth / 4]}>
        <planeGeometry args={[0.6, roadWidth / 2]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>

      {/* Pedestrian Zebra Crossings (Stripes) */}
      {/* North Crossing */}
      {[-5, -3, -1, 1, 3, 5].map((offset, idx) => (
        <mesh key={`zebra-n-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.022, stopDistance - 1.4]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshBasicMaterial color={markingColor} />
        </mesh>
      ))}
      {/* South Crossing */}
      {[-5, -3, -1, 1, 3, 5].map((offset, idx) => (
        <mesh key={`zebra-s-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[offset, 0.022, -stopDistance + 1.4]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshBasicMaterial color={markingColor} />
        </mesh>
      ))}
      {/* East Crossing */}
      {[-5, -3, -1, 1, 3, 5].map((offset, idx) => (
        <mesh key={`zebra-e-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[stopDistance - 1.4, 0.022, offset]}>
          <planeGeometry args={[1.8, 0.9]} />
          <meshBasicMaterial color={markingColor} />
        </mesh>
      ))}
      {/* West Crossing */}
      {[-5, -3, -1, 1, 3, 5].map((offset, idx) => (
        <mesh key={`zebra-w-${idx}`} rotation={[-Math.PI / 2, 0, 0]} position={[-stopDistance + 1.4, 0.022, offset]}>
          <planeGeometry args={[1.8, 0.9]} />
          <meshBasicMaterial color={markingColor} />
        </mesh>
      ))}

      {/* 3D Road Name Labels painted on asphalt */}
      <Text
        rotation={[-Math.PI / 2, 0, Math.PI]}
        position={[-3.5, 0.03, 14]}
        fontSize={1.6}
        color={isNight ? '#38bdf8' : '#0284c7'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
      >
        NORTH APPROACH
      </Text>

      <Text
        rotation={[-Math.PI / 2, 0, 0]}
        position={[3.5, 0.03, -14]}
        fontSize={1.6}
        color={isNight ? '#38bdf8' : '#0284c7'}
        anchorX="center"
        anchorY="middle"
      >
        SOUTH APPROACH
      </Text>

      <Text
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        position={[14, 0.03, 3.5]}
        fontSize={1.6}
        color={isNight ? '#38bdf8' : '#0284c7'}
        anchorX="center"
        anchorY="middle"
      >
        EAST APPROACH
      </Text>

      <Text
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[-14, 0.03, -3.5]}
        fontSize={1.6}
        color={isNight ? '#38bdf8' : '#0284c7'}
        anchorX="center"
        anchorY="middle"
      >
        WEST APPROACH
      </Text>

      {/* Corner Modern Buildings / Architecture */}
      {[
        { x: -28, z: -28, h: 26, w: 20, d: 20, label: 'TRAFFIC OPS CENTER' },
        { x: 28, z: -28, h: 32, w: 22, d: 22, label: 'METRO TECH HUB' },
        { x: -28, z: 28, h: 22, w: 22, d: 20, label: 'CITY MEDICAL CENTER' },
        { x: 28, z: 28, h: 36, w: 20, d: 24, label: 'CIVIC TOWER' }
      ].map((b, i) => (
        <group key={`bldg-${i}`} position={[b.x, b.h / 2 + 0.3, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={buildingColor} roughness={0.4} metalness={0.2} />
          </mesh>
          {/* Glowing architectural windows */}
          {isNight && (
            <mesh position={[0, 0, b.d / 2 + 0.05]}>
              <planeGeometry args={[b.w * 0.75, b.h * 0.75]} />
              <meshBasicMaterial color={windowColor} opacity={0.35} transparent wireframe />
            </mesh>
          )}
        </group>
      ))}

      {/* Smart City Street Lights */}
      {[
        { x: -8, z: 12 },
        { x: 8, z: -12 },
        { x: 12, z: 8 },
        { x: -12, z: -8 }
      ].map((light, i) => (
        <group key={`streetlight-${i}`} position={[light.x, 0, light.z]}>
          {/* Pole */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 7, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Arm */}
          <mesh position={[0, 6.8, 0.6]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 1.5, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Fixture Lamp */}
          <mesh position={[0, 6.7, 1.2]}>
            <boxGeometry args={[0.4, 0.15, 0.6]} />
            <meshStandardMaterial
              color={isNight ? '#38bdf8' : '#cbd5e1'}
              emissive={isNight ? '#38bdf8' : '#000000'}
              emissiveIntensity={isNight ? 2 : 0}
            />
          </mesh>
          {isNight && (
            <pointLight position={[0, 6.5, 1.2]} intensity={25} distance={18} color="#38bdf8" />
          )}
        </group>
      ))}
    </group>
  );
}
