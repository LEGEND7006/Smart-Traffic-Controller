/**
 * Adaptive FairFlow - Ultrasonic Sensor Telemetry & Diagnostics Station
 */

import React from 'react';
import { Radar, Activity, CheckCircle2, AlertTriangle, Cpu, Radio, Zap } from 'lucide-react';
import { APPROACH_ORDER } from '../simulation/constants';

export function SensorMonitoring({ sensors = {} }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">HC-SR04 ULTRASONIC SENSOR TELEMETRY</h2>
          <p className="text-xs text-slate-400">Continuous acoustic echo distance monitoring across four roadside transducer stations</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ALL 4 TRANSDUCERS ONLINE</span>
        </div>
      </div>

      {/* 4 Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPROACH_ORDER.map((app) => {
          const s = sensors[app] || {};
          const isDetected = s.detected;
          const distCm = s.distanceCm || 3200;
          const distM = (distCm / 100).toFixed(2);
          const history = s.history || [];

          return (
            <div
              key={app}
              className={`glass-panel p-5 rounded-2xl border transition-all ${
                isDetected
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40 bg-gradient-to-b from-cyan-950/20 to-slate-900/60'
                  : 'border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${isDetected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    <Radar className={`w-4 h-4 ${isDetected ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{s.sensorId || `HC-SR04-${app[0]}`}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{app} APPROACH</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isDetected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isDetected ? 'TARGET LOCK' : 'SCANNING'}
                </span>
              </div>

              {/* Main Distance Display */}
              <div className="my-4 text-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
                  ECHO DISTANCE
                </span>
                <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  {isDetected ? distCm : '> 3200'}
                  <span className="text-xs font-normal text-slate-400 ml-1">cm</span>
                </div>
                <span className="text-xs font-mono text-cyan-400 mt-0.5 block">
                  {isDetected ? `(${distM} meters)` : 'Corridor Free (>32m)'}
                </span>
              </div>

              {/* Sensor Attributes */}
              <div className="space-y-2 text-xs font-mono border-t border-slate-800/80 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Vehicle Detected:</span>
                  <span className={`font-bold ${isDetected ? 'text-cyan-300' : 'text-slate-400'}`}>
                    {isDetected ? 'YES' : 'NO'}
                  </span>
                </div>

                {isDetected && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-sans">Target Vehicle:</span>
                    <span className="text-slate-200">{s.detectedVehicleId} ({s.detectedVehicleType})</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Demand Level:</span>
                  <span className={`font-bold ${
                    s.demandLevel === 'HEAVY' ? 'text-rose-400' :
                    s.demandLevel === 'MODERATE' ? 'text-amber-400' :
                    s.demandLevel === 'LIGHT' ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    {s.demandLevel || 'EMPTY'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Transducer Health:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{s.health || 'ONLINE'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Acoustic Pings:</span>
                  <span className="text-slate-300">{s.pingCount || 0}</span>
                </div>
              </div>

              {/* Sparkline Visualizer */}
              <div className="mt-3 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                  Rolling Echo History
                </span>
                <div className="h-8 flex items-end gap-0.5 bg-slate-900/50 p-1 rounded-lg">
                  {history.slice(-20).map((h, i) => {
                    const heightPercent = Math.min(100, Math.max(10, 100 - (h.distanceCm / 3200) * 100));
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm transition-all ${h.detected ? 'bg-cyan-400' : 'bg-slate-700'}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`${h.distanceCm} cm`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HC-SR04 Technical Specifications & Acoustic Physics Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">HC-SR04 ACOUSTIC SENSING SPECIFICATION</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The ultrasonic simulation uses high-frequency 40 kHz acoustic burst time-of-flight (ToF) calculations.
          The round-trip travel time of sound through air at 20°C (speed of sound c ≈ 343 m/s) determines vehicle proximity:
        </p>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-300">
          Distance (cm) = (Echo Pulse Duration in µs × 0.0343) / 2
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Nominal Range</span>
            <span className="font-bold text-white">2 cm to 400 cm (Scaled 32m)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Measuring Angle</span>
            <span className="font-bold text-white">15° Conical Field</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Trigger Input Pulse</span>
            <span className="font-bold text-white">10 µs TTL Level Pulse</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">ESP32 GPIO Interface</span>
            <span className="font-bold text-white">TRIG (Output) / ECHO (Input)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
