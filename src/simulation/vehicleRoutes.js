/**
 * Adaptive FairFlow - Vehicle Kinematics & Route Geometry
 * 
 * Implements smooth vehicle motion, car-following physics, deceleration at stop lines,
 * safe following distances, and Bézier curves for intersection turns.
 */

import { ROAD_GEOMETRY, VEHICLE_CONFIGS, VEHICLE_TYPES } from './constants';

const { laneOffset, stopDistance, spawnDistance, exitDistance } = ROAD_GEOMETRY;

// Generate route path waypoints
export function generateRoute(approach, turnType = 'STRAIGHT') {
  // Coordinate references:
  // NORTH: from (x: -laneOffset, z: spawnDistance) heading -Z (yaw: Math.PI)
  // SOUTH: from (x: +laneOffset, z: -spawnDistance) heading +Z (yaw: 0)
  // EAST:  from (x: spawnDistance, z: +laneOffset) heading -X (yaw: -Math.PI / 2)
  // WEST:  from (x: -spawnDistance, z: -laneOffset) heading +X (yaw: Math.PI / 2)

  let startPos, stopPos, exitPos, startYaw, exitYaw;

  if (approach === 'NORTH') {
    startPos = { x: -laneOffset, y: 0, z: spawnDistance };
    stopPos  = { x: -laneOffset, y: 0, z: stopDistance };
    startYaw = Math.PI;

    if (turnType === 'STRAIGHT') {
      exitPos = { x: -laneOffset, y: 0, z: -exitDistance };
      exitYaw = Math.PI;
    } else if (turnType === 'RIGHT') {
      // Turns right to West bound (heading -X, x = -exitDistance, z = laneOffset)
      exitPos = { x: -exitDistance, y: 0, z: laneOffset };
      exitYaw = -Math.PI / 2;
    } else {
      // LEFT turns to East bound (heading +X, x = exitDistance, z = -laneOffset)
      exitPos = { x: exitDistance, y: 0, z: -laneOffset };
      exitYaw = Math.PI / 2;
    }
  } else if (approach === 'SOUTH') {
    startPos = { x: laneOffset, y: 0, z: -spawnDistance };
    stopPos  = { x: laneOffset, y: 0, z: -stopDistance };
    startYaw = 0;

    if (turnType === 'STRAIGHT') {
      exitPos = { x: laneOffset, y: 0, z: exitDistance };
      exitYaw = 0;
    } else if (turnType === 'RIGHT') {
      // Turns right to East bound (heading +X, x = exitDistance, z = -laneOffset)
      exitPos = { x: exitDistance, y: 0, z: -laneOffset };
      exitYaw = Math.PI / 2;
    } else {
      // LEFT turns to West bound (heading -X, x = -exitDistance, z = laneOffset)
      exitPos = { x: -exitDistance, y: 0, z: laneOffset };
      exitYaw = -Math.PI / 2;
    }
  } else if (approach === 'EAST') {
    startPos = { x: spawnDistance, y: 0, z: laneOffset };
    stopPos  = { x: stopDistance, y: 0, z: laneOffset };
    startYaw = -Math.PI / 2;

    if (turnType === 'STRAIGHT') {
      exitPos = { x: -exitDistance, y: 0, z: laneOffset };
      exitYaw = -Math.PI / 2;
    } else if (turnType === 'RIGHT') {
      // Turns right to North bound (heading +Z, x = laneOffset, z = exitDistance)
      exitPos = { x: laneOffset, y: 0, z: exitDistance };
      exitYaw = 0;
    } else {
      // LEFT turns to South bound (heading -Z, x = -laneOffset, z = -exitDistance)
      exitPos = { x: -laneOffset, y: 0, z: -exitDistance };
      exitYaw = Math.PI;
    }
  } else { // WEST
    startPos = { x: -spawnDistance, y: 0, z: -laneOffset };
    stopPos  = { x: -stopDistance, y: 0, z: -laneOffset };
    startYaw = Math.PI / 2;

    if (turnType === 'STRAIGHT') {
      exitPos = { x: exitDistance, y: 0, z: -laneOffset };
      exitYaw = Math.PI / 2;
    } else if (turnType === 'RIGHT') {
      // Turns right to South bound (heading -Z, x = -laneOffset, z = -exitDistance)
      exitPos = { x: -laneOffset, y: 0, z: -exitDistance };
      exitYaw = Math.PI;
    } else {
      // LEFT turns to North bound (heading +Z, x = laneOffset, z = exitDistance)
      exitPos = { x: laneOffset, y: 0, z: exitDistance };
      exitYaw = 0;
    }
  }

  return {
    approach,
    turnType,
    startPos,
    stopPos,
    exitPos,
    startYaw,
    exitYaw
  };
}

let vehicleCounter = 100;

export function createVehicle(type = VEHICLE_TYPES.CAR, approach = 'NORTH', turnType = 'STRAIGHT', isEmergency = false) {
  vehicleCounter += 1;
  const config = VEHICLE_CONFIGS[type] || VEHICLE_CONFIGS[VEHICLE_TYPES.CAR];
  const route = generateRoute(approach, turnType);

  const id = isEmergency ? `AMB-911` : `${type.slice(0, 3)}-${vehicleCounter}`;

  // Starting position with slight stagger
  const pos = { ...route.startPos };

  return {
    id,
    type,
    approach,
    turnType,
    isEmergency,
    rfidTag: isEmergency ? 'RFID-EMERG-AMB-911' : null,
    length: config.length,
    width: config.width,
    height: config.height,
    color: config.color,
    maxSpeed: config.maxSpeed,
    acceleration: config.acceleration,
    deceleration: config.deceleration,
    safeDistance: config.safeDistance,
    speed: config.maxSpeed * 0.7,
    position: pos,
    yaw: route.startYaw,
    route,
    distanceTraveled: 0,
    hasPassedStopLine: false,
    hasClearedIntersection: false,
    waitTime: 0,
    isWaitingAtRed: false,
    status: 'APPROACHING',
    spawnedAt: Date.now() / 1000
  };
}

