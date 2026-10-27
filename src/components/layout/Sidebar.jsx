/**
 * Adaptive FairFlow - Sidebar Navigation
 */

import React from 'react';
import { 
  Box, BarChart3, Radar, ShieldAlert, Cpu, 
  Settings, Siren, Scale, CheckCircle2
} from 'lucide-react';

export function Sidebar({ currentTab, onSelectTab, fairnessIndex = 0.95, onQuickAmbulance }) {
  const navItems = [
    { id: 'simulation', label: 'Live Simulation', icon: Box },
    { id: 'analytics',  label: 'Traffic Analytics', icon: BarChart3 },
    { id: 'sensors',    label: 'Sensor Monitoring', icon: Radar },
    { id: 'emergency',  label: 'Emergency / RFID',  icon: ShieldAlert },
    { id: 'logic',      label: 'Controller Logic',  icon: Cpu },
    { id: 'settings',   label: 'System Settings',   icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0e1a] border-r border-slate-800 flex flex-col justify-between p-4 z-20 select-none">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase px-3">
            Operations Center
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/40 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Fairness Metric Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-purple-400" />
              <span>Equity Index</span>
            </span>
            <span className="font-mono font-bold text-purple-300">
              {(fairnessIndex * 100).toFixed(0)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, fairnessIndex * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            Anti-starvation protocol balancing green times across 4 corridors.
          </p>
        </div>
      </div>

      {/* Footer Emergency Priority Dispatcher Action */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <button
          onClick={() => onQuickAmbulance && onQuickAmbulance('EAST')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:border-rose-400 transition-all shadow-md group"
        >
          <Siren className="w-4 h-4 text-rose-400 group-hover:animate-bounce" />
          <span>Dispatch Ambulance</span>
        </button>

        <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
          <span>Simulation Twin</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Optimal</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
