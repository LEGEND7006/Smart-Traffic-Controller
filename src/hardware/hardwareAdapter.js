/**
 * Adaptive FairFlow - Hardware Adapter & ESP32 IoT Bridge
 * 
 * Provides a bi-directional communication layer supporting WebSockets and MQTT
 * for real ESP32 microcontroller sensor boards (HC-SR04 ultrasonic + RC522 RFID + 12V Relays).
 */

export class HardwareAdapter {
  constructor(config = {}) {
    this.mode = 'SIMULATION'; // 'SIMULATION' or 'HARDWARE'
    this.wsUrl = config.wsUrl || 'ws://192.168.4.1:81';
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'HARDWARE' && !this.isConnected) {
      this.connect();
    } else if (mode === 'SIMULATION' && this.socket) {
      this.disconnect();
    }
  }

  connect() {
    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.emit('connectionChange', { isConnected: true, mode: 'HARDWARE' });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit('telemetry', data);
        } catch (e) {
          console.error('[HardwareAdapter] Failed to parse inbound packet:', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[HardwareAdapter] WebSocket error (Falling back to Autonomous Simulation):', err);
        this.isConnected = false;
        this.emit('connectionChange', { isConnected: false, mode: 'SIMULATION' });
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.emit('connectionChange', { isConnected: false, mode: 'SIMULATION' });
      };
    } catch (err) {
      console.warn('[HardwareAdapter] Unable to open physical socket:', err);
      this.isConnected = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.emit('connectionChange', { isConnected: false, mode: 'SIMULATION' });
  }

  /**
   * Transmit current signal states to physical relay outputs on ESP32
   */
  sendSignalState(signals, activePhase) {
    if (this.mode === 'HARDWARE' && this.isConnected && this.socket) {
      const payload = {
        command: 'SET_SIGNALS',
        timestamp: Date.now(),
        activePhase,
        outputs: signals
      };
      this.socket.send(JSON.stringify(payload));
    }
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
    return () => this.listeners.get(event)?.delete(handler);
  }

  emit(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const h of handlers) h(data);
    }
  }
}

export const hardwareAdapter = new HardwareAdapter();
