'use client';

import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { WebCLISandbox } from '@/components/WebCLISandbox';
import { getPanelDemo, getAllPanelDemos } from '@/lib/panel-config';
import { IconTerminal } from '@/components/icons/ZeoIcons';

export default function PanelDemoPage() {
  const params = useParams<{ panel: string }>();
  const searchParams = useSearchParams();
  const slug = params.panel;
  const panel = getPanelDemo(slug);
  const initialCmd = searchParams.get('cmd') || undefined;

  if (!panel) {
    const allPanels = getAllPanelDemos();
    return (
      <PublicShell title="Demo Not Found">
        <div className="max-w-2xl">
          <p className="text-gray-600">
            No demo available for &quot;{slug}&quot;.
          </p>
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Available demos:</p>
            {allPanels.map(p => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}/demo`}
                className="block rounded border border-gray-200 bg-white px-4 py-3 text-sm transition-colors hover:border-blue-300"
              >
                <span className="font-medium text-blue-700">{p.title}</span>
                <span className="ml-2 text-gray-500">{p.description}</span>
              </Link>
            ))}
          </div>
          <Link href="/platform" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
            &larr; Back to Product
          </Link>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell title={`${panel.title} — CLI Demo`}>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <IconTerminal className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{panel.title}</h2>
            <p className="text-sm text-gray-600">{panel.description}</p>
          </div>
        </div>

        <WebCLISandbox panel={panel} initialCmd={initialCmd} />

        <div className="mt-6 flex items-center justify-between">
          <Link href="/platform" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Product
          </Link>
          <span className="text-xs text-gray-400">
            All output is deterministic. Same command, same result.
          </span>
        </div>
      </div>
    </PublicShell>
  );
}
