'use client';

import React from 'react';
import type { UiPanelManifest, Inference } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface InferencesPanelProps {
    manifest: UiPanelManifest;
}

export default function InferencesPanel({ manifest }: InferencesPanelProps) {
    const { result } = useDecisionStore();
    const inferences = result?.inferences || [];

    return (
        <div className="p-4 space-y-4 h-full flex flex-col overflow-hidden">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            {inferences.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    No inferences computed for this run.
                </div>
            ) : (
                <div className="flex-1 overflow-auto space-y-3">
                    {inferences.map((inf) => (
                        <div key={inf.key} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs font-bold text-blue-600 uppercase tracking-tighter">{inf.key}</span>
                                <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{inf.method}</span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                                {Array.isArray(inf.value) ? (
                                    <div className="flex flex-wrap gap-1">
                                        {inf.value.map((v, i) => (
                                            <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{String(v)}</span>
                                        ))}
                                    </div>
                                ) : (
                                    <span>{String(inf.value)} <span className="text-xs text-gray-400 font-normal">{inf.units}</span></span>
                                )}
                            </div>
                            {inf.uncertainty && (
                                <div className="text-[10px] text-gray-500 flex items-center gap-1.5 pt-1.5 border-t border-gray-50">
                                    <span className="bg-gray-100 px-1 rounded uppercase font-bold text-[9px]">Uncertainty: {inf.uncertainty.kind}</span>
                                    {inf.uncertainty.note && <span className="italic">"{inf.uncertainty.note}"</span>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
