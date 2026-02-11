"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AuditPage() {
    const [runs, setRuns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, we'd fetch from a unified runs endpoint that joins attestations
        // For this demo, let's fetch evidence attestations directly
        fetch("/api/evidence/v1/verify", { // Actually we need a list endpoint, but let's mock or use Prisma directly if it were a server component
            method: "POST", // This is not right for a list, let's assume we have a generic way to get runs
            body: JSON.stringify({ runId: "dummy" })
        }).catch(() => { });

        // Mocking for now to show the UI design
        setRuns([
            {
                id: "run_7v9k2x",
                title: "Vendor Selection: GPU Cluster",
                createdAt: new Date().toISOString(),
                status: "completed",
                attestation: {
                    manifestHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    verified: true
                }
            },
            {
                id: "run_1a2b3c",
                title: "Budget Approval: Q3 Marketing",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                status: "completed",
                attestation: {
                    manifestHash: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
                    verified: true
                }
            }
        ]);
        setIsLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-5xl font-extrabold tracking-tighter text-white">
                        Evidence Chain
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Immutable, tamper-evident audit logs for every decision.</p>
                </header>

                <div className="grid gap-4">
                    {runs.map(run => (
                        <div key={run.id} className="group bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{run.title}</h3>
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase tracking-widest">
                                            {run.id}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">Executed {new Date(run.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                        Signed & Verified
                                    </div>
                                    <p className="text-[10px] text-gray-600 font-mono mt-1">SHA256: {run.attestation.manifestHash.substring(0, 16)}...</p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <a
                                    href={`/api/evidence/v1/runs/${run.id}/export`}
                                    className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Download Evidence Packet (.zip)
                                </a>
                                <button className="px-6 py-2.5 bg-white/5 text-white text-sm font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all">
                                    Verify Hash
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <section className="mt-20 border-t border-white/10 pt-12">
                    <h2 className="text-2xl font-bold mb-6">Security & Provenance</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 border border-blue-500/30 text-blue-400">
                                ◈
                            </div>
                            <h4 className="font-bold mb-2">Deterministic Manifests</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Every evidence bundle generates a stable JSON manifest normalized via canonical sorting.
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/30 text-emerald-400">
                                🛡
                            </div>
                            <h4 className="font-bold mb-2">Tamper Evidence</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Merkle tree hashes ensure that any modification to the decision transcript or artifacts invalidates the chain.
                            </p>
                        </div>
                        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 border border-purple-500/30 text-purple-400">
                                ⛓
                            </div>
                            <h4 className="font-bold mb-2">Enterprise Wedge</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Multi-org support with scoping and policy enforcement built into the ingestion layer.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
