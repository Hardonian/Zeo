import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export default function QuickStartPage() {
  return (
    <PublicShell title="Quickstart">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-700">Run Zeo locally in under a minute. This page is static-first and does not import server-only engines.</p>
        <ol className="list-decimal space-y-2 pl-5 text-gray-700">
          <li><code className="rounded bg-gray-100 px-1 py-0.5">pnpm install</code></li>
          <li><code className="rounded bg-gray-100 px-1 py-0.5">pnpm -r build</code></li>
          <li><code className="rounded bg-gray-100 px-1 py-0.5">pnpm -C apps/web dev</code></li>
        </ol>
        <div className="flex gap-3">
          <Link href="/demo" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Open demo panels</Link>
          <Link href="/view/example" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">View dashboard sample</Link>
        </div>
      </div>
    </PublicShell>
  );
}
