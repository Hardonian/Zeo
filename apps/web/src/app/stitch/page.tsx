import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchPagesByCategory } from '@/lib/stitch';

export const metadata = {
  title: 'Stitch Gallery | Zeo',
  description: 'Browse all stitched Zeo panels rendered from repository HTML artifacts.',
};

export default async function StitchIndexPage() {
  const pagesByCategory = await getStitchPagesByCategory();
  const categories = Object.keys(pagesByCategory).sort();
  const totalPanels = Object.values(pagesByCategory).reduce((total, pages) => total + pages.length, 0);

  return (
    <PublicShell title="Stitch panel gallery">
      <p className="mb-6 text-gray-700">
        This gallery renders all Stitch panel HTML artifacts tracked in the repository. Each panel opens in a sandboxed iframe to preserve the original design and UX behavior.
      </p>
      <p className="mb-8 text-sm text-gray-500">{totalPanels} panel pages available across {categories.length} categories.</p>

      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{category}</h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pagesByCategory[category].map((page) => (
              <li key={page.slug} className="rounded border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300">
                <h3 className="font-medium text-gray-900">{page.title}</h3>
                <Link className="mt-2 inline-block text-sm text-blue-700 hover:underline" href={`/stitch/${page.slug}`}>
                  Open panel →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PublicShell>
  );
}
