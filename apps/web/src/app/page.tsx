import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconBranching, IconShield, IconProvenance } from '@/components/icons/ZeoIcons';
import { DecisionHeroLoader } from '@/components/hero/DecisionHeroLoader';

export const metadata = buildMetadata({
  title: 'Zeo — Decision Intelligence Under Pressure',
  description: 'Simulate outcomes, measure stability, improve confidence — with full traceability. Enterprise-grade decision governance.',
  canonicalPath: '/',
});

const capabilities = [
  { title: 'Decision Branching', description: 'Explore decisions with sensitivity thresholds and flip-point detection.', icon: IconBranching, color: 'bg-blue-100 text-blue-700' },
  { title: 'Governance', description: 'Policy compliance, drift detection, and health dashboards.', icon: IconShield, color: 'bg-green-100 text-green-700' },
  { title: 'Evidence Provenance', description: 'Full audit trails with source tracking and integrity checksums.', icon: IconProvenance, color: 'bg-violet-100 text-violet-700' },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zeo',
    url: 'https://zeo.dev',
    logo: 'https://zeo.dev/favicon.svg',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Zeo',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    url: 'https://zeo.dev',
  },
];

export default function Home() {
  return (
    <PublicShell title="Decision intelligence under uncertainty" hero>
      <JsonLd data={jsonLd} />
      <h1 className="sr-only">Decision intelligence under uncertainty</h1>

      <section className="relative -mx-6 -mt-10 overflow-hidden" style={{ minHeight: '600px' }}>
        <DecisionHeroLoader />
      </section>

      <div className="space-y-8 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          {capabilities.map((cap) => (
            <article key={cap.title} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cap.color}`}>
                <cap.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">{cap.title}</h2>
              <p className="text-sm text-gray-700 mt-1">{cap.description}</p>
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
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/docs" className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50">Read docs</Link>
            <Link href="/studio" className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">Next step: Open studio</Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
