/**
 * Adaptive FairFlow - RFID Emergency Preemption Simulator
 * 
 * Simulates high-frequency RFID transponder interrogation for priority emergency response:
 * - Detects authenticated emergency transponder tags within defined approach interrogation zones
 * - Manages an emergency priority queue
 * - Handles preemption clearance once the emergency vehicle traverses the intersection safely
 */

import { RFID_ZONES, APPROACH_ORDER } from './constants';

export class RFIDSimulator {
  constructor() {
    this.readers = {
      NORTH: { id: 'RFID-RDR-N', approach: 'NORTH', active: false, readingTag: null, zone: RFID_ZONES.NORTH },
      SOUTH: { id: 'RFID-RDR-S', approach: 'SOUTH', active: false, readingTag: null, zone: RFID_ZONES.SOUTH },
      EAST:  { id: 'RFID-RDR-E', approach: 'EAST',  active: false, readingTag: null, zone: RFID_ZONES.EAST },
      WEST:  { id: 'RFID-RDR-W', approach: 'WEST',  active: false, readingTag: null, zone: RFID_ZONES.WEST }
    };

    this.activeEmergencyRequests = []; // [{ id, approach, tagId, vehicleId, status, detectedAt }]
    this.emergencyHistory = [];
  }

  reset() {
    for (const app of APPROACH_ORDER) {
      this.readers[app].active = false;
      this.readers[app].readingTag = null;
    }
    this.activeEmergencyRequests = [];
  }

  /**
   * Check if an emergency vehicle has entered an approach's RFID interrogation zone
   */
  update(vehicles, simTime, onEmergencyTriggered) {
    for (const app of APPROACH_ORDER) {
      const reader = this.readers[app];
      const zone = reader.zone;

      // Find any ambulance on this approach that hasn't cleared the intersection
      const ambulances = vehicles.filter(v => v.isEmergency && v.approach === app && !v.hasClearedIntersection);

      let detectedAmbulance = null;
      for (const amb of ambulances) {
        const { x, z } = amb.position;
        // Check if inside zone bounding box
        if (x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ) {
          detectedAmbulance = amb;
          break;
        }
      }

      if (detectedAmbulance) {
        reader.active = true;
        reader.readingTag = detectedAmbulance.rfidTag || 'RFID-EMERG-AMB-911';

        // Check if request already queued
        const alreadyQueued = this.activeEmergencyRequests.some(r => r.vehicleId === detectedAmbulance.id);
        if (!alreadyQueued) {
          const newRequest = {
            id: `EMERG-${Date.now().toString().slice(-4)}`,
            approach: app,
            tagId: reader.readingTag,
            vehicleId: detectedAmbulance.id,
            status: 'PREEMPTION_PENDING',
            detectedAt: simTime
          };

          this.activeEmergencyRequests.push(newRequest);
          this.emergencyHistory.unshift(newRequest);

          if (onEmergencyTriggered) {
            onEmergencyTriggered(newRequest);
          }
        }
      } else {
        reader.active = false;
        reader.readingTag = null;
      }
    }

    // Clean up emergency requests if the vehicle cleared the intersection or was removed
    const remainingRequests = [];
    for (const req of this.activeEmergencyRequests) {
      const veh = vehicles.find(v => v.id === req.vehicleId);
      if (veh && !veh.hasClearedIntersection) {
        remainingRequests.push(req);
      } else {
        // Mark as completed in history
        const hist = this.emergencyHistory.find(h => h.id === req.id);
        if (hist) hist.status = 'COMPLETED';
      }
    }
    this.activeEmergencyRequests = remainingRequests;

    return {
      readers: this.readers,
      activeRequests: this.activeEmergencyRequests
    };
  }

  /**
   * Manual trigger via UI control
   */
  manualTrigger(approach, tagId = 'RFID-TEST-TAG-99') {
    const newRequest = {
      id: `EMERG-MAN-${Date.now().toString().slice(-4)}`,
      approach,
      tagId,
      vehicleId: `MANUAL-${approach}`,
      status: 'MANUAL_OVERRIDE',
      detectedAt: Date.now() / 1000
    };
    this.activeEmergencyRequests.push(newRequest);
    this.emergencyHistory.unshift(newRequest);
    return newRequest;
  }

  cancelRequest(requestId) {
    this.activeEmergencyRequests = this.activeEmergencyRequests.filter(r => r.id !== requestId);
    const hist = this.emergencyHistory.find(h => h.id === requestId);
    if (hist) hist.status = 'CANCELLED';
  }

  clearAll() {
    this.activeEmergencyRequests = [];
    for (const app of APPROACH_ORDER) {
      this.readers[app].active = false;
      this.readers[app].readingTag = null;
    }
  }

  getActiveEmergencyApproach() {
    if (this.activeEmergencyRequests.length > 0) {
      return this.activeEmergencyRequests[0].approach;
    }
    return null;
  }
}

export const rfidSimulator = new RFIDSimulator();
