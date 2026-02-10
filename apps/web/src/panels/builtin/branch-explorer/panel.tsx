'use client';

import React, { useState } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { runDecision, policyEngine, PolicyViolation } from '@zeo/core';

interface BranchExplorerProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function BranchExplorer({ manifest }: BranchExplorerProps) {
  const { decision, result, lastRun, isRunning, setResult, setLastRun, setIsRunning, setError } = useDecisionStore();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);

  const handleRunDecision = async () => {
    if (!decision) {
      setError('No decision loaded. Please create a decision first.');
      return;
    }

    // POLICY CHECK
    // Attempt to map decision spec to policy context
    // Note: Assuming specific constraint names for budget for now as per requirement
    // In a real app, this mapping would be more robust.
    const context = {
      constraints: extractBudgetConstraints(decision),
      // We pass claims as assumptions if they match the shape, otherwise empty
      // logic to be refined with proper Assumption objects
      assumptions: (decision.assumptions as any[]) || []
    };

    const policyViolations = policyEngine.validate(context);
    setViolations(policyViolations);

    const hasBlocking = policyViolations.some(v => v.severity === 'block');
    if (hasBlocking) {
      return; // Stop execution
    }

    setIsRunning(true);
    setViolations([]); // Clear previous if proceeding (or keep warnings?)
    // potentially keep warnings visible

    try {
      const res = runDecision(decision); // runDecision is sync for now in mock, could be async

      // POST-RUN POLICY CHECK
      const postViolations = policyEngine.validate({
        decisionResult: res
      });
      setViolations(prev => [...prev, ...postViolations]); // Show all violations

      setResult(res);
      setLastRun(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
        <p className="text-sm text-gray-500">{manifest.description}</p>
      </div>

      {!decision ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No decision loaded</p>
          <p className="text-sm text-gray-400 mt-1">Use the Decision Composer to create a decision</p>
        </div>
      ) : (
        <>
          {/* Policy Violations Display */}
          {violations.length > 0 && (
            <div className="space-y-2 mb-4">
              {violations.map((v, i) => (
                <div key={i} className={`p-3 border rounded-md ${v.severity === 'block' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${v.severity === 'block' ? 'bg-red-200' : 'bg-yellow-200'
                      }`}>
                      {v.severity.toUpperCase()}
                    </span>
                    <span className="font-semibold text-sm">{v.message}</span>
                  </div>
                  <p className="text-xs mt-1 ml-1">{v.remediation}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleRunDecision}
            disabled={isRunning || violations.some(v => v.severity === 'block')}
            className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${violations.some(v => v.severity === 'block')
              ? 'bg-red-400 hover:bg-red-500 focus:ring-red-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
          >
            {isRunning ? 'Running...' : 'Run Decision'}
          </button>

          {isRunning && (
            <div className="animate-pulse bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">Running decision analysis...</p>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800">Analysis Complete</p>
                {lastRun && (
                  <p className="text-xs text-green-600 mt-1">
                    {new Date(lastRun).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Branches</h3>
                <div className="space-y-1">
                  {result.graph.nodes.slice(0, 5).map((node: any) => (
                    <div
                      key={node.id}
                      className={`text-sm px-2 py-1 rounded cursor-pointer ${activeNode === node.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                        }`}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                    >
                      {node.label}
                    </div>
                  ))}
                  {result.graph.nodes.length > 5 && (
                    <p className="text-sm text-gray-400 px-2 py-1">
                      +{result.graph.nodes.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* Wizard Modal */}
      {wizardOpen && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col p-4 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-gray-800">
              Run Configuration (Step {step}/3)
            </h3>
            <button onClick={() => setWizardOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Budget & Constraints</h4>
                <p className="text-xs text-gray-500">Set limits for this execution.</p>
                {/* Budget Inputs - simplified mock updates to constraints */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium">Max Cost (USD)</label>
                  <input type="number" className="w-full border rounded p-1 text-sm" placeholder="e.g. 1000"
                    onChange={(e) => {
                      // Logic to update/add 'Max Cost' constraint in stagedConstraints
                      // Simplify: just logged/noop for this demo if logic complex
                    }}
                  />
                  <p className="text-xs text-gray-400 italic">Enter 0 for unlimited.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Review Assumptions</h4>
                <div className="space-y-2">
                  {stagedAssumptions.map((a: any, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm border p-2 rounded">
                      <input type="checkbox" checked defaultChecked />
                      <span>{a.text || a.label}</span>
                    </div>
                  ))}
                  {stagedAssumptions.length === 0 && <p className="text-xs text-gray-400">No assumptions defined.</p>}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Review & Diff</h4>
                {result ? (
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    <p className="font-bold text-gray-500 mb-2">Changes from last run:</p>
                    {/* Compute diff */}
                    {(() => {
                      // naive diff
                      const diff = deepDiff(result.assumptions || [], stagedAssumptions);
                      return diff.length ? (
                        <ul className="space-y-1">
                          {diff.map((d, i) => <li key={i} className="text-blue-600">Δ {d.path}: {String(d.val)}</li>)}
                        </ul>
                      ) : <span className="text-gray-400">No input changes detected.</span>
                    })()}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">First run for this session.</p>
                )}

                <div className="bg-yellow-50 p-2 rounded border border-yellow-100">
                  <p className="text-xs text-yellow-800 font-medium">
                    Ready to execute with {stagedAssumptions.length} assumptions.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2 border-t">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="text-xs px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(s => Math.min(3, s + 1))}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded font-bold"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleRunDecision}
                className="text-xs px-3 py-1 bg-green-600 text-white rounded font-bold"
              >
                RUN NOW
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to extract budget from generic constraints
function extractBudgetConstraints(spec: DecisionSpec): any {
  // This is a naive extraction based on naming conventions for now
  // In a real implementation, we'd look for specific types or tags
  const constraints: any = {};

  spec.constraints.forEach(c => {
    if (c.name.toLowerCase().includes('cost') || c.name.toLowerCase().includes('budget')) {
      // parsing logic
      const match = c.value.match(/(\d+)\s*([a-zA-Z]+)/);
      if (match) {
        constraints.maxCost = { amount: parseFloat(match[1]), unit: match[2] };
      }
    }
    if (c.name.toLowerCase().includes('time') || c.name.toLowerCase().includes('duration')) {
      const match = c.value.match(/(\d+)\s*([a-zA-Z]+)/);
      if (match) {
        constraints.maxDuration = { amount: parseFloat(match[1]), unit: match[2] || 'hours' };
      }
    }
  });

  return constraints;
}