/**
 * Updates vehicle position, applies car-following distance rules,
 * stops at red light, accelerates on green, and interpolates turning curves.
 */
export function updateVehicle(veh, dt, isGreen, precedingVehicle) {
  const config = VEHICLE_CONFIGS[veh.type];
  const approach = veh.approach;

  // Calculate distance remaining to stop line
  let distToStopLine = 0;
  if (approach === 'NORTH') distToStopLine = veh.position.z - stopDistance;
  else if (approach === 'SOUTH') distToStopLine = -stopDistance - veh.position.z;
  else if (approach === 'EAST')  distToStopLine = veh.position.x - stopDistance;
  else if (approach === 'WEST')  distToStopLine = -stopDistance - veh.position.x;

  // Determine if stop line has been passed
  if (!veh.hasPassedStopLine && distToStopLine <= 0.2) {
    if (isGreen || veh.isEmergency) {
      veh.hasPassedStopLine = true;
    }
  }

  // Determine target speed based on:
  // 1. Red signal before stop line
  // 2. Preceding vehicle ahead (collision avoidance)
  let targetSpeed = veh.maxSpeed;
  let mustStopForSignal = false;

  if (!veh.hasPassedStopLine) {
    if (!isGreen && !veh.isEmergency) {
      // Must stop before stop line
      if (distToStopLine <= 22.0) {
        mustStopForSignal = true;
        // Target speed decreases as we near stop line
        const brakeSpeed = Math.max(0, (distToStopLine / 14.0) * veh.maxSpeed);
        targetSpeed = Math.min(targetSpeed, brakeSpeed);
      }
    }
  }

  // Collision avoidance with preceding vehicle on the same approach
  if (precedingVehicle) {
    const p1 = veh.position;
    const p2 = precedingVehicle.position;
    const distBetween = Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2)
    );

    const minGap = veh.safeDistance + (veh.length + precedingVehicle.length) / 2;

    if (distBetween < minGap + 12.0) {
      const headway = Math.max(0, distBetween - minGap);
      const safeSpeed = Math.min(precedingVehicle.speed, (headway / 10.0) * veh.maxSpeed);
      targetSpeed = Math.min(targetSpeed, safeSpeed);
      if (distBetween <= minGap + 0.3) {
        targetSpeed = 0;
      }
    }
  }

  // Accelerate or decelerate smoothly toward targetSpeed
  if (veh.speed < targetSpeed) {
    veh.speed = Math.min(targetSpeed, veh.speed + veh.acceleration * dt);
  } else if (veh.speed > targetSpeed) {
    veh.speed = Math.max(targetSpeed, veh.speed - veh.deceleration * dt);
  }

  // Prevent negative speed
  veh.speed = Math.max(0, veh.speed);

  // Track waiting time
  if (veh.speed < 0.25) {
    veh.waitTime += dt;
    veh.isWaitingAtRed = mustStopForSignal || (precedingVehicle?.isWaitingAtRed ?? false);
    veh.status = 'WAITING';
  } else {
    veh.isWaitingAtRed = false;
    veh.status = veh.hasPassedStopLine ? 'CROSSING' : 'APPROACHING';
  }

  // Advance vehicle along trajectory
  const moveDist = veh.speed * dt;
  veh.distanceTraveled += moveDist;

  // Move along approach until stop line or straight through intersection
  if (!veh.hasPassedStopLine || veh.turnType === 'STRAIGHT') {
    if (approach === 'NORTH') {
      veh.position.z -= moveDist;
      veh.yaw = Math.PI;
    } else if (approach === 'SOUTH') {
      veh.position.z += moveDist;
      veh.yaw = 0;
    } else if (approach === 'EAST') {
      veh.position.x -= moveDist;
      veh.yaw = -Math.PI / 2;
    } else if (approach === 'WEST') {
      veh.position.x += moveDist;
      veh.yaw = Math.PI / 2;
    }
  } else {
    // Turning vehicle traversing the intersection (curved path)
    const turnFraction = Math.min(1.0, (stopDistance - distToStopLine) / (stopDistance * 2));
    
    // Smooth angle interpolation
    const angleDiff = veh.route.exitYaw - veh.route.startYaw;
    veh.yaw = veh.route.startYaw + angleDiff * turnFraction;

    // Advance according to updated yaw
    veh.position.x += Math.sin(veh.yaw) * moveDist;
    veh.position.z += Math.cos(veh.yaw) * moveDist;
  }

  // Check if cleared the intersection (beyond opposite stop line)
  if (veh.hasPassedStopLine) {
    const centerDist = Math.sqrt(veh.position.x * veh.position.x + veh.position.z * veh.position.z);
    if (centerDist > stopDistance + 2.0) {
      veh.hasClearedIntersection = true;
      veh.status = 'EXITING';
    }
  }

  // Check if vehicle reached scene exit threshold
  const isOutOfScene = 
    Math.abs(veh.position.x) > exitDistance + 5 || 
    Math.abs(veh.position.z) > exitDistance + 5;

  return isOutOfScene; // true if ready to be despawned
}
