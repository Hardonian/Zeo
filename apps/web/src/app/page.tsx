import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export default function Home() {
  return (
    <PublicShell title="Decision intelligence under uncertainty">
      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Fact</h2>
          <p className="mt-2 text-sm text-gray-600">Public pages render without authentication and without backend dependencies.</p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Belief</h2>
          <p className="mt-2 text-sm text-gray-600">Most teams get better outcomes by making assumptions explicit and sensitivity visible.</p>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Unknown</h2>
          <p className="mt-2 text-sm text-gray-600">New evidence can change the preferred option; Zeo keeps provenance for every claim.</p>
        </article>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Quickstart</Link>
        <Link href="/demo" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Panel Demo</Link>
        <Link href="/stitch" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Browse Stitch Pages</Link>
      </div>
    </PublicShell>
  );
}
