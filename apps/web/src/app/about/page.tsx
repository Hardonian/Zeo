import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'About | Zeo',
  description: 'Learn about Zeo — an evidence-mapping workspace for decisions under uncertainty with provenance tracking and sensitivity analysis.',
};

export default function AboutPage() {
  return (
    <PublicShell title="About Zeo">
      <div className="max-w-3xl space-y-8">
        {/* Mission */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Mission</h2>
          <p className="text-gray-700 leading-relaxed">
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
        </section>

        {/* Explore */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Explore</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/stitch" className="text-blue-700 hover:underline">
              Browse Stitch Panels →
            </Link>
            <Link href="/platform" className="text-blue-700 hover:underline">
              Platform Overview →
            </Link>
            <Link href="/pricing" className="text-blue-700 hover:underline">
              Pricing →
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
