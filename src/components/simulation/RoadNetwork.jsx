/**
 * Adaptive FairFlow - 3D Urban Road Network & Smart City Environment
 * 
 * Uses only built-in Three.js primitives (no remote font loading).
 */

import React from 'react';
import { ROAD_GEOMETRY } from '../../simulation/constants';

const { roadWidth, stopDistance, roadHalfLength } = ROAD_GEOMETRY;

export function RoadNetwork({ dayNightMode = 'night' }) {
  const isNight = dayNightMode === 'night';
  const groundColor     = isNight ? '#080c16' : '#1e293b';
  const asphaltColor    = isNight ? '#131b2e' : '#2d3748';
  const curbColor       = isNight ? '#1c2840' : '#4a5568';
  const markingColor    = '#f8fafc';
  const yellowLine      = '#f59e0b';
  const buildingColor   = isNight ? '#111827' : '#334155';
  const buildingGlow    = isNight ? '#06b6d4' : '#94a3b8';

  // Helper for dashed lane markings
  const dashCount = 8;
  const dashLength = (roadHalfLength - stopDistance - 4) / (dashCount * 2);

  return (
    <group>
      {/* ── Ground ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color={groundColor} roughness={0.95} />
      </mesh>

      {/* ── Grid ── */}
      <gridHelper
        args={[180, 45, isNight ? '#1e293b' : '#475569', isNight ? '#0f172a' : '#334155']}
        position={[0, -0.05, 0]}
      />

      {/* ── N-S Road ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadHalfLength * 2]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.75} />
      </mesh>

      {/* ── E-W Road ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <planeGeometry args={[roadHalfLength * 2, roadWidth]} />
        <meshStandardMaterial color={asphaltColor} roughness={0.75} />
      </mesh>

      {/* ── Sidewalks / Curbs (4 corner quadrants) ── */}
      {[
        [-30, -30], [30, -30], [-30, 30], [30, 30]
      ].map(([x, z], i) => (
        <mesh key={`curb-${i}`} position={[x, 0.15, z]} receiveShadow>
          <boxGeometry args={[26, 0.3, 26]} />
          <meshStandardMaterial color={curbColor} roughness={0.85} />
        </mesh>
      ))}

      {/* ── Yellow Centre Lines ── */}
      {/* North road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, (roadHalfLength + stopDistance) / 2]}>
        <planeGeometry args={[0.22, roadHalfLength - stopDistance - 2]} />
        <meshBasicMaterial color={yellowLine} />
      </mesh>
      {/* South road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.022, -(roadHalfLength + stopDistance) / 2]}>
        <planeGeometry args={[0.22, roadHalfLength - stopDistance - 2]} />
        <meshBasicMaterial color={yellowLine} />
      </mesh>
      {/* East road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(roadHalfLength + stopDistance) / 2, 0.022, 0]}>
        <planeGeometry args={[roadHalfLength - stopDistance - 2, 0.22]} />
        <meshBasicMaterial color={yellowLine} />
      </mesh>
      {/* West road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(roadHalfLength + stopDistance) / 2, 0.022, 0]}>
        <planeGeometry args={[roadHalfLength - stopDistance - 2, 0.22]} />
        <meshBasicMaterial color={yellowLine} />
      </mesh>

      {/* ── White Stop Lines ── */}
      {/* North */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-roadWidth / 4, 0.025, stopDistance]}>
        <planeGeometry args={[roadWidth / 2 - 0.5, 0.5]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* South */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[roadWidth / 4, 0.025, -stopDistance]}>
        <planeGeometry args={[roadWidth / 2 - 0.5, 0.5]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* East */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stopDistance, 0.025, roadWidth / 4]}>
        <planeGeometry args={[0.5, roadWidth / 2 - 0.5]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>
      {/* West */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-stopDistance, 0.025, -roadWidth / 4]}>
        <planeGeometry args={[0.5, roadWidth / 2 - 0.5]} />
        <meshBasicMaterial color={markingColor} />
      </mesh>

      {/* ── Zebra Crossings ── */}
      {[-4, -2, 0, 2, 4].map((offset, idx) => (
        <React.Fragment key={`zebra-n-${idx}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset * 1.4, 0.022, stopDistance - 1.5]}>
            <planeGeometry args={[0.9, 1.8]} />
            <meshBasicMaterial color={markingColor} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[offset * 1.4, 0.022, -stopDistance + 1.5]}>
            <planeGeometry args={[0.9, 1.8]} />
            <meshBasicMaterial color={markingColor} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[stopDistance - 1.5, 0.022, offset * 1.4]}>
            <planeGeometry args={[1.8, 0.9]} />
            <meshBasicMaterial color={markingColor} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-stopDistance + 1.5, 0.022, offset * 1.4]}>
            <planeGeometry args={[1.8, 0.9]} />
            <meshBasicMaterial color={markingColor} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ── Directional Arrow Markers (simple rectangles) ── */}
      {[
        { pos: [-2.4, 0.023, 18], rot: [-Math.PI / 2, 0, 0], w: 0.6, h: 2.5 },
        { pos: [2.4, 0.023, -18], rot: [-Math.PI / 2, 0, Math.PI], w: 0.6, h: 2.5 },
        { pos: [18, 0.023, 2.4], rot: [-Math.PI / 2, 0, Math.PI / 2], w: 0.6, h: 2.5 },
        { pos: [-18, 0.023, -2.4], rot: [-Math.PI / 2, 0, -Math.PI / 2], w: 0.6, h: 2.5 },
      ].map((a, i) => (
        <mesh key={`arrow-${i}`} rotation={a.rot} position={a.pos}>
          <planeGeometry args={[a.w, a.h]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}

      {/* ── Buildings ── */}
      {[
        { x: -28, z: -28, h: 26, w: 18, d: 18 },
        { x:  28, z: -28, h: 32, w: 20, d: 20 },
        { x: -28, z:  28, h: 22, w: 18, d: 18 },
        { x:  28, z:  28, h: 36, w: 20, d: 22 },
      ].map((b, i) => (
        <group key={`bldg-${i}`} position={[b.x, b.h / 2 + 0.3, b.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={buildingColor} roughness={0.4} metalness={0.15} />
          </mesh>
          {/* Window grid (simplified emissive plane) */}
          {isNight && (
            <mesh position={[0, 0, b.d / 2 + 0.05]}>
              <planeGeometry args={[b.w * 0.7, b.h * 0.7]} />
              <meshBasicMaterial color={buildingGlow} opacity={0.2} transparent wireframe />
            </mesh>
          )}
          {/* Rooftop beacon */}
          <mesh position={[0, b.h / 2 + 0.6, 0]}>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color={isNight ? '#f43f5e' : '#cbd5e1'}
              emissive={isNight ? '#f43f5e' : '#000'}
              emissiveIntensity={isNight ? 3 : 0}
            />
          </mesh>
        </group>
      ))}

      {/* ── Street Lamps ── */}
      {[
        [-8, 12], [8, -12], [12, 8], [-12, -8],
        [-8, -12], [8, 12], [-12, 8], [12, -8],
      ].map(([x, z], i) => (
        <group key={`lamp-${i}`} position={[x, 0, z]}>
          {/* Pole */}
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 7, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 7.0, 0.5]}>
            <boxGeometry args={[0.35, 0.18, 0.55]} />
            <meshStandardMaterial
              color={isNight ? '#38bdf8' : '#94a3b8'}
              emissive={isNight ? '#38bdf8' : '#000'}
              emissiveIntensity={isNight ? 2.5 : 0}
            />
          </mesh>
          {isNight && (
            <pointLight position={[0, 6.8, 0.8]} intensity={20} distance={18} color="#38bdf8" />
          )}
        </group>
      ))}
    </group>
  );
}
