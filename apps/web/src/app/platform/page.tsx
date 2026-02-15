import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { IconArrowRight, IconTerminal } from '@/components/icons/ZeoIcons';
import { getAllPanelConfigs } from '@/lib/panel-config';
import type { PanelConfig } from '@/lib/panel-config';

export const metadata = {
  title: 'Platform | Zeo',
  description: 'Explore Zeo platform capabilities including governance dashboards, decision branching, uncertainty tracking, and epistemic tooling.',
};

interface Capability {
  title: string;
  description: string;
  panelSlug: string;
  illustration: string | null;
  illustrationAlt: string;
  illustrationW: number;
  illustrationH: number;
}

function buildCapabilities(panels: PanelConfig[]): Capability[] {
  return panels.map(p => ({
    title: p.title,
    description: p.description,
    panelSlug: p.slug,
    illustration: null,
    illustrationAlt: '',
    illustrationW: 0,
    illustrationH: 0,
  }));
}

const techFeatures = [
  {
    title: 'Deterministic Execution',
    description: 'Every analysis run is reproducible. Same inputs produce identical outputs, enabling reliable auditing.',
  },
  {
    title: 'Signed Evidence Bundles',
    description: 'Cryptographic signatures on evidence bundles create tamper-proof audit trails for compliance.',
  },
  {
    title: 'Confidence Intervals',
    description: 'All estimates carry explicit uncertainty ranges — never false precision on inherently uncertain data.',
  },
  {
    title: 'Policy-as-Code',
    description: 'Governance rules expressed as deterministic policy packs that gate decisions at CI time.',
  },
  {
    title: 'Provenance Tracking',
    description: 'Every fact records its source, retrieval timestamp, and integrity checksum for full traceability.',
  },
  {
    title: 'Replay & Audit',
    description: 'Re-run any past analysis with original inputs to verify conclusions and satisfy auditors.',
  },
];

export default function PlatformPage() {
  const panels = getAllPanelConfigs();
  const capabilities = buildCapabilities(panels);

  return (
    <PublicShell title="Platform">
      <div className="max-w-5xl space-y-12">
        <section className="max-w-3xl">
          <p className="text-lg leading-relaxed text-gray-700">
            Zeo combines governance dashboards, decision branching tools, and provenance-first evidence workflows in one static-safe product surface.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Product panels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <Link key={capability.panelSlug} href={`/product/${capability.panelSlug}/demo`} className="rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm">
                <h3 className="font-semibold text-blue-700">{capability.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{capability.description}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600">
                  <IconTerminal className="h-3.5 w-3.5" />
                  Try the CLI Live
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Technical features</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {techFeatures.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Interactive CLI demos</h2>
          <p className="mb-4 text-sm text-gray-600">Try Zeo commands directly in your browser. Deterministic output, no backend required.</p>
          <div className="grid gap-4 md:grid-cols-3">
            {panels.map((panel) => (
              <Link key={panel.slug} href={`/product/${panel.slug}/demo`} className="rounded-lg border border-gray-200 bg-gray-950 p-5 transition-all hover:border-blue-500 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <IconTerminal className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white">{panel.title}</h3>
                </div>
                <p className="mt-2 text-sm text-gray-400">{panel.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-blue-400">
                  Launch demo
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Link href="/stitch" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:shadow-md">
            Browse all panels
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </PublicShell>
  );
}
