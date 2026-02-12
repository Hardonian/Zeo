import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getStitchHtml, getStitchPages } from '@/lib/stitch';

export async function generateStaticParams() {
  const pages = await getStitchPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export default async function StitchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getStitchHtml(slug);

  if (!page) {
    return (
      <PublicShell title="Stitch page unavailable">
        <p className="text-gray-700">This stitch page does not exist or could not be loaded.</p>
        <Link href="/stitch" className="mt-4 inline-block text-blue-700 hover:underline">Back to stitch index</Link>
      </PublicShell>
    );
  }

  return (
    <PublicShell title={page.title}>
      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <iframe title={page.title} srcDoc={page.html} className="h-[900px] w-full" sandbox="allow-scripts allow-same-origin" />
      </div>
    </PublicShell>
  );
}
