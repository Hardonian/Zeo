import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Features | Zeo',
  description: 'Explore Zeo capabilities: deterministic CLI execution, counterfactual guardrails, MCP integration, OSS governance, and runtime visibility.',
};

const PANELS = [
  {
    title: 'CLI Assist Layer',
    description: 'Deterministic command planning with git diff awareness, key/token scoping, and intent validation before execution.',
    href: '/cli',
    tags: ['Git-aware', 'Token isolation', 'Deterministic'],
  },
  {
    title: 'Action Guard',
    description: 'Counterfactual preview and risk gating for merge operations. Evidence scoring and regret-aware confirmation.',
    href: '/stitch/merge-confirmation-dialog',
    tags: ['Counterfactual', 'Risk gating', 'Evidence'],
  },
  {
    title: 'OSS Integrity View',
    description: 'Dependency visibility, API surface awareness, key rotation signaling, and audit trace transparency.',
    href: '/oss',
    tags: ['Compliance', 'Audit', 'Governance'],
  },
  {
    title: 'Runtime Status Panel',
    description: 'CLI hot path state, MCP handshake indicator, token usage snapshots, and command latency visibility.',
    href: '/runtime',
    tags: ['MCP', 'Telemetry', 'Latency'],
  },
];

const ARCHITECTURE_FEATURES = [
  {
    title: 'Local-First by Default',
    description: 'Zeo runs locally. No hosted coordination required. All decision logic executes on your machine.',
  },
  {
    title: 'Deterministic Execution',
    description: 'Every CLI invocation produces reproducible evidence bundles with cryptographic attestation.',
  },
  {
    title: 'Static-First Marketing',
    description: 'Marketing frontend renders without backend dependencies. No auth gating on public routes.',
  },
  {
    title: 'Key + Token Isolation',
    description: 'Secrets are scoped per session. No cross-session leakage. Rotation signaling built in.',
  },
  {
    title: 'Counterfactual Guardrails',
    description: 'Before destructive actions, Zeo analyzes alternative paths and surfaces regret potential.',
  },
  {
    title: 'API Routing Awareness',
    description: 'Vendor APIs are behind adapters. Core engine never depends on specific vendors.',
  },
];

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className="max-w-4xl space-y-10">
        <section>
          <p className="text-gray-700 leading-relaxed">
            Zeo combines a deterministic CLI runtime, MCP server integration, and governance
            infrastructure into a single composable system. Every feature is designed around
            local-first execution, auditability, and strict architectural boundaries.
          </p>
        </section>

        {/* Panel Showcase */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Integrated Panels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {PANELS.map((panel) => (
              <Link
                key={panel.title}
                href={panel.href}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-blue-700">{panel.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{panel.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {panel.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Architecture Features */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Architectural Principles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ARCHITECTURE_FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Future Path Signaling */}
        <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">On the Roadmap</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Optional hosted coordination layer for team-wide governance visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Enterprise audit export and compliance reporting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Secure key orchestration across multi-environment deployments</span>
            </li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
