/**
 * Adaptive FairFlow - Intelligent Controller Logic & Explainable AI (XAI)
 */

import React from 'react';
import { Cpu, Sparkles, TrendingUp, CheckCircle, Scale, ShieldAlert, BookOpen } from 'lucide-react';
import { APPROACH_ORDER } from '../simulation/constants';

export function ControllerLogic({ evaluation = {}, fsm = {}, settings = {} }) {
  const scores = evaluation.approachScores || {};
  const selectedApp = evaluation.selectedApproach;
  const isEmergency = evaluation.isEmergencyOverride;
  const explanation = evaluation.explanation;

  // Collect all active rules from approaches
  const activeRulesMap = new Map();
  for (const app of APPROACH_ORDER) {
    const fuzzy = scores[app]?.fuzzyDetails;
    if (fuzzy?.activeRules) {
      for (const rule of fuzzy.activeRules) {
        if (!activeRulesMap.has(rule.id) || activeRulesMap.get(rule.id).weight < rule.weight) {
          activeRulesMap.set(rule.id, { ...rule, approach: app });
        }
      }
    }
  }
  const allActiveRules = Array.from(activeRulesMap.values());

  const weights = settings.weights || {
    demand: 0.25,
    waitingTime: 0.25,
    queueLength: 0.20,
    fairness: 0.15,
    fuzzyUrgency: 0.15
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide">ADAPTIVE CONTROLLER LOGIC & DECISION ENGINE</h2>
        <p className="text-xs text-slate-400">Context-aware hybrid optimization blending Mamdani Fuzzy Inference with Dynamic Priority Indexing</p>
      </div>

      {/* "Why This Road Was Selected" Explainable AI Banner */}
      <div className="glass-panel-accent p-6 rounded-2xl border border-cyan-500/40 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide">DECISION RATIONALE: WHY THIS CORRIDOR WAS SELECTED</h3>
            <span className="text-xs text-cyan-400 font-mono">
              Target Phase: <span className="font-bold text-white">{selectedApp}</span> {isEmergency && '(EMERGENCY PREEMPTION)'}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          {explanation || 'Calculating initial phase optimization...'}
        </p>
      </div>

      {/* Live Decision Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white tracking-wide">LIVE APPROACH EVALUATION MATRIX</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">APPROACH</th>
                <th className="py-2.5 px-3">DEMAND</th>
                <th className="py-2.5 px-3">WAIT TIME</th>
                <th className="py-2.5 px-3">QUEUE</th>
                <th className="py-2.5 px-3">FAIRNESS</th>
                <th className="py-2.5 px-3">FUZZY URGENCY</th>
                <th className="py-2.5 px-3">COMPUTED DPI</th>
                <th className="py-2.5 px-3">SIGNAL ASPECT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {APPROACH_ORDER.map((app) => {
                const s = scores[app] || {};
                const isSelected = selectedApp === app;
                const signal = fsm?.signals?.[app] || 'RED';
                const fuzzyCat = s.fuzzyDetails?.category || 'LOW';

                return (
                  <tr
                    key={app}
                    className={`transition-colors ${
                      isSelected ? 'bg-cyan-950/30 font-semibold' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-1.5">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                      <span>{app}</span>
                    </td>
                    <td className="py-3 px-3 text-cyan-300">{s.demandScore ?? 0} pts</td>
                    <td className="py-3 px-3 text-amber-300">{s.waitingTimeScore ?? 0} pts</td>
                    <td className="py-3 px-3 text-rose-300">{s.queueLengthScore ?? 0} pts</td>
                    <td className="py-3 px-3 text-purple-300">{s.fairnessScore ?? 0} pts</td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200">{s.fuzzyUrgencyScore ?? 0}</span>
                      <span className="text-slate-500 text-[10px] ml-1">({fuzzyCat})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-base font-extrabold text-cyan-400">{s.dpi ?? 0}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        signal === 'GREEN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        signal === 'YELLOW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {signal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Fuzzy Rules Inspector */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">ACTIVATED MAMDANI FUZZY RULES</h3>
          </div>
          <span className="text-xs font-mono text-cyan-400">{allActiveRules.length} rules currently firing</span>
        </div>

        <div className="space-y-2">
          {allActiveRules.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">Baseline conditions. No elevated fuzzy rules firing.</p>
          ) : (
            allActiveRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-1">
                  <span className="text-[11px] text-cyan-400 font-bold">Rule #{rule.id} [{rule.approach}]:</span>
                  <p className="text-slate-200 font-sans">{rule.text}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Firing Strength (α-cut)</span>
                  <span className="text-amber-400 font-bold">{rule.weight.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dynamic Priority Index (DPI) Mathematical Model Explanation */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 text-xs leading-relaxed">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">DYNAMIC PRIORITY INDEX (DPI) MATHEMATICAL FORMULATION</h3>
        </div>

        <p className="text-slate-300">
          The Dynamic Priority Index determines which road receives the next green allocation by computing a multi-attribute weighted synthesis:
        </p>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-cyan-300 text-xs">
          DPI = (wd × DemandScore) + (ww × WaitingTimeScore) + (wq × QueueLengthScore) + (wf × FairnessScore) + (wu × FuzzyUrgencyScore)
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono pt-2">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Demand Weight (wd)</span>
            <span className="font-bold text-white">{weights.demand}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Wait Weight (ww)</span>
            <span className="font-bold text-white">{weights.waitingTime}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Queue Weight (wq)</span>
            <span className="font-bold text-white">{weights.queueLength}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Fairness Weight (wf)</span>
            <span className="font-bold text-white">{weights.fairness}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Fuzzy Urgency (wu)</span>
            <span className="font-bold text-white">{weights.fuzzyUrgency}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
