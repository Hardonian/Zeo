import Image from 'next/image';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Features | Zeo',
  description: 'Zeo features: decision branching, flip-point detection, value of information, regret analysis, and provenance-first evidence tracking.',
};

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className="max-w-4xl space-y-12">

        <p className="text-gray-700">Zeo provides provenance-first decision support with confidence ranges, assumption tracking, and sensitivity analysis.</p>

        {/* Feature 1: Decision Branching */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Decision Branching</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex-shrink-0">
              <img
                src="/illustrations/counterfactual-graph.svg"
                alt="Counterfactual graph: current decision path highlighted, alternative branches shown faint with flip-distance annotation"
                width={320}
                height={200}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Map decisions as graphs. Each node is a choice; each edge carries a probability weight.
                Counterfactual branches show what would have happened under alternative assumptions.
                The active path is highlighted; alternatives are rendered faint to preserve visual hierarchy.
              </p>
            </div>
          </div>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/decision_branching_view_1/screen.png"
              alt="Decision branching panel showing branching tree with sensitivity thresholds"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </section>

        {/* Feature 2: Flip Thresholds */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Sensitivity and Flip Thresholds</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex-shrink-0">
              <img
                src="/illustrations/flip-threshold.svg"
                alt="Flip threshold: parameter axis showing current estimate and the threshold distance to flip the decision"
                width={280}
                height={140}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Every decision analysis outputs a flip distance: the smallest change in any assumption
                that would change the recommendation. A flip distance near zero signals a fragile
                decision. A large flip distance means the conclusion is robust to plausible variation
                in inputs.
              </p>
            </div>
          </div>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/sensitivity_&_flip-thresholds_panel/screen.png"
              alt="Sensitivity and flip thresholds panel showing assumption ranges"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </section>

        {/* Feature 3: Evidence Planning / VOI */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Evidence Planning and Value of Information</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex-shrink-0">
              <img
                src="/illustrations/voi-diagram.svg"
                alt="Value of information diagram: decision node with evidence sources flowing in, showing confidence delta before and after"
                width={280}
                height={180}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Before collecting more data, Zeo calculates the expected value of that information.
                If the best-case evidence could not flip the decision, collecting it is unnecessary.
                The VOI panel ranks evidence sources by their potential to reduce uncertainty at the
                decision node.
              </p>
            </div>
          </div>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/option_value_inspector/screen.png"
              alt="Option value inspector panel showing evidence value analysis"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </section>

        {/* Feature 4: Robustness / Regret */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Robustness and Regret Analysis</h2>
          <div className="flex flex-col md:flex-row gap-6 items-start rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex-shrink-0">
              <img
                src="/illustrations/regret-envelope.svg"
                alt="Regret envelope showing outcome range band between worst-case and best-case, with robust central path"
                width={300}
                height={160}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Rather than optimizing for a single expected value, Zeo computes the minimax-regret
                decision: the choice that minimizes worst-case regret across all plausible assumption
                sets. The envelope diagram shows the outcome range your decision could land in, and
                the robust path that stays inside plausible bounds regardless of which assumptions hold.
              </p>
            </div>
          </div>
        </section>

        {/* Feature 5: Provenance and Audit */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Provenance and Audit Trails</h2>
          <p className="text-sm text-gray-600">
            Every extracted fact carries source, timestamp, and confidence. Evidence bundles are
            cryptographically signed. Any modification invalidates the chain, making tampered
            evidence detectable at replay time.
          </p>
          <div className="rounded border border-gray-100 overflow-hidden">
            <Image
              src="/panels/provenance_explorer_panel/screen.png"
              alt="Provenance explorer panel showing source chain and confidence metadata"
              width={900}
              height={600}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        </section>

        {/* Design Guarantees */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold mb-4">Design Guarantees</h2>
          <img
            src="/illustrations/transparency-badges.svg"
            alt="Four design guarantees: Deterministic, Auditable, Replayable, Bounded"
            width={360}
            height={80}
            loading="lazy"
          />
        </section>

      </div>
    </PublicShell>
  );
}
