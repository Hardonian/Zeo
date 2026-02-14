import Link from 'next/link';
import Image from 'next/image';
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

export default function PlatformPage() {
  const capabilities = [
    {
      title: 'Decision Branching',
      description: 'Explore complex decisions with branching analysis, sensitivity thresholds, and flip-point detection.',
      href: '/stitch/decision-branching-view-1',
      illustration: '/illustrations/counterfactual-graph.svg',
      illustrationAlt: 'Node graph showing current decision path highlighted with faint counterfactual branches and flip-distance annotation',
      illustrationW: 320,
      illustrationH: 200,
    },
    {
      title: 'Uncertainty Ledger',
      description: 'Track confidence ranges and belief states with full provenance and audit trails.',
      href: '/stitch/uncertainty-ledger-viewer-1',
      illustration: null,
      illustrationAlt: '',
      illustrationW: 0,
      illustrationH: 0,
    },
    {
      title: 'Epistemic Translator',
      description: 'Translate between different reasoning frameworks and align team mental models.',
      href: '/stitch/epistemic-translator-panel-1',
      illustration: null,
      illustrationAlt: '',
      illustrationW: 0,
      illustrationH: 0,
    },
    {
      title: 'OSS Governance',
      description: 'Monitor policy compliance, drift detection, and governance health dashboards.',
      href: '/stitch/oss-governance-dashboard',
      illustration: '/illustrations/value-policy.svg',
      illustrationAlt: 'Policy document with compliance checkmarks representing governance enforcement',
      illustrationW: 120,
      illustrationH: 90,
    },
    {
      title: 'KPI Health Monitoring',
      description: 'Track key performance indicators with uncertainty bands and health scoring.',
      href: '/stitch/kpi-health-monitor-1',
      illustration: '/illustrations/regret-envelope.svg',
      illustrationAlt: 'Outcome envelope showing best-case and worst-case bounds with a robust central path',
      illustrationW: 300,
      illustrationH: 160,
    },
    {
      title: 'Evidence Planning',
      description: 'Plan evidence collection and track research queues with value-of-information analysis.',
      href: '/stitch/evidence-planner',
      illustration: '/illustrations/voi-diagram.svg',
      illustrationAlt: 'Decision node with evidence source arrows flowing in and confidence delta bracket showing posterior narrowing',
      illustrationW: 280,
      illustrationH: 180,
    },
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
          <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((cap) => (
              <Link
                key={cap.title}
                href={cap.href}
                className="rounded-lg border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                {cap.illustration && (
                  <div className="mb-3">
                    <img
                      src={cap.illustration}
                      alt={cap.illustrationAlt}
                      width={cap.illustrationW}
                      height={cap.illustrationH}
                      loading="lazy"
                      className="max-w-full rounded opacity-90"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-blue-700">{cap.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{cap.description}</p>
                <span className="text-sm text-blue-600 mt-3 inline-block">View panel →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Flip-Point Detection */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold mb-3">Flip-Point Detection</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <img
                src="/illustrations/flip-threshold.svg"
                alt="Parameter axis showing current estimate distance to flip threshold separating Option A and Option B"
                width={280}
                height={140}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Every decision analysis outputs a flip distance — the smallest change in any assumption
                that would reverse the conclusion. A flip distance near zero signals a fragile decision;
                a large distance signals robustness to new evidence.
              </p>
              <div className="mt-3">
                <Image
                  src="/panels/sensitivity_&_flip-thresholds_panel/screen.png"
                  alt="Sensitivity and flip thresholds panel showing assumption ranges and flip distances"
                  width={600}
                  height={400}
                  className="w-full max-w-md h-auto rounded border border-gray-100"
                  loading="lazy"
                />
              </div>
            </div>
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
          <div className="mt-5 flex justify-center">
            <img
              src="/illustrations/transparency-badges.svg"
              alt="Four design guarantees: Deterministic, Auditable, Replayable, Bounded"
              width={360}
              height={80}
              loading="lazy"
            />
          </div>
        </section>

        {/* Architecture */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Architecture</h2>
          <div className="mb-4">
            <img
              src="/illustrations/engine-block.svg"
              alt="Architecture pipeline: inputs to model to evidence ranking to signed plan output"
              width={440}
              height={120}
              className="max-w-full"
              loading="lazy"
            />
          </div>
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
