/**
 * Adaptive FairFlow - Fairness & Anti-Starvation Manager
 * 
 * Prevents high-density arteries from monopolizing intersection green phases.
 * Tracks waiting duration, service frequency, and dynamically amplifies priority
 * for starved approaches.
 */

import { APPROACH_ORDER } from './constants';

export class FairnessManager {
  constructor() {
    this.approachStats = {
      NORTH: { starvationTime: 0, servedCount: 0, totalGreenTime: 0, lastServedAt: 0 },
      SOUTH: { starvationTime: 0, servedCount: 0, totalGreenTime: 0, lastServedAt: 0 },
      EAST:  { starvationTime: 0, servedCount: 0, totalGreenTime: 0, lastServedAt: 0 },
      WEST:  { starvationTime: 0, servedCount: 0, totalGreenTime: 0, lastServedAt: 0 }
    };
  }

  reset() {
    for (const app of APPROACH_ORDER) {
      this.approachStats[app] = {
        starvationTime: 0,
        servedCount: 0,
        totalGreenTime: 0,
        lastServedAt: 0
      };
    }
  }

  /**
   * Update starvation timers each simulation tick
   * @param {number} dt - delta time in seconds
   * @param {string} currentActiveApproach - currently green or yellow approach (or null if all red)
   */
  tick(dt, currentActiveApproach) {
    for (const app of APPROACH_ORDER) {
      if (app === currentActiveApproach) {
        this.approachStats[app].starvationTime = 0;
        this.approachStats[app].totalGreenTime += dt;
      } else {
        this.approachStats[app].starvationTime += dt;
      }
    }
  }

  /**
   * Record that an approach just began its green phase
   */
  recordGreenStart(approach, simTime) {
    if (this.approachStats[approach]) {
      this.approachStats[approach].servedCount += 1;
      this.approachStats[approach].lastServedAt = simTime;
      this.approachStats[approach].starvationTime = 0;
    }
  }

  /**
   * Calculate fairness score for an approach [0 - 100]
   * Higher score = higher starvation, needs urgent priority
   */
  getFairnessScore(approach) {
    const stats = this.approachStats[approach];
    if (!stats) return 0;

    const starvation = stats.starvationTime;
    // Base linear scaling up to 30 seconds
    let score = Math.min(starvation * 2.5, 75);

    // Exponential boost if starvation exceeds 30 seconds to strictly prevent starvation
    if (starvation > 30) {
      const excess = starvation - 30;
      score = Math.min(100, 75 + excess * 3.5);
    }

    return parseFloat(score.toFixed(1));
  }

  /**
   * Overall fairness index (0.0 to 1.0)
   * 1.0 means perfectly balanced service times across approaches
   */
  getSystemFairnessIndex() {
    const served = APPROACH_ORDER.map(a => this.approachStats[a].servedCount);
    const sum = served.reduce((a, b) => a + b, 0);
    if (sum === 0) return 1.0;

    const mean = sum / 4;
    let variance = 0;
    for (const count of served) {
      variance += Math.pow(count - mean, 2);
    }
    const stdDev = Math.sqrt(variance / 4);
    // Index: 1 - coefficient of variation normalized
    const cv = mean > 0 ? stdDev / mean : 0;
    return parseFloat(Math.max(0.2, 1 - cv * 0.4).toFixed(2));
  }

  getApproachStats(approach) {
    return {
      ...this.approachStats[approach],
      fairnessScore: this.getFairnessScore(approach)
    };
  }
}

export const fairnessManager = new FairnessManager();
