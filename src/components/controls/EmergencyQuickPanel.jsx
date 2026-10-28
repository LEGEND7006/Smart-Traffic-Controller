/**
 * Adaptive FairFlow - Emergency Management & RFID Priority Console
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, Siren, Radio, CheckCircle, 
  XCircle, ArrowRight, Zap, RefreshCw
} from 'lucide-react';

export function EmergencyQuickPanel({
  rfidData,
  onDispatchAmbulance,
  onManualTrigger,
  onCancelEmergency,
  onClearAll
}) {
  const [approach, setApproach] = useState('EAST');
  const activeRequests = rfidData?.activeRequests || [];
  const activeEmergency = activeRequests[0];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">EMERGENCY RFID PREEMPTION</h3>
            <p className="text-xs text-slate-400">Authenticated High-Frequency Vehicle Interrogation Console</p>
          </div>
        </div>

        {activeEmergency ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>PREEMPTION ACTIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-slate-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>STANDBY</span>
          </div>
        )}
      </div>

      {/* Corridor Selector & Ambulance Dispatch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300">Select Emergency Ingress Corridor:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {['NORTH', 'SOUTH', 'EAST', 'WEST'].map((app) => (
              <button
                key={app}
                onClick={() => setApproach(app)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                  approach === app
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {app}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onDispatchAmbulance(approach)}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>Spawn {approach}</span>
            </button>

            <button
              onClick={onClearAll}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 transition-all"
              title="Clear all emergency vehicles & reset preemption"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Clear Road</span>
            </button>
          </div>

          <button
            onClick={() => onManualTrigger(approach)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>Force RFID Trigger on {approach}</span>
          </button>
        </div>
      </div>

      {/* Active Emergency Request Banner */}
      {activeEmergency ? (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-rose-400" />
              <span>Priority Request #{activeEmergency.id}</span>
            </span>
            <button
              onClick={() => onCancelEmergency(activeEmergency.id)}
              className="text-rose-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold underline"
            >
              Cancel Preemption
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-300">
            <div>Corridor: <span className="font-bold text-white">{activeEmergency.approach}</span></div>
            <div>Tag: <span className="text-amber-300">{activeEmergency.tagId}</span></div>
            <div>Status: <span className="text-emerald-400">{activeEmergency.status}</span></div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-slate-500" />
            <span>All 4 RFID gantries scanning for transponders within 32m...</span>
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">ALL READERS READY</span>
        </div>
      )}
    </div>
  );
}
