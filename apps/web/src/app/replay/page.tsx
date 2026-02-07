"use client";

import { useState, useCallback } from "react";
import type { ReplayDataset, ReplayResult } from "@zeo/contracts";

export default function ReplayPage() {
  const [dataset, setDataset] = useState<ReplayDataset | null>(null);
  const [results, setResults] = useState<ReplayResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as ReplayDataset;
        setDataset(parsed);
        setResults([]);
      } catch (err) {
        setError(`Failed to parse dataset: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }, []);

  const loadSampleDataset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/examples/replay/sample_dataset.json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const parsed = (await response.json()) as ReplayDataset;
      setDataset(parsed);
      setResults([]);
    } catch (err) {
      setError(`Failed to load sample: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Replay Viewer</h1>
      <p className="text-gray-600 mb-8">
        View replay datasets and calibration reports. Upload a dataset JSON or load the sample.
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Load Dataset</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Replay Dataset JSON
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="text-center text-gray-500">or</div>

          <button
            onClick={loadSampleDataset}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load Sample Dataset"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {dataset && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dataset: {dataset.datasetId}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Description:</span>
                <p className="font-medium">{dataset.description || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">{new Date(dataset.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Cases:</span>
                <p className="font-medium">{dataset.cases.length}</p>
              </div>
              <div>
                <span className="text-gray-500">Timezone:</span>
                <p className="font-medium">{dataset.timeZone || "UTC"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cases</h2>
            <div className="space-y-4">
              {dataset.cases.map((c) => (
                <div key={c.caseId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{c.label}</h3>
                    <span className="text-xs text-gray-500">{c.caseId}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span>Decision:</span>
                      <p className="font-medium text-gray-900">{c.decisionSpec.title}</p>
                    </div>
                    <div>
                      <span>Horizon:</span>
                      <p className="font-medium text-gray-900">{c.decisionSpec.horizon}</p>
                    </div>
                    <div>
                      <span>Observations:</span>
                      <p className="font-medium text-gray-900">
                        {c.observationBatches.reduce((sum, b) => sum + b.observations.length, 0)}
                      </p>
                    </div>
                    <div>
                      <span>Outcome:</span>
                      <p className="font-medium text-gray-900">{c.outcome.status}</p>
                    </div>
                  </div>
                  {c.notes && (
                    <p className="mt-2 text-sm text-gray-500">{c.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Replay Results</h2>
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.caseId} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{result.caseId}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Checkpoints:</span>
                        <p className="font-medium">{result.checkpoints.length}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Coverage:</span>
                        <p className="font-medium">
                          {(result.scoring.coverage.overall * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Widen Factor:</span>
                        <p className="font-medium">
                          {result.scoring.recommendedAdjustment.widenFactorOverall.toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-medium">Note on Calibration:</p>
        <p>
          The replay viewer displays dataset contents. To run actual replay and generate calibration reports, use the CLI:
        </p>
        <code className="block mt-2 bg-blue-100 px-2 py-1 rounded font-mono">
          pnpm -C apps/cli start -- --replay dataset.json --report-out ./reports
        </code>
      </div>
    </div>
  );
}
