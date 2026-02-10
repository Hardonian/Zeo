'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { makeNegotiationExample, runDecision, canonicalizeDecisionSpec, hashDecisionSpec, buildEvidencePacket, buildEvidencePacketMarkdown, computeDeterministicSeed } from '@zeo/core';
import type { DecisionResult, DecisionSpec } from '@zeo/contracts';

interface OnboardingState {
  phase: 'welcome' | 'running' | 'results' | 'error';
  scenarioName: string;
  progress: string;
  error: string | null;
  result: DecisionResult | null;
  reproPack: { json: string; markdown: string } | null;
  decisionHash: string;
  seed: string;
}

export default function QuickStartPage() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    phase: 'welcome',
    scenarioName: 'Negotiation Decision',
    progress: '',
    error: null,
    result: null,
    reproPack: null,
    decisionHash: '',
    seed: '',
  });

  const runDemoScenario = useCallback(async () => {
    setState(s => ({ ...s, phase: 'running', progress: 'Initializing scenario...' }));

    try {
      // Create demo scenario
      const spec = makeNegotiationExample();
      setState(s => ({ ...s, progress: 'Running decision engine...' }));

      // Run decision
      const result = runDecision(spec, { depth: 2 });
      setState(s => ({ ...s, progress: 'Building evidence packet...' }));

      // Compute hashes
      const canonicalSpec = canonicalizeDecisionSpec(spec);
      const decisionHash = hashDecisionSpec(canonicalSpec);
      const seed = computeDeterministicSeed(decisionHash, undefined, 2);

      // Build repro pack
      const runMeta = {
        seed,
        depth: 2,
        limits: { maxBranches: 100, maxDepth: 2 },
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        errors: [],
      };

      const packet = buildEvidencePacket({
        decisionSpec: spec,
        decisionResult: result,
        runMeta,
        errors: [],
      });

      const packetJson = JSON.stringify(packet, null, 2);
      const packetMarkdown = buildEvidencePacketMarkdown(packet);

      setState(s => ({
        ...s,
        phase: 'results',
        progress: 'Complete!',
        result,
        reproPack: { json: packetJson, markdown: packetMarkdown },
        decisionHash,
        seed,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        phase: 'error',
        error: (err as Error).message,
      }));
    }
  }, []);

  const handleDownloadReproPack = () => {
    if (!state.reproPack) return;

    // Download JSON
    const blob = new Blob([state.reproPack.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zeo-repro-pack-${state.decisionHash.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also download markdown summary
    const mdBlob = new Blob([state.reproPack.markdown], { type: 'text/markdown' });
    const mdUrl = URL.createObjectURL(mdBlob);
    const mdA = document.createElement('a');
    mdA.href = mdUrl;
    mdA.download = `zeo-report-${state.decisionHash.slice(0, 8)}.md`;
    document.body.appendChild(mdA);
    mdA.click();
    document.body.removeChild(mdA);
    URL.revokeObjectURL(mdUrl);
  };

  const handleStartOwn = () => {
    router.push('/intake');
  };

  const handleViewDemo = () => {
    router.push('/demo');
  };

  // Auto-run on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      runDemoScenario();
    }, 1500);
    return () => clearTimeout(timer);
  }, [runDemoScenario]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Quick Start</h1>
          </div>
          <div className="text-sm text-gray-500">
            {state.decisionHash
              ? `Decision: ${state.decisionHash.slice(0, 12)}...`
              : 'Initializing...'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Modal (shown during loading) */}
        {state.phase === 'welcome' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to Zeo
            </h2>
            <p className="text-gray-600 mb-6">
              Running your first decision scenario...
            </p>
            <div className="text-sm text-gray-500">
              {state.progress}
            </div>
          </div>
        )}

        {/* Running State */}
        {state.phase === 'running' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Running Decision Analysis
            </h2>
            <p className="text-gray-600 mb-4">
              {state.progress}
            </p>
            <p className="text-sm text-gray-500">
              This runs locally on your machine — no data leaves your browser.
            </p>
          </div>
        )}

        {/* Results */}
        {state.phase === 'results' && state.result && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Decision Analysis Complete
                  </h3>
                  <p className="text-sm text-green-700">
                    {state.result.graph.nodes.length} branches analyzed • {state.result.graph.edges.length} dependencies
                  </p>
                </div>
              </div>

              {/* Key Findings */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Robust Actions</div>
                  <div className="font-semibold text-gray-900">
                    {state.result.evaluations
                      .find(e => e.lens === 'robustness')
                      ?.robustActions.slice(0, 3)
                      .join(', ') || 'None identified'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Branches</div>
                  <div className="font-semibold text-gray-900">
                    {state.result.graph.nodes.length} nodes
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Evidence Pulls</div>
                  <div className="font-semibold text-gray-900">
                    {state.result.nextBestEvidence.length} items
                  </div>
                </div>
              </div>
            </div>

            {/* What Would Change */}
            {state.result.explanation.whatWouldChange.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  What Would Change the Answer
                </h4>
                <div className="space-y-3">
                  {state.result.explanation.whatWouldChange.slice(0, 3).map((wc, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-yellow-700">
                          {wc.assumptionId.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {wc.flipCondition}
                        </div>
                        <div className="text-xs text-gray-500">
                          If this assumption holds differently
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Best Evidence */}
            {state.result.nextBestEvidence.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Recommended Evidence to Gather
                </h4>
                <div className="space-y-3">
                  {state.result.nextBestEvidence.slice(0, 5).map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-700">{i + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {n.prompt}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {n.rationale}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleDownloadReproPack}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Repro Pack
              </button>
              <button
                onClick={handleStartOwn}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Start Your Own Decision
              </button>
              <button
                onClick={handleViewDemo}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Full Demo
              </button>
            </div>

            {/* Determinism Info */}
            <div className="text-xs text-gray-400 text-center">
              Decision Hash: {state.decisionHash} • Seed: {state.seed.slice(0, 16)}...
            </div>
          </div>
        )}

        {/* Error State */}
        {state.phase === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 mb-4">
              {state.error}
            </p>
            <button
              onClick={runDemoScenario}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
