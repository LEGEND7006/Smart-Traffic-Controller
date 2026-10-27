/**
 * Adaptive FairFlow - Main Application Shell
 */

import React, { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LiveSimulation } from './pages/LiveSimulation';
import { TrafficAnalytics } from './pages/TrafficAnalytics';
import { SensorMonitoring } from './pages/SensorMonitoring';
import { EmergencyManagement } from './pages/EmergencyManagement';
import { ControllerLogic } from './pages/ControllerLogic';
import { Settings } from './pages/Settings';

export default function App() {
  const [currentTab, setCurrentTab] = useState('simulation');
  const sim = useSimulation();

  // Keyboard shortcut listener (Space to play/pause, R to restart)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input field
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        sim.togglePause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        sim.restart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sim]);

  const activeEmergencyApproach = sim.rfid?.activeRequests?.[0]?.approach || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Persistent Operations Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        fairnessIndex={sim.metrics?.fairnessIndex ?? 0.95}
        onQuickAmbulance={sim.dispatchAmbulance}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Status Bar & Controls */}
        <Header
          simTime={sim.simTime}
          isPaused={sim.isPaused}
          fsm={sim.fsm}
          onTogglePause={sim.togglePause}
          onRestart={sim.restart}
          onReset={sim.reset}
          speedMultiplier={sim.settings?.speedMultiplier ?? 1.0}
          onChangeSpeed={(speed) => sim.updateSettings({ speedMultiplier: speed })}
          activeEmergency={activeEmergencyApproach}
        />

        {/* Scrollable Page Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070b14]">
          {currentTab === 'simulation' && (
            <LiveSimulation
              simTime={sim.simTime}
              fsm={sim.fsm}
              vehicles={sim.vehicles}
              sensors={sim.sensors}
              rfid={sim.rfid}
              evaluation={sim.evaluation}
              metrics={sim.metrics}
              settings={sim.settings}
              chartHistory={sim.chartHistory}
              eventLogs={sim.eventLogs}
              selectedVehicle={sim.selectedVehicle}
              onSelectVehicle={sim.selectVehicle}
              onClearSelectedVehicle={sim.clearSelectedVehicle}
              onUpdateSettings={sim.updateSettings}
              onSpawnVehicle={sim.spawnVehicle}
              onDispatchAmbulance={sim.dispatchAmbulance}
              onManualTriggerEmergency={sim.manualTriggerEmergency}
              onCancelEmergency={sim.cancelEmergency}
              onClearAllEmergencies={sim.clearAllEmergencies}
            />
          )}

          {currentTab === 'analytics' && (
            <TrafficAnalytics
              chartHistory={sim.chartHistory}
              vehicles={sim.vehicles}
              metrics={sim.metrics}
              fsm={sim.fsm}
            />
          )}

          {currentTab === 'sensors' && (
            <SensorMonitoring sensors={sim.sensors} />
          )}

          {currentTab === 'emergency' && (
            <EmergencyManagement
              rfidData={sim.rfid}
              onDispatchAmbulance={sim.dispatchAmbulance}
              onManualTrigger={sim.manualTriggerEmergency}
              onCancelEmergency={sim.cancelEmergency}
              onClearAll={sim.clearAllEmergencies}
            />
          )}

          {currentTab === 'logic' && (
            <ControllerLogic
              evaluation={sim.evaluation}
              fsm={sim.fsm}
              settings={sim.settings}
            />
          )}

          {currentTab === 'settings' && (
            <Settings
              settings={sim.settings}
              onUpdateSettings={sim.updateSettings}
              onReset={sim.reset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
