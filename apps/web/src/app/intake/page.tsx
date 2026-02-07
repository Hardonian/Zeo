'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseScenario } from '@zeo/nl';
import { useInboxStore } from '@/stores/inboxStore';
import type { ScenarioDraft, QualObservation, EvidenceCandidate } from '@zeo/contracts';

export default function IntakePage() {
  const router = useRouter();
  const { createDraft, loading, error, initialize } = useInboxStore();
  
  const [inputText, setInputText] = useState('');
  const [draft, setDraft] = useState<ScenarioDraft | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleParse = useCallback(async () => {
    if (!inputText.trim()) return;
    
    setParseError(null);
    try {
      const parsed = parseScenario(inputText, {
        checksum: '',
      });
      setDraft(parsed);
    } catch (err) {
      setParseError((err as Error).message);
    }
  }, [inputText]);

  const handleSaveToInbox = async () => {
    if (!draft) return;
    
    setSaving(true);
    try {
      await createDraft(draft);
      router.push('/inbox');
    } catch (err) {
      setParseError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePromoteToDecision = async () => {
    if (!draft) return;
    
    setSaving(true);
    try {
      const draftId = await createDraft(draft);
      router.push(`/demo?draftId=${draftId}`);
    } catch (err) {
      setParseError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back
            </a>
            <h1 className="text-lg font-semibold text-gray-900">Natural Language Intake</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/inbox"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View Inbox →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">What&apos;s going on?</h2>
              <p className="text-sm text-gray-600 mb-4">
                Describe your decision situation in plain English. Include:
              </p>
              <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                <li>What decision you need to make</li>
                <li>Time horizon or deadline</li>
                <li>Key constraints or considerations</li>
                <li>Uncertainties or assumptions</li>
              </ul>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., I need to decide whether to launch the new feature by Q2. The engineering team says it will take 6 weeks. Marketing is worried about competitor timing..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleParse}
                  disabled={!inputText.trim() || loading}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Processing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {parseError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {parseError}
              </div>
            )}
          </div>

          {draft && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Extracted Draft</h2>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    {draft.candidateActions.length} actions · {draft.candidateAssumptions.length} assumptions
                  </span>
                </div>

                {draft.warnings.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Warnings</p>
                    <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                      {draft.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suggested Title
                    </label>
                    <p className="text-gray-900">{draft.titleSuggestion}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary
                    </label>
                    <p className="text-gray-900">{draft.summary}</p>
                  </div>

                  {draft.extractedEntities.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {draft.extractedEntities.map((entity, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.candidateActions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candidate Actions
                      </label>
                      <div className="space-y-2">
                        {draft.candidateActions.map((action) => (
                          <div key={action.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-gray-900">{action.label}</span>
                            {action.kind && (
                              <span className="text-xs text-gray-500">({action.kind})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.candidateAssumptions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assumptions (with Uncertainty Bands)
                      </label>
                      <div className="space-y-3">
                        {draft.candidateAssumptions.map((assumption) => (
                          <div key={assumption.id} className="p-3 bg-blue-50 rounded">
                            <p className="text-sm text-gray-900 mb-2">{assumption.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Band:</span>
                              <span className="text-sm font-mono">
                                {(assumption.band.low * 100).toFixed(0)}% – {(assumption.band.high * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  left: `${assumption.band.low * 100}%`,
                                  right: `${100 - assumption.band.high * 100}%`,
                                  position: 'absolute',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {draft.qualObservations.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualitative Observations
                      </label>
                      <div className="space-y-2">
                        {draft.qualObservations.map((obs, i) => (
                          <div key={i} className="p-3 bg-purple-50 rounded">
                            <p className="text-sm text-gray-900">
                              {obs.scaleId}: {obs.levelLabel}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Confidence band: {(obs.band.low * 100).toFixed(0)}% – {(obs.band.high * 100).toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={handleSaveToInbox}
                    disabled={saving}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save to Inbox'}
                  </button>
                  <button
                    onClick={handlePromoteToDecision}
                    disabled={saving}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Processing...' : 'Promote to Decision →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
