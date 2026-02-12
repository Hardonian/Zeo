import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchPagesByCategory } from '@/lib/stitch';

export const metadata = {
  title: 'Zeo — Decision Intelligence Under Uncertainty',
  description: 'Zeo is an evidence-mapping workspace for decisions under uncertainty. Features governance dashboards, decision branching, uncertainty tracking, and epistemic tooling.',
  openGraph: {
    title: 'Zeo — Decision Intelligence Under Uncertainty',
    description: 'Evidence-mapping workspace with governance dashboards, decision branching, and uncertainty tracking.',
  },
};

export default async function Home() {
  const pagesByCategory = await getStitchPagesByCategory();
  const featuredPanels = [
    { slug: 'oss-governance-dashboard', title: 'OSS Governance Dashboard' },
    { slug: 'epistemic-translator-panel-1', title: 'Epistemic Translator' },
    { slug: 'uncertainty-ledger-viewer-1', title: 'Uncertainty Ledger' },
    { slug: 'kpi-health-monitor-1', title: 'KPI Health Monitor' },
  ];

  return (
    <PublicShell title="Decision intelligence under uncertainty">
      {/* Hero Section */}
      <section className="mb-12">
        <p className="max-w-3xl text-lg text-gray-700 leading-relaxed">
          Zeo is an evidence-mapping workspace for decisions made under uncertainty. 
          It focuses on provenance, confidence ranges, and sensitivity analysis instead 
          of single-point certainty claims.
        </p>
      </section>

      {/* Core Concepts */}
      <section className="grid gap-6 md:grid-cols-3 mb-12">
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-blue-700">Fact</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ground claims in evidence with full provenance tracking. Every assertion carries 
            its source, timestamp, and confidence level.
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-blue-700">Belief</h2>
          <p className="mt-2 text-sm text-gray-600">
            Make assumptions explicit and visible. Teams get better outcomes when 
            uncertainty is tracked alongside conviction.
          </p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-blue-700">Unknown</h2>
          <p className="mt-2 text-sm text-gray-600">
            New evidence can change the preferred option. Zeo maintains audit trails 
            for every claim and its evolution.
          </p>
        </article>
      </section>

      {/* Featured Panels */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Featured Panels</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredPanels.map((panel) => (
            <Link 
              key={panel.slug}
              href={`/stitch/${panel.slug}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <h3 className="font-medium text-blue-700">{panel.title}</h3>
              <p className="text-sm text-gray-500 mt-1">View panel →</p>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/stitch" className="text-blue-700 hover:underline text-sm">
            Browse all {Object.values(pagesByCategory).flat().length} Stitch panels →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(pagesByCategory).map(([category, pages]) => (
            <div key={category} className="rounded-lg border border-gray-200 bg-white p-5">
              <h3 className="font-semibold">{category}</h3>
              <p className="text-sm text-gray-600 mt-1">{pages.length} panels available</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTAs */}
      <section className="flex flex-wrap gap-3">
        <Link href="/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Quickstart
        </Link>
        <Link href="/stitch" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
          Browse Stitch Panels
        </Link>
        <Link href="/platform" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
          Platform Overview
        </Link>
      </section>
    </PublicShell>
  );
}
