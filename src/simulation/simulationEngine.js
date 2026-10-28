/**
 * Adaptive FairFlow - Master Simulation & Orchestration Engine
 * 
 * Central coordinator combining:
 * - 3D Vehicle Kinematics & Collision Management
 * - HC-SR04 Ultrasonic Sensor Telemetry
 * - RFID Emergency Preemption
 * - Traffic Signal Finite State Machine
 * - Mamdani Fuzzy Urgency Inference
 * - Dynamic Priority Index (DPI)
 * - Anti-Starvation Fairness Monitoring
 * - Event Logging & Performance Metrics
 */

import { APPROACH_ORDER, DEFAULT_SETTINGS, VEHICLE_TYPES } from './constants';
import { createVehicle, updateVehicle } from './vehicleRoutes';
import { trafficFSM } from './trafficSignalFSM';
import { sensorSimulator } from './sensorSimulator';
import { rfidSimulator } from './rfidSimulator';
import { dynamicPriorityEngine } from './dynamicPriority';
import { fairnessManager } from './fairnessManager';

export class SimulationEngine {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.isRunning = true;
    this.isPaused = false;
    this.simTime = 0;
    this.vehicles = [];
    this.passedVehiclesCount = 0;
    this.lastSpawnTime = 0;
    this.selectedVehicle = null;

    // Event log buffer (most recent first)
    this.eventLogs = [];

    // Chart telemetry history
    this.chartDataHistory = [];

    // Subscribers for UI updates
    this.subscribers = new Set();

    // Initialize with a few starting vehicles on different approaches
    this.seedInitialVehicles();

