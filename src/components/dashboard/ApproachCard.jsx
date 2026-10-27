/**
 * Adaptive FairFlow - Approach Comparison Card
 * 
 * Displays deep telemetry for an individual approach corridor:
 * Signal aspect, vehicles queued, ultrasonic telemetry, fuzzy urgency, and DPI score.
 */

import React from 'react';
import { Car, Clock, Radar, Flame, TrendingUp } from 'lucide-react';

export function ApproachCard({ approach, signal = 'RED', metrics, sensor, dpiData, isSelected = false }) {
  const isGreen = signal === 'GREEN';
  const isYellow = signal === 'YELLOW';
  const isRed = signal === 'RED';

  const signalBadge = isGreen
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 glow-emerald'
    : isYellow
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 glow-amber'
    : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

  const fuzzyCategory = dpiData?.fuzzyDetails?.category || 'LOW';
  const fuzzyColor = 
    fuzzyCategory === 'VERY HIGH' ? 'text-rose-400 bg-rose-500/20 border-rose-500/30' :
    fuzzyCategory === 'HIGH' ? 'text-amber-400 bg-amber-500/20 border-amber-500/30' :
    fuzzyCategory === 'NORMAL' ? 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' :
    'text-slate-400 bg-slate-800 border-slate-700';

  const dpi = dpiData?.dpi ?? 0;
  const queueLength = metrics?.queueLength ?? 0;
  const vehicleCount = metrics?.vehicleCount ?? 0;
  const avgWait = metrics?.avgWaitTime?.toFixed(1) ?? '0.0';
  const sensorDist = sensor?.detected ? `${sensor.distanceCm} cm` : 'CLEAR';

  return (
    <div className={`glass-panel p-4 rounded-2xl border transition-all ${
      isGreen 
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40 bg-gradient-to-b from-emerald-950/20 to-slate-900/60' 
        : isSelected 
        ? 'border-cyan-500/60 shadow-lg shadow-cyan-950/40' 
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Approach & Signal Aspect */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-white tracking-wide">{approach} CORRIDOR</h3>
          <span className="text-[10px] font-mono text-slate-400">APPROACH LANES</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${signalBadge}`}>
          <span className={`w-2 h-2 rounded-full ${isGreen ? 'bg-emerald-400' : isYellow ? 'bg-amber-400' : 'bg-rose-400'}`} />
          <span>{signal}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
        {/* Vehicles / Queue */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>Demand / Queue</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {vehicleCount} <span className="text-xs font-normal text-slate-400">({queueLength} queued)</span>
          </div>
        </div>

        {/* Avg Wait */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Wait Time</span>
          </div>
          <div className="text-base font-bold text-white font-mono">
            {avgWait} <span className="text-xs font-normal text-slate-400">sec</span>
          </div>
        </div>

        {/* Ultrasonic Sensor */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Radar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ultrasonic Echo</span>
          </div>
          <div className="text-xs font-bold font-mono text-cyan-300">
            {sensorDist}
          </div>
        </div>

        {/* Fuzzy Urgency */}
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Fuzzy Urgency</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${fuzzyColor}`}>
              {fuzzyCategory}
            </span>
            <span className="text-xs font-mono text-slate-300">({dpiData?.fuzzyUrgencyScore || 0})</span>
          </div>
        </div>
      </div>

      {/* Dynamic Priority Index (DPI) Bar */}
      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Priority Index (DPI)</span>
          </span>
          <span className="font-mono font-extrabold text-cyan-300">{dpi} pts</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, dpi)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
