/**
 * Adaptive FairFlow - Simulation Constants & Geometric Coordinates
 */

export const APPROACHES = {
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST'
};

export const APPROACH_ORDER = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

export const SIGNAL_STATES = {
  ALL_RED: 'ALL_RED',
  NORTH_GREEN: 'NORTH_GREEN',
  NORTH_YELLOW: 'NORTH_YELLOW',
  SOUTH_GREEN: 'SOUTH_GREEN',
  SOUTH_YELLOW: 'SOUTH_YELLOW',
  EAST_GREEN: 'EAST_GREEN',
  EAST_YELLOW: 'EAST_YELLOW',
  WEST_GREEN: 'WEST_GREEN',
  WEST_YELLOW: 'WEST_YELLOW'
};

export const VEHICLE_TYPES = {
  CAR: 'CAR',
  BUS: 'BUS',
  TRUCK: 'TRUCK',
  AMBULANCE: 'AMBULANCE'
};

export const VEHICLE_CONFIGS = {
  [VEHICLE_TYPES.CAR]: {
    length: 3.2,
    width: 1.6,
    height: 1.2,
    maxSpeed: 8.5,
    acceleration: 4.0,
    deceleration: 7.0,
    safeDistance: 2.2,
    color: '#38bdf8' // Cyan / Sky blue
  },
  [VEHICLE_TYPES.BUS]: {
    length: 7.2,
    width: 2.2,
    height: 2.5,
    maxSpeed: 6.0,
    acceleration: 2.5,
    deceleration: 5.5,
    safeDistance: 3.5,
    color: '#fbbf24' // Amber
  },
  [VEHICLE_TYPES.TRUCK]: {
    length: 6.5,
    width: 2.1,
    height: 2.3,
    maxSpeed: 5.5,
    acceleration: 2.2,
    deceleration: 5.0,
    safeDistance: 3.2,
    color: '#a855f7' // Purple
  },
  [VEHICLE_TYPES.AMBULANCE]: {
    length: 4.8,
    width: 1.9,
    height: 2.0,
    maxSpeed: 11.0,
    acceleration: 6.0,
    deceleration: 8.5,
    safeDistance: 2.5,
    color: '#ffffff' // White with Red cross
  }
};

export const DEFAULT_SETTINGS = {
  minGreen: 5,
  maxGreen: 20,
  yellowTime: 3,
  allRedTime: 1.5,
  ultrasonicRange: 32, // meters (3200 cm)
  trafficDensity: 'medium', // 'low', 'medium', 'high', 'custom'
  spawnIntervalSec: 3.5,
  autoSpawn: true,
  sensorVisualization: true,
  emergencySimulation: true,
  dayNightMode: 'night', // 'night' or 'day'
  speedMultiplier: 1.0,
  // Dynamic Priority Index weights (normalized, sum to 1.0)
  weights: {
    demand: 0.25,
    waitingTime: 0.25,
    queueLength: 0.20,
    fairness: 0.15,
    fuzzyUrgency: 0.15
  }
};

// Coordinate systems:
// Intersection center: (0, 0, 0)
// Roads along X axis: West (-X) <---> East (+X)
// Roads along Z axis: South (-Z) <---> North (+Z)
// Driving on right side of road:
// - NORTH approach: travels from +Z towards -Z. Incoming lane X = -2.2, Stop line at Z = +8.0
// - SOUTH approach: travels from -Z towards +Z. Incoming lane X = +2.2, Stop line at Z = -8.0
// - EAST approach: travels from +X towards -X. Incoming lane Z = +2.2, Stop line at X = +8.0
// - WEST approach: travels from -X towards +X. Incoming lane Z = -2.2, Stop line at X = -8.0

export const ROAD_GEOMETRY = {
  roadWidth: 14.0,
  laneOffset: 2.4,
  stopDistance: 8.0,
  spawnDistance: 48.0,
  exitDistance: 48.0,
  roadHalfLength: 50.0
};

export const SENSOR_POSITIONS = {
  NORTH: { x: -4.5, y: 0.8, z: 9.0, rotationY: Math.PI },
  SOUTH: { x: 4.5, y: 0.8, z: -9.0, rotationY: 0 },
  EAST: { x: 9.0, y: 0.8, z: 4.5, rotationY: -Math.PI / 2 },
  WEST: { x: -9.0, y: 0.8, z: -4.5, rotationY: Math.PI / 2 }
};

export const RFID_ZONES = {
  NORTH: { minZ: 10.0, maxZ: 32.0, minX: -5.0, maxX: 0.0 },
  SOUTH: { minZ: -32.0, maxZ: -10.0, minX: 0.0, maxX: 5.0 },
  EAST: { minX: 10.0, maxX: 32.0, minZ: 0.0, maxZ: 5.0 },
  WEST: { minX: -32.0, maxX: -10.0, minZ: -5.0, maxZ: 0.0 }
};
