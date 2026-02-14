import { getCapabilityPages, getCapabilityHtml } from '@/lib/capabilities';

export interface StitchPanelConfig {
  slug: string;
  title: string;
  description: string;
  cliWorkflow: string[];
}

export const STITCH_PANELS: StitchPanelConfig[] = [
  {
    slug: 'decision-branching-view-1',
    title: 'Decision Branching',
    description: 'Branch-level scenario mapping with explicit assumption tracking and flip-distance controls.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -r build',
      'pnpm -C apps/cli start -- --example negotiation',
    ],
  },
  {
    slug: 'uncertainty-ledger-viewer-1',
    title: 'Uncertainty Ledger',
    description: 'Confidence ranges and assumption sensitivity checkpoints for evidence-backed updates.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -C apps/cli eval -- --input examples/startup-scaling/replay.json',
      'pnpm -C apps/cli start -- --replay examples/startup-scaling/replay.json',
    ],
  },
  {
    slug: 'epistemic-translator-panel-1',
    title: 'Epistemic Translator',
    description: 'Cross-framework interpretation with provenance tags and bounded confidence language.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -C apps/cli start -- --example negotiation',
      'pnpm -C apps/web dev',
    ],
  },
  {
    slug: 'oss-governance-dashboard',
    title: 'OSS Governance',
    description: 'Governance drift, policy posture, and organization-level compliance health views.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -C apps/cli start -- --replay examples/auth-migration/replay.json',
      'pnpm -C apps/web dev',
    ],
  },
  {
    slug: 'kpi-health-monitor-1',
    title: 'KPI Health Monitoring',
    description: 'KPI trend tracking with uncertainty bounds and threshold breach context.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -C apps/cli start -- --replay examples/startup-scaling/replay.json',
      'pnpm -C apps/web dev',
    ],
  },
  {
    slug: 'evidence-planner',
    title: 'Evidence Planning',
    description: 'Research queue planning with value-of-information prioritization across assumptions.',
    cliWorkflow: [
      'pnpm install',
      'pnpm -C apps/cli start -- --replay examples/infra-cost-tradeoff/replay.json',
      'pnpm -C apps/web dev',
    ],
  },
];

let capabilityPagesPromise: ReturnType<typeof getCapabilityPages> | null = null;

function getCapabilityPagesCached() {
  if (!capabilityPagesPromise) {
    capabilityPagesPromise = getCapabilityPages();
  }

  return capabilityPagesPromise;
}

function findFallbackCapabilitySlug(
  requestedSlug: string,
  availableSlugs: string[],
): string | null {
  const normalized = requestedSlug.toLowerCase();
  const exactSuffix = `-${normalized}`;
  const inlinedSegment = `-${normalized}-`;

  for (const slug of availableSlugs) {
    if (slug.endsWith(exactSuffix) || slug.includes(inlinedSegment)) {
      return slug;
    }
  }

  return null;
}

export async function resolveStitchCapability(slug: string) {
  const exact = await getCapabilityHtml(slug);
  if (exact) return exact;

  const pages = await getCapabilityPagesCached();
  const fallbackSlug = findFallbackCapabilitySlug(
    slug,
    pages.map((page) => page.slug),
  );

  if (!fallbackSlug) {
    return null;
  }

  return getCapabilityHtml(fallbackSlug);
}

export function getStitchPanelConfig(slug: string): StitchPanelConfig | undefined {
  return STITCH_PANELS.find((panel) => panel.slug === slug);
}

export function __resetStitchCacheForTests() {
  capabilityPagesPromise = null;
}
