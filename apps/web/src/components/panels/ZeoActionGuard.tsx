'use client';

import { useState } from 'react';

const RISKS = [
  {
    id: 'paths',
    title: 'Uncovered Logic Paths',
    description: 'Several conditional branches in the checkout flow lack unit tests. Counterfactual analysis shows 3 potential failure modes.',
    severity: 'high' as const,
    score: 0.72,
  },
  {
    id: 'workflows',
    title: 'Unverified Workflows',
    description: 'API gateway integration changes have not been fully simulated against production traffic patterns.',
    severity: 'medium' as const,
    score: 0.45,
  },
  {
    id: 'drift',
    title: 'Configuration Drift',
    description: 'Environment variables differ between staging and production. 2 keys are scoped incorrectly.',
    severity: 'low' as const,
    score: 0.18,
  },
];

const CHECKS = [
  { name: 'Build & Test', status: 'passed' as const },
  { name: 'Lint & Format', status: 'passed' as const },
  { name: 'Zeo Counterfactual Audit', status: 'warning' as const },
  { name: 'Key Scope Verification', status: 'passed' as const },
];

export function ZeoActionGuard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Blurred background PR context */}
      <div className="bg-gray-50 border-b border-gray-200 p-5 opacity-60 select-none pointer-events-none">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
          <span>zeo/core-engine</span>
          <span>#842</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">feat: API gateway routing integration v2</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium border border-green-200">Open</span>
          <span className="text-xs text-gray-500">opened 4 hours ago</span>
        </div>
        <div className="mt-3 space-y-2">
          {CHECKS.map((check) => (
            <div key={check.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-[10px] ${
                  check.status === 'passed' ? 'bg-green-500' : 'bg-amber-500'
                }`}>
                  {check.status === 'passed' ? '\u2713' : '!'}
                </span>
                <span className="text-sm text-gray-700">{check.name}</span>
              </div>
              <span className={`text-xs ${check.status === 'passed' ? 'text-gray-500' : 'text-amber-600 font-medium'}`}>
                {check.status === 'passed' ? 'Passed' : 'Risks found'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Guard Dialog Overlay */}
      <div className="p-6">
        <div className="text-center mb-5">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Action Guard</h2>
          <p className="mt-1 text-sm text-gray-500">Zeo found potential risks requiring review before merge.</p>
        </div>

        {/* Risk Items with Evidence Scoring */}
        <div className="space-y-3 mb-5">
          {RISKS.map((risk) => (
            <button
              key={risk.id}
              onClick={() => setExpanded(expanded === risk.id ? null : risk.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                risk.severity === 'high'
                  ? 'bg-amber-50 border-amber-100'
                  : risk.severity === 'medium'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{risk.title}</h3>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{risk.description}</p>
                </div>
                <div className="ml-3 text-right shrink-0">
                  <div className="text-xs text-gray-500 mb-1">Evidence</div>
                  <div className={`text-sm font-bold ${
                    risk.score > 0.6 ? 'text-amber-600' : risk.score > 0.3 ? 'text-gray-700' : 'text-green-600'
                  }`}>
                    {(risk.score * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              {expanded === risk.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 space-y-1">
                  <div>Counterfactual paths analyzed: <span className="text-gray-700 font-medium">12</span></div>
                  <div>Regret potential: <span className="text-gray-700 font-medium">{risk.score > 0.5 ? 'High' : 'Low'}</span></div>
                  <div>Reversibility: <span className="text-gray-700 font-medium">{risk.severity === 'high' ? 'Difficult' : 'Easy'}</span></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors">
            Run Verification Now
          </button>
          <button className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors">
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
