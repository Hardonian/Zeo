'use client';

import React, { useEffect, useState } from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { runDecision } from '@zeo/core/engine';

interface BranchExplorerProps {
  manifest: UiPanelManifest;
  context: any;
}

export default function BranchExplorer({ manifest }: BranchExplorerProps) {
  const { decision, result, lastRun, isRunning, setResult, setLastRun, setIsRunning, setError } = useDecisionStore();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleRunDecision = async () => {
    if (!decision) {
      setError('No decision loaded. Please create a decision first.');
      return;
    }

    setIsRunning(true);
    try {
      const res = runDecision(decision);
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
          <button
            onClick={handleRunDecision}
            disabled={isRunning}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
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
                <h3 className="font-medium text-gray-900 mb-2">Branches ({result.graph.nodes.length})</h3>
                <ul className="space-y-1">
                  {result.graph.nodes.slice(0, 5).map((node: any) => (
                    <li
                      key={node.id}
                      className={`text-sm px-2 py-1 rounded cursor-pointer ${
                        activeNode === node.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                    >
                      {node.label}
                    </li>
                  ))}
                  {result.graph.nodes.length > 5 && (
                    <li className="text-sm text-gray-400 px-2 py-1">
                      +{result.graph.nodes.length - 5} more
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-medium text-gray-900 mb-2">Evaluations</h3>
                {result.evaluations.map((eval: any) => (
                  <div key={eval.lens} className="mb-2 last:mb-0">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {eval.lens.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">{eval.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
