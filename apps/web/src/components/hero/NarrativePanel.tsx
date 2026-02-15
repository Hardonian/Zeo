'use client';

import { useState } from 'react';
import type { HeroStep, HeroMode } from './hero-engine';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface NarrativePanelProps {
  step: HeroStep;
  mode: HeroMode;
  reducedMotion: boolean;
}

export function NarrativePanel({ step, mode, reducedMotion }: NarrativePanelProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const transitionClass = reducedMotion ? '' : 'transition-all duration-500';

  const modeLabel = mode === 'simulate' ? 'Simulate' : mode === 'stress-test' ? 'Stress Test' : 'Improve';

  return (
    <div className={`space-y-3 ${transitionClass}`}>
      {/* Mode badge */}
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
          mode === 'simulate'
            ? 'bg-indigo-500/20 text-indigo-300'
            : mode === 'stress-test'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-emerald-500/20 text-emerald-300'
        }`}>
          {modeLabel}
        </span>
        <span className="text-[10px] text-slate-500">
          Step {step.index + 1}
        </span>
      </div>

      {/* Executive Summary */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Executive Summary
        </p>
        <p className={`mt-1 text-sm leading-relaxed text-slate-200 ${transitionClass}`}>
          {step.executiveSummary}
        </p>
      </div>

      {/* Key Drivers */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Key Drivers
        </p>
        <ul className="mt-1 space-y-1">
          {step.keyDrivers.map((driver, i) => (
            <li key={i} className={`flex items-start gap-1.5 text-xs text-slate-300 ${transitionClass}`}>
              <span className="mt-1 block h-1 w-1 flex-shrink-0 rounded-full bg-blue-400" />
              {driver}
            </li>
          ))}
        </ul>
      </div>

      {/* Next Action */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Next Action
        </p>
        <p className={`mt-1 text-xs leading-relaxed text-blue-300 ${transitionClass}`}>
          {step.nextAction}
        </p>
      </div>

      {/* Live narrative line (synced with animation) */}
      <div className={`rounded-lg border border-slate-700/30 bg-slate-800/30 px-3 py-2 ${transitionClass}`}>
        <p className="text-xs italic text-slate-400">
          {step.narrativeLine}
        </p>
      </div>

      {/* Technical details micro-toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-1 text-[10px] text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg
            className={`h-3 w-3 transition-transform ${showTechnical ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          View technical details
        </button>
        {showTechnical && (
          <div className="mt-2 rounded-lg border border-slate-700/30 bg-slate-900/50 p-2.5">
            <p className="mb-1 text-[9px] font-medium uppercase tracking-wider text-slate-500">
              CLI Command
            </p>
            <code className="block text-[11px] text-blue-400">
              {step.cliCommand}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
