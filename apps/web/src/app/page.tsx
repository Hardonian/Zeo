import Link from 'next/link';
import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Zeo — Governance and Evidence for Uncertain Decisions',
  description: 'Static-first Zeo site for product overview, documentation, pricing, and onboarding to CLI and governance workflows.',
};

const highlights = [
  'Branch decisions with confidence ranges and explicit assumptions.',
  'Attach provenance pointers to every evidence-backed fact.',
  'Track sensitivity and flip thresholds before shipping critical changes.',
];

export default function Home() {
  return (
    <PublicShell title="Decision intelligence under uncertainty" hero>
      <section className="relative -mx-6 -mt-10 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-6 py-20 md:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-4 py-1.5 text-xs font-medium text-slate-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Open source · MIT License
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Governance &amp; evidence for uncertain decisions
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Zeo helps teams evaluate decisions with confidence ranges, assumptions, provenance, and sensitivity tracking.
          </p>

          <div className="mt-8 w-full max-w-2xl rounded-xl border border-slate-700/80 bg-slate-900/50 p-4">
            <img
              src="/illustrations/engine-block.svg"
              alt="Flow diagram showing deterministic pipeline from inputs to signed plan output"
              width={640}
              height={220}
              className="mx-auto h-auto w-full"
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/docs/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Get started</Link>
            <Link href="/platform" className="rounded border border-slate-500 px-4 py-2 text-slate-100 hover:bg-slate-700/40">View product</Link>
          </div>
        </div>
      </section>

      <div className="space-y-8 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <article key={item} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-700">{item}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold">In the workspace</h2>
          <p className="mt-2 text-sm text-gray-600">Branching analysis, evidence ledgers, and governance health in one deterministic workspace.</p>
          <div className="mt-4 overflow-hidden rounded border border-gray-100">
            <Image
              src="/panels/zeo_decision_dashboard/screen.png"
              alt="Zeo decision dashboard showing branching analysis, evidence tracking, and governance metrics"
              width={900}
              height={600}
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
