import { PublicShell } from '@/components/site/PublicShell';
import { ZeoOssIntegrityView } from '@/components/panels/ZeoOssIntegrityView';

export const metadata = {
  title: 'OSS Integrity | Zeo',
  description: 'Zeo OSS governance: dependency visibility, API surface awareness, key rotation signaling, and audit trace transparency.',
};

const GOVERNANCE_FEATURES = [
  {
    title: 'Dependency Visibility',
    description: 'Full dependency tree scanning with vulnerability detection, license compliance checking, and supply chain integrity verification.',
  },
  {
    title: 'API Surface Awareness',
    description: 'Automatic discovery and tracking of exposed API endpoints. Surface area changes are flagged in PR reviews.',
  },
  {
    title: 'Key Rotation Signaling',
    description: 'Proactive alerts when keys or tokens approach expiration. Rotation history is tracked in the audit ledger.',
  },
  {
    title: 'Audit Trace Transparency',
    description: 'Every governance check produces a signed evidence record. Audit trails are immutable and cryptographically verifiable.',
  },
];

export default function OssPage() {
  return (
    <PublicShell title="OSS Integrity View">
      <div className="max-w-4xl space-y-10">
        <section>
          <p className="text-gray-700 leading-relaxed">
            Zeo provides comprehensive open-source governance tooling. The OSS Integrity View
            monitors compliance, tracks dependency health, and maintains audit transparency
            across your entire project surface.
          </p>
        </section>

        {/* Features */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Governance Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {GOVERNANCE_FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* OSS Integrity Panel */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Integrity Dashboard</h2>
          <p className="text-sm text-gray-600 mb-4">
            The integrity dashboard shows license verification, contribution rules, and
            real-time compliance matrix status.
          </p>
          <div className="max-w-md">
            <ZeoOssIntegrityView />
          </div>
        </section>

        {/* Compliance Checks */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Compliance Matrix</h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {[
                { check: 'License Header Verification', scope: 'All source files' },
                { check: 'Dependency Vulnerability Audit', scope: 'package.json, pnpm-lock.yaml' },
                { check: 'Binary File Detection', scope: 'All tracked files' },
                { check: 'Secret Detection', scope: '.env, config files, source code' },
                { check: 'Branch Protection Rules', scope: 'Git repository settings' },
                { check: 'API Surface Change Detection', scope: 'Route handlers, exports' },
                { check: 'Key Rotation Freshness', scope: 'Credential store timestamps' },
              ].map((item) => (
                <div key={item.check} className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm text-gray-900">{item.check}</span>
                  <span className="text-xs text-gray-500">{item.scope}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
