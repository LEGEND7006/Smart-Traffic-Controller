/**
 * Adaptive FairFlow - Simulation Quick Actions & Vehicle Spawner Toolbar
 */

import React, { useState } from 'react';
import { 
  Car, Bus, Truck, PlusCircle, Gauge, 
  ToggleLeft, ToggleRight, Sparkles, Sliders
} from 'lucide-react';
import { VEHICLE_TYPES } from '../../simulation/constants';

export function SimulationToolbar({ 
  settings, 
  onUpdateSettings, 
  onSpawnVehicle 
}) {
  const [selectedApproach, setSelectedApproach] = useState('NORTH');
  const [selectedTurn, setSelectedTurn] = useState('STRAIGHT');

  const densities = [
    { id: 'low', label: 'Low Demand' },
    { id: 'medium', label: 'Normal Demand' },
    { id: 'high', label: 'High Congestion' }
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white tracking-wider uppercase">SIMULATION DISPATCH & FLOW</h3>
        </div>

        {/* Traffic Density Presets */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          {densities.map((d) => (
            <button
              key={d.id}
              onClick={() => onUpdateSettings({ trafficDensity: d.id })}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                settings?.trafficDensity === d.id
                  ? 'bg-cyan-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Auto-Spawn Toggle */}
        <button
          onClick={() => onUpdateSettings({ autoSpawn: !settings?.autoSpawn })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            settings?.autoSpawn
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {settings?.autoSpawn ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
          <span>Auto-Spawn: {settings?.autoSpawn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Manual Vehicle Spawner Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Corridor:</span>
          <select
            value={selectedApproach}
            onChange={(e) => setSelectedApproach(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500"
          >
            <option value="NORTH">North Approach</option>
            <option value="SOUTH">South Approach</option>
            <option value="EAST">East Approach</option>
            <option value="WEST">West Approach</option>
          </select>

          <span className="text-slate-400 font-medium ml-2">Maneuver:</span>
          <select
            value={selectedTurn}
            onChange={(e) => setSelectedTurn(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs outline-none focus:border-cyan-500"
          >
            <option value="STRAIGHT">Straight Through</option>
            <option value="RIGHT">Right Turn</option>
            <option value="LEFT">Left Turn</option>
          </select>
        </div>

        {/* Vehicle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSpawnVehicle(VEHICLE_TYPES.CAR, selectedApproach, selectedTurn)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-all font-medium"
          >
            <Car className="w-3.5 h-3.5" />
            <span>+ Car</span>
          </button>
          <button
            onClick={() => onSpawnVehicle(VEHICLE_TYPES.BUS, selectedApproach, selectedTurn)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all font-medium"
          >
            <Bus className="w-3.5 h-3.5" />
            <span>+ Bus</span>
          </button>
          <button
            onClick={() => onSpawnVehicle(VEHICLE_TYPES.TRUCK, selectedApproach, selectedTurn)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 hover:border-purple-500/50 transition-all font-medium"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>+ Truck</span>
          </button>
        </div>
      </div>
    </div>
  );
}
