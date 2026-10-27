/**
 * Adaptive FairFlow - Traffic Signal Finite State Machine (FSM)
 * 
 * Enforces strict intersection clearance safety invariants:
 * ACTIVE GREEN -> ACTIVE YELLOW -> ALL RED CLEARANCE -> NEXT GREEN
 * Conflicting directions NEVER hold green simultaneously.
 */

import { SIGNAL_STATES } from './constants';

export class TrafficSignalFSM {
  constructor(config = {}) {
    this.minGreen = config.minGreen || 5.0;
    this.maxGreen = config.maxGreen || 20.0;
    this.yellowTime = config.yellowTime || 3.0;
    this.allRedTime = config.allRedTime || 1.5;

    this.currentState = SIGNAL_STATES.ALL_RED;
    this.activeApproach = null; // 'NORTH', 'SOUTH', 'EAST', 'WEST'
    this.stateTimer = 0;
    this.totalGreenElapsed = 0;
    this.pendingNextApproach = null;
  }

  updateConfig(config) {
    if (config.minGreen !== undefined) this.minGreen = config.minGreen;
    if (config.maxGreen !== undefined) this.maxGreen = config.maxGreen;
    if (config.yellowTime !== undefined) this.yellowTime = config.yellowTime;
    if (config.allRedTime !== undefined) this.allRedTime = config.allRedTime;
  }

  reset() {
    this.currentState = SIGNAL_STATES.ALL_RED;
    this.activeApproach = null;
    this.stateTimer = 0;
    this.totalGreenElapsed = 0;
    this.pendingNextApproach = null;
  }

  /**
   * Returns whether a given approach currently has a GREEN signal
   */
  isGreen(approach) {
    return this.currentState === `${approach}_GREEN`;
  }

  /**
   * Returns whether a given approach currently has a YELLOW signal
   */
  isYellow(approach) {
    return this.currentState === `${approach}_YELLOW`;
  }

  /**
   * Returns whether a given approach has RED (all others when not green or yellow, plus all red)
   */
  isRed(approach) {
    return !this.isGreen(approach) && !this.isYellow(approach);
  }

  /**
   * Advance FSM by delta time dt
   * @param {number} dt - delta time in seconds
   * @param {function} getNextBestApproach - callback returning optimal next approach based on DPI/Emergency
   * @param {function} onTransition - event callback
   */
  tick(dt, getNextBestApproach, onTransition) {
    this.stateTimer += dt;

    if (this.currentState.endsWith('_GREEN')) {
      this.totalGreenElapsed += dt;
      const currentApp = this.activeApproach;

      // Check if green duration conditions warrant a phase change
      const targetNext = getNextBestApproach();
      const needsSwitch = targetNext && targetNext !== currentApp;
      const reachedMax = this.totalGreenElapsed >= this.maxGreen;
      const passedMin = this.totalGreenElapsed >= this.minGreen;

      // Force change if maximum green reached or if minimum green passed and another approach has higher priority
      if ((reachedMax || (passedMin && needsSwitch))) {
        this.pendingNextApproach = targetNext || this._getDefaultNext(currentApp);
        this.transitionTo(`${currentApp}_YELLOW`, onTransition);
      }
    } else if (this.currentState.endsWith('_YELLOW')) {
      if (this.stateTimer >= this.yellowTime) {
        this.transitionTo(SIGNAL_STATES.ALL_RED, onTransition);
      }
    } else if (this.currentState === SIGNAL_STATES.ALL_RED) {
      if (this.stateTimer >= this.allRedTime) {
        // Safe clearance complete -> activate green for chosen next approach
        const nextApp = this.pendingNextApproach || getNextBestApproach() || 'NORTH';
        this.activeApproach = nextApp;
        this.pendingNextApproach = null;
        this.totalGreenElapsed = 0;
        this.transitionTo(`${nextApp}_GREEN`, onTransition);
      }
    }
  }

  transitionTo(newState, onTransition) {
    const prevState = this.currentState;
    this.currentState = newState;
    this.stateTimer = 0;

    if (newState.endsWith('_GREEN')) {
      this.activeApproach = newState.replace('_GREEN', '');
    } else if (newState.endsWith('_YELLOW')) {
      this.activeApproach = newState.replace('_YELLOW', '');
    } else if (newState === SIGNAL_STATES.ALL_RED) {
      this.activeApproach = null;
    }

    if (onTransition) {
      onTransition({
        from: prevState,
        to: newState,
        activeApproach: this.activeApproach,
        time: this.stateTimer
      });
    }
  }

  _getDefaultNext(current) {
    const order = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  }

  getStateDetails() {
    return {
      state: this.currentState,
      activeApproach: this.activeApproach,
      stateTimer: parseFloat(this.stateTimer.toFixed(1)),
      totalGreenElapsed: parseFloat(this.totalGreenElapsed.toFixed(1)),
      minGreen: this.minGreen,
      maxGreen: this.maxGreen,
      yellowTime: this.yellowTime,
      allRedTime: this.allRedTime,
      signals: {
        NORTH: this.isGreen('NORTH') ? 'GREEN' : this.isYellow('NORTH') ? 'YELLOW' : 'RED',
        SOUTH: this.isGreen('SOUTH') ? 'GREEN' : this.isYellow('SOUTH') ? 'YELLOW' : 'RED',
        EAST:  this.isGreen('EAST')  ? 'GREEN' : this.isYellow('EAST')  ? 'YELLOW' : 'RED',
        WEST:  this.isGreen('WEST')  ? 'GREEN' : this.isYellow('WEST')  ? 'YELLOW' : 'RED'
      }
    };
  }
}

export const trafficFSM = new TrafficSignalFSM();
