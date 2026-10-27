/**
 * Adaptive FairFlow - Traffic Analytics & Performance Metrics Dashboard
 */

import React from 'react';
import { TrafficCharts } from '../components/dashboard/TrafficCharts';
import { MetricCard } from '../components/dashboard/MetricCard';
import { 
  BarChart3, Activity, TrendingUp, Clock, 
  Car, ShieldAlert, Award, ArrowUpRight
} from 'lucide-react';
import { APPROACH_ORDER } from '../simulation/constants';

export function TrafficAnalytics({ chartHistory = [], vehicles = [], metrics = {}, fsm }) {
  const approachesData = {};
  for (const app of APPROACH_ORDER) {
    const oncoming = vehicles.filter(v => v.approach === app && !v.hasPassedStopLine);
    const waiting = oncoming.filter(v => v.isWaitingAtRed);
    const totalWait = oncoming.reduce((acc, v) => acc + v.waitTime, 0);
    const avgWait = oncoming.length > 0 ? totalWait / oncoming.length : 0;
    approachesData[app] = {
      approach: app,
      vehicleCount: oncoming.length,
      queueLength: waiting.length,
      avgWaitTime: avgWait
    };
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">TRAFFIC ANALYTICS & SYSTEM PERFORMANCE</h2>
        <p className="text-xs text-slate-400">Live operational data and historical telemetry recorded from the simulation engine</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Vehicles Handled"
          value={metrics.passedVehicles || 0}
          unit="served"
          icon={Award}
          color="emerald"
          subtitle="Passed safely through intersection"
        />
        <MetricCard
          title="Active Congestion"
          value={metrics.waitingVehicles || 0}
          unit="queued"
          icon={Activity}
          color="amber"
          subtitle="Awaiting green clearance"
        />
        <MetricCard
          title="Mean Wait Duration"
          value={metrics.avgWaitTime || '0.0'}
          unit="sec"
          icon={Clock}
          color="cyan"
          subtitle="Network average across all approaches"
        />
        <MetricCard
          title="System Fairness Rating"
          value={`${((metrics.fairnessIndex || 1.0) * 100).toFixed(0)}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Anti-starvation equity balance"
        />
      </div>

      {/* Interactive Charts Suite */}
      <TrafficCharts
        chartHistory={chartHistory}
        fsm={fsm}
        approachesData={approachesData}
      />

      {/* Detailed Approach Breakdown Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-wide">CORRIDOR PERFORMANCE COMPARISON</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">CORRIDOR</th>
                <th className="py-2.5 px-3">ACTIVE VEHICLES</th>
                <th className="py-2.5 px-3">QUEUE LENGTH</th>
                <th className="py-2.5 px-3">AVG WAIT TIME</th>
                <th className="py-2.5 px-3">CURRENT SIGNAL</th>
                <th className="py-2.5 px-3">SERVICE HEALTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {APPROACH_ORDER.map((app) => {
                const data = approachesData[app];
                const signal = fsm?.signals?.[app] || 'RED';
                const queue = data?.queueLength || 0;
                const status = queue > 4 ? 'CONGESTED' : queue > 1 ? 'MODERATE' : 'OPTIMAL';
                const statusColor = queue > 4 ? 'text-rose-400' : queue > 1 ? 'text-amber-400' : 'text-emerald-400';

                return (
                  <tr key={app} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{app} ROAD</td>
                    <td className="py-2.5 px-3 text-cyan-300">{data?.vehicleCount || 0}</td>
                    <td className="py-2.5 px-3 text-amber-300">{data?.queueLength || 0}</td>
                    <td className="py-2.5 px-3 text-purple-300">{(data?.avgWaitTime || 0).toFixed(1)}s</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        signal === 'GREEN' ? 'bg-emerald-500/20 text-emerald-300' :
                        signal === 'YELLOW' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {signal}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 font-semibold ${statusColor}`}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
