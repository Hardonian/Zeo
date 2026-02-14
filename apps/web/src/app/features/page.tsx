import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className="max-w-4xl space-y-12">

        <p className="text-gray-700">Zeo provides provenance-first decision support with confidence ranges, assumption tracking, and sensitivity analysis.</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Decision Branching</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex-shrink-0">
              <img src="/illustrations/counterfactual-graph.svg" alt="Counterfactual graph: current decision path highlighted, alternative branches shown faint with flip-distance annotation" width={320} height={200} loading="lazy" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Map decisions as graphs. Each node is a choice; each edge carries a probability weight. Counterfactual branches show what would have happened under alternative assumptions.</p>
            </div>
          </div>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image src="/panels/decision_branching_view_1/screen.png" alt="Decision branching panel showing branching tree with sensitivity thresholds" width={900} height={600} className="w-full h-auto" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sensitivity and Flip Thresholds</h2>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image src="/panels/sensitivity_&_flip-thresholds_panel/screen.png" alt="Sensitivity and flip thresholds panel showing assumption ranges" width={900} height={600} className="w-full h-auto" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Evidence Planning and Value of Information</h2>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image src="/panels/option_value_inspector/screen.png" alt="Option value inspector panel showing evidence value analysis" width={900} height={600} className="w-full h-auto" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Provenance and Audit Trails</h2>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image src="/panels/provenance_explorer_panel/screen.png" alt="Provenance explorer panel showing source chain and confidence metadata" width={900} height={600} className="w-full h-auto" loading="lazy" />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
