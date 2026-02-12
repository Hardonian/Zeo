import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchPagesByCategory } from '@/lib/stitch';

export default async function StitchIndexPage() {
  const pagesByCategory = await getStitchPagesByCategory();
  const categories = Object.keys(pagesByCategory).sort();

  return (
    <PublicShell title="Stitch Panel Gallery">
      <p className="mb-6 text-gray-700">
        Interactive UI panels generated from Google Stitch exports. These pages demonstrate 
        Zeo&apos;s governance, decision intelligence, and epistemic tooling capabilities.
      </p>
      
      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{category}</h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {pagesByCategory[category].map((page) => (
              <li key={page.slug} className="rounded border border-gray-200 bg-white p-4 hover:border-blue-300 transition-colors">
                <Link 
                  className="block text-blue-700 hover:underline font-medium" 
                  href={`/stitch/${page.slug}`}
                >
                  {page.title}
                </Link>
                <span className="text-xs text-gray-500 mt-1 block">{page.category}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </PublicShell>
  );
}
