import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconCheck } from '@/components/icons/ZeoIcons';
import { Badge, ButtonLink, Card } from '@/components/ui';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = buildMetadata({
  title: 'Pricing',
  description: 'Compare Zeo Community and Enterprise plans for governance, provenance, and decision-intelligence workflows.',
  canonicalPath: '/pricing',
});

const communityFeatures = [
  'Local deployment',
  'Self-managed provenance storage',
  'Core decision branching tools',
  'Basic governance dashboards',
  'Community support',
  'MIT licensed',
];

const enterpriseFeatures = [
  'Everything in Community, plus:',
  'Policy packs and custom rules',
  'GitHub App integration',
  'Audit-focused rollout support',
  'SSO and team management',
  'Priority support',
  'Custom integrations',
];

const faqs = [
  {
    q: "What's included in the Community edition?",
    a: 'The Community edition includes all core decision intelligence tools, governance dashboards, and epistemic tooling. It is designed for individual users and small teams who can self-host and manage their own infrastructure.',
  },
  {
    q: 'When should I consider Enterprise?',
    a: 'Enterprise is recommended for teams that need policy enforcement across repositories, GitHub integration for PR governance, SSO for team management, or audit support for compliance requirements.',
  },
  {
    q: 'Is Zeo open source?',
    a: 'Yes. The core Zeo platform is open source under the MIT license. Enterprise features are offered as a hosted service with additional support and integrations.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((entry) => ({
    '@type': 'Question',
    name: entry.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: entry.a,
    },
  })),
};



export default function PricingPage() {
  return (
    <PublicShell title="Pricing">
      <JsonLd data={faqJsonLd} />
      <div className="max-w-4xl space-y-12">
        <p className="text-muted-foreground max-w-2xl">
          Start free with the full open-source platform. Upgrade to Enterprise when your team needs governance integrations and dedicated support.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-7 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Community</h2>
              <p className="text-muted-foreground mt-1 text-sm">Open-source, self-hosted</p>
              <p className="text-4xl font-bold mt-4 text-foreground">Free</p>
              <p className="text-xs text-muted-foreground mt-1">Forever</p>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground flex-1">
              {communityFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <IconCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/quickstart" variant="outline" className="mt-8 w-full justify-center">
              Get Started
            </ButtonLink>
          </Card>

          <Card className="relative border-primary/30 bg-gradient-to-b from-blue-50/60 to-white p-7 flex flex-col">
            <div className="absolute -top-3 right-6">
              <Badge variant="primary">Recommended</Badge>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Enterprise</h2>
              <p className="text-muted-foreground mt-1 text-sm">For teams that need governance</p>
              <p className="text-4xl font-bold mt-4 text-foreground">Custom</p>
              <p className="text-xs text-muted-foreground mt-1">Contact for pricing</p>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground flex-1">
              {enterpriseFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <IconCheck className="h-4 w-4 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/contact" className="mt-8 w-full justify-center">
              Contact Sales
            </ButtonLink>
          </Card>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-lg border border-border bg-surface">
                <summary className="cursor-pointer p-5 font-medium text-foreground flex items-center justify-between">
                  {faq.q}
                  <span className="ml-4 text-muted-foreground group-open:rotate-180 transition-transform text-sm">&#9660;</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
