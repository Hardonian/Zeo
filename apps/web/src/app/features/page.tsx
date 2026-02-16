import Image from 'next/image';
import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className="max-w-4xl space-y-12">
        <p className="text-muted-foreground">Zeo provides provenance-first decision support with confidence ranges, assumption tracking, and sensitivity analysis.</p>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Decision Branching</h2>
          <Card className="flex flex-col gap-6 p-5 md:flex-row md:items-start">
            <div className="flex-shrink-0">
              <Image
                src="/images/illustrations/counterfactual-graph.svg"
                alt="Counterfactual graph: current decision path highlighted, alternative branches shown faint with flip-distance annotation"
                width={320}
                height={200}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Map decisions as graphs. Each node is a choice; each edge carries a probability weight. Counterfactual branches show what would have happened under alternative assumptions.</p>
            </div>
          </Card>
          <div className="overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/decision-branching-view.png"
              alt="Decision branching panel showing branching tree with sensitivity thresholds"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Sensitivity and Flip Thresholds</h2>
          <div className="overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/sensitivity-flip-thresholds.png"
              alt="Sensitivity and flip thresholds panel showing assumption ranges"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Evidence Planning and Value of Information</h2>
          <div className="overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/option-value-inspector.png"
              alt="Option value inspector panel showing evidence value analysis"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Provenance and Audit Trails</h2>
          <div className="overflow-hidden rounded-md border border-border">
            <Image
              src="/images/panels/provenance-explorer.png"
              alt="Provenance explorer panel showing source chain and confidence metadata"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
