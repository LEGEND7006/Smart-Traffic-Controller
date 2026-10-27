/**
 * Adaptive FairFlow - React Hook for Simulation State Management
 */

import { useState, useEffect, useCallback } from 'react';
import { simulationEngine } from '../simulation/simulationEngine';
import { rfidSimulator } from '../simulation/rfidSimulator';

export function useSimulation() {
  const [snapshot, setSnapshot] = useState(() => simulationEngine.getSnapshot());

  useEffect(() => {
    // Throttle UI re-renders to ~30 FPS for optimal browser UI performance
    let lastRenderTime = 0;
    const unsubscribe = simulationEngine.subscribe((newSnapshot) => {
      const now = performance.now();
      if (now - lastRenderTime >= 32) {
        lastRenderTime = now;
        setSnapshot({ ...newSnapshot });
      }
    });

    return () => unsubscribe();
  }, []);

  const start = useCallback(() => simulationEngine.start(), []);
  const pause = useCallback(() => simulationEngine.pause(), []);
  const togglePause = useCallback(() => simulationEngine.togglePause(), []);
  const restart = useCallback(() => simulationEngine.restart(), []);
  const reset = useCallback(() => simulationEngine.reset(), []);

  const updateSettings = useCallback((newSettings) => {
    simulationEngine.updateSettings(newSettings);
  }, []);

  const spawnVehicle = useCallback((type, approach, turnType, isEmergency) => {
    return simulationEngine.spawnVehicle(type, approach, turnType, isEmergency);
  }, []);

  const dispatchAmbulance = useCallback((approach) => {
    return simulationEngine.dispatchAmbulance(approach);
  }, []);

  const selectVehicle = useCallback((id) => {
    simulationEngine.selectVehicle(id);
  }, []);

  const clearSelectedVehicle = useCallback(() => {
    simulationEngine.clearSelectedVehicle();
  }, []);

  const manualTriggerEmergency = useCallback((approach) => {
    return rfidSimulator.manualTrigger(approach);
  }, []);

  const cancelEmergency = useCallback((requestId) => {
    rfidSimulator.cancelRequest(requestId);
  }, []);

  const clearAllEmergencies = useCallback(() => {
    rfidSimulator.clearAll();
  }, []);

  return {
    ...snapshot,
    start,
    pause,
    togglePause,
    restart,
    reset,
    updateSettings,
    spawnVehicle,
    dispatchAmbulance,
    selectVehicle,
    clearSelectedVehicle,
    manualTriggerEmergency,
    cancelEmergency,
    clearAllEmergencies
  };
}
