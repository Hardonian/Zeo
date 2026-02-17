import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconBranching, IconShield, IconProvenance } from '@/components/icons/ZeoIcons';
import { DecisionHeroLoader } from '@/components/hero/DecisionHeroLoader';
import { CTASection, uiTokens } from '@/components/site/ui-system';

export const metadata = buildMetadata({
  title: 'Zeo — Decision Intelligence Under Pressure',
  description: 'Simulate outcomes, measure stability, improve confidence — with full traceability. Enterprise-grade decision governance.',
  canonicalPath: '/',
  ogImage: '/brand/zeo/og-image.png',
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
    logo: 'https://zeo.dev/icon.png',
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

      <section className="relative -mx-6 -mt-10 overflow-hidden min-h-[600px]">
        <DecisionHeroLoader />
      </section>

      <div className={`${uiTokens.pageStack} py-10`}>
        <section className="grid gap-4 md:grid-cols-3">
          {capabilities.map((cap) => (
            <article key={cap.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm card-hover">
              <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${cap.color}`}>
                <cap.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">{cap.title}</h2>
              <p className="text-sm text-gray-700 mt-1">{cap.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">In the workspace</h2>
          <p className="mt-2 text-sm text-gray-600">Branching analysis, evidence ledgers, and governance health in one deterministic workspace.</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
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
            <Link href="/docs" className={uiTokens.buttonSecondary}>Read docs</Link>
            <Link href="/studio" className={uiTokens.buttonPrimary}>Open studio</Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Governance at a glance</h2>
            <p className="text-sm text-gray-600 mb-4">Policy compliance, drift detection, and health dashboards — all in one view.</p>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <Image
                src="/brand/zeo/governance.png"
                alt="Zeo governance dashboard showing policy compliance and health metrics"
                width={600}
                height={400}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Signal tracking</h2>
            <p className="text-sm text-gray-600 mb-4">Monitor evidence signals and confidence shifts as new data arrives.</p>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <Image
                src="/brand/zeo/signals.png"
                alt="Zeo signal tracking panel showing evidence confidence over time"
                width={600}
                height={400}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          </div>
        </section>


        <CTASection
          title="Move from exploration to governed execution"
          description="Use docs and studio together to run deterministic decision workflows with provenance and sensitivity visible end-to-end."
          primaryHref="/docs/quickstart"
          primaryLabel="Start quickstart"
          secondaryHref="/platform"
          secondaryLabel="View platform"
        />
      </div>
    </PublicShell>
  );
}
