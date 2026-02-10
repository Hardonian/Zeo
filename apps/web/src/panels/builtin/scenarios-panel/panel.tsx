'use client';

import React, { useState } from 'react';
import type { UiPanelManifest, Scenario } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { scenarios } from '@zeo/core';

interface ScenariosPanelProps {
    manifest: UiPanelManifest;
}

export default function ScenariosPanel({ manifest }: ScenariosPanelProps) {
    const { decision, setDecision } = useDecisionStore();
    const [localScenarios, setLocalScenarios] = useState<Scenario[]>(scenarios.listScenarios());
    const [showSave, setShowSave] = useState(false);
    const [saveName, setSaveName] = useState('');

    const handleSave = () => {
        if (!decision || !saveName) return;
        const s = scenarios.saveScenario(decision, saveName, 'User saved scenario');
        setLocalScenarios(scenarios.listScenarios());
        setSaveName('');
        setShowSave(false);
    };

    const handleLoad = (s: Scenario) => {
        setDecision(s.spec);
    };

    const handleLoadTemplate = (type: "investment" | "hiring" | "crisis") => {
        const spec = scenarios.createTemplate(`New ${type}`, type);
        setDecision(spec);
    };

    return (
        <div className="p-4 space-y-6 h-full flex flex-col overflow-y-auto">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{manifest.title}</h2>
                <p className="text-sm text-gray-500">{manifest.description}</p>
            </div>

            <section className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Templates</h3>
                <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => handleLoadTemplate('investment')} className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-100 text-sm font-medium">📈 Investment Analysis</button>
                    <button onClick={() => handleLoadTemplate('hiring')} className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-100 text-sm font-medium">👥 Strategic Hiring</button>
                    <button onClick={() => handleLoadTemplate('crisis')} className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-100 text-sm font-medium">🚨 Crisis Management</button>
                </div>
            </section>

            <section className="space-y-3 flex-1">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Scenarios</h3>
                    <button
                        onClick={() => setShowSave(!showSave)}
                        className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold hover:bg-blue-700"
                    >
                        SAVE CURRENT
                    </button>
                </div>

                {showSave && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md space-y-2">
                        <input
                            type="text"
                            placeholder="Scenario name..."
                            value={saveName}
                            onChange={(e) => setSaveName(e.target.value)}
                            className="w-full text-xs p-1.5 border border-blue-200 rounded"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded font-bold">CONFIRM</button>
                            <button onClick={() => setShowSave(false)} className="flex-1 bg-gray-200 text-gray-600 text-[10px] py-1 rounded font-bold">CANCEL</button>
                        </div>
                    </div>
                )}

                {localScenarios.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No saved scenarios yet.</p>
                ) : (
                    <div className="space-y-2">
                        {localScenarios.map((s) => (
                            <div key={s.id} className="p-2 bg-white border border-gray-200 rounded flex justify-between items-center group">
                                <div className="overflow-hidden">
                                    <div className="text-xs font-medium truncate">{s.name}</div>
                                    <div className="text-[9px] text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</div>
                                </div>
                                <button
                                    onClick={() => handleLoad(s)}
                                    className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    LOAD
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
