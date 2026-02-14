import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import {
  IconBranching,
  IconUncertainty,
  IconShield,
  IconAudit,
  IconSensitivity,
  IconProvenance,
  IconArrowRight,
} from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'Platform | Zeo',
  description: 'Explore Zeo platform capabilities including governance dashboards, decision branching, uncertainty tracking, and epistemic tooling.',
};

const capabilities = [
  {
    icon: IconBranching,
    title: 'Decision Branching',
    description: 'Explore complex decisions with branching analysis, sensitivity thresholds, and flip-point detection.',
    href: '/stitch/decision-branching-view-1',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: IconUncertainty,
    title: 'Uncertainty Ledger',
    description: 'Track confidence ranges and belief states with full provenance and audit trails.',
    href: '/stitch/uncertainty-ledger-viewer-1',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: IconShield,
    title: 'Epistemic Translator',
    description: 'Translate between different reasoning frameworks and align team mental models.',
    href: '/stitch/epistemic-translator-panel-1',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: IconAudit,
    title: 'OSS Governance',
    description: 'Monitor policy compliance, drift detection, and governance health dashboards.',
    href: '/stitch/oss-governance-dashboard',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: IconSensitivity,
    title: 'KPI Health Monitoring',
    description: 'Track key performance indicators with uncertainty bands and health scoring.',
    href: '/stitch/kpi-health-monitor-1',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: IconProvenance,
    title: 'Evidence Planning',
    description: 'Plan evidence collection and track research queues with value-of-information analysis.',
    href: '/stitch/evidence-planner',
    color: 'from-cyan-500 to-blue-500',
  },
];

const techFeatures = [
  { title: 'Static-First', description: 'Marketing pages render without backend dependencies. No auth gating on public routes.' },
  { title: 'Deterministic', description: 'Evidence contracts produce cryptographically signed bundles for audit trails.' },
  { title: 'Composable', description: 'Vendor APIs are behind adapters. Core engine never depends on specific vendors.' },
];

export default function PlatformPage() {
  return (
    <PublicShell title="Platform">
      <div className="max-w-5xl space-y-14">
        {/* Overview */}
        <section className="max-w-3xl">
          <p className="text-lg text-gray-700 leading-relaxed">
            Zeo provides a comprehensive workspace for decision intelligence under uncertainty.
            The platform combines governance dashboards, decision branching tools, and epistemic
            infrastructure to help teams make better decisions with full transparency.
          </p>
        </section>

        {/* Capabilities Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Capabilities</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.title}
                  href={cap.href}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 card-hover"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cap.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    <h3 className="font-semibold text-gray-900">{cap.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{cap.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    View panel <IconArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Technical Features */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {techFeatures.map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Architecture</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: 'Apps/Web', desc: 'Next.js 15+ frontend with static generation for marketing pages and dynamic routing for authenticated dashboards.' },
              { label: 'Panel System', desc: 'React components and HTML panels from Google Stitch exports, served via iframe sandboxing for isolation.' },
              { label: 'Bridge Layer', desc: 'Secure communication between panels and host application with capability-based permissions.' },
              { label: 'Static Exports', desc: 'Marketing routes are fully static with no runtime database dependencies.' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-gray-50 p-4">
                <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Browse All */}
        <section>
          <Link
            href="/stitch"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          >
            Browse All Panels
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
