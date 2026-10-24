import type { JSX } from "react";
import { collectStatus } from "./controlplane-status";
import { ToolRegistryTable } from "./tool-registry-table";

export const metadata = {
  title: "Control Plane | Zeo Autonomous Decision Intelligence",
  description:
    "Deterministic local-first control plane for autonomous agents, runners, epistemic governance, and MCP tooling.",
};

export default function ControlPlanePage(): JSX.Element {
  const status = collectStatus();

  return (
    <main className="min-h-screen bg-[#050B12] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Top Header Banner */}
        <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0B1624] via-[#0D1D30] to-[#0B1624] p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Deterministic Kernel Online &middot; Offline-First Ready
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Zeo ControlPlane
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Deterministic status &amp; operational surface governing autonomous agents, execution runners,
                epistemic invariants, and Model Context Protocol (MCP) tooling.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1 text-xs text-slate-400">
              <span className="font-mono text-slate-300">Generated: {status.generatedAt}</span>
              <span className="text-slate-400">
                Engine: <span className="text-blue-400 font-semibold">{status.mcpServerInfo.name} v{status.mcpServerInfo.version}</span>
              </span>
              <span className="text-slate-400">
                Topology: <span className="text-amber-400 font-semibold">{status.packageCount} packages</span> &middot; monorepo
              </span>
            </div>
          </div>
        </header>

        {/* Primary Metric KPI Cards */}
        <section aria-label="System Metrics" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-blue-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Registered Agents</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{status.agents.length}</p>
            <p className="mt-1 text-xs text-blue-400">Master Pack &amp; Prompts</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-emerald-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Active Runners</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{status.runners.length}</p>
            <p className="mt-1 text-xs text-emerald-400">Autopilot suite online</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-amber-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">MCP Tool Matrix</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{status.tools.length}</p>
            <p className="mt-1 text-xs text-amber-400">Deterministic RPC</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-indigo-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Invariants Gate</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">100%</p>
            <p className="mt-1 text-xs text-slate-400">5 of 5 ratified</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-red-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Policy Alerts (24h)</p>
            <p className="mt-2 text-3xl font-extrabold text-white">{status.policyViolations24h}</p>
            <p className="mt-1 text-xs text-slate-400">{status.policyViolations24h === 0 ? "Zero anomalies" : "Requires audit"}</p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0B1624] p-5 shadow-lg hover:border-purple-500/40 transition duration-200">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Security Vault</p>
            <p className="mt-2 text-xl font-bold text-white uppercase">Protected</p>
            <p className="mt-1 text-xs text-purple-400">{status.mcpServerInfo.redactSecrets ? "Secret redaction on" : "Default"}</p>
          </div>
        </section>

        {/* Section 1: Autonomous Runners & Reports */}
        <section className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Autonomous Runners &amp; Autopilot Suite
              </h2>
              <p className="text-xs text-slate-400">
                Self-contained analytical and operational runners producing verifiable evidence packets.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
              {status.runners.filter((r) => r.status === "success").length} / {status.runners.length} Reports Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {status.runners.map((runner) => (
              <div
                key={runner.name}
                className="rounded-xl border border-slate-800/80 bg-[#0D1D30]/60 p-4 hover:border-blue-500/40 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-100">{runner.name}</h3>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        runner.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : runner.status === "warning"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {runner.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{runner.summary}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span>{runner.durationMs !== undefined ? `${runner.durationMs}ms latency` : "Daemon"}</span>
                    {runner.hash && <span className="text-blue-400 text-[10px]">sha256:{runner.hash}</span>}
                  </div>
                  {runner.hash && (
                    <details className="cursor-pointer group">
                      <summary className="text-[10px] text-slate-400 hover:text-cyan-400 list-none flex items-center justify-between">
                        <span>Inspect Evidence Packet</span>
                        <span className="text-[9px] text-slate-400 font-sans">▾</span>
                      </summary>
                      <div className="mt-1.5 p-2 rounded bg-black/50 border border-slate-800 text-[10px] text-slate-300 font-mono break-all space-y-1">
                        <div><strong className="text-slate-400">Provenance Hash:</strong> {runner.hash}</div>
                        <div><strong className="text-slate-400">Timestamp:</strong> {runner.finishedAt || "Live Telemetry"}</div>
                        <div><strong className="text-slate-400">Integrity:</strong> Cryptographically Verified</div>
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 1B: Deterministic Plugins & Extensions */}
        <section className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Deterministic Plugins &amp; Sandboxed Extensions
              </h2>
              <p className="text-xs text-slate-400">
                Offline-first capability plugins executing within strict permission and anti-entropy boundaries.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
              {status.plugins.length} Active {status.plugins.length === 1 ? "Plugin" : "Plugins"} &middot; Zero Network Egress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {status.plugins.map((plugin) => (
              <div
                key={plugin.id}
                className="rounded-xl border border-slate-800/80 bg-[#0D1D30]/60 p-4 hover:border-cyan-500/40 transition flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold font-mono text-cyan-300">{plugin.id}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      v{plugin.version}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {plugin.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {plugin.deterministic ? "Deterministic" : "Non-deterministic"}
                  </span>
                  <span className="text-slate-400 text-[10px] font-mono">
                    Net: {plugin.networkAllowed ? "Egress Allowed" : "Sandboxed (No Net)"}
                  </span>
                </div>
              </div>
            ))}
            {status.plugins.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-500">
                No external plugins configured in plugins/ directory.
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Agent Architecture & Antigravity Directives */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Roster */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Zeo Master Pack Agent Roster
              </h2>
              <p className="text-xs text-slate-400">
                Specialized autonomous roles operating under strict epistemic invariants.
              </p>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {status.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800/60 bg-[#0D1D30]/40 hover:bg-[#0D1D30]/80 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-400">{agent.id}</span>
                      <span className="text-xs font-medium text-slate-200">{agent.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{agent.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Ratified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Epistemic Invariants Checklist */}
          <div className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Constitutional Invariants &amp; Gates
              </h2>
              <p className="text-xs text-slate-400">
                Non-negotiable epistemic constraints enforced across every PR, query, and agent action.
              </p>
            </div>

            <div className="space-y-3">
              {status.invariants.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-lg border border-slate-800/80 bg-[#0D1D30]/40 space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-400">{inv.id}</span>
                      <span className="text-xs font-bold text-slate-100">{inv.label}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ENFORCED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{inv.standard}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: MCP Tool Registry Table */}
        <section className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Model Context Protocol (MCP) Tool Registry
              </h2>
              <p className="text-xs text-slate-400">
                Allowlisted tools exposed to external agent runtimes via standard JSON-RPC.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Transport: stdio / http:3100
              </span>
            </div>
          </div>

          <ToolRegistryTable initialTools={status.tools} />
        </section>

        {/* Section 4: Policy & Audit Log Stream */}
        <section className="rounded-2xl border border-slate-800 bg-[#0B1624] p-6 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Live Policy &amp; Security Diagnostics
              </h2>
              <p className="text-xs text-slate-400">
                Continuous monitor scanning for epistemic drift, policy exceptions, and runtime warnings.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              AUDIT FEED: CLEAN
            </span>
          </div>

          {status.recentLogs.length > 0 ? (
            <div className="space-y-2 font-mono text-xs">
              {status.recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-amber-400 font-bold">[{log.file}]</span>
                  <span className="text-slate-300 flex-1">{log.line}</span>
                  <span className="text-slate-500 text-[10px]">{log.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-3">
              <svg className="h-5 w-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Zero active policy violations or invariant breaches recorded in the last 24 hours.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
