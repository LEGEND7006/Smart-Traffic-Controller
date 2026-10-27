/**
 * Adaptive FairFlow - Vehicle Telemetry & Inspection Panel
 */

import React from 'react';
import { Car, Clock, Gauge, Compass, AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function VehicleDetailModal({ vehicle, onClose }) {
  if (!vehicle) return null;

  const speedKmh = (vehicle.speed * 3.6).toFixed(1);
  const waitTimeSec = vehicle.waitTime.toFixed(1);

  return (
    <div 
      className="absolute top-4 right-4 z-20 w-80 rounded-2xl glass-panel-accent p-4 text-slate-200 shadow-2xl border border-cyan-500/30 animate-in fade-in slide-in-from-top-4 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${vehicle.isEmergency ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'}`}>
            {vehicle.isEmergency ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Car className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white tracking-wide">{vehicle.id}</h4>
            <span className="text-xs text-slate-400 font-mono uppercase">{vehicle.type}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Key Telemetry */}
      <div className="grid grid-cols-2 gap-2 my-3 text-xs">
        {/* Speed */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Current Speed</span>
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {speedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
        </div>

        {/* Wait Time */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Wait Time</span>
          </div>
          <div className="text-base font-bold text-slate-100 font-mono">
            {waitTimeSec} <span className="text-xs font-normal text-slate-400">sec</span>
          </div>
        </div>

        {/* Approach */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Approach Road</span>
          </div>
          <div className="font-semibold text-slate-200">
            {vehicle.approach}
          </div>
        </div>

        {/* Route / Destination */}
        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Route Trajectory</span>
          </div>
          <div className="font-semibold text-slate-200">
            {vehicle.turnType}
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="space-y-2 pt-2 border-t border-slate-700/60 text-xs">
        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400">Kinematic Status:</span>
          <span className={`px-2 py-0.5 rounded font-mono font-medium ${
            vehicle.status === 'WAITING' 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : vehicle.status === 'CROSSING'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            {vehicle.status}
          </span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400">Waiting at Red Signal:</span>
          <span className={`font-mono font-medium ${vehicle.isWaitingAtRed ? 'text-rose-400' : 'text-slate-400'}`}>
            {vehicle.isWaitingAtRed ? 'YES (QUEUED)' : 'NO (FREE FLOW)'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-slate-400">Passed Stop Line:</span>
          <span className="font-mono text-slate-200">
            {vehicle.hasPassedStopLine ? 'YES (IN JUNCTION)' : 'NO (APPROACHING)'}
          </span>
        </div>

        {vehicle.isEmergency && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 mt-2">
            <div className="flex items-center gap-1.5 font-semibold text-rose-300 mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>RFID Transponder Authenticated</span>
            </div>
            <div className="font-mono text-[11px] text-rose-200/90">
              TAG: {vehicle.rfidTag}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
