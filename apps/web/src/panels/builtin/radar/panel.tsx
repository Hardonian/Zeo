'use client';

import React, { useMemo } from 'react';
import type { UiPanelManifest, DecisionSpec } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { runStrategicRadar } from '@zeo/radar';
import type { SignalDiscoveryGraph, CandidateSignal } from '@zeo/signal-discovery';
import { nanoid } from 'nanoid';

interface RadarPanelProps {
    manifest: UiPanelManifest;
    context: any;
}

// Mock Signals for frontend - in real app, fetch from SignalDiscovery API
const MOCK_GRAPH: SignalDiscoveryGraph = {
    nodes: [],
    edges: [],
    signals: new Map<string, CandidateSignal>([
        ['sig-1', {
            id: 'sig-1',
            name: 'User Churn vs Latency',
            sourceSignalId: 'latency_ms',
            targetId: 'churn_rate',
            relationshipType: 'correlation_pearson',
            metrics: { effectSize: 0.85, stabilityScore: 0.9, sampleSize: 1000, uncertaintyBand: { low: 0.8, high: 0.9 } },
            riskBands: { confoundingRisk: 'low', leakageRisk: 'low', dataQuality: 'high' },
            provenance: [],
            disclaimers: [],
            createdAt: new Date().toISOString(),
            contentHash: 'abc',
        }],
        ['sig-2', {
            id: 'sig-2',
            name: 'Competitor Price Drop',
            sourceSignalId: 'market_intel',
            targetId: 'sales_volume',
            relationshipType: 'correlation_spearman',
            metrics: { effectSize: 0.6, stabilityScore: 0.7, sampleSize: 50, uncertaintyBand: { low: 0.4, high: 0.8 } },
            riskBands: { confoundingRisk: 'medium', leakageRisk: 'low', dataQuality: 'medium' },
            provenance: [],
            disclaimers: [],
            createdAt: new Date().toISOString(),
            contentHash: 'def',
        }]
    ]),
    generatedAt: new Date().toISOString(),
    configHash: 'hash',
};

export default function RadarPanel({ manifest }: RadarPanelProps) {
    const { decision } = useDecisionStore();

    const radar = useMemo(() => {
        // If no decision, show global radar (empty activeDecisions)
        const activeDecisions = decision ? [decision] : [];
        return runStrategicRadar(MOCK_GRAPH, activeDecisions, { minPriority: 0.1 });
    }, [decision]);

    return (
        <div className="p-4 space-y-4 h-full flex flex-col">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {radar.watchlist.length === 0 ? (
                    <div className="text-sm text-gray-400 text-center py-4">
                        No signals currently prioritized.
                    </div>
                ) : (
                    radar.watchlist.map((item) => (
                        <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm border-l-4 border-l-purple-500">
                            <div className="flex justify-between items-start">
                                <h3 className="text-sm font-medium text-gray-900">
                                    {MOCK_GRAPH.signals.get(item.signalId)?.name || 'Unknown Signal'}
                                </h3>
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-mono">
                                    {(item.priority.score * 100).toFixed(0)}%
                                </span>
                            </div>

                            <p className="text-xs text-gray-600 mt-1">
                                {item.significance}
                            </p>

                            <div className="mt-2 flex gap-1 flex-wrap">
                                {item.priority.rationale.map((r, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded border border-gray-200">
                                        {r}
                                    </span>
                                ))}
                            </div>

                            {item.skepticism.length > 0 && (
                                <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded flex items-start gap-1">
                                    <span>⚠️</span>
                                    <div>
                                        {item.skepticism}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="text-[10px] text-gray-400 text-center border-t pt-2">
                Radar Active • {radar.feed.length} Feed Events
            </div>
        </div>
    );
}
