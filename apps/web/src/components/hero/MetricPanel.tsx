'use client';

import type { HeroStep, HeroMode } from './hero-engine';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface MetricPanelProps {
  step: HeroStep;
  mode: HeroMode;
  reducedMotion: boolean;
}

export function MetricPanel({ step, mode, reducedMotion }: MetricPanelProps) {
  const transitionClass = reducedMotion ? '' : 'transition-all duration-500';

  return (
    <div className="space-y-3">
      {/* Primary Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricCard
          label="Confidence"
          value={`${step.confidence}%`}
          color={step.confidence >= 60 ? 'text-emerald-400' : step.confidence >= 40 ? 'text-yellow-400' : 'text-red-400'}
          transitionClass={transitionClass}
        />
        <MetricCard
          label="Stability"
          value={step.stability.toFixed(2)}
          color={step.stability >= 0.7 ? 'text-emerald-400' : step.stability >= 0.5 ? 'text-yellow-400' : 'text-red-400'}
          transitionClass={transitionClass}
        />
        <MetricCard
          label="Flip Dist."
          value={step.flipDistance.toFixed(2)}
          color={step.flipDistance >= 0.15 ? 'text-blue-400' : 'text-yellow-400'}
          transitionClass={transitionClass}
        />
      </div>

      {/* Evidence panel for improve mode */}
      {mode === 'improve' && step.topEvidence.length > 0 && (
        <div className={`rounded-lg border border-slate-700/50 bg-slate-800/40 p-3 ${transitionClass}`}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Top Evidence by VOI
          </p>
          <div className="space-y-1.5">
            {step.topEvidence.map((ev) => (
              <div key={ev.source} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[9px] font-medium text-slate-300">
                    {ev.rank}
                  </span>
                  <span className="text-xs text-slate-300">{ev.source}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${ev.voiScore * 100}%`, transition: reducedMotion ? 'none' : 'width 0.6s ease' }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-blue-400">
                    {ev.voiScore.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fragility markers for stress-test mode */}
      {mode === 'stress-test' && (
        <div className={`rounded-lg border border-amber-800/30 bg-amber-900/10 p-3 ${transitionClass}`}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
            Fragility Markers
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Flip threshold</span>
              <span className="font-mono text-amber-400">{step.flipDistance.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Stability score</span>
              <span className={`font-mono ${step.stability < 0.6 ? 'text-red-400' : 'text-yellow-400'}`}>
                {step.stability.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  color,
  transitionClass,
}: {
  label: string;
  value: string;
  color: string;
  transitionClass: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-700/50 bg-slate-800/50 px-3 py-2 ${transitionClass}`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-bold ${color} ${transitionClass}`}>{value}</p>
    </div>
  );
}
