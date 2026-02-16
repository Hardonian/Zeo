import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Quickstart',
  description: 'Get started with Zeo quickly. Follow the canonical quickstart guide.',
};

export default function QuickStartPage() {
  return (
    <PublicShell title="Quickstart">
      <Card className="p-6">
        <p className="text-muted-foreground">
          The canonical quickstart guide now lives under the docs section.
        </p>
        <Link href="/docs/quickstart" className="mt-3 inline-block font-medium text-primary hover:underline">
          Go to /docs/quickstart →
        </Link>
      </Card>
    </PublicShell>
  );
}
