/**
 * Adaptive FairFlow - Real-Time Traffic Analytics Charts (Recharts)
 */

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon } from 'lucide-react';

export function TrafficCharts({ chartHistory = [], fsm, approachesData = {} }) {
  const [activeTab, setActiveTab] = useState('queues');

  // Colors for North, South, East, West
  const approachColors = {
    NORTH: '#38bdf8', // Cyan
    SOUTH: '#34d399', // Emerald
    EAST:  '#fbbf24', // Amber
    WEST:  '#c084fc'  // Purple
  };

  const waitTimeData = [
    { name: 'North', wait: approachesData?.NORTH?.avgWaitTime || 0, queue: approachesData?.NORTH?.queueLength || 0 },
    { name: 'South', wait: approachesData?.SOUTH?.avgWaitTime || 0, queue: approachesData?.SOUTH?.queueLength || 0 },
    { name: 'East',  wait: approachesData?.EAST?.avgWaitTime || 0,  queue: approachesData?.EAST?.queueLength || 0 },
    { name: 'West',  wait: approachesData?.WEST?.avgWaitTime || 0,  queue: approachesData?.WEST?.queueLength || 0 }
  ];

  const pieData = [
    { name: 'North Corridor', value: (approachesData?.NORTH?.vehicleCount || 1) + 2, color: approachColors.NORTH },
    { name: 'South Corridor', value: (approachesData?.SOUTH?.vehicleCount || 1) + 2, color: approachColors.SOUTH },
    { name: 'East Corridor',  value: (approachesData?.EAST?.vehicleCount || 1) + 2,  color: approachColors.EAST },
    { name: 'West Corridor',  value: (approachesData?.WEST?.vehicleCount || 1) + 2,  color: approachColors.WEST }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
      {/* Chart Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">TELEMETRY & QUEUE DYNAMICS</h3>
          <p className="text-xs text-slate-400">Live operational data collected from virtual intersection sensors</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('queues')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'queues' ? 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineIcon className="w-3.5 h-3.5" />
            <span>Queue History</span>
          </button>
          <button
            onClick={() => setActiveTab('waittime')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'waittime' ? 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Wait Times</span>
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'distribution' ? 'bg-cyan-600 text-white font-medium shadow-md shadow-cyan-600/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Demand Distribution</span>
          </button>
        </div>
      </div>

      {/* Chart Body */}
      <div className="h-64 w-full">
        {activeTab === 'queues' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="northQueue" name="North Queue" stroke={approachColors.NORTH} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="southQueue" name="South Queue" stroke={approachColors.SOUTH} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="eastQueue"  name="East Queue"  stroke={approachColors.EAST}  strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="westQueue"  name="West Queue"  stroke={approachColors.WEST}  strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'waittime' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waitTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="s" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="wait" name="Avg Wait Time (sec)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="queue" name="Waiting Vehicles" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
