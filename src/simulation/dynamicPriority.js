/**
 * Adaptive FairFlow - Dynamic Priority Index (DPI) & Decision Rationale Engine
 * 
 * Computes multi-attribute dynamic priority scores for all approaches and generates
 * context-aware explanations of signal allocation decisions.
 */

import { APPROACH_ORDER } from './constants';
import { fuzzyEngine } from './fuzzyLogic';
import { fairnessManager } from './fairnessManager';

export class DynamicPriorityEngine {
  constructor(weights = { demand: 0.25, waitingTime: 0.25, queueLength: 0.20, fairness: 0.15, fuzzyUrgency: 0.15 }) {
    this.weights = weights;
  }

  setWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Normalizes raw metrics into [0, 100] scores
   */
  normalizeMetrics(approachData) {
    // 8 detected vehicles considered maximum nominal demand
    const demandScore = Math.min(100, (approachData.vehicleCount / 8) * 100);

    // 30 seconds average wait considered 100% urgency
    const waitingTimeScore = Math.min(100, (approachData.avgWaitTime / 30) * 100);

    // 6 stopped vehicles queue considered 100% queue pressure
    const queueLengthScore = Math.min(100, (approachData.queueLength / 6) * 100);

    // Fairness from starvation tracker [0, 100]
    const fairnessScore = fairnessManager.getFairnessScore(approachData.approach);

    // Density for fuzzy input [0.0 - 1.0]
    const density = Math.min(1.0, approachData.vehicleCount / 7);

    // Fuzzy Urgency [0, 100]
    const fuzzyResult = fuzzyEngine.computeUrgency(
      density,
      approachData.avgWaitTime,
      approachData.queueLength
    );

    return {
      demandScore: parseFloat(demandScore.toFixed(1)),
      waitingTimeScore: parseFloat(waitingTimeScore.toFixed(1)),
      queueLengthScore: parseFloat(queueLengthScore.toFixed(1)),
      fairnessScore: parseFloat(fairnessScore.toFixed(1)),
      fuzzyUrgencyScore: fuzzyResult.urgency,
      fuzzyDetails: fuzzyResult
    };
  }

  /**
   * Calculate DPI for a single approach
   */
  calculateApproachDPI(approachData) {
    const scores = this.normalizeMetrics(approachData);
    const { demand, waitingTime, queueLength, fairness, fuzzyUrgency } = this.weights;

    // Normalizing weights in case user modified them
    const totalWeight = demand + waitingTime + queueLength + fairness + fuzzyUrgency || 1.0;

    const dpi = (
      (scores.demandScore * demand) +
      (scores.waitingTimeScore * waitingTime) +
      (scores.queueLengthScore * queueLength) +
      (scores.fairnessScore * fairness) +
      (scores.fuzzyUrgencyScore * fuzzyUrgency)
    ) / totalWeight;

    return {
      approach: approachData.approach,
      dpi: parseFloat(dpi.toFixed(1)),
      ...scores,
      raw: approachData
    };
  }

  /**
   * Evaluates all 4 approaches and selects the optimal next phase
   */
  evaluateAllApproaches(approachesData, emergencyApproach = null) {
    const results = {};
    let highestDpi = -1;
    let selectedApproach = null;

    for (const app of APPROACH_ORDER) {
      const data = approachesData[app] || { approach: app, vehicleCount: 0, avgWaitTime: 0, queueLength: 0 };
      const dpiResult = this.calculateApproachDPI(data);
      results[app] = dpiResult;

      // Regular winner by DPI
      if (dpiResult.dpi > highestDpi) {
        highestDpi = dpiResult.dpi;
        selectedApproach = app;
      }
    }

    // Emergency Override takes precedence if an active RFID priority exists
    const isEmergencyOverride = Boolean(emergencyApproach);
    const winnerApproach = isEmergencyOverride ? emergencyApproach : (selectedApproach || 'NORTH');

    // Generate dynamic textual explanation
    const explanation = this.generateExplanation(winnerApproach, results, isEmergencyOverride);

    return {
      selectedApproach: winnerApproach,
      isEmergencyOverride,
      explanation,
      approachScores: results
    };
  }

  /**
   * Constructs natural language rationale from actual mathematical contributions
   */
  generateExplanation(winnerApproach, results, isEmergencyOverride) {
    if (isEmergencyOverride) {
      return `EMERGENCY PREEMPTION: ${winnerApproach} approach granted immediate priority due to verified RFID tag on responding emergency ambulance. Standard cycle safely paused.`;
    }

    const winner = results[winnerApproach];
    if (!winner) return 'Defaulting to standard safety rotation.';

    // Check which factor contributed the most
    const factors = [
      { name: 'queue length', val: winner.queueLengthScore, desc: `${winner.raw.queueLength} stopped vehicles in queue` },
      { name: 'waiting time', val: winner.waitingTimeScore, desc: `avg wait of ${winner.raw.avgWaitTime.toFixed(1)}s` },
      { name: 'anti-starvation fairness', val: winner.fairnessScore, desc: `starvation priority score ${winner.fairnessScore}` },
      { name: 'fuzzy urgency', val: winner.fuzzyUrgencyScore, desc: `${winner.fuzzyDetails.category} urgency rating` },
      { name: 'traffic demand', val: winner.demandScore, desc: `${winner.raw.vehicleCount} vehicles detected` }
    ];

    factors.sort((a, b) => b.val - a.val);
    const topFactor = factors[0];
    const secondFactor = factors[1];

    // Compare with 2nd place
    const otherApproaches = APPROACH_ORDER.filter(a => a !== winnerApproach);
    const nextBest = otherApproaches.reduce((best, curr) => {
      return (results[curr]?.dpi > (results[best]?.dpi || -1)) ? curr : best;
    }, otherApproaches[0]);

    const margin = (winner.dpi - (results[nextBest]?.dpi || 0)).toFixed(1);

    return `${winnerApproach} approach selected with highest DPI (${winner.dpi} pts, +${margin} ahead of ${nextBest}). Driven primarily by ${topFactor.name} (${topFactor.desc}) and ${secondFactor.name} (${secondFactor.desc}).`;
  }
}

export const dynamicPriorityEngine = new DynamicPriorityEngine();
