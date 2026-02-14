import Link from 'next/link';
import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';
import {
  IconBranching,
  IconShield,
  IconProvenance,
  IconUncertainty,
  IconSensitivity,
  IconAudit,
  IconTerminal,
  IconArrowRight,
} from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'Zeo — Governance and Evidence for Uncertain Decisions',
  description: 'Static-first Zeo site for product overview, documentation, pricing, and onboarding to CLI and governance workflows.',
  openGraph: {
    title: 'Zeo — Governance and Evidence for Uncertain Decisions',
    description: 'Learn Zeo, install the CLI, connect GitHub safely, and operationalize policy with deterministic evidence.',
  },
};

const capabilities = [
  {
    icon: IconBranching,
    title: 'Decision Branching',
    description: 'Explore multi-step decision trees with probability intervals, dependency tracking, and flip-point detection.',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    icon: IconShield,
    title: 'Policy Enforcement',
    description: 'Hierarchical policy packs gate PRs based on organization-wide security and quality standards.',
    color: 'text-violet-600 bg-violet-50',
  },
  {
    icon: IconProvenance,
    title: 'Evidence Provenance',
    description: 'Every fact carries its source, timestamp, and checksum. Without provenance, claims stay as assumptions.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: IconUncertainty,
    title: 'Uncertainty Ledger',
    description: 'Track confidence ranges and how they evolve. Intervals widen under uncertainty — never false precision.',
    color: 'text-amber-600 bg-amber-50',
  },
  {
    icon: IconSensitivity,
    title: 'Sensitivity Analysis',
    description: 'Surface fragile dependencies and flip thresholds. Know what would change the answer before it matters.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: IconAudit,
    title: 'Deterministic Audit',
    description: 'Cryptographically signed evidence bundles create an unbreakable audit trail for compliance.',
    color: 'text-cyan-600 bg-cyan-50',
  },
];

export default function Home() {
  return (
    <PublicShell title="Decision intelligence under uncertainty" hero>
      {/* Hero Section */}
      <section className="relative -mx-6 -mt-10 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-6 py-20 md:py-28 bg-grid">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open source &middot; MIT License
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Governance &amp; evidence for{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              uncertain decisions
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            Zeo helps teams evaluate decisions with confidence ranges, assumptions, provenance, and sensitivity tracking. Deterministic policy checks and signed evidence bundles create audit-ready governance.
          </p>
          <div className="mt-4">
            <img
              src="/illustrations/engine-block.svg"
              alt="Deterministic pipeline: inputs flow through model and evidence ranking to produce a signed plan output"
              width={440}
              height={120}
              className="max-w-full"
              loading="eager"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Get started</Link>
            <Link href="/pricing" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">View pricing</Link>
          </div>
        </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {capabilities.map((cap) => (
            <article key={cap.title} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cap.color}`}>
                <cap.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900">{cap.title}</h3>
              <p className="text-sm text-gray-700 mt-1">{cap.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Start here</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-gray-700">
            <li><Link href="/docs/install" className="text-blue-700 hover:underline">Install from source with the repository-supported pnpm workflow.</Link></li>
            <li><Link href="/docs/github" className="text-blue-700 hover:underline">Connect GitHub with least-privilege permissions and secure webhooks.</Link></li>
            <li><Link href="/signup" className="text-blue-700 hover:underline">Join updates via email fallback or GitHub community channels.</Link></li>
          </ul>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold mb-2">In the workspace</h2>
          <p className="text-sm text-gray-600 mb-4">
            Branching analysis, evidence ledgers, and governance health in one deterministic workspace.
          </p>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/zeo_decision_dashboard/screen.png"
              alt="Zeo decision dashboard showing branching analysis, evidence tracking, and governance metrics"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </section>
    </PublicShell>
  );
}
