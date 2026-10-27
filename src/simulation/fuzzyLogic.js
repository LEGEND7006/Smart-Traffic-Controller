/**
 * Adaptive FairFlow - Fuzzy Logic Inference Engine
 * 
 * Implements a Mamdani Fuzzy Inference System for Intelligent Traffic Signal Control:
 * 1. Fuzzification with Triangular and Trapezoidal Membership Functions
 * 2. Rule Base Evaluation using Mamdani Min-T-Norm
 * 3. Rule Aggregation using Max-S-Norm
 * 4. Centroid Defuzzification (Center of Gravity)
 */

// Trapezoidal membership function
function trapmf(x, [a, b, c, d]) {
  if (x <= a) return 0;
  if (x >= a && x <= b) return b === a ? 1 : (x - a) / (b - a);
  if (x >= b && x <= c) return 1;
  if (x >= c && x <= d) return d === c ? 0 : (d - x) / (d - c);
  return 0;
}

// Triangular membership function
function trimf(x, [a, b, c]) {
  if (x <= a) return 0;
  if (x >= a && x <= b) return b === a ? 1 : (x - a) / (b - a);
  if (x >= b && x <= c) return c === b ? 0 : (c - x) / (c - b);
  return 0;
}

export class FuzzyLogicEngine {
  constructor() {
    // Membership function parameters
    this.densityMF = {
      LOW: (x) => trapmf(x, [-0.1, 0, 0.25, 0.45]),
      MEDIUM: (x) => trimf(x, [0.25, 0.5, 0.75]),
      HIGH: (x) => trapmf(x, [0.55, 0.75, 1.0, 1.2])
    };

    this.waitingTimeMF = {
      SHORT: (x) => trapmf(x, [-1, 0, 6, 12]),
      MODERATE: (x) => trimf(x, [8, 18, 30]),
      LONG: (x) => trapmf(x, [22, 35, 60, 999])
    };

    this.queueLengthMF = {
      SMALL: (x) => trapmf(x, [-1, 0, 1.5, 3]),
      MEDIUM: (x) => trimf(x, [2, 4, 6]),
      LARGE: (x) => trapmf(x, [4.5, 7, 12, 999])
    };

    // Output urgency membership functions (Universe: [0, 100])
    this.urgencyMF = {
      LOW: (x) => trimf(x, [-10, 15, 35]),
      NORMAL: (x) => trimf(x, [25, 45, 65]),
      HIGH: (x) => trimf(x, [50, 70, 85]),
      VERY_HIGH: (x) => trapmf(x, [75, 90, 100, 110])
    };
  }

  /**
   * Fuzzifies input values into fuzzy sets
   */
  fuzzify(density, waitingTime, queueLength) {
    return {
      density: {
        LOW: this.densityMF.LOW(density),
        MEDIUM: this.densityMF.MEDIUM(density),
        HIGH: this.densityMF.HIGH(density)
      },
      waitingTime: {
        SHORT: this.waitingTimeMF.SHORT(waitingTime),
        MODERATE: this.waitingTimeMF.MODERATE(waitingTime),
        LONG: this.waitingTimeMF.LONG(waitingTime)
      },
      queueLength: {
        SMALL: this.queueLengthMF.SMALL(queueLength),
        MEDIUM: this.queueLengthMF.MEDIUM(queueLength),
        LARGE: this.queueLengthMF.LARGE(queueLength)
      }
    };
  }

