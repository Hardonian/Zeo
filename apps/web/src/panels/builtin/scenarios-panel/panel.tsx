'use client';

import React, { useState, useRef } from 'react';
import type { UiPanelManifest, Scenario } from '@zeo/contracts';
import { useDecisionStore } from '@/stores/decisionStore';
import { scenarios, exportScenarioPack, importScenarioPack } from '@zeo/core/client';

interface ScenariosPanelProps {
    manifest: UiPanelManifest;
}

export default function ScenariosPanel({ manifest }: ScenariosPanelProps) {
    const { decision, setDecision } = useDecisionStore();
    const [localScenarios, setLocalScenarios] = useState<Scenario[]>(scenarios.listScenarios());
    const [showSave, setShowSave] = useState(false);
    const [saveName, setSaveName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleExportPack = async () => {
        if (localScenarios.length === 0) return;
        try {
            const packBytes = await exportScenarioPack(localScenarios, { packName: "My Scenarios" });
            const blob = new Blob([packBytes as unknown as BlobPart], { type: "application/zip" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scenarios-pack-${new Date().toISOString().slice(0, 10)}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to export pack");
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const buffer = await file.arrayBuffer();
            const result = await importScenarioPack(new Uint8Array(buffer));

            // Import logic: save each scenario
            let count = 0;
            for (const item of result.scenarios) {
                // Check if exists? Overwrite? For now, append/save new
                // Note: scenarios.saveScenario requires a decision spec and creates a new ID typically,
                // but here we want to preserve the ID if possible or just import as new.
                // The core scenarios module doesn't expose a raw 'insert' method easily visible here,
                // so we might just save as new versions.
                scenarios.saveScenario(item.spec, item.meta.name, `Imported from pack ${result.manifest.name}`);
                count++;
            }

            setLocalScenarios(scenarios.listScenarios());
            alert(`Imported ${count} scenarios from pack: ${result.manifest.name}`);
        } catch (err) {
            console.error("Import failed", err);
            alert("Failed to import pack: " + (err instanceof Error ? err.message : String(err)));
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".zip"
                            className="hidden"
                            aria-label="Import scenarios"
                        />
                        <button
                            onClick={handleImportClick}
                            className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold hover:bg-gray-200 border border-gray-300"
                        >
                            IMPORT
                        </button>
                        <button
                            onClick={handleExportPack}
                            disabled={localScenarios.length === 0}
                            className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold hover:bg-gray-200 border border-gray-300 disabled:opacity-50"
                        >
                            EXPORT PACK
                        </button>
                        <button
                            onClick={() => setShowSave(!showSave)}
                            className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold hover:bg-blue-700"
                        >
                            SAVE CURRENT
                        </button>
                    </div>
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
