/**
 * Adaptive FairFlow - Primary Live 3D Simulation & Control Dashboard
 */

import React from 'react';
import { Intersection3D } from '../components/simulation/Intersection3D';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ApproachCard } from '../components/dashboard/ApproachCard';
import { SimulationToolbar } from '../components/controls/SimulationToolbar';
import { EmergencyQuickPanel } from '../components/controls/EmergencyQuickPanel';
import { EventLog } from '../components/dashboard/EventLog';
import { TrafficCharts } from '../components/dashboard/TrafficCharts';
import { VehicleDetailModal } from '../components/simulation/VehicleDetailModal';
import { Car, Clock, ShieldCheck, Scale, Cpu, Sparkles } from 'lucide-react';
import { APPROACH_ORDER } from '../simulation/constants';

export function LiveSimulation({
  simTime,
  fsm,
  vehicles,
  sensors,
  rfid,
  evaluation,
  metrics,
  settings,
  chartHistory,
  eventLogs,
  selectedVehicle,
  onSelectVehicle,
  onClearSelectedVehicle,
  onUpdateSettings,
  onSpawnVehicle,
  onDispatchAmbulance,
  onManualTriggerEmergency,
  onCancelEmergency,
  onClearAllEmergencies
}) {
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

  const signals = fsm?.signals || { NORTH: 'RED', SOUTH: 'RED', EAST: 'RED', WEST: 'RED' };
  const approachScores = evaluation?.approachScores || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Vehicles"
          value={metrics?.totalVehicles ?? 0}
          unit="in scene"
          icon={Car}
          color="cyan"
          subtitle={`${metrics?.passedVehicles ?? 0} vehicles served so far`}
        />
        <MetricCard
          title="Queued at Signals"
          value={metrics?.waitingVehicles ?? 0}
          unit="vehicles"
          icon={Clock}
          color="amber"
          subtitle="Stopped before stop line"
        />
        <MetricCard
          title="Average Wait Time"
          value={metrics?.avgWaitTime ?? '0.0'}
          unit="sec"
          icon={Cpu}
          color="purple"
          subtitle={`Max wait: ${metrics?.maxWaitTime ?? '0.0'}s`}
        />
        <MetricCard
          title="Anti-Starvation Equity"
          value={`${((metrics?.fairnessIndex ?? 1.0) * 100).toFixed(0)}%`}
          icon={Scale}
          color="emerald"
          subtitle="System fairness score"
        />
      </div>

      {/* Main 3D Viewport with Live Decision Rationale Ribbon */}
      <div className="relative space-y-3">
        {/* Why this road was selected live rationale banner */}
        {evaluation?.explanation && (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs text-slate-200 backdrop-blur-md">
            <span className="flex items-center gap-1.5 font-bold text-cyan-400 uppercase tracking-wider shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Controller Decision:</span>
            </span>
            <p className="text-slate-300 font-medium truncate">{evaluation.explanation}</p>
          </div>
        )}

        <div className="h-[520px] w-full relative">
          <Intersection3D
            fsm={fsm}
            vehicles={vehicles}
            sensors={sensors}
            rfid={rfid}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={onSelectVehicle}
            onClearSelectedVehicle={onClearSelectedVehicle}
            dayNightMode={settings?.dayNightMode || 'night'}
            onToggleDayNight={() =>
              onUpdateSettings({
                dayNightMode: settings?.dayNightMode === 'night' ? 'day' : 'night'
              })
            }
          />

          {/* Vehicle Telemetry Modal Overlay */}
          <VehicleDetailModal vehicle={selectedVehicle} onClose={onClearSelectedVehicle} />
        </div>
      </div>

      {/* 4 Approach Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {APPROACH_ORDER.map((app) => (
          <ApproachCard
            key={app}
            approach={app}
            signal={signals[app]}
            metrics={approachesData[app]}
            sensor={sensors?.[app]}
            dpiData={approachScores[app]}
            isSelected={fsm?.activeApproach === app}
          />
        ))}
      </div>

      {/* Interactive Controls Row: Spawner + Emergency Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SimulationToolbar
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onSpawnVehicle={onSpawnVehicle}
        />
        <EmergencyQuickPanel
          rfidData={rfid}
          onDispatchAmbulance={onDispatchAmbulance}
          onManualTrigger={onManualTriggerEmergency}
          onCancelEmergency={onCancelEmergency}
          onClearAll={onClearAllEmergencies}
        />
      </div>

      {/* Telemetry Charts & Audit Event Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrafficCharts
          chartHistory={chartHistory}
          fsm={fsm}
          approachesData={approachesData}
        />
        <EventLog logs={eventLogs} />
      </div>
    </div>
  );
}
