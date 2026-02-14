import Link from 'next/link';
import Image from 'next/image';
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
          <h2 className="text-lg font-semibold mb-3">Core Principles</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">Epistemic Honesty</h3>
              <p className="text-sm text-gray-600 mt-1">
                Never convert uncertainty into false precision. Facts, beliefs, and 
                assumptions are clearly distinguished.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">Provenance-First</h3>
              <p className="text-sm text-gray-600 mt-1">
                Every extracted fact carries its source, timestamp, and confidence. 
                Without provenance, claims are marked as assumptions or beliefs.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">Robustness Over Recommendation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Prefer outputs that are robust across assumptions rather than a single
                &quot;best choice.&quot; Sensitivity analysis shows what would change the answer.
              </p>
              <figure className="mt-3">
                <img
                  src="/illustrations/regret-envelope.svg"
                  alt="Outcome envelope showing robust central path between worst-case and best-case bounds"
                  width={300}
                  height={160}
                  loading="lazy"
                  className="opacity-90"
                />
                <figcaption className="text-xs text-gray-400 mt-1">
                  Minimax regret envelope — the robust path stays inside plausible bounds.
                </figcaption>
              </figure>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-medium">Privacy-First Defaults</h3>
              <p className="text-sm text-gray-600 mt-1">
                Edge-first processing when feasible. Raw data is minimized; extracted 
                artifacts and provenance are stored instead.
              </p>
            </div>
          </div>
        </section>

        {/* What Zeo Includes */}
        <section>
          <h2 className="text-lg font-semibold mb-3">What Zeo Includes</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Decision Branching Engine:</strong> Explore decision trees with sensitivity analysis and flip thresholds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Evidence Ingestion:</strong> Structured adapters for OCR, audio, and computer vision inputs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Uncertainty Ledger:</strong> Track confidence ranges and how they evolve with new evidence.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Epistemic Translator:</strong> Convert between different reasoning frameworks and vocabularies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span><strong>Governance Dashboards:</strong> OSS governance, KPI monitoring, and audit trails.</span>
            </li>
          </ul>
          <div className="mt-4 rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/audit_packet_builder/screen.png"
              alt="Audit packet builder showing signed evidence bundles with provenance metadata"
              width={800}
              height={500}
              className="w-full h-auto"
              loading="lazy"
            />
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
