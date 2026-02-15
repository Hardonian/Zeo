import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { IconTerminal, IconArrowRight } from '@/components/icons/ZeoIcons';
import { getAllPanelConfigs } from '@/lib/panel-config';
import { WORKFLOWS, getHumanPanelsByWorkflow } from '@/lib/human-panels';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = buildMetadata({
  title: 'Product | Zeo',
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
        {/* Decision Studio CTA */}
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Decision Intelligence Studio</h2>
          <p className="mt-2 text-gray-600">
            Ask questions in plain language. Zeo translates your query into deterministic analysis
            and explains the results — no CLI knowledge required.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
            <li>Decision Checkpoints: audit-ready, replayable, exportable.</li>
            <li>Bounded multi-agent workflows with full trace.</li>
          </ul>
          <Link
            href="/studio"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
          >
            Open Decision Studio
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Primary Workflows */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Primary Workflows</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {WORKFLOWS.map(workflow => (
              <div
                key={workflow.key}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold text-gray-900">{workflow.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
                <div className="mt-3 space-y-1.5">
                  {panelsByWorkflow[workflow.key]?.map(panel => (
                    <Link
                      key={panel.intentKey}
                      href={`/studio?intent=${encodeURIComponent(panel.intentKey)}`}
                      className="block text-sm text-blue-600 transition-colors hover:text-blue-800"
                    >
                      {panel.humanLabel}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CLI Demos */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-900">CLI Demos</h2>
          <p className="mb-4 text-sm text-gray-600">
            Try Zeo commands directly in your browser. Every demo runs deterministic analysis with sample data — no backend, no account required.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {panels.map(panel => (
              <div
                key={panel.slug}
                className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <IconTerminal className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{panel.title}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600">{panel.description}</p>
                <div className="mt-3 flex items-center gap-4">
                  <Link
                    href={`/studio?intent=${encodeURIComponent(SLUG_TO_INTENT[panel.slug] ?? panel.slug)}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    Open in Decision Studio
                    <IconArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href={`/product/${panel.slug}/demo`}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
                  >
                    CLI Demo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/platform" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Platform Overview
          </Link>
          <Link href="/studio" className="text-sm text-blue-600 hover:underline">
            Open Decision Studio
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
