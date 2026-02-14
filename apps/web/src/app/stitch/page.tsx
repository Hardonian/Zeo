import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { STITCH_PANELS } from '@/lib/stitch';

export const metadata = {
  title: 'Stitch Panels | Zeo',
  description: 'Static panel catalog for Stitch exports with CLI workflow references and resilient fallback routing.',
};

export default function StitchIndexPage() {
  return (
    <PublicShell title="Stitch Panels">
      <div className="max-w-5xl space-y-8 text-gray-700">
        <p>
          Browse panel pages with static rendering and CLI workflow snippets. Each panel route resolves to the nearest available exported capability page to avoid dead-end links.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {STITCH_PANELS.map((panel) => (
            <article key={panel.slug} className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900">{panel.title}</h2>
              <p className="mt-2 text-sm">{panel.description}</p>
              <Link href={`/stitch/${panel.slug}`} className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:underline">
                Open panel page →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
