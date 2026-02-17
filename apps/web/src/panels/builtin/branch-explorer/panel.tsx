'use client';

import React, { useState } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { runDecision, policyEngine, PolicyViolation, exportScenarioPack } from '@zeo/core';
import { deepDiff, support } from '@zeo/repro-pack';

interface BranchExplorerProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function BranchExplorer({ manifest }: BranchExplorerProps) {
  const { decision, result, lastRun, isRunning, setResult, setLastRun, setIsRunning, setError, setDecision } = useDecisionStore();
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [violations, setViolations] = useState<PolicyViolation[]>([]);

  // Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Budget, 2: Assumptions, 3: Review

  // Staged changes for the run
  const [stagedConstraints, setStagedConstraints] = useState<any[]>([]);
  const [stagedAssumptions, setStagedAssumptions] = useState<any[]>([]);

  const handleStartRun = () => {
    if (!decision) {
      setError('No decision loaded. Please create a decision first.');
      return;
    }
    setStagedConstraints([...decision.constraints]);
    setStagedAssumptions([...decision.assumptions]);
    setStep(1);
    setWizardOpen(true);
    setViolations([]);
  };

  const updateStagedConstraint = (nameKey: string, value: string) => {
    setStagedConstraints(prev => {
      const index = prev.findIndex(c => c.name.toLowerCase().includes(nameKey.toLowerCase()));
      if (index !== -1) {
        const next = [...prev];
        next[index] = { ...next[index], value };
        return next;
      } else {
        // Add new if not found
        return [...prev, { id: crypto.randomUUID(), name: nameKey, value, status: 'assumption' }];
      }
    });
  };

