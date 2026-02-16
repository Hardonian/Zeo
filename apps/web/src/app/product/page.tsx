import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconTerminal, IconArrowRight } from '@/components/icons/ZeoIcons';
import { ButtonLink, Card } from '@/components/ui';
import { getAllPanelConfigs } from '@/lib/panel-config';
import { WORKFLOWS, getHumanPanelsByWorkflow } from '@/lib/human-panels';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = buildMetadata({
  title: 'Product',
  description: 'Zeo Decision Intelligence — natural language analysis and CLI demos. Deterministic output, no backend required.',
  canonicalPath: '/product',
});
const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Zeo Decision Intelligence',
  description: 'Deterministic decision intelligence with provenance-first governance and evidence mapping.',
  brand: { '@type': 'Brand', name: 'Zeo' },
  url: 'https://zeo.dev/product',
};


/** Map panel slugs to studio intent params. */
const SLUG_TO_INTENT: Record<string, string> = {
  'counterfactual-lab': 'counterfactual-lab',
  'evidence-planner': 'evidence-planner',
  'decision-graph': 'decision-graph',
  'uncertainty-ledger': 'flip-distance',
  'epistemic-translator': 'counterfactual-lab',
  'governance': 'evidence-planner',
  'kpi-monitor': 'evidence-planner',
};

export default function ProductPage() {
  const panels = getAllPanelConfigs();
  const panelsByWorkflow = getHumanPanelsByWorkflow();

  return (
    <PublicShell title="Product">
      <JsonLd data={productJsonLd} />
      <div className="max-w-4xl space-y-10">
        <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
          <h2 className="text-xl font-semibold text-foreground">Decision Intelligence Studio</h2>
          <p className="mt-2 text-muted-foreground">
            Ask questions in plain language. Zeo translates your query into deterministic analysis
            and explains the results — no CLI knowledge required.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Decision Checkpoints: audit-ready, replayable, exportable.</li>
            <li>Bounded multi-agent workflows with full trace.</li>
          </ul>
          <ButtonLink href="/studio" className="mt-4 inline-flex">
            Open Decision Studio
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Primary Workflows</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {WORKFLOWS.map(workflow => (
              <Card key={workflow.key} className="p-5">
                <h3 className="font-semibold text-foreground">{workflow.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
                <div className="mt-3 space-y-1.5">
                  {panelsByWorkflow[workflow.key]?.map(panel => (
                    <Link
                      key={panel.intentKey}
                      href={`/studio?intent=${encodeURIComponent(panel.intentKey)}`}
                      className="block text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      {panel.humanLabel}
                    </Link>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">CLI Demos</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Try Zeo commands directly in your browser. Every demo runs deterministic analysis with sample data — no backend, no account required.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {panels.map(panel => (
              <Card key={panel.slug} className="p-5">
                <div className="flex items-center gap-2">
                  <IconTerminal className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{panel.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{panel.description}</p>
                <div className="mt-3 flex items-center gap-4">
                  <Link
                    href={`/studio?intent=${encodeURIComponent(SLUG_TO_INTENT[panel.slug] ?? panel.slug)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Open in Decision Studio
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/product/${panel.slug}/demo`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    CLI Demo
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/platform" className="text-sm font-medium text-primary hover:underline">
            &larr; Back to Platform Overview
          </Link>
          <Link href="/studio" className="text-sm font-medium text-primary hover:underline">
            Open Decision Studio
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
