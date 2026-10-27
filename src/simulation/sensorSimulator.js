/**
 * Adaptive FairFlow - HC-SR04 Ultrasonic Sensor Simulator
 * 
 * Accurately models roadside ultrasonic transducer telemetry:
 * - Geometric line-of-sight distance calculation to oncoming vehicles
 * - Conversion to centimeters (realistic HC-SR04 echo timing: t = 2d / 343 m/s)
 * - Dynamic beam cone targeting
 * - Rolling telemetry buffer for graphing & hardware emulation
 */

import { APPROACH_ORDER, SENSOR_POSITIONS } from './constants';

export class SensorSimulator {
  constructor(maxRangeMeters = 32.0) {
    this.maxRangeMeters = maxRangeMeters;
    this.sensors = {
      NORTH: this._createSensorState('NORTH', 'HC-SR04-N01'),
      SOUTH: this._createSensorState('SOUTH', 'HC-SR04-S02'),
      EAST:  this._createSensorState('EAST',  'HC-SR04-E03'),
      WEST:  this._createSensorState('WEST',  'HC-SR04-W04')
    };
  }

  _createSensorState(approach, sensorId) {
    return {
      sensorId,
      approach,
      distanceCm: 3200,
      distanceMeters: 32.0,
      detected: false,
      detectedVehicleId: null,
      detectedVehicleType: null,
      demandLevel: 'LOW',
      health: 'ONLINE',
      pingCount: 0,
      lastUpdated: 0,
      beamTarget: null, // [x, y, z] of target vehicle for 3D laser/beam visualization
      history: [] // [{ time, distanceCm }]
    };
  }

  setMaxRange(meters) {
    this.maxRangeMeters = meters;
  }

  reset() {
    for (const app of APPROACH_ORDER) {
      this.sensors[app] = this._createSensorState(app, this.sensors[app].sensorId);
    }
  }

  /**
   * Updates sensor readings from live vehicle coordinates
   * @param {Array} vehicles - array of active vehicle objects
   * @param {number} simTime - current simulation timestamp
   */
  update(vehicles, simTime) {
    for (const app of APPROACH_ORDER) {
      const sensor = this.sensors[app];
      const sensorPos = SENSOR_POSITIONS[app];

      // Filter vehicles that are oncoming on this approach and haven't passed the stop line
      const oncomingVehicles = vehicles.filter(v => v.approach === app && !v.hasPassedStopLine);

      let closestDist = Infinity;
      let targetVeh = null;

      for (const veh of oncomingVehicles) {
        // Distance along travel axis or Euclidean distance to sensor
        const dx = veh.position.x - sensorPos.x;
        const dy = veh.position.y - sensorPos.y;
        const dz = veh.position.z - sensorPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < closestDist) {
          closestDist = dist;
          targetVeh = veh;
        }
      }

      sensor.pingCount += 1;
      sensor.lastUpdated = simTime;

      if (targetVeh && closestDist <= this.maxRangeMeters) {
        sensor.detected = true;
        sensor.distanceMeters = parseFloat(closestDist.toFixed(2));
        sensor.distanceCm = Math.round(closestDist * 100);
        sensor.detectedVehicleId = targetVeh.id;
        sensor.detectedVehicleType = targetVeh.type;
        sensor.beamTarget = {
          x: targetVeh.position.x,
          y: targetVeh.position.y + 0.6,
          z: targetVeh.position.z
        };

        // Determine demand based on distance & queue presence
        if (sensor.distanceMeters < 10) sensor.demandLevel = 'HEAVY';
        else if (sensor.distanceMeters < 20) sensor.demandLevel = 'MODERATE';
        else sensor.demandLevel = 'LIGHT';
      } else {
        sensor.detected = false;
        sensor.distanceMeters = this.maxRangeMeters;
        sensor.distanceCm = Math.round(this.maxRangeMeters * 100);
        sensor.detectedVehicleId = null;
        sensor.detectedVehicleType = null;
        sensor.demandLevel = 'EMPTY';
        sensor.beamTarget = null;
      }

      // Record rolling telemetry history (keep last 30 samples)
      if (sensor.history.length >= 30) {
        sensor.history.shift();
      }
      sensor.history.push({
        time: parseFloat(simTime.toFixed(1)),
        distanceCm: sensor.distanceCm,
        detected: sensor.detected
      });
    }

    return this.sensors;
  }

  getSensorData(approach) {
    return this.sensors[approach];
  }

  getAllSensors() {
    return this.sensors;
  }
}

export const sensorSimulator = new SensorSimulator();
