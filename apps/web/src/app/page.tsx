import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Zeo — Governance and Evidence for Uncertain Decisions',
  description: 'Static-first Zeo site for product overview, documentation, pricing, and onboarding to CLI and governance workflows.',
  openGraph: {
    title: 'Zeo — Governance and Evidence for Uncertain Decisions',
    description: 'Learn Zeo, install the CLI, connect GitHub safely, and operationalize policy with deterministic evidence.',
  },
};

const features = [
  'Deterministic policy checks for code review and governance workflows.',
  'Evidence bundles with provenance metadata and audit-ready change history.',
  'CLI and web interfaces for local diagnostics, dashboards, and replay analysis.',
];

export default function Home() {
  return (
    <PublicShell title="Decision intelligence under uncertainty">
      <div className="max-w-4xl space-y-8">
        <section className="space-y-3">
          <p className="text-lg text-gray-700">
            Zeo helps teams evaluate decisions with confidence ranges, assumptions, provenance, and sensitivity tracking. The CLI drives local workflows, while this static site provides onboarding, docs, and support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Get started</Link>
            <Link href="/pricing" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">View pricing</Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature} className="rounded-lg border border-gray-200 bg-white p-5">
              <p className="text-sm text-gray-700">{feature}</p>
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
      </div>
    </PublicShell>
  );
}
