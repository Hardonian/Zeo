import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';
import { STITCH_PANELS } from '@/lib/stitch';

export const metadata = {
  title: 'Stitch Panels',
  description: 'Static panel catalog for Stitch exports with CLI workflow references and resilient fallback routing.',
};

export default function StitchIndexPage() {
  return (
    <PublicShell title="Stitch Panels">
      <div className="max-w-5xl space-y-8">
        <p className="text-muted-foreground">
          Browse panel pages with static rendering and CLI workflow snippets. Each panel route resolves to the nearest available exported capability page to avoid dead-end links.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {STITCH_PANELS.map((panel) => (
            <Card key={panel.slug} className="p-5">
              <h2 className="text-lg font-semibold text-foreground">{panel.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{panel.description}</p>
              <Link href={`/stitch/${panel.slug}`} className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                Open panel page →
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
