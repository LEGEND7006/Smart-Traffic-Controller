/**
 * Adaptive FairFlow - Master 3D Intersection Canvas & Scene Graph
 *
 * KEY DESIGN: The 3D scene reads DIRECTLY from simulationEngine's mutable
 * state every frame via useFrame, so it never waits for React state updates.
 * React state (via useSimulation hook) drives only the 2D dashboard panels.
 */

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoadNetwork } from './RoadNetwork';
import { TrafficLight3D } from './TrafficLight3D';
import { Vehicle3D } from './Vehicle3D';
import { UltrasonicSensor3D } from './UltrasonicSensor3D';
import { RFIDReader3D } from './RFIDReader3D';
import { simulationEngine } from '../../simulation/simulationEngine';
import { SENSOR_POSITIONS } from '../../simulation/constants';
import { trafficFSM } from '../../simulation/trafficSignalFSM';
import { sensorSimulator } from '../../simulation/sensorSimulator';
import { rfidSimulator } from '../../simulation/rfidSimulator';
import { 
  Compass, Eye, Maximize, Minimize, Sun, Moon, Navigation
} from 'lucide-react';

// ─── Live Scene Content ───────────────────────────────────────────────────────
// Reads engine state every frame directly — no React prop staleness.
function SceneContent({ dayNightMode, selectedVehicleId, onSelectVehicle }) {
  const [tick, setTick] = useState(0);
  const frameCount = useRef(0);

  useFrame((_, delta) => {
    // Advance the simulation
    simulationEngine.tick(delta);

    // Force React re-render every 2 frames (~30fps UI update)
    frameCount.current += 1;
    if (frameCount.current % 2 === 0) {
      setTick(t => t + 1);
    }
  });

  // Read directly from engine mutable state (always current)
  const vehicles = simulationEngine.vehicles;
  const signals = trafficFSM.getStateDetails().signals;
  const sensors = sensorSimulator.getAllSensors();
  const readers = rfidSimulator.readers;
  const isNight = dayNightMode === 'night';

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={isNight ? 0.5 : 1.0} />
      <directionalLight
        position={[40, 55, 40]}
        intensity={isNight ? 0.8 : 1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <hemisphereLight
        args={[isNight ? '#0e1726' : '#dbeafe', isNight ? '#020617' : '#475569', 0.6]}
      />

      {/* ── Road Network ── */}
      <RoadNetwork dayNightMode={dayNightMode} />

      {/* ── Traffic Signals ── */}
      <TrafficLight3D approach="NORTH" signal={signals.NORTH} position={[-7.5, 0, 8.8]} rotation={[0, 0, 0]} />
      <TrafficLight3D approach="SOUTH" signal={signals.SOUTH} position={[7.5, 0, -8.8]} rotation={[0, Math.PI, 0]} />
      <TrafficLight3D approach="EAST"  signal={signals.EAST}  position={[8.8, 0, 7.5]}  rotation={[0, Math.PI / 2, 0]} />
      <TrafficLight3D approach="WEST"  signal={signals.WEST}  position={[-8.8, 0, -7.5]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Ultrasonic Sensors ── */}
      <UltrasonicSensor3D sensor={sensors.NORTH} position={SENSOR_POSITIONS.NORTH} rotation={[0, Math.PI, 0]} />
      <UltrasonicSensor3D sensor={sensors.SOUTH} position={SENSOR_POSITIONS.SOUTH} rotation={[0, 0, 0]} />
      <UltrasonicSensor3D sensor={sensors.EAST}  position={SENSOR_POSITIONS.EAST}  rotation={[0, -Math.PI / 2, 0]} />
      <UltrasonicSensor3D sensor={sensors.WEST}  position={SENSOR_POSITIONS.WEST}  rotation={[0, Math.PI / 2, 0]} />

      {/* ── RFID Gantries ── */}
      <RFIDReader3D reader={readers.NORTH} approach="NORTH" />
      <RFIDReader3D reader={readers.SOUTH} approach="SOUTH" />
      <RFIDReader3D reader={readers.EAST}  approach="EAST" />
      <RFIDReader3D reader={readers.WEST}  approach="WEST" />

      {/* ── Vehicles ── */}
      {vehicles.map(veh => (
        <Vehicle3D
          key={veh.id}
          vehicle={veh}
          isSelected={selectedVehicleId === veh.id}
          onSelect={onSelectVehicle}
        />
      ))}
    </>
  );
}

// ─── Camera Presets ───────────────────────────────────────────────────────────
function SceneCamera({ preset }) {
  const controlsRef = useRef();

  useFrame(({ camera }) => {
    if (!controlsRef.current) return;
    // Preset applied only once when preset changes (tracked via ref)
  });

  const presetProps = (() => {
    switch (preset) {
      case 'topDown':  return { position: [0, 75, 0.1], target: [0, 0, 0] };
      case 'north':    return { position: [0, 18, 48],  target: [0, 2, 0] };
      case 'south':    return { position: [0, 18, -48], target: [0, 2, 0] };
      case 'east':     return { position: [48, 18, 0],  target: [0, 2, 0] };
      case 'west':     return { position: [-48, 18, 0], target: [0, 2, 0] };
      default:         return { position: [38, 42, 38], target: [0, 0, 0] };
    }
  })();

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={8}
      maxDistance={130}
      target={presetProps.target}
    />
  );
}

// ─── Main Exported Component ──────────────────────────────────────────────────
export function Intersection3D({
  selectedVehicle,
  onSelectVehicle,
  onClearSelectedVehicle,
  dayNightMode = 'night',
  onToggleDayNight,
  vehicleCount = 0,
}) {
  const [cameraPreset, setCameraPreset] = useState('isometric');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    const el = document.getElementById('intersection-viewport');
    if (!document.fullscreenElement) {
      el?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const camPresets = ['Iso', 'Top', 'N', 'S', 'E', 'W'];
  const camKeys   = ['isometric', 'topDown', 'north', 'south', 'east', 'west'];

  return (
    <div
      id="intersection-viewport"
      className="relative w-full h-full min-h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl"
      onClick={() => onClearSelectedVehicle && onClearSelectedVehicle()}
    >
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [38, 42, 38], fov: 45 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#070b14');
        }}
      >
        <SceneContent
          dayNightMode={dayNightMode}
          selectedVehicleId={selectedVehicle?.id}
          onSelectVehicle={onSelectVehicle}
        />
        <SceneCamera preset={cameraPreset} />
      </Canvas>

      {/* ── Status Badge ── */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-xs font-mono pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-200">3D TWIN</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400">{vehicleCount} vehicles</span>
      </div>

      {/* ── Camera Toolbar ── */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-xs text-slate-300"
        onClick={e => e.stopPropagation()}
      >
        {camPresets.map((label, i) => (
          <button
            key={label}
            onClick={() => setCameraPreset(camKeys[i])}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              cameraPreset === camKeys[i]
                ? 'bg-cyan-600 text-white shadow shadow-cyan-600/40'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="w-px h-4 bg-white/15 mx-1" />

        {/* Day/Night */}
        <button
          onClick={onToggleDayNight}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors"
          title="Toggle Day/Night"
        >
          {dayNightMode === 'night' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
