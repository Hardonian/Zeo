'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { WebCLISandbox } from '@/components/WebCLISandbox';
import { getPanelConfig, getAllPanelConfigs } from '@/lib/panel-config';
import { IconTerminal } from '@/components/icons/ZeoIcons';

const SAMPLE_TRACE_EVENTS = [
  { step: 'ANALYST', tool: 'zeo.classify_intent', status: 'ok', duration: '0.1s' },
  { step: 'SIMULATOR', tool: 'zeo.flip_distance', status: 'ok', duration: '0.8s' },
  { step: 'EVIDENCE_PLANNER', tool: 'zeo.evidence_plan', status: 'ok', duration: '0.3s' },
  { step: 'SCRIBE', tool: 'zeo.format_narrative', status: 'ok', duration: '0.2s' },
  { step: 'GOVERNANCE_AUDITOR', tool: 'zeo.policy_check', status: 'ok', duration: '0.1s' },
];

const SAMPLE_APPROVAL = {
  tool: 'zeo.export_audit_pack',
  scope: 'write',
  status: 'approved',
  summary: 'Export decision record as JSON audit pack',
};

export default function PanelDemoPage() {
  const params = useParams<{ panel: string }>();
  const searchParams = useSearchParams();
  const slug = params.panel;
  const panel = getPanelConfig(slug);
  const initialCmd = searchParams.get('cmd') || undefined;
  const [agenticMode, setAgenticMode] = useState(false);

  if (!panel) {
    const allPanels = getAllPanelConfigs();
    return (
      <PublicShell title="Demo Not Found">
        <div className="max-w-2xl">
          <p className="text-gray-600">
            No demo available for &quot;{slug}&quot;.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Available demos:</p>
            {allPanels.map(p => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}/demo`}
                className="block rounded border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-blue-300"
              >
                <span className="font-medium text-blue-700">{p.title}</span>
                <span className="ml-2 text-gray-500">{p.description}</span>
              </Link>
            ))}
          </div>
          <Link href="/platform" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            &larr; Back to Product
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell title={`${panel.title} — CLI Demo`}>
      <div className="max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconTerminal className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{panel.title}</h2>
              <p className="text-sm text-gray-600">{panel.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAgenticMode(!agenticMode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              agenticMode
                ? 'bg-purple-600 text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {agenticMode ? 'Agentic Workflow On' : 'Run as Agentic Workflow'}
          </button>
        </div>

        {/* Dual View */}
        <div className={agenticMode ? 'grid gap-4 lg:grid-cols-2' : ''}>
          {/* CLI Console */}
          <div>
            <WebCLISandbox panel={panel} initialCmd={initialCmd} />
          </div>

          {/* Agentic Trace Panel */}
          {agenticMode && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Agentic Trace</h3>
                <div className="space-y-2">
                  {SAMPLE_TRACE_EVENTS.map((evt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span className="badge-neutral text-[10px]">{evt.step}</span>
                      <span className="font-mono text-xs text-blue-600">{evt.tool}</span>
                      <span className={evt.status === 'ok' ? 'badge-allow text-[9px]' : 'badge-deny text-[9px]'}>
                        {evt.status}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">{evt.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Approval */}
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Approval Checkpoint</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="badge-pending">Requested</span>
                  <span className="font-mono text-xs">{SAMPLE_APPROVAL.tool}</span>
                  <span className="badge-deterministic text-[10px]">{SAMPLE_APPROVAL.scope}</span>
                  <span className="badge-allow text-[10px] ml-auto">{SAMPLE_APPROVAL.status}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{SAMPLE_APPROVAL.summary}</p>
              </div>

              {/* Checkpoint Summary */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Checkpoint Summary</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-gray-500">Steps executed</dt>
                    <dd className="font-semibold text-gray-900">{SAMPLE_TRACE_EVENTS.length}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Tools invoked</dt>
                    <dd className="font-semibold text-gray-900">{SAMPLE_TRACE_EVENTS.length}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Policy checks</dt>
                    <dd className="font-semibold text-gray-900">5 allow / 0 deny</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Approvals</dt>
                    <dd className="font-semibold text-gray-900">1 approved</dd>
                  </div>
                </dl>
              </div>

              {/* Hash + Reproducibility */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Reproducibility</h3>
                <div className="flex items-center gap-2">
                  <span className="badge-deterministic">Deterministic</span>
                  <span className="text-xs text-gray-500">
                    Same input, same output. Hash-verified.
                  </span>
                </div>
                <p className="mt-2 font-mono text-[10px] text-gray-400">
                  Output hash: sha256-demo-deterministic-output
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Link href="/platform" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Product
          </Link>
          <span className="text-xs text-gray-400">
            All output is deterministic. Same command, same result. No backend required for demos.
          </span>
        </div>
      </div>
    </PublicShell>
  );
}
