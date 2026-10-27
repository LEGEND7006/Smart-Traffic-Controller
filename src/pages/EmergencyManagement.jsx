/**
 * Adaptive FairFlow - Emergency Management & RFID Priority Operations
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, Siren, Radio, CheckCircle2, 
  XCircle, Zap, ShieldCheck, History, Clock
} from 'lucide-react';
import { APPROACH_ORDER } from '../simulation/constants';

export function EmergencyManagement({
  rfidData = {},
  onDispatchAmbulance,
  onManualTrigger,
  onCancelEmergency,
  onClearAll
}) {
  const [selectedApproach, setSelectedApproach] = useState('EAST');
  const activeRequests = rfidData.activeRequests || [];
  const history = rfidData.history || [];
  const readers = rfidData.readers || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">EMERGENCY PREEMPTION & RFID CONTROL</h2>
          <p className="text-xs text-slate-400">Autonomous RFID transponder interrogation and fail-safe signal preemption orchestration</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>ACTIVE QUEUE: {activeRequests.length} INCIDENT(S)</span>
        </div>
      </div>

      {/* Dispatch & Testing Control Console */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">INTERACTIVE EMERGENCY DISPATCH</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <span className="text-xs text-slate-400 font-medium">Select Approach Ingress Corridor:</span>
            <div className="grid grid-cols-4 gap-2">
              {APPROACH_ORDER.map((app) => (
                <button
                  key={app}
                  onClick={() => setSelectedApproach(app)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectedApproach === app
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              When spawned, the ambulance travels along <span className="font-semibold text-white">{selectedApproach} Road</span>,
              enters the virtual RFID interrogation zone, authenticates transponder tag <span className="font-mono text-amber-300 font-bold">RFID-EMERG-AMB-911</span>,
              and requests immediate safe preemption clearance.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-2.5">
            <button
              onClick={() => onDispatchAmbulance(selectedApproach)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all group"
            >
              <Siren className="w-5 h-5 text-white group-hover:animate-bounce" />
              <span>Dispatch Emergency Ambulance on {selectedApproach}</span>
            </button>

            <button
              onClick={() => onManualTrigger(selectedApproach)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all"
            >
              <Radio className="w-4 h-4" />
              <span>Simulate RFID Tag Detection on {selectedApproach}</span>
            </button>

            {activeRequests.length > 0 && (
              <button
                onClick={onClearAll}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all"
              >
                <span>Clear All Active Emergency Preemptions</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Overhead RFID Gantry Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPROACH_ORDER.map((app) => {
          const r = readers[app] || {};
          const isActive = r.active;

          return (
            <div
              key={app}
              className={`glass-panel p-4 rounded-2xl border transition-all ${
                isActive
                  ? 'border-amber-500/60 shadow-lg shadow-amber-950/40 bg-gradient-to-b from-amber-950/20 to-slate-900/60'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">{app} RFID GANTRY</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isActive ? 'INTERROGATING' : 'STANDBY'}
                </span>
              </div>

              <div className="my-3 space-y-1.5 text-xs font-mono">
                <div className="text-[11px] text-slate-400">Gantry Station ID: <span className="text-white">{r.id || `RFID-${app}`}</span></div>
                <div className="text-[11px] text-slate-400">Zone Range: <span className="text-cyan-300">10m - 32m from stop</span></div>
                <div className="text-[11px] text-slate-400">Read Tag: <span className="text-amber-300 font-bold">{r.readingTag || 'NONE'}</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident History & Preemption Logs */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">EMERGENCY PREEMPTION INCIDENT AUDIT</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">INCIDENT ID</th>
                <th className="py-2.5 px-3">APPROACH</th>
                <th className="py-2.5 px-3">AUTHENTICATED TAG</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-500 italic font-sans">
                    No emergency preemption incidents registered yet. Dispatch an ambulance above to test.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-rose-300">{h.id}</td>
                    <td className="py-2.5 px-3 text-white">{h.approach}</td>
                    <td className="py-2.5 px-3 text-amber-300">{h.tagId}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'PREEMPTION_PENDING' ? 'bg-amber-500/20 text-amber-300' :
                        h.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {h.status === 'PREEMPTION_PENDING' && (
                        <button
                          onClick={() => onCancelEmergency(h.id)}
                          className="text-rose-400 hover:text-white text-[11px] font-semibold underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
