'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  buildHeroState,
  getCurrentStep,
  nextStep,
  getConfidenceWaveData,
  getFragilityBand,
  getProjectedUplift,
} from './hero-engine';
import type { HeroMode, HeroState } from './hero-engine';
import { AnimatedGraph } from './AnimatedGraph';
import { MetricPanel } from './MetricPanel';
import { NarrativePanel } from './NarrativePanel';
import { ConfidenceWave } from './ConfidenceWave';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STEP_INTERVAL_MS = 3000; // 3 seconds between steps
const MODES: HeroMode[] = ['simulate', 'stress-test', 'improve'];

const MODE_LABELS: Record<HeroMode, string> = {
  simulate: 'Simulate',
  'stress-test': 'Stress Test',
  improve: 'Improve',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DecisionHero() {
  const [mounted, setMounted] = useState(false);
  const [heroState, setHeroState] = useState<HeroState>(() => buildHeroState('simulate'));
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // SSR-safe mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!mounted || paused || reducedMotion) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setHeroState((prev) => nextStep(prev));
    }, STEP_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mounted, paused, reducedMotion]);

  const handleModeChange = useCallback((mode: HeroMode) => {
    setHeroState(buildHeroState(mode));
  }, []);

  const handlePauseToggle = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  // Derived state
  const step = getCurrentStep(heroState);
  const waveData = getConfidenceWaveData(heroState);
  const fragilityBand = getFragilityBand(heroState);
  const projectedUplift = getProjectedUplift(heroState);

  // Static fallback during SSR
  if (!mounted) {
    return (
      <section
        className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800"
        style={{ minHeight: '600px' }}
      >
        <div className="bg-grid absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              See how your decisions hold under pressure.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
              Simulate outcomes. Measure stability. Improve confidence — with full traceability.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <div className="bg-grid absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Headline */}
        <div className="mb-8 text-center md:mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            See how your decisions hold under pressure.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Simulate outcomes. Measure stability. Improve confidence — with full traceability.
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                heroState.mode === mode
                  ? mode === 'simulate'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : mode === 'stress-test'
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}

          {/* Pause/Play */}
          <button
            type="button"
            onClick={handlePauseToggle}
            className="ml-2 rounded-lg bg-slate-800/40 px-3 py-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
            aria-label={paused ? 'Resume animation' : 'Pause animation'}
          >
            {paused ? '▶' : '❚❚'}
          </button>
        </div>

        {/* Main Hero Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Graph (takes 2 cols on lg) */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 md:col-span-1 lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Decision Graph
              </p>
              <span className="rounded bg-slate-700/50 px-2 py-0.5 text-[9px] text-slate-400">
                Node: {step.activeNodeId}
              </span>
            </div>
            <AnimatedGraph
              nodes={heroState.nodes}
              edges={heroState.edges}
              activeNodeId={step.activeNodeId}
              activeEdgeIds={step.activeEdgeIds}
              mode={heroState.mode}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* Narrative Panel (right column on lg) */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4">
            <NarrativePanel
              step={step}
              mode={heroState.mode}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* Bottom row: Metrics + Confidence Wave */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Metrics */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Metrics
            </p>
            <MetricPanel step={step} mode={heroState.mode} reducedMotion={reducedMotion} />
          </div>

          {/* Confidence Wave */}
          <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Confidence Wave
            </p>
            <ConfidenceWave
              data={waveData}
              fragilityBand={fragilityBand}
              projectedUplift={projectedUplift}
              mode={heroState.mode}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Deterministic
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Reproducible
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Audit-ready
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/studio"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
          >
            Open Decision Studio
          </Link>
          <Link
            href="/product"
            className="rounded-lg border border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-slate-800/60"
          >
            View Panel Demos
          </Link>
        </div>
      </div>
    </section>
  );
}
