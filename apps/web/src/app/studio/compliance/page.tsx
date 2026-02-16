'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ComplianceReport {
  tenantId: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  totalRuns: number;
  totalPolicyViolations: number;
  totalAccessDenials: number;
  totalSecretDetections: number;
  averageRunLatencyMs: number;
  deterministicRunPercentage: number;
  auditEntryCount: number;
  retentionCompliant: boolean;
  findings: Array<{
    severity: string;
    code: string;
    message: string;
    timestamp: string;
  }>;
}

export default function StudioCompliancePage() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; hint?: string } | null>(null);

  useEffect(() => {
    fetch('/api/studio/compliance')
      .then(r => r.json())
      .then(data => {
        if (data.ok) setReport(data.data);
        else setError(data.error);
      })
      .catch(e => setError({ message: (e as Error).message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/studio" className="text-sm text-slate-400 hover:text-white transition-colors">← Studio</Link>
          <h1 className="text-lg font-semibold text-white">🛡 Compliance Report</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Generating compliance report…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-950/30 p-4 mb-6">
            <p className="text-sm text-red-400">{error.message}</p>
            {error.hint && <p className="mt-1 text-xs text-red-500/80">💡 {error.hint}</p>}
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Runs', value: report.totalRuns, color: 'blue' },
                { label: 'Deterministic %', value: `${report.deterministicRunPercentage.toFixed(0)}%`, color: 'emerald' },
                { label: 'Policy Violations', value: report.totalPolicyViolations, color: report.totalPolicyViolations > 0 ? 'red' : 'emerald' },
                { label: 'Secret Detections', value: report.totalSecretDetections, color: report.totalSecretDetections > 0 ? 'red' : 'emerald' },
              ].map(card => (
                <div key={card.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                  <span className="text-xs text-slate-500">{card.label}</span>
                  <p className={`text-2xl font-bold text-${card.color}-400 mt-1`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">Report Details</h3>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-xs text-slate-500">Tenant</span>
                  <p className="text-slate-200">{report.tenantId}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Generated</span>
                  <p className="text-slate-200">{new Date(report.generatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Period</span>
                  <p className="text-slate-200">{report.periodStart} → {report.periodEnd}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Avg Latency</span>
                  <p className="text-slate-200">{report.averageRunLatencyMs.toFixed(0)}ms</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Access Denials</span>
                  <p className="text-slate-200">{report.totalAccessDenials}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Audit Entries</span>
                  <p className="text-slate-200">{report.auditEntryCount}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Retention Compliant</span>
                  <p className={report.retentionCompliant ? 'text-emerald-400' : 'text-red-400'}>
                    {report.retentionCompliant ? '✓ Yes' : '✗ No'}
                  </p>
                </div>
              </div>
            </div>

            {/* Findings */}
            {report.findings.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500">
                  Findings ({report.findings.length})
                </h3>
                <div className="space-y-2">
                  {report.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-slate-800/40 p-3 text-xs">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        f.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        f.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        f.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {f.severity}
                      </span>
                      <div>
                        <p className="text-white font-medium">{f.code}</p>
                        <p className="text-slate-400 mt-0.5">{f.message}</p>
                        <p className="text-slate-600 mt-0.5">{new Date(f.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