  const handleRunDecision = async () => {
    if (!decision) return;

    // Apply staged changes (transiently for this run)
    const updatedSpec = {
      ...decision,
      constraints: stagedConstraints,
      assumptions: stagedAssumptions
    };

    setDecision(updatedSpec);

    // POLICY CHECK
    const context = {
      constraints: extractBudgetConstraints(updatedSpec),
      assumptions: stagedAssumptions
    };

    const policyViolations = policyEngine.validate(context);
    setViolations(policyViolations);

    const hasBlocking = policyViolations.some(v => v.severity === 'block');
    if (hasBlocking) {
      setWizardOpen(false);
      return;
    }

    setWizardOpen(false);
    setIsRunning(true);
    setViolations([]);

    try {
      const res = runDecision(updatedSpec);

      // POST-RUN POLICY CHECK
      const postViolations = policyEngine.validate({
        decisionResult: res
      });
      setViolations(prev => [...prev, ...postViolations]);

      setResult(res);
      setLastRun(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-4 space-y-4 relative h-full flex flex-col">
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
            onClick={handleStartRun}
            disabled={isRunning || violations.some(v => v.severity === 'block')}
            className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 ${violations.some(v => v.severity === 'block')
              ? 'bg-red-400 hover:bg-red-500 focus:ring-red-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
          >
            {isRunning ? 'Running...' : 'Configure & Run'}
          </button>

          {isRunning && (
            <div className="animate-pulse bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700">Running decision analysis...</p>
            </div>
          )}

          {result && (
            <div className="space-y-3 flex-1 overflow-y-auto">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-green-800">Analysis Complete</p>
                    {lastRun && (
                      <p className="text-xs text-green-600 mt-1">
                        {new Date(lastRun).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      if (!decision || !result) return;
                      try {
                        const pack = await exportScenarioPack([{ id: decision.id, name: decision.title, description: decision.context, spec: decision, version: 1, createdAt: new Date().toISOString() }]);
                        const bundle = await support.buildBundle(pack, result, { panelStates: {} } as any, { appVersion: '0.6.0', userAgent: navigator.userAgent });
                        const blob = new Blob([bundle as unknown as BlobPart], { type: 'application/octet-stream' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `support-bundle-${decision.id}.zeo`;
                        a.click();
                      } catch (e) {
                        console.error("Support bundle export failed", e);
                      }
                    }}
                    className="text-[10px] bg-white border border-green-300 text-green-700 px-2 py-1 rounded hover:bg-green-100"
                    title="Export Support Bundle for debugging"
                  >
                    Export Support
                  </button>
                </div>
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

          {/* Wizard Modal */}
          {wizardOpen && (
            <div
              className="absolute inset-0 bg-white z-20 flex flex-col p-4 space-y-4 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wizard-title"
            >
              <div className="flex justify-between items-center border-b pb-2">
                <h3 id="wizard-title" className="font-bold text-gray-800">
                  Run Configuration (Step {step}/3)
                </h3>
                <button
                  onClick={() => setWizardOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-lg"
                  aria-label="Close Wizard"
                >✕</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {step === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Budget & Constraints</h4>
                    <p className="text-xs text-gray-500">Set limits for this execution (overrides defaults).</p>
                    <div className="space-y-3 bg-gray-50 p-3 rounded">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Max Cost</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded p-1.5 text-sm"
                          placeholder="Enter amount..."
                          defaultValue={extractBudgetConstraints({ constraints: stagedConstraints } as any).maxCost?.amount || ''}
                          onChange={(e) => updateStagedConstraint('Max Cost', `${e.target.value} USD`)}
                        />
                        <span className="text-[10px] text-gray-400">Unit: USD (default)</span>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Max Duration (Hours)</label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded p-1.5 text-sm"
                          placeholder="Enter hours..."
                          defaultValue={extractBudgetConstraints({ constraints: stagedConstraints } as any).maxDuration?.amount || ''}
                          onChange={(e) => updateStagedConstraint('Max Duration', `${e.target.value} hours`)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Review Assumptions</h4>
                    <p className="text-xs text-gray-500">Uncheck to disable specific assumptions.</p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {stagedAssumptions.map((a: any, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm border p-2 rounded bg-white">
                          <input
                            type="checkbox"
                            checked={a.status !== 'dropped'}
                            onChange={(e) => {
                              const next = [...stagedAssumptions];
                              next[i] = { ...next[i], status: e.target.checked ? 'assumption' : 'dropped' };
                              setStagedAssumptions(next);
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`truncate ${a.status === 'dropped' ? 'text-gray-400 line-through' : ''}`}>
                            {a.text || a.label || `Assumption ${i + 1}`}
                          </span>
                        </div>
                      ))}
                      {stagedAssumptions.length === 0 && <div className="text-xs text-gray-400 italic p-4 text-center bg-gray-50 rounded">No active assumptions.</div>}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700">Review & Diff</h4>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">Comparing staged changes against baseline.</p>
                      <div className="bg-blue-50 p-3 rounded text-[11px] font-mono border border-blue-100 overflow-x-auto">
                        <p className="font-bold text-blue-800 mb-2 uppercase tracking-wide">Diff Summary</p>
                        <pre className="text-blue-900">
                          {JSON.stringify(deepDiff(decision, {
                            ...decision,
                            constraints: stagedConstraints,
                            assumptions: stagedAssumptions
                          }), null, 2)}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded border border-green-100 mt-2">
                      <p className="text-xs text-green-800 font-medium flex items-center gap-2">
                        ✅ Ready to execute with {stagedAssumptions.length} assumptions
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-3 border-t">
                <button
                  onClick={() => setStep(s => Math.max(1, s - 1))}
                  disabled={step === 1}
                  className="text-xs px-4 py-2 bg-white border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep(s => Math.min(3, s + 1))}
                    className="text-xs px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-sm"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleRunDecision}
                    className="text-xs px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow-sm"
                  >
                    RUN NOW
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Helper to extract budget from generic constraints
function extractBudgetConstraints(spec: DecisionSpec): any {
  const constraints: any = {};
  if (!spec.constraints) return constraints;

  spec.constraints.forEach(c => {
    if (c.name.toLowerCase().includes('cost') || c.name.toLowerCase().includes('budget')) {
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
