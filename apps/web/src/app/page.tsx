import Image from 'next/image';
import Image from 'next/image';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconBranching, IconShield, IconProvenance } from '@/components/icons/ZeoIcons';
import { Card } from '@/components/ui';
import { DecisionHeroLoader } from '@/components/hero/DecisionHeroLoader';

export const metadata = buildMetadata({
  title: 'Decision Intelligence Under Pressure',
  description: 'Simulate outcomes, measure stability, improve confidence — with full traceability. Enterprise-grade decision governance.',
  canonicalPath: '/',
});

const capabilities = [
  { title: 'Decision Branching', description: 'Explore decisions with sensitivity thresholds and flip-point detection.', icon: IconBranching },
  { title: 'Governance', description: 'Policy compliance, drift detection, and health dashboards.', icon: IconShield },
  { title: 'Evidence Provenance', description: 'Full audit trails with source tracking and integrity checksums.', icon: IconProvenance },
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

      <section className="relative -mx-6 -mt-12 overflow-hidden min-h-[560px]">
        <DecisionHeroLoader />
      </section>

      <div className="space-y-12 py-12">
        <section className="grid gap-4 md:grid-cols-3">
          {capabilities.map((cap) => (
            <Card key={cap.title} className="p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <cap.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{cap.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{cap.description}</p>
            </Card>
          ))}
        </section>

        <Card className="p-5">
          <h2 className="text-xl font-semibold text-foreground">In the workspace</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Branching analysis, evidence ledgers, and governance health in one deterministic workspace. See the
            <Link href="/docs" className="ml-1 font-medium text-primary hover:underline">documentation</Link>
            for setup details.
          </p>
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/zeo-decision-dashboard.png"
              alt="Zeo decision dashboard showing branching analysis, evidence tracking, and governance metrics"
              width={900}
              height={600}
              className="h-auto w-full"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
