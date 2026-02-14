import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchPanelConfig, resolveStitchCapability, STITCH_PANELS } from '@/lib/stitch';

export async function generateStaticParams() {
  return STITCH_PANELS.map((panel) => ({ slug: panel.slug }));
}

export default async function StitchPanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const panel = getStitchPanelConfig(slug);
  const capability = await resolveStitchCapability(slug);

  if (!capability) {
    return (
      <PublicShell title="Panel unavailable">
        <div className="max-w-3xl space-y-4 text-gray-700">
          <p>
            This panel could not be resolved to a static export. Use the Stitch catalog to choose another panel route.
          </p>
          <Link href="/stitch" className="inline-flex text-sm font-medium text-blue-700 hover:underline">
            Back to Stitch panels
          </Link>
        </div>
      </PublicShell>
    );
  }

  const title = panel?.title ?? capability.title;

  return (
    <PublicShell title={title}>
      <div className="max-w-5xl space-y-6 text-gray-700">
        <p>{panel?.description ?? 'Static Stitch panel rendering with deterministic iframe isolation.'}</p>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">CLI workflow</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
            {(panel?.cliWorkflow ?? ['pnpm install', 'pnpm -C apps/web dev']).join('\n')}
          </pre>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-3">
          <iframe
            title={capability.title}
            srcDoc={capability.html}
            className="h-[70vh] w-full rounded border border-gray-100"
            sandbox="allow-scripts allow-same-origin"
          />
        </section>

        <div className="flex gap-4 text-sm">
          <Link href="/stitch" className="text-blue-700 hover:underline">Back to Stitch panels</Link>
          <Link href="/install" className="text-blue-700 hover:underline">CLI install</Link>
        </div>
      </div>
    </PublicShell>
  );
}
