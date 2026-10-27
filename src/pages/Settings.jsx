/**
 * Adaptive FairFlow - System Configuration & Hardware Adapter Settings
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, Sliders, Cpu, 
  Wifi, ShieldCheck, Save, RotateCcw, Radio, Terminal
} from 'lucide-react';

export function Settings({ settings = {}, onUpdateSettings, onReset }) {
  const [formData, setFormData] = useState({ ...settings });
  const [hardwareMode, setHardwareMode] = useState('SIMULATION'); // 'SIMULATION' or 'HARDWARE'
  const [saveMessage, setSaveMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeightChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: parseFloat(value)
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveMessage('Configuration applied successfully to live simulation.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">SYSTEM SETTINGS & HARDWARE ARCHITECTURE</h2>
        <p className="text-xs text-slate-400">Configure safety timings, heuristic weighting factors, and optional IoT hardware interfaces</p>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Signal Timing Constraints */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">TRAFFIC SIGNAL FSM TIMING CONSTRAINTS</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Min Green Duration (sec)</label>
              <input
                type="number"
                min="3"
                max="30"
                step="1"
                value={formData.minGreen ?? 5}
                onChange={(e) => handleChange('minGreen', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Minimum green window</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Max Green Duration (sec)</label>
              <input
                type="number"
                min="10"
                max="60"
                step="1"
                value={formData.maxGreen ?? 20}
                onChange={(e) => handleChange('maxGreen', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Hard phase termination</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">Yellow Clearance (sec)</label>
              <input
                type="number"
                min="2"
                max="6"
                step="0.5"
                value={formData.yellowTime ?? 3}
                onChange={(e) => handleChange('yellowTime', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Deceleration warning</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium">All-Red Interval (sec)</label>
              <input
                type="number"
                min="1"
                max="4"
                step="0.5"
                value={formData.allRedTime ?? 1.5}
                onChange={(e) => handleChange('allRedTime', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Junction clearance</span>
            </div>
          </div>
        </div>

        {/* Dynamic Priority Weights */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">DYNAMIC PRIORITY INDEX (DPI) WEIGHT SYNTHESIS</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Demand Weight (wd)</span>
                <span className="font-mono text-cyan-300">{formData.weights?.demand ?? 0.25}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={formData.weights?.demand ?? 0.25}
                onChange={(e) => handleWeightChange('demand', e.target.value)}
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Wait Time Weight (ww)</span>
                <span className="font-mono text-amber-300">{formData.weights?.waitingTime ?? 0.25}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={formData.weights?.waitingTime ?? 0.25}
                onChange={(e) => handleWeightChange('waitingTime', e.target.value)}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Queue Length Weight (wq)</span>
                <span className="font-mono text-rose-300">{formData.weights?.queueLength ?? 0.20}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={formData.weights?.queueLength ?? 0.20}
                onChange={(e) => handleWeightChange('queueLength', e.target.value)}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Fairness Weight (wf)</span>
                <span className="font-mono text-purple-300">{formData.weights?.fairness ?? 0.15}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={formData.weights?.fairness ?? 0.15}
                onChange={(e) => handleWeightChange('fairness', e.target.value)}
                className="w-full accent-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Fuzzy Urgency Weight (wu)</span>
                <span className="font-mono text-emerald-300">{formData.weights?.fuzzyUrgency ?? 0.15}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={formData.weights?.fuzzyUrgency ?? 0.15}
                onChange={(e) => handleWeightChange('fuzzyUrgency', e.target.value)}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Operating Mode: Simulation vs Hardware */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">OPERATING MODE & ESP32 HARDWARE INTEGRATION</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setHardwareMode('SIMULATION')}
              className={`p-3 rounded-xl border text-left transition-all ${
                hardwareMode === 'SIMULATION'
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>SIMULATION MODE (Active)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% autonomous software simulation without physical microcontrollers.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setHardwareMode('HARDWARE')}
              className={`p-3 rounded-xl border text-left transition-all ${
                hardwareMode === 'HARDWARE'
                  ? 'bg-amber-500/20 border-amber-500/50 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold mb-1 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-400" />
                <span>HARDWARE MODE (ESP32 Ready)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Connects to physical ESP32 controller over WebSocket/MQTT (Safe fallback to simulation).
              </p>
            </button>
          </div>

          {/* Hardware Protocol Specification */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Terminal className="w-3.5 h-3.5" />
              <span>ESP32 JSON TELEMETRY PROTOCOL SCHEMA</span>
            </div>
            <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
{`// Inbound Sensor Payload (ESP32 -> Adaptive FairFlow via WebSocket)
{
  "device": "ESP32-INTERSECTION-CTRL-01",
  "sensors": {
    "NORTH": { "distanceCm": 420, "detected": true },
    "SOUTH": { "distanceCm": 3200, "detected": false },
    "EAST":  { "distanceCm": 1150, "detected": true },
    "WEST":  { "distanceCm": 3200, "detected": false }
  },
  "rfid": {
    "tagId": "RFID-EMERG-AMB-911",
    "approach": "EAST",
    "timestamp": 1729000000
  }
}

// Outbound Signal State (Adaptive FairFlow -> ESP32 Relays)
{
  "command": "SET_SIGNALS",
  "phase": "EAST_GREEN",
  "allRed": false,
  "outputs": {
    "NORTH": "RED", "SOUTH": "RED", "EAST": "GREEN", "WEST": "RED"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Factory Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
