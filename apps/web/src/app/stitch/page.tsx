import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchPages } from '@/lib/stitch';

export default async function StitchIndexPage() {
  const pages = await getStitchPages();

  return (
    <PublicShell title="Stitch panel pages">
      <p className="mb-4 text-gray-700">These pages are generated from local Stitch HTML assets and served without authentication.</p>
      <ul className="grid gap-3 md:grid-cols-2">
        {pages.map((page) => (
          <li key={page.slug} className="rounded border border-gray-200 bg-white p-4">
            <Link className="text-blue-700 hover:underline" href={`/stitch/${page.slug}`}>{page.title}</Link>
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}
