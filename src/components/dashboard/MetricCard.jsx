/**
 * Adaptive FairFlow - Reusable Key Performance Indicator (KPI) Metric Card
 */

import React from 'react';

export function MetricCard({ title, value, unit = '', icon: Icon, color = 'cyan', subtitle }) {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
  };

  const style = colorMap[color] || colorMap.cyan;

  return (
    <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-slate-700 transition-all">
      <div className="space-y-1">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-white font-mono tracking-tight">{value}</span>
          {unit && <span className="text-xs font-medium text-slate-400 font-sans">{unit}</span>}
        </div>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl border ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
