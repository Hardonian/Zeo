import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Platform | Zeo',
  description: 'Explore Zeo platform capabilities including governance dashboards, decision branching, uncertainty tracking, and epistemic tooling.',
};

export default function PlatformPage() {
  const capabilities = [
    {
      title: 'Decision Branching',
      description: 'Explore complex decisions with branching analysis, sensitivity thresholds, and flip-point detection.',
      href: '/stitch/decision-branching-view-1',
    },
    {
      title: 'Uncertainty Ledger',
      description: 'Track confidence ranges and belief states with full provenance and audit trails.',
      href: '/stitch/uncertainty-ledger-viewer-1',
    },
    {
      title: 'Epistemic Translator',
      description: 'Translate between different reasoning frameworks and align team mental models.',
      href: '/stitch/epistemic-translator-panel-1',
    },
    {
      title: 'OSS Governance',
      description: 'Monitor policy compliance, drift detection, and governance health dashboards.',
      href: '/stitch/oss-governance-dashboard',
    },
    {
      title: 'KPI Health Monitoring',
      description: 'Track key performance indicators with uncertainty bands and health scoring.',
      href: '/stitch/kpi-health-monitor-1',
    },
    {
      title: 'Evidence Planning',
      description: 'Plan evidence collection and track research queues with value-of-information analysis.',
      href: '/stitch/evidence-planner',
    },
  ];

  return (
    <PublicShell title="Platform">
      <div className="max-w-4xl space-y-8">
        {/* Overview */}
        <section>
          <p className="text-gray-700 leading-relaxed">
            Zeo provides a comprehensive workspace for decision intelligence under uncertainty. 
            The platform combines governance dashboards, decision branching tools, and epistemic 
            infrastructure to help teams make better decisions with full transparency.
          </p>
        </section>

        {/* Capabilities Grid */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((cap) => (
              <Link
                key={cap.title}
                href={cap.href}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-blue-700">{cap.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{cap.description}</p>
                <span className="text-sm text-blue-600 mt-3 inline-block">View panel →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Technical Features */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Technical Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">Static-First</h3>
              <p className="text-sm text-gray-600 mt-1">
                Marketing pages render without backend dependencies. No auth gating on public routes.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">Deterministic</h3>
              <p className="text-sm text-gray-600 mt-1">
                Evidence contracts produce cryptographically signed bundles for audit trails.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">Composable</h3>
              <p className="text-sm text-gray-600 mt-1">
                Vendor APIs are behind adapters. Core engine never depends on specific vendors.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Architecture</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Apps/Web:</strong> Next.js 15+ frontend with static generation for marketing pages 
              and dynamic routing for authenticated dashboards.
            </p>
            <p>
              <strong>Panel System:</strong> React components and HTML panels from Google Stitch exports, 
              served via iframe sandboxing for isolation.
            </p>
            <p>
              <strong>Bridge Layer:</strong> Secure communication between panels and host application 
              with capability-based permissions.
            </p>
            <p>
              <strong>Static Exports:</strong> Marketing routes are fully static with no runtime 
              database dependencies.
            </p>
          </div>
        </section>

        {/* Browse All */}
        <section>
          <Link 
            href="/stitch" 
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-3 hover:border-blue-300 transition-colors"
          >
            <span className="font-medium">Browse All Panels</span>
            <span>→</span>
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
