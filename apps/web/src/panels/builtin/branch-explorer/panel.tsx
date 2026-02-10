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
