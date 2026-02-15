import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { IconTerminal, IconArrowRight } from '@/components/icons/ZeoIcons';
import { getAllPanelConfigs } from '@/lib/panel-config';

export const metadata = {
  title: 'Product Demos | Zeo',
  description: 'Try Zeo CLI demos directly in your browser. Deterministic output, no backend required.',
};

export default function ProductPage() {
  const panels = getAllPanelConfigs();

  return (
    <PublicShell title="Product Demos">
      <div className="max-w-4xl space-y-8">
        <p className="text-lg text-gray-700">
          Try Zeo commands directly in your browser. Every demo runs deterministic analysis with sample data — no backend, no account required.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {panels.map(panel => (
            <Link
              key={panel.slug}
              href={`/product/${panel.slug}/demo`}
              className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <IconTerminal className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{panel.title}</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600">{panel.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 transition-colors group-hover:text-blue-700">
                Try the CLI Live
                <IconArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div>
          <Link href="/platform" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Platform Overview
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
