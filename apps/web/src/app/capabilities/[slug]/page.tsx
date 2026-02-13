import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { getCapabilityHtml, getCapabilityPages } from '@/lib/capabilities';

export async function generateStaticParams() {
  const pages = await getCapabilityPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export default async function CapabilityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getCapabilityHtml(slug);

  if (!page) {
    return (
      <PublicShell title="Page unavailable">
        <p className="text-gray-700">This capability documentation does not exist or could not be loaded.</p>
        <Link href="/capabilities" className="mt-4 inline-block text-blue-700 hover:underline">Back to capabilities</Link>
      </PublicShell>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-8 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/capabilities"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight">{page.title}</h1>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-widest">{page.category}</p>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                Live Preview
             </div>
          </div>
        </div>
      </header>

      <main className="w-full">
        <div className="bg-white rounded-none shadow-none overflow-hidden">
          <iframe
            title={page.title}
            srcDoc={page.html}
            className="w-full h-[calc(100vh-65px)] border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </main>
    </div>
  );
}
