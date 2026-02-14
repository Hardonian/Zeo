import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { IconArrowRight, IconTerminal } from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'Platform | Zeo',
  description: 'Explore Zeo platform capabilities including governance dashboards, decision branching, uncertainty tracking, and epistemic tooling.',
};

const capabilities = [
    {
      title: 'Decision Branching',
      description: 'Explore complex decisions with branching analysis, sensitivity thresholds, and flip-point detection.',
      href: '/product/counterfactual-lab/demo',
      illustration: '/illustrations/counterfactual-graph.svg',
      illustrationAlt: 'Node graph showing current decision path highlighted with faint counterfactual branches and flip-distance annotation',
      illustrationW: 320,
      illustrationH: 200,
    },
    {
      title: 'Uncertainty Ledger',
      description: 'Track confidence ranges and belief states with full provenance and audit trails.',
      href: '/product/counterfactual-lab/demo',
      illustration: null,
      illustrationAlt: '',
      illustrationW: 0,
      illustrationH: 0,
    },
    {
      title: 'Epistemic Translator',
      description: 'Translate between different reasoning frameworks and align team mental models.',
      href: '/product/evidence-planner/demo',
      illustration: null,
      illustrationAlt: '',
      illustrationW: 0,
      illustrationH: 0,
    },
    {
      title: 'OSS Governance',
      description: 'Monitor policy compliance, drift detection, and governance health dashboards.',
      href: '/product/evidence-planner/demo',
      illustration: '/illustrations/value-policy.svg',
      illustrationAlt: 'Policy document with compliance checkmarks representing governance enforcement',
      illustrationW: 120,
      illustrationH: 90,
    },
    {
      title: 'KPI Health Monitoring',
      description: 'Track key performance indicators with uncertainty bands and health scoring.',
      href: '/product/decision-graph/demo',
      illustration: '/illustrations/regret-envelope.svg',
      illustrationAlt: 'Outcome envelope showing best-case and worst-case bounds with a robust central path',
      illustrationW: 300,
      illustrationH: 160,
    },
    {
      title: 'Evidence Planning',
      description: 'Plan evidence collection and track research queues with value-of-information analysis.',
      href: '/product/evidence-planner/demo',
      illustration: '/illustrations/voi-diagram.svg',
      illustrationAlt: 'Decision node with evidence source arrows flowing in and confidence delta bracket showing posterior narrowing',
      illustrationW: 280,
      illustrationH: 180,
    },
];

const cliDemos = [
  { title: 'Counterfactual Lab', slug: 'counterfactual-lab', description: 'Flip-distance analysis and counterfactual exploration' },
  { title: 'Evidence Planner', slug: 'evidence-planner', description: 'Value-of-information ranking and collection planning' },
  { title: 'Decision Graph', slug: 'decision-graph', description: 'Graph simulation and path explanation' },
];

const techFeatures = [
  {
    title: 'Deterministic Execution',
    description: 'Every analysis run is reproducible. Same inputs produce identical outputs, enabling reliable auditing.',
  },
  {
    title: 'Signed Evidence Bundles',
    description: 'Cryptographic signatures on evidence bundles create tamper-proof audit trails for compliance.',
  },
  {
    title: 'Confidence Intervals',
    description: 'All estimates carry explicit uncertainty ranges — never false precision on inherently uncertain data.',
  },
  {
    title: 'Policy-as-Code',
    description: 'Governance rules expressed as deterministic policy packs that gate decisions at CI time.',
  },
  {
    title: 'Provenance Tracking',
    description: 'Every fact records its source, retrieval timestamp, and integrity checksum for full traceability.',
  },
  {
    title: 'Replay & Audit',
    description: 'Re-run any past analysis with original inputs to verify conclusions and satisfy auditors.',
  },
];

export default function PlatformPage() {
  return (
    <PublicShell title="Platform">
      <div className="max-w-5xl space-y-12">
        <section className="max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            Zeo combines governance dashboards, decision branching tools, and provenance-first evidence workflows in one static-safe product surface.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Product panels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <Link key={capability.title} href={capability.href} className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm">
                <h3 className="font-semibold text-blue-700">{capability.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{capability.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600">
                  <IconTerminal className="h-3.5 w-3.5" />
                  Try the CLI Live
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Technical features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {techFeatures.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Interactive CLI demos</h2>
          <p className="mb-4 text-sm text-gray-600">Try Zeo commands directly in your browser. Deterministic output, no backend required.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {cliDemos.map((demo) => (
              <Link key={demo.slug} href={`/product/${demo.slug}/demo`} className="rounded-lg border border-gray-200 bg-gray-950 p-5 transition-all hover:border-blue-500 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <IconTerminal className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white">{demo.title}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-400">{demo.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400">
                  Launch demo
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Link href="/stitch" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md">
            Browse all panels
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
