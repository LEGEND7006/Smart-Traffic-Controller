/**
 * Adaptive FairFlow - Real-Time Operational Event Audit Log
 */

import React, { useState } from 'react';
import { 
  FileText, ShieldAlert, Radio, TrafficCone, 
  Cpu, Car, Filter, Trash2
} from 'lucide-react';

export function EventLog({ logs = [], onClear }) {
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.category === filter;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'EMERGENCY':
        return { label: 'EMERGENCY', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'SIGNAL':
        return { label: 'SIGNAL', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'SENSOR':
        return { label: 'SENSOR', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'CONTROLLER':
        return { label: 'CONTROLLER', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'VEHICLE':
        return { label: 'VEHICLE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'SYSTEM', color: 'bg-slate-700/40 text-slate-300 border-slate-600/40' };
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col h-full">
      {/* Header and Filter Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">SYSTEM AUDIT STREAM</h3>
          <span className="text-xs font-mono text-slate-400">({filteredLogs.length} events)</span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-[11px]">
          {['ALL', 'SIGNAL', 'SENSOR', 'EMERGENCY', 'VEHICLE', 'CONTROLLER'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 rounded-lg transition-all ${
                filter === cat
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[300px] text-xs font-mono">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 italic font-sans text-xs">
            No events logged for current filter.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = getCategoryBadge(log.category);
            return (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-slate-400 text-[10px]">{log.timestamp} (T+{log.time}s)</span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">{log.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
