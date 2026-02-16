import Link from 'next/link';
import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';
import { ButtonLink, Card } from '@/components/ui';
import {
  IconBranching,
  IconProvenance,
  IconUncertainty,
  IconShield,
  IconAudit,
} from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'About',
  description: 'Learn about Zeo — an evidence-mapping workspace for decisions under uncertainty with provenance tracking and sensitivity analysis.',
};

const principles = [
  {
    icon: IconUncertainty,
    title: 'Epistemic Honesty',
    description: 'Never convert uncertainty into false precision. Facts, beliefs, and assumptions are clearly distinguished.',
    color: 'border-blue-500 bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: IconProvenance,
    title: 'Provenance-First',
    description: 'Every extracted fact carries its source, timestamp, and confidence. Without provenance, claims are marked as assumptions or beliefs.',
    color: 'border-emerald-500 bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: IconBranching,
    title: 'Robustness Over Recommendation',
    description: 'Prefer outputs that are robust across assumptions rather than a single "best choice." Sensitivity analysis shows what would change the answer.',
    color: 'border-violet-500 bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: IconShield,
    title: 'Privacy-First Defaults',
    description: 'Edge-first processing when feasible. Raw data is minimized; extracted artifacts and provenance are stored instead.',
    color: 'border-amber-500 bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

const includes = [
  { icon: IconBranching, label: 'Decision Branching Engine', desc: 'Explore decision trees with sensitivity analysis and flip thresholds.' },
  { icon: IconProvenance, label: 'Evidence Ingestion', desc: 'Structured adapters for OCR, audio, and computer vision inputs.' },
  { icon: IconUncertainty, label: 'Uncertainty Ledger', desc: 'Track confidence ranges and how they evolve with new evidence.' },
  { icon: IconShield, label: 'Epistemic Translator', desc: 'Convert between different reasoning frameworks and vocabularies.' },
  { icon: IconAudit, label: 'Governance Dashboards', desc: 'OSS governance, KPI monitoring, and audit trails.' },
];

export default function AboutPage() {
  return (
    <PublicShell title="About Zeo">
      <div className="max-w-4xl space-y-12">
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-foreground">Mission</h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Zeo is an evidence-mapping workspace for decisions made under uncertainty.
            Unlike traditional decision tools that optimize for certainty, Zeo makes
            uncertainty a first-class citizen — tracking confidence ranges, assumptions,
            and the sensitivity of conclusions to new evidence.
          </p>
        </Card>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Core Principles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <Card key={principle.title} className="p-5">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-md border ${principle.color}`}>
                  <principle.icon className={`h-5 w-5 ${principle.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground">{principle.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
              </Card>
            ))}
          </div>
          <figure className="mt-6">
            <Image
              src="/images/illustrations/regret-envelope.svg"
              alt="Outcome envelope showing robust central path between worst-case and best-case bounds"
              width={360}
              height={180}
              className="opacity-90"
            />
            <figcaption className="text-xs text-muted-foreground mt-2">
              Minimax regret envelope — the robust path stays inside plausible bounds.
            </figcaption>
          </figure>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">What Zeo Includes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {includes.map((item) => (
              <Card key={item.label} className="p-4">
                <div className="flex items-start gap-3">
                  <item.icon className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/audit-packet-builder.png"
              alt="Audit packet builder showing signed evidence bundles with provenance metadata"
              width={800}
              height={500}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <ButtonLink href="/stitch" variant="outline">
            Browse Stitch Panels
          </ButtonLink>
          <ButtonLink href="/platform" variant="outline">
            Platform Overview
          </ButtonLink>
          <ButtonLink href="/pricing" variant="outline">
            Pricing
          </ButtonLink>
        </section>
      </div>
    </PublicShell>
  );
}
