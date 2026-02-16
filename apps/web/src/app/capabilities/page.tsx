import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';
import { getCapabilityPagesByCategory } from '@/lib/capabilities';

export const metadata = {
  title: 'Capabilities',
  description: 'Explore core features, key decisions, and KPIs that power the Zeo platform.',
};

export default async function CapabilitiesIndexPage() {
  const pagesByCategory = await getCapabilityPagesByCategory();
  const categories = Object.keys(pagesByCategory).sort();

  return (
    <PublicShell title="Platform Capabilities & Fundamentals">
      <div className="mb-12 max-w-3xl">
        <p className="text-lg text-muted-foreground leading-relaxed">
          Zeo provides a transparent, deterministic foundation for enterprise decision intelligence.
          Explore the key features, architectural decisions, and operational metrics that define our platform.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category) => (
          <section key={category}>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">{category}</h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pagesByCategory[category].map((page) => (
                <Link key={page.slug} href={`/capabilities/${page.slug}`} className="group">
                  <Card className="relative flex h-full flex-col overflow-hidden transition-transform group-hover:-translate-y-1">
                    <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {page.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
                        Explore the technical implementation and design decisions behind this capability.
                      </p>
                      <div className="mt-4 flex items-center text-xs font-medium text-primary uppercase tracking-wider">
                        View details
                        <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicShell>
  );
}
