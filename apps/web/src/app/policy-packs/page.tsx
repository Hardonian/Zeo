"use client";

import React, { useState, useEffect } from "react";

export default function PolicyPacksPage() {
    const [packs, setPacks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/policy-packs/v1")
            .then(res => res.json())
            .then(data => {
                setPacks(data);
                setIsLoading(false);
            });
    }, []);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            try {
                const json = JSON.parse(content);
                const res = await fetch("/api/policy-packs/v1", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(json)
                });
                if (res.ok) {
                    const newPack = await res.json();
                    setPacks([newPack, ...packs]);
                }
            } catch (err) {
                alert("Invalid JSON policy pack");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Policy Packs
                    </h1>
                    <p className="text-gray-400 mt-2">Manage enterprise governance at scale.</p>
                </div>
                <div className="flex gap-4">
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-all">
                        Import Pack
                        <input type="file" className="hidden" onChange={handleImport} accept=".json" />
                    </label>
                </div>
            </header>

            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
                    <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
                    <div className="h-12 bg-gray-800 rounded-lg w-full"></div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {packs.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
                            <p className="text-gray-500">No policy packs found. Import one to get started.</p>
                        </div>
                    ) : (
                        packs.map(pack => (
                            <div key={pack.id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex justify-between items-center hover:border-gray-700 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold">{pack.name}</h3>
                                        <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full font-mono">v{pack.version}</span>
                                        {pack.signature ? (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded font-bold uppercase tracking-wider">Signed</span>
                                        ) : (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-500 border border-gray-700 rounded font-bold uppercase tracking-wider">Unsigned</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{pack.description || "No description provided."}</p>
                                    <div className="mt-4 font-mono text-[10px] text-gray-500">
                                        SHA256: {pack.packHash}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all">
                                        Assign
                                    </button>
                                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all">
                                        Export
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