  /**
   * Evaluates the comprehensive Mamdani rule base
   */
  evaluateRules(fuzz) {
    const rules = [
      {
        id: 1,
        text: 'IF Density is HIGH AND Waiting Time is LONG THEN Urgency is VERY HIGH',
        weight: Math.min(fuzz.density.HIGH, fuzz.waitingTime.LONG),
        consequent: 'VERY_HIGH'
      },
      {
        id: 2,
        text: 'IF Queue is LARGE AND Waiting Time is MODERATE THEN Urgency is HIGH',
        weight: Math.min(fuzz.queueLength.LARGE, fuzz.waitingTime.MODERATE),
        consequent: 'HIGH'
      },
      {
        id: 3,
        text: 'IF Density is LOW AND Waiting Time is SHORT THEN Urgency is LOW',
        weight: Math.min(fuzz.density.LOW, fuzz.waitingTime.SHORT),
        consequent: 'LOW'
      },
      {
        id: 4,
        text: 'IF Density is MEDIUM AND Waiting Time is LONG THEN Urgency is HIGH',
        weight: Math.min(fuzz.density.MEDIUM, fuzz.waitingTime.LONG),
        consequent: 'HIGH'
      },
      {
        id: 5,
        text: 'IF Density is HIGH AND Queue is LARGE THEN Urgency is VERY HIGH',
        weight: Math.min(fuzz.density.HIGH, fuzz.queueLength.LARGE),
        consequent: 'VERY_HIGH'
      },
      {
        id: 6,
        text: 'IF Waiting Time is LONG AND Queue is SMALL THEN Urgency is HIGH',
        weight: Math.min(fuzz.waitingTime.LONG, fuzz.queueLength.SMALL),
        consequent: 'HIGH'
      },
      {
        id: 7,
        text: 'IF Density is MEDIUM AND Queue is MEDIUM THEN Urgency is NORMAL',
        weight: Math.min(fuzz.density.MEDIUM, fuzz.queueLength.MEDIUM),
        consequent: 'NORMAL'
      },
      {
        id: 8,
        text: 'IF Density is LOW AND Queue is LARGE THEN Urgency is HIGH',
        weight: Math.min(fuzz.density.LOW, fuzz.queueLength.LARGE),
        consequent: 'HIGH'
      },
      {
        id: 9,
        text: 'IF Density is LOW AND Waiting Time is MODERATE THEN Urgency is NORMAL',
        weight: Math.min(fuzz.density.LOW, fuzz.waitingTime.MODERATE),
        consequent: 'NORMAL'
      },
      {
        id: 10,
        text: 'IF Queue is LARGE AND Waiting Time is LONG THEN Urgency is VERY HIGH',
        weight: Math.min(fuzz.queueLength.LARGE, fuzz.waitingTime.LONG),
        consequent: 'VERY_HIGH'
      },
      {
        id: 11,
        text: 'IF Density is HIGH AND Waiting Time is SHORT THEN Urgency is NORMAL',
        weight: Math.min(fuzz.density.HIGH, fuzz.waitingTime.SHORT),
        consequent: 'NORMAL'
      },
      {
        id: 12,
        text: 'IF Density is MEDIUM AND Waiting Time is SHORT THEN Urgency is LOW',
        weight: Math.min(fuzz.density.MEDIUM, fuzz.waitingTime.SHORT),
        consequent: 'LOW'
      }
    ];

    // Filter rules that have firing strength > 0.01
    const activeRules = rules.filter(r => r.weight > 0.01);

    // Aggregate consequence strengths via Max operator
    const aggregate = {
      LOW: 0,
      NORMAL: 0,
      HIGH: 0,
      VERY_HIGH: 0
    };

    for (const rule of rules) {
      if (rule.weight > aggregate[rule.consequent]) {
        aggregate[rule.consequent] = rule.weight;
      }
    }

    return { activeRules, aggregate };
  }

  /**
   * Defuzzifies aggregate fuzzy sets using the Centroid method (Center of Gravity)
   */
  defuzzifyCentroid(aggregate) {
    let numerator = 0;
    let denominator = 0;
    const step = 1; // 1-point discretization over [0, 100]

    for (let x = 0; x <= 100; x += step) {
      // Evaluate truncated membership for each output category
      const muLow = Math.min(aggregate.LOW, this.urgencyMF.LOW(x));
      const muNorm = Math.min(aggregate.NORMAL, this.urgencyMF.NORMAL(x));
      const muHigh = Math.min(aggregate.HIGH, this.urgencyMF.HIGH(x));
      const muVHigh = Math.min(aggregate.VERY_HIGH, this.urgencyMF.VERY_HIGH(x));

      // Union (Max) of all truncated outputs
      const muCombined = Math.max(muLow, muNorm, muHigh, muVHigh);

      numerator += x * muCombined;
      denominator += muCombined;
    }

    // Default to base score of 20 if no rules fired
    if (denominator === 0) return 20;
    return numerator / denominator;
  }

  /**
   * Main inference execution for an approach
   */
  computeUrgency(density, waitingTime, queueLength) {
    const fuzz = this.fuzzify(density, waitingTime, queueLength);
    const { activeRules, aggregate } = this.evaluateRules(fuzz);
    const crispUrgency = this.defuzzifyCentroid(aggregate);

    let category = 'LOW';
    if (crispUrgency >= 75) category = 'VERY HIGH';
    else if (crispUrgency >= 50) category = 'HIGH';
    else if (crispUrgency >= 30) category = 'NORMAL';

    return {
      urgency: parseFloat(crispUrgency.toFixed(1)),
      category,
      inputs: {
        density: parseFloat(density.toFixed(2)),
        waitingTime: parseFloat(waitingTime.toFixed(1)),
        queueLength
      },
      memberships: fuzz,
      activeRules: activeRules.sort((a, b) => b.weight - a.weight),
      aggregate
    };
  }
}

export const fuzzyEngine = new FuzzyLogicEngine();
