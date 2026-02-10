'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { makeNegotiationExample, runDecision, makeOpsExample, canonicalizeDecisionSpec, hashDecisionSpec, buildEvidencePacket, computeDeterministicSeed } from '@zeo/core';
import type { DecisionResult, DecisionSpec } from '@zeo/contracts';

interface RunComparison {
  id: string;
  title: string;
  scenario: string;
  result: DecisionResult;
  spec: DecisionSpec;
  hash: string;
  seed: string;
  timestamp: string;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [runs, setRuns] = useState<[RunComparison | null, RunComparison | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRuns, setLocalRuns] = useState<RunComparison[]>([]);

  // Get run IDs from URL or generate demo runs
  const runAId = searchParams.get('a');
  const runBId = searchParams.get('b');

  // Load local runs on mount
  useEffect(() => {
    const saved = localStorage.getItem('zeo_compare_runs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalRuns(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Fetch or generate runs
  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (runAId && runBId) {
        // Try to fetch from local storage
        const saved = localStorage.getItem('zeo_compare_runs');
        if (saved) {
          const parsed: RunComparison[] = JSON.parse(saved);
          const runA = parsed.find(r => r.id === runAId);
          const runB = parsed.find(r => r.id === runBId);
          if (runA && runB) {
            setRuns([runA, runB]);
            return;
          }
        }
        setError('Runs not found. Please generate comparison runs first.');
        return;
      }

      // Generate two demo runs with different scenarios
      const [spec1, spec2] = [makeNegotiationExample(), makeOpsExample()];

      const result1 = runDecision(spec1, { depth: 2 });
      const result2 = runDecision(spec2, { depth: 2 });

      const hash1 = hashDecisionSpec(canonicalizeDecisionSpec(spec1));
      const hash2 = hashDecisionSpec(canonicalizeDecisionSpec(spec2));
      const seed1 = computeDeterministicSeed(hash1, undefined, 2);
      const seed2 = computeDeterministicSeed(hash2, undefined, 2);

      const timestamp = new Date().toISOString();

      const run1: RunComparison = {
        id: `run-${Date.now()}-a`,
        title: spec1.title,
        scenario: 'Negotiation Decision',
        result: result1,
        spec: spec1,
        hash: hash1,
        seed: seed1,
        timestamp,
      };

      const run2: RunComparison = {
        id: `run-${Date.now()}-b`,
        title: spec2.title,
        scenario: 'Ops Decision',
        result: result2,
        spec: spec2,
        hash: hash2,
        seed: seed2,
        timestamp,
      };

      // Save to local storage
      const newRuns = [...localRuns, run1, run2].slice(-10); // Keep last 10
      setLocalRuns(newRuns);
      localStorage.setItem('zeo_compare_runs', JSON.stringify(newRuns));

      setRuns([run1, run2]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [runAId, runBId, localRuns]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  const handleGenerateNew = () => {
    setRuns([null, null]);
    fetchRuns();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Comparison</h2>
          <p className="text-gray-600">Running decision scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleGenerateNew}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Generate New Comparison
          </button>
        </div>
      </div>
    );
  }

  const [run1, run2] = runs;

  if (!run1 || !run2) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Compare Runs</h1>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </a>
            <span className="text-gray-300">|</span>
            <a href="/demo" className="text-sm text-gray-500 hover:text-gray-700">
              Demo
            </a>
            <span className="text-gray-300">|</span>
            <a href="/quickstart" className="text-sm text-gray-500 hover:text-gray-700">
              Quick Start
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Comparison Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Run Comparison</h2>
            <p className="text-gray-600 mt-1">Side-by-side analysis of two decision runs</p>
          </div>
          <button
            onClick={handleGenerateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.001 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate New
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <RunSummaryCard run={run1} label="Run A" color="blue" />
          <RunSummaryCard run={run2} label="Run B" color="green" />
        </div>

        {/* Detailed Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="font-semibold text-gray-900">Detailed Comparison</h3>
          </div>

          <div className="divide-y divide-gray-100">
            <ComparisonRow label="Scenario">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium">
                  {run1.scenario}
                </div>
                <div className="text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm font-medium">
                  {run2.scenario}
                </div>
              </div>
            </ComparisonRow>

            <ComparisonRow label="Branches">
              <div className="grid grid-cols-2 gap-4">
                <ComparisonCell
                  value={`${run1.result.graph.nodes.length} nodes, ${run1.result.graph.edges.length} edges`}
                  highlight={run1.result.graph.nodes.length !== run2.result.graph.nodes.length}
                />
                <ComparisonCell
                  value={`${run2.result.graph.nodes.length} nodes, ${run2.result.graph.edges.length} edges`}
                  highlight={run2.result.graph.nodes.length !== run1.result.graph.nodes.length}
                />
              </div>
            </ComparisonRow>

            <ComparisonRow label="Robust Actions">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {run1.result.evaluations
                    .find(e => e.lens === 'robustness')
                    ?.robustActions.slice(0, 3)
                    .map((action, i) => (
                      <div key={i} className="text-blue-700 bg-blue-50 px-3 py-2 rounded-lg text-sm">
                        {action}
                      </div>
                    )) || <span className="text-gray-400 text-sm">None</span>}
                </div>
                <div className="space-y-2">
                  {run2.result.evaluations
                    .find(e => e.lens === 'robustness')
                    ?.robustActions.slice(0, 3)
                    .map((action, i) => (
                      <div key={i} className="text-green-700 bg-green-50 px-3 py-2 rounded-lg text-sm">
                        {action}
                      </div>
                    )) || <span className="text-gray-400 text-sm">None</span>}
                </div>
              </div>
            </ComparisonRow>

            <ComparisonRow label="Evidence Requests">
              <div className="grid grid-cols-2 gap-4">
                <ComparisonCell
                  value={`${run1.result.nextBestEvidence.length} items`}
                  highlight={run1.result.nextBestEvidence.length !== run2.result.nextBestEvidence.length}
                />
                <ComparisonCell
                  value={`${run2.result.nextBestEvidence.length} items`}
                  highlight={run2.result.nextBestEvidence.length !== run1.result.nextBestEvidence.length}
                />
              </div>
            </ComparisonRow>

            <ComparisonRow label="Determinism">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-xs text-gray-500 font-mono">
                  <div>Hash: {run1.hash.slice(0, 16)}...</div>
                  <div>Seed: {run1.seed.slice(0, 16)}...</div>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  <div>Hash: {run2.hash.slice(0, 16)}...</div>
                  <div>Seed: {run2.seed.slice(0, 16)}...</div>
                </div>
              </div>
            </ComparisonRow>
          </div>
        </div>

        {/* Determinism Note */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-yellow-900">Deterministic Results</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Each run produces identical results given the same seed. Compare different scenarios to see how assumptions affect outcomes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RunSummaryCard({ run, label, color }: { run: RunComparison; label: string; color: 'blue' | 'green' }) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium opacity-80">{label}</span>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">{run.scenario}</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">{run.title}</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs opacity-70 mb-1">Branches</div>
          <div className="font-semibold">{run.result.graph.nodes.length}</div>
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Evidence</div>
          <div className="font-semibold">{run.result.nextBestEvidence.length}</div>
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Fragile</div>
          <div className="font-semibold">{run.result.explanation.whatWouldChange.length}</div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr]">
      <div className="px-6 py-4 bg-gray-50 font-medium text-gray-700 text-sm border-r border-gray-100">
        {label}
      </div>
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}

function ComparisonCell({ value, highlight }: { value: string; highlight?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded-lg text-sm ${highlight ? 'bg-yellow-50 text-yellow-800 font-medium' : 'text-gray-700'}`}>
      {value}
    </div>
  );
}