    // Log startup
    this.logEvent('SYSTEM', 'Adaptive FairFlow simulation engine initialized in Autonomous Hybrid Mode.');
  }

  seedInitialVehicles() {
    this.vehicles = [
      createVehicle(VEHICLE_TYPES.CAR, 'NORTH', 'STRAIGHT'),
      createVehicle(VEHICLE_TYPES.BUS, 'EAST', 'STRAIGHT'),
      createVehicle(VEHICLE_TYPES.TRUCK, 'SOUTH', 'STRAIGHT'),
      createVehicle(VEHICLE_TYPES.CAR, 'WEST', 'STRAIGHT')
    ];
    // Stagger positions slightly
    this.vehicles[0].position.z = 24.0;
    this.vehicles[1].position.x = 22.0;
    this.vehicles[2].position.z = -20.0;
    this.vehicles[3].position.x = -26.0;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const snapshot = this.getSnapshot();
    for (const callback of this.subscribers) {
      callback(snapshot);
    }
  }

  logEvent(category, message, details = {}) {
    const event = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: parseFloat(this.simTime.toFixed(1)),
      timestamp: new Date().toLocaleTimeString(),
      category, // 'SIGNAL', 'SENSOR', 'EMERGENCY', 'CONTROLLER', 'VEHICLE', 'SYSTEM'
      message,
      details
    };

    this.eventLogs.unshift(event);
    if (this.eventLogs.length > 250) {
      this.eventLogs.pop();
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    trafficFSM.updateConfig({
      minGreen: this.settings.minGreen,
      maxGreen: this.settings.maxGreen,
      yellowTime: this.settings.yellowTime,
      allRedTime: this.settings.allRedTime
    });
    if (this.settings.weights) {
      dynamicPriorityEngine.setWeights(this.settings.weights);
    }
    if (this.settings.ultrasonicRange) {
      sensorSimulator.setMaxRange(this.settings.ultrasonicRange);
    }
    this.logEvent('SYSTEM', 'Configuration parameters updated.');
    this.notifySubscribers();
  }

  start() {
    this.isPaused = false;
    this.logEvent('SYSTEM', 'Simulation started / resumed.');
    this.notifySubscribers();
  }

  pause() {
    this.isPaused = true;
    this.logEvent('SYSTEM', 'Simulation paused.');
    this.notifySubscribers();
  }

  togglePause() {
    if (this.isPaused) this.start();
    else this.pause();
  }

  reset() {
    this.simTime = 0;
    this.vehicles = [];
    this.passedVehiclesCount = 0;
    this.lastSpawnTime = 0;
    this.selectedVehicle = null;
    this.chartDataHistory = [];

    trafficFSM.reset();
    sensorSimulator.reset();
    rfidSimulator.reset();
    fairnessManager.reset();

    this.seedInitialVehicles();
    this.logEvent('SYSTEM', 'Simulation completely reset to initial parameters.');
    this.notifySubscribers();
  }

  restart() {
    this.reset();
    this.start();
  }

  /**
   * Spawn a specific vehicle
   */
  spawnVehicle(type = VEHICLE_TYPES.CAR, approach = 'NORTH', turnType = 'STRAIGHT', isEmergency = false) {
    // Inline spawn coordinates (mirrors vehicleRoutes.js generateRoute startPos)
    // NORTH: x=-2.4, z=+48 | SOUTH: x=+2.4, z=-48 | EAST: x=+48, z=+2.4 | WEST: x=-48, z=-2.4
    const SPAWN_POS = {
      NORTH: { x: -2.4, z: 48 },
      SOUTH: { x:  2.4, z: -48 },
      EAST:  { x:  48,  z: 2.4 },
      WEST:  { x: -48,  z: -2.4 },
    };
    const sp = SPAWN_POS[approach] || { x: 0, z: 0 };

    // Block spawn if another vehicle is already within 8 units of the entry point
    const tooClose = this.vehicles.some(v => {
      if (v.approach !== approach) return false;
      const dist = Math.sqrt(
        Math.pow(v.position.x - sp.x, 2) + Math.pow(v.position.z - sp.z, 2)
      );
      return dist < 8.0;
    });

    if (tooClose && !isEmergency) {
      return null; // road entrance congested, skip this spawn tick
    }

    const veh = createVehicle(type, approach, turnType, isEmergency);
    this.vehicles.push(veh);

    this.logEvent('VEHICLE', `New ${type} ${veh.id} entered ${approach} Road heading ${turnType}.`, { vehicleId: veh.id, approach });
    this.notifySubscribers();
    return veh;
  }

  /**
   * High priority emergency ambulance dispatch
   */
  dispatchAmbulance(approach = 'EAST') {
    // Limit simultaneous ambulances on scene to avoid pile-up
    const activeAmbs = this.vehicles.filter(v => v.isEmergency);
    if (activeAmbs.length >= 3) {
      this.logEvent('EMERGENCY', 'Dispatch rejected: maximum simultaneous emergency vehicles (3) already active.', { approach });
      return null;
    }
    const amb = this.spawnVehicle(VEHICLE_TYPES.AMBULANCE, approach, 'STRAIGHT', true);
    if (amb) {
      this.logEvent('EMERGENCY', `PRIORITY ALERT: Emergency Ambulance ${amb.id} dispatched on ${approach} corridor.`, { approach, vehicleId: amb.id });
    }
    return amb;
  }

  /**
   * Clear all emergency ambulances currently on the road
   */
  clearEmergencyVehicles() {
    const count = this.vehicles.filter(v => v.isEmergency).length;
    this.vehicles = this.vehicles.filter(v => !v.isEmergency);
    rfidSimulator.clearAll();
    this.logEvent('EMERGENCY', `Cleared ${count} emergency vehicle(s) and reset RFID preemption states.`);
    this.notifySubscribers();
  }

  /**
   * Primary physics and controller tick
   * @param {number} wallDt - raw delta time from requestAnimationFrame (seconds)
   */
  tick(wallDt) {
    if (!this.isRunning || this.isPaused) return;

    // Apply speed multiplier (0.5x, 1x, 2x, etc.)
    const dt = Math.min(0.1, wallDt) * (this.settings.speedMultiplier || 1.0);
    this.simTime += dt;

    // 1. Advance Fairness & Starvation Tracking
    fairnessManager.tick(dt, trafficFSM.activeApproach);

    // 2. Ultrasonic Sensor Telemetry Calculation
    sensorSimulator.update(this.vehicles, this.simTime);

    // 3. RFID Interrogation Zone Check
    rfidSimulator.update(this.vehicles, this.simTime, (request) => {
      this.logEvent('EMERGENCY', `RFID TAG DETECTED: Valid transponder [${request.tagId}] authenticated on ${request.approach} approach. Requesting preemption.`, request);
    });

    // 4. Gather Metrics for all 4 Approaches
    const approachesData = {};
    for (const app of APPROACH_ORDER) {
      const oncoming = this.vehicles.filter(v => v.approach === app && !v.hasPassedStopLine);
      const waiting = oncoming.filter(v => v.isWaitingAtRed);
      const totalWait = oncoming.reduce((acc, v) => acc + v.waitTime, 0);
      const avgWait = oncoming.length > 0 ? totalWait / oncoming.length : 0;

      approachesData[app] = {
        approach: app,
        vehicleCount: oncoming.length,
        queueLength: waiting.length,
        avgWaitTime: avgWait,
        maxWaitTime: oncoming.reduce((max, v) => Math.max(max, v.waitTime), 0)
      };
    }

    // 5. Dynamic Priority & Fuzzy Controller Evaluation
    const emergencyApproach = rfidSimulator.getActiveEmergencyApproach();
    const evaluation = dynamicPriorityEngine.evaluateAllApproaches(approachesData, emergencyApproach);
    this.lastEvaluation = evaluation;

    // 6. Advance Traffic Signal FSM
    trafficFSM.tick(
      dt,
      () => evaluation.selectedApproach,
      (transition) => {
        if (transition.to.endsWith('_GREEN')) {
          fairnessManager.recordGreenStart(transition.activeApproach, this.simTime);
          this.logEvent('SIGNAL', `${transition.activeApproach} signal turned GREEN.`, transition);
        } else if (transition.to.endsWith('_YELLOW')) {
          this.logEvent('SIGNAL', `${transition.activeApproach} signal turned YELLOW.`, transition);
        } else if (transition.to === 'ALL_RED') {
          this.logEvent('SIGNAL', `Intersection cleared: ALL-RED safety interval engaged.`, transition);
        }
      }
    );

    // 7. Update Vehicles Motion and Car-Following Physics
    const remainingVehicles = [];
    for (let i = 0; i < this.vehicles.length; i++) {
      const veh = this.vehicles[i];
      const isGreen = trafficFSM.isGreen(veh.approach);

      // Find preceding vehicle on same approach that hasn't cleared
      let preceding = null;
      let minAheadDist = Infinity;

      for (let j = 0; j < this.vehicles.length; j++) {
        if (i === j) continue;
        const other = this.vehicles[j];
        if (other.approach === veh.approach && !other.hasClearedIntersection) {
          // Check if other is ahead of veh along travel axis
          let distAhead = 0;
          if (veh.approach === 'NORTH') distAhead = veh.position.z - other.position.z;
          else if (veh.approach === 'SOUTH') distAhead = other.position.z - veh.position.z;
          else if (veh.approach === 'EAST') distAhead = veh.position.x - other.position.x;
          else if (veh.approach === 'WEST') distAhead = other.position.x - veh.position.x;

          if (distAhead > 0 && distAhead < minAheadDist) {
            minAheadDist = distAhead;
            preceding = other;
          }
        }
      }

      const isOut = updateVehicle(veh, dt, isGreen, preceding);

      if (isOut) {
        this.passedVehiclesCount += 1;
        if (this.selectedVehicle?.id === veh.id) {
          this.selectedVehicle = null;
        }
      } else {
        remainingVehicles.push(veh);
      }
    }
    this.vehicles = remainingVehicles;

    // 8. Auto-spawning Logic according to Traffic Density
    if (this.settings.autoSpawn) {
      let interval = 3.5;
      if (this.settings.trafficDensity === 'low') interval = 5.5;
      else if (this.settings.trafficDensity === 'medium') interval = 3.2;
      else if (this.settings.trafficDensity === 'high') interval = 1.8;

      if (this.simTime - this.lastSpawnTime >= interval) {
        this.lastSpawnTime = this.simTime;
        // Pick approach with lower vehicle count or random
        const app = APPROACH_ORDER[Math.floor(Math.random() * APPROACH_ORDER.length)];
        // Random vehicle type (predominantly cars, occasional bus/truck)
        const rand = Math.random();
        let type = VEHICLE_TYPES.CAR;
        if (rand > 0.85) type = VEHICLE_TYPES.BUS;
        else if (rand > 0.70) type = VEHICLE_TYPES.TRUCK;

        // Turn types: mostly straight, some right/left turns
        const turnRand = Math.random();
        let turn = 'STRAIGHT';
        if (turnRand > 0.8) turn = 'RIGHT';
        else if (turnRand > 0.65) turn = 'LEFT';

        this.spawnVehicle(type, app, turn);
      }
    }

    // 9. Periodically Record Chart Telemetry (every 1.5 seconds)
    if (!this.lastChartRecord || this.simTime - this.lastChartRecord >= 1.5) {
      this.lastChartRecord = this.simTime;
      const chartPoint = {
        time: parseFloat(this.simTime.toFixed(0)),
        timeLabel: `${Math.floor(this.simTime / 60)}:${(Math.floor(this.simTime) % 60).toString().padStart(2, '0')}`,
        northQueue: approachesData.NORTH?.queueLength || 0,
        southQueue: approachesData.SOUTH?.queueLength || 0,
        eastQueue: approachesData.EAST?.queueLength || 0,
        westQueue: approachesData.WEST?.queueLength || 0,
        northWait: parseFloat((approachesData.NORTH?.avgWaitTime || 0).toFixed(1)),
        southWait: parseFloat((approachesData.SOUTH?.avgWaitTime || 0).toFixed(1)),
        eastWait: parseFloat((approachesData.EAST?.avgWaitTime || 0).toFixed(1)),
        westWait: parseFloat((approachesData.WEST?.avgWaitTime || 0).toFixed(1)),
        activePhase: trafficFSM.activeApproach || 'CLEARANCE'
      };

      this.chartDataHistory.push(chartPoint);
      if (this.chartDataHistory.length > 25) {
        this.chartDataHistory.shift();
      }
    }

    // Update selected vehicle reference if still active
    if (this.selectedVehicle) {
      const updated = this.vehicles.find(v => v.id === this.selectedVehicle.id);
      this.selectedVehicle = updated || null;
    }

    // Notify 2D dashboard subscribers ~every 15 frames (avoids hammering React state)
    this._tickCount = (this._tickCount || 0) + 1;
    if (this._tickCount % 15 === 0) {
      this.notifySubscribers();
    }
  }

  selectVehicle(vehicleId) {
    this.selectedVehicle = this.vehicles.find(v => v.id === vehicleId) || null;
    this.notifySubscribers();
  }

  clearSelectedVehicle() {
    this.selectedVehicle = null;
    this.notifySubscribers();
  }

  /**
   * Full data snapshot for React views
   */
  getSnapshot() {
    const fsmState = trafficFSM.getStateDetails();
    const sensors = sensorSimulator.getAllSensors();
    const rfidData = {
      readers: rfidSimulator.readers,
      activeRequests: rfidSimulator.activeEmergencyRequests,
      history: rfidSimulator.emergencyHistory
    };

    // Calculate aggregated system metrics
    const waitingVehicles = this.vehicles.filter(v => v.isWaitingAtRed);
    const totalWait = this.vehicles.reduce((acc, v) => acc + v.waitTime, 0);
    const avgWait = this.vehicles.length > 0 ? totalWait / this.vehicles.length : 0;
    const maxWait = this.vehicles.reduce((max, v) => Math.max(max, v.waitTime), 0);

    return {
      simTime: this.simTime,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      settings: this.settings,
      fsm: fsmState,
      sensors,
      rfid: rfidData,
      evaluation: this.lastEvaluation,
      vehicles: this.vehicles,
      selectedVehicle: this.selectedVehicle,
      metrics: {
        totalVehicles: this.vehicles.length,
        waitingVehicles: waitingVehicles.length,
        passedVehicles: this.passedVehiclesCount,
        avgWaitTime: parseFloat(avgWait.toFixed(1)),
        maxWaitTime: parseFloat(maxWait.toFixed(1)),
        fairnessIndex: fairnessManager.getSystemFairnessIndex()
      },
      chartHistory: this.chartDataHistory,
      eventLogs: this.eventLogs
    };
  }
}

// Singleton global engine instance
export const simulationEngine = new SimulationEngine();
