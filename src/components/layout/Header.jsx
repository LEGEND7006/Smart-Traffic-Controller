/**
 * Adaptive FairFlow - Top Application Header & Live Operations Bar
 */

import React from 'react';
import { 
  Play, Pause, RotateCcw, RefreshCw, Cpu, 
  Wifi, Clock, ShieldAlert, Sparkles, Activity
} from 'lucide-react';

export function Header({
  simTime = 0,
  isPaused = false,
  fsm,
  onTogglePause,
  onRestart,
  onReset,
  speedMultiplier = 1.0,
  onChangeSpeed,
  activeEmergency = null
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeApp = fsm?.activeApproach || 'CLEARANCE';
  const stateTimer = fsm?.stateTimer || 0;
  const isAllRed = fsm?.state === 'ALL_RED';

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-wider text-white">ADAPTIVE FAIRFLOW</h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              v2.4 HYBRID
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Context-Aware Fuzzy Logic & Dynamic Priority Controller</p>
        </div>
      </div>

      {/* Center Operational Telemetry */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Status: Running / Paused */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-xs font-bold text-slate-200">
            {isPaused ? 'PAUSED' : 'RUNNING'}
          </span>
          <span className="text-slate-600">|</span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono font-semibold text-cyan-300">{formatTime(simTime)}</span>
        </div>

        {/* Current Traffic Phase */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Phase:</span>
          {isAllRed ? (
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
              ALL-RED ({stateTimer.toFixed(1)}s)
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
              fsm?.state?.endsWith('_YELLOW')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {activeApp} {fsm?.state?.endsWith('_YELLOW') ? 'YELLOW' : 'GREEN'} ({stateTimer.toFixed(1)}s)
            </span>
          )}
        </div>

        {/* Emergency Alert Badge */}
        {activeEmergency && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold font-mono">RFID PREEMPTION: {activeEmergency}</span>
          </div>
        )}

        {/* Controller Engine Mode */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fuzzy-DPI</span>
        </div>

        {/* Hardware Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sim Mode</span>
        </div>
      </div>

      {/* Control Actions & Speed Multiplier */}
      <div className="flex items-center gap-2">
        {/* Speed Selector */}
        <div className="flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-800 text-xs">
          {[0.5, 1.0, 2.0, 4.0].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed && onChangeSpeed(s)}
              className={`px-2 py-1 rounded-lg font-mono font-medium transition-colors ${
                speedMultiplier === s 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Play / Pause */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
          }`}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Restart Simulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Reset Everything"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
