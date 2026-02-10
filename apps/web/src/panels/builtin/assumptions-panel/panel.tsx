'use client';

import React from 'react';
import type { UiPanelManifest, Assumption } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';

interface AssumptionsPanelProps {
    manifest: UiPanelManifest;
}

export default function AssumptionsPanel({ manifest }: AssumptionsPanelProps) {
    const { result } = useDecisionStore();
    const assumptions = result?.assumptions || [];

    const getSensitivityColor = (s: string) => {
        switch (s) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'med': return 'text-orange-600 bg-orange-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSourceBadge = (source: string) => {
        switch (source) {
            case 'user': return 'bg-blue-100 text-blue-800';
            case 'default': return 'bg-gray-100 text-gray-800';
            case 'system': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-4 space-y-4 h-full flex flex-col overflow-hidden">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            {assumptions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                    No assumptions recorded for this run.
                </div>
            ) : (
                <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sens.</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {assumptions.map((a) => (
                                <tr key={a.key} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 text-sm text-gray-900">
                                        <div className="font-medium">{a.label}</div>
                                        <div className="text-[10px] text-gray-400 font-mono">{a.key}</div>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-600">
                                        {String(a.value)} <span className="text-[10px] text-gray-400">{a.units}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold italic ${getSourceBadge(a.source)}`}>
                                            {a.source}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getSensitivityColor(a.sensitivity)}`}>
                                            {a.sensitivity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
