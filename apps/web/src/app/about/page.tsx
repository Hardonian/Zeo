import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import {
  IconBranching,
  IconProvenance,
  IconUncertainty,
  IconShield,
  IconAudit,
} from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'About | Zeo',
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
        {/* Mission */}
        <section className="rounded-2xl border border-gray-200 bg-white p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Zeo is an evidence-mapping workspace for decisions made under uncertainty.
            Unlike traditional decision tools that optimize for certainty, Zeo makes
            uncertainty a first-class citizen — tracking confidence ranges, assumptions,
            and the sensitivity of conclusions to new evidence.
          </p>
        </section>

        {/* Core Principles */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Core Principles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`rounded-xl border-l-4 ${p.color} p-5`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`h-5 w-5 ${p.iconColor}`} />
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* What Zeo Includes */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">What Zeo Includes</h2>
          <div className="space-y-3">
            {includes.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 card-hover">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-4.5 w-4.5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Explore */}
        <section className="flex flex-wrap gap-4">
          <Link href="/stitch" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
            Browse Stitch Panels
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/platform" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
            Platform Overview
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
            Pricing
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
