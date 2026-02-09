'use client';

import React from 'react';
import type { UiPanelManifest } from '@zeo/contracts';
import type { CandidateSignal } from '@zeo/signal-discovery';

interface SignalsPanelProps {
    manifest: UiPanelManifest;
    context: any;
}

// Mock Data for now
const MOCK_SIGNALS: CandidateSignal[] = [
    {
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
    },
    {
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
    }
];

export default function SignalsPanel({ manifest }: SignalsPanelProps) {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{manifest.title}</h1>
                <p className="text-gray-500">{manifest.description}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Signal Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Relation
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Effect Size
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Risk Profile
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data Points
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_SIGNALS.map((signal) => (
                            <tr key={signal.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{signal.name}</div>
                                    <div className="text-xs text-gray-400">{signal.sourceSignalId} → {signal.targetId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                        {signal.relationshipType.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {signal.metrics.effectSize.toFixed(2)}
                                    <span className="text-gray-400 text-xs ml-1">
                                        (±{(signal.metrics.uncertaintyBand.high - signal.metrics.uncertaintyBand.low).toFixed(2)})
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-xs">
                                            <span className="text-gray-400">Confounds: </span>
                                            <span className={`font-medium ${signal.riskBands.confoundingRisk === 'low' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {signal.riskBands.confoundingRisk}
                                            </span>
                                        </div>
                                        <div className="text-xs">
                                            <span className="text-gray-400">Quality: </span>
                                            <span className={`font-medium ${signal.riskBands.dataQuality === 'high' ? 'text-green-600' : 'text-amber-600'}`}>
                                                {signal.riskBands.dataQuality}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {signal.metrics.sampleSize}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
