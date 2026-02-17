import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { CTASection, uiTokens } from '@/components/site/ui-system';

export const metadata = buildMetadata({
  title: 'Features | Zeo',
  description: 'Explore Zeo features: decision branching, sensitivity analysis, flip thresholds, evidence planning, and provenance tracking.',
  canonicalPath: '/features',
});

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className={`max-w-4xl ${uiTokens.pageStack}`}>
        <section className={uiTokens.card}>
          <p className="text-sm leading-7 text-slate-700 md:text-base">Zeo provides provenance-first decision support with confidence ranges, assumption tracking, and sensitivity analysis.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Decision Branching</h2>
          <div className="flex flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row">
            <div className="flex-shrink-0">
              <Image src="/illustrations/counterfactual-graph.svg" alt="Counterfactual graph: current decision path highlighted, alternative branches shown faint with flip-distance annotation" width={320} height={200} loading="lazy" />
            </div>
            <p className="text-sm leading-6 text-slate-600">Map decisions as graphs. Each node is a choice; each edge carries a probability weight. Counterfactual branches show what would have happened under alternative assumptions.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image src="/panels/decision_branching_view_1/screen.png" alt="Decision branching panel showing branching tree with sensitivity thresholds" width={900} height={600} className="h-auto w-full" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Sensitivity and Flip Thresholds</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image src="/panels/sensitivity_&_flip-thresholds_panel/screen.png" alt="Sensitivity and flip thresholds panel showing assumption ranges" width={900} height={600} className="h-auto w-full" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Evidence Planning and Value of Information</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image src="/panels/option_value_inspector/screen.png" alt="Option value inspector panel showing evidence value analysis" width={900} height={600} className="h-auto w-full" loading="lazy" />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Provenance and Audit Trails</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Image src="/panels/provenance_explorer_panel/screen.png" alt="Provenance explorer panel showing source chain and confidence metadata" width={900} height={600} className="h-auto w-full" loading="lazy" />
          </div>
        </section>

        <CTASection
          title="See these features in context"
          description="Open the platform page to compare panel workflows, then run a local demo path from quickstart."
          primaryHref="/platform"
          primaryLabel="Open platform"
          secondaryHref="/quickstart"
          secondaryLabel="Run quickstart"
        />
      </div>
    </PublicShell>
  );
}
