/**
 * Adaptive FairFlow - Master 3D Intersection Canvas & Scene Graph
 */

import React, { useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoadNetwork } from './RoadNetwork';
import { TrafficLight3D } from './TrafficLight3D';
import { Vehicle3D } from './Vehicle3D';
import { UltrasonicSensor3D } from './UltrasonicSensor3D';
import { RFIDReader3D } from './RFIDReader3D';
import { CameraControls } from './CameraControls';
import { simulationEngine } from '../../simulation/simulationEngine';
import { SENSOR_POSITIONS } from '../../simulation/constants';
import { 
  Compass, Eye, Camera, Maximize, Minimize,
  Sun, Moon, Radio, Navigation
} from 'lucide-react';

function SceneContent({ 
  fsm, 
  vehicles, 
  sensors, 
  rfid, 
  selectedVehicle, 
  onSelectVehicle, 
  dayNightMode, 
  cameraPreset 
}) {
  // Master physics and simulation clock loop
  useFrame((_, delta) => {
    simulationEngine.tick(delta);
  });

  const isNight = dayNightMode === 'night';
  const signals = fsm?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={isNight ? 0.4 : 0.85} />
      <directionalLight
        position={[45, 60, 45]}
        intensity={isNight ? 0.7 : 1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight
        skyColor={isNight ? '#0e1726' : '#dbeafe'}
        groundColor={isNight ? '#020617' : '#475569'}
        intensity={0.5}
      />

      {/* Urban Road Network & Surroundings */}
      <RoadNetwork dayNightMode={dayNightMode} />

      {/* Four 3D Traffic Signal Assemblies */}
      <TrafficLight3D
        approach="NORTH"
        signal={signals.NORTH}
        position={[-7.5, 0, 8.8]}
        rotation={[0, 0, 0]}
      />
      <TrafficLight3D
        approach="SOUTH"
        signal={signals.SOUTH}
        position={[7.5, 0, -8.8]}
        rotation={[0, Math.PI, 0]}
      />
      <TrafficLight3D
        approach="EAST"
        signal={signals.EAST}
        position={[8.8, 0, 7.5]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <TrafficLight3D
        approach="WEST"
        signal={signals.WEST}
        position={[-8.8, 0, -7.5]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* Four HC-SR04 Ultrasonic Sensors */}
      <UltrasonicSensor3D
        sensor={sensors?.NORTH}
        position={SENSOR_POSITIONS.NORTH}
        rotation={[0, Math.PI, 0]}
      />
      <UltrasonicSensor3D
        sensor={sensors?.SOUTH}
        position={SENSOR_POSITIONS.SOUTH}
        rotation={[0, 0, 0]}
      />
      <UltrasonicSensor3D
        sensor={sensors?.EAST}
        position={SENSOR_POSITIONS.EAST}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <UltrasonicSensor3D
        sensor={sensors?.WEST}
        position={SENSOR_POSITIONS.WEST}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* Four RFID Gantries and Interrogation Zones */}
      <RFIDReader3D reader={rfid?.readers?.NORTH} approach="NORTH" />
      <RFIDReader3D reader={rfid?.readers?.SOUTH} approach="SOUTH" />
      <RFIDReader3D reader={rfid?.readers?.EAST} approach="EAST" />
      <RFIDReader3D reader={rfid?.readers?.WEST} approach="WEST" />

      {/* All Simulated 3D Vehicles */}
      {vehicles?.map((veh) => (
        <Vehicle3D
          key={veh.id}
          vehicle={veh}
          isSelected={selectedVehicle?.id === veh.id}
          onSelect={onSelectVehicle}
        />
      ))}

      {/* Dynamic Camera Orbit Controls */}
      <CameraControls cameraPreset={cameraPreset} selectedVehicle={selectedVehicle} />
    </>
  );
}

export function Intersection3D({
  fsm,
  vehicles,
  sensors,
  rfid,
  selectedVehicle,
  onSelectVehicle,
  onClearSelectedVehicle,
  dayNightMode = 'night',
  onToggleDayNight
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
        gl={{ antialias: true, alpha: false }}
      >
        <SceneContent
          fsm={fsm}
          vehicles={vehicles}
          sensors={sensors}
          rfid={rfid}
          selectedVehicle={selectedVehicle}
          onSelectVehicle={onSelectVehicle}
          dayNightMode={dayNightMode}
          cameraPreset={cameraPreset}
        />
      </Canvas>

      {/* Top Left Floating Status Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-slate-200 font-semibold">3D TWIN ENGINE:</span>
        <span className="text-cyan-400 font-mono">{vehicles?.length || 0} VEHICLES</span>
        <span className="text-slate-500">|</span>
        <span className="text-amber-400">4 ULTRASONIC</span>
        <span className="text-slate-500">|</span>
        <span className="text-rose-400">RFID ACTIVE</span>
      </div>

      {/* Camera & Scene Viewport Toolbar (Floating Bottom Center) */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl text-xs text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setCameraPreset('isometric')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            cameraPreset === 'isometric' ? 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Isometric View"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Isometric</span>
        </button>

        <button
          onClick={() => setCameraPreset('topDown')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
            cameraPreset === 'topDown' ? 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Top-Down Overhead View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Top-Down</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {['North', 'East', 'South', 'West'].map((dir) => (
          <button
            key={dir}
            onClick={() => setCameraPreset(dir.toLowerCase())}
            className={`px-2 py-1.5 rounded-lg transition-all ${
              cameraPreset === dir.toLowerCase() ? 'bg-cyan-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {dir[0]}
          </button>
        ))}

        {selectedVehicle && (
          <button
            onClick={() => setCameraPreset('follow')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              cameraPreset === 'follow' ? 'bg-amber-600 text-white font-medium' : 'hover:bg-slate-800 text-amber-400'
            }`}
            title="Follow Selected Vehicle"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Follow</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Day / Night Toggle */}
        <button
          onClick={onToggleDayNight}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
          title={dayNightMode === 'night' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
        >
          {dayNightMode === 'night' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
