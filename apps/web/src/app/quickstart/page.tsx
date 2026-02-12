import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export default function QuickStartPage() {
  return (
    <PublicShell title="Quickstart">
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-700">
        <p>
          The canonical quickstart guide now lives under the docs section.
        </p>
        <Link href="/docs/quickstart" className="mt-3 inline-block text-blue-700 hover:underline">
          Go to /docs/quickstart →
        </Link>
      </div>
    </PublicShell>
  );
}
