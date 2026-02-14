import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import {
  IconBranching,
  IconShield,
  IconProvenance,
  IconUncertainty,
  IconSensitivity,
  IconAudit,
  IconTerminal,
  IconArrowRight,
} from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'Features | Zeo',
  description: 'Explore Zeo features: decision branching, policy enforcement, evidence provenance, uncertainty tracking, and deterministic audit trails.',
};

const features = [
  {
    icon: IconBranching,
    title: 'Decision Branching Engine',
    description: 'Explore multi-step decision trees with probability intervals, dependency tracking, and flip-point detection. Branches expand 2-3 steps deep by default and are expandable on demand.',
    details: ['Probability intervals on every branch', 'Dependency tracking between assumptions', 'Flip-point detection for sensitivity', 'Expandable depth with pruning controls'],
    color: 'from-blue-500 to-indigo-500',
  },
  {
    icon: IconShield,
    title: 'Policy Enforcement',
    description: 'Hierarchical policy packs gate PRs based on organization-wide security and quality standards. Policies support inheritance from global to repository level.',
    details: ['Block, warn, or allow per finding severity', 'Global, team, and repository inheritance', 'Evidence bundles for every evaluation', 'GitHub App integration for status checks'],
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: IconProvenance,
    title: 'Evidence Provenance',
    description: 'Every fact carries its source, timestamp, and checksum. Without provenance, claims are automatically downgraded to assumptions or beliefs.',
    details: ['SHA-256 checksums on all evidence', 'Source pointer and timestamp tracking', 'Automatic downgrade without provenance', 'Immutable decision records'],
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: IconUncertainty,
    title: 'Uncertainty Ledger',
    description: 'Track confidence ranges and how they evolve with new evidence. Intervals widen under uncertainty and never produce false precision.',
    details: ['Widen-only calibration rule', 'Epistemic vs aleatoric decomposition', 'Brier score and interval scoring', 'Domain-specific calibration profiles'],
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: IconSensitivity,
    title: 'Sensitivity Analysis',
    description: 'Surface fragile dependencies and flip thresholds. Know what would change the answer before it matters with counterfactual analysis.',
    details: ['Counterfactual engine for "what flips"', 'Value of Information prioritization', 'Fragile dependency detection', 'Robustness scoring across assumptions'],
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: IconAudit,
    title: 'Deterministic Audit Trail',
    description: 'Cryptographically signed evidence bundles create an unbreakable audit trail. Same inputs always produce same outputs for reproducible analysis.',
    details: ['SHA-256 content addressing', 'Canonical JSON serialization', 'Explicit seed parameter for randomness', 'Replay and verification commands'],
    color: 'from-cyan-500 to-blue-500',
  },
];

export default function FeaturesPage() {
  return (
    <PublicShell title="Features">
      <div className="max-w-5xl space-y-14">
        <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
          Zeo provides provenance-first decision support with confidence ranges, assumption tracking, and sensitivity analysis. Every component enforces epistemic discipline.
        </p>

        <div className="space-y-8">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <section key={f.title} className="group rounded-2xl border border-gray-200 bg-white p-7 card-hover">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{f.title}</h2>
                    <p className="mt-2 text-gray-600 leading-relaxed">{f.description}</p>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {f.details.map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="h-1 w-1 rounded-full bg-gray-400 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <section className="flex flex-wrap gap-4">
          <Link href="/docs/quickstart" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
            Get Started <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/platform" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 transition-colors">
            View Platform <IconArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
