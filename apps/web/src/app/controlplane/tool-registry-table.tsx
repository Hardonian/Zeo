"use client";

import { useState, useMemo, type JSX } from "react";
import type { Tool } from "./controlplane-status";

interface ToolRegistryTableProps {
  initialTools: Tool[];
}

export function ToolRegistryTable({ initialTools }: ToolRegistryTableProps): JSX.Element {
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "read" | "write">("all");

  const filteredTools = useMemo(() => {
    return initialTools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.scope.toLowerCase().includes(search.toLowerCase());
      const matchesScope = scopeFilter === "all" || tool.scope.toLowerCase() === scopeFilter;
      return matchesSearch && matchesScope;
    });
  }, [initialTools, search, scopeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search tools by identifier or scope..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0D1D30] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-[#0D1D30] p-1 rounded-lg border border-slate-800 text-xs">
          {(["all", "read", "write"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setScopeFilter(filter)}
              className={`px-3 py-1 rounded text-[11px] font-semibold uppercase transition ${
                scopeFilter === filter
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Tool Identifier</th>
              <th className="py-3 px-4 font-semibold">Scope</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Confirmation Policy</th>
              <th className="py-3 px-4 font-semibold">Access Surface</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredTools.map((tool) => (
              <tr key={tool.name} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 font-semibold text-blue-400">{tool.name}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tool.scope === "read"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {tool.scope}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    enabled
                  </span>
                </td>
                <td className="py-3 px-4">
                  {tool.requireConfirmation ? (
                    <span className="text-amber-400">Prompt required</span>
                  ) : (
                    <span className="text-slate-400">Autonomous</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400 font-sans">stdio allowlist</td>
              </tr>
            ))}
            {filteredTools.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                  No tools matched search query &quot;{search}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
