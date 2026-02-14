import Link from 'next/link';
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
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/docs/quickstart" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700">
              Get started
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800/50 px-6 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700/50 transition-colors">
              View pricing
            </Link>
          </div>

          {/* Quick install snippet */}
          <div className="mx-auto mt-10 max-w-md rounded-xl border border-slate-700 bg-slate-800/80 p-4 text-left backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <IconTerminal className="h-3.5 w-3.5" />
              Quick start
            </div>
            <code className="block text-sm text-slate-300 font-mono">
              <span className="text-slate-500">$</span> pnpm install && pnpm doctor
            </code>
          </div>
        </div>

        {/* Decorative branching lines */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <svg className="absolute -right-20 top-1/4 h-64 w-64 text-blue-500/10" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="20" cy="100" r="4" fill="currentColor" />
            <line x1="24" y1="100" x2="80" y2="60" />
            <circle cx="80" cy="60" r="3" fill="currentColor" />
            <line x1="24" y1="100" x2="80" y2="140" />
            <circle cx="80" cy="140" r="3" fill="currentColor" />
            <line x1="83" y1="60" x2="140" y2="40" />
            <circle cx="140" cy="40" r="2.5" fill="currentColor" />
            <line x1="83" y1="60" x2="140" y2="80" />
            <circle cx="140" cy="80" r="2.5" fill="currentColor" />
            <line x1="83" y1="140" x2="140" y2="120" />
            <circle cx="140" cy="120" r="2.5" fill="currentColor" />
            <line x1="83" y1="140" x2="140" y2="160" />
            <circle cx="140" cy="160" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Built for epistemic discipline
          </h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Every component enforces provenance, uncertainty representation, and deterministic behavior.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            const [textColor, bgColor] = cap.color.split(' ');
            return (
              <article key={cap.title} className="group rounded-xl border border-gray-200 bg-white p-6 card-hover">
                <div className={`inline-flex rounded-lg p-2.5 ${bgColor}`}>
                  <Icon className={`h-5 w-5 ${textColor}`} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{cap.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{cap.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Start Here */}
      <section className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10">
        <h2 className="text-xl font-bold text-gray-900">Start here</h2>
        <p className="mt-2 text-gray-600 text-sm">Three steps to a running Zeo environment.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/docs/install" className="group flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">1</span>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Install from source</p>
              <p className="mt-1 text-xs text-gray-500">Repository-supported pnpm workflow.</p>
            </div>
          </Link>
          <Link href="/docs/github" className="group flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">2</span>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Connect GitHub</p>
              <p className="mt-1 text-xs text-gray-500">Least-privilege permissions and secure webhooks.</p>
            </div>
          </Link>
          <Link href="/signup" className="group flex items-start gap-3 rounded-lg border border-gray-100 p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">3</span>
            <div>
              <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Join the community</p>
              <p className="mt-1 text-xs text-gray-500">Updates via email or GitHub channels.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust bar */}
      <section className="mt-12 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Deterministic &middot; Provenance-first &middot; Edge-first &middot; MIT Licensed
        </p>
      </section>
    </PublicShell>
  );
}
