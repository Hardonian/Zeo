import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { ButtonLink } from '@/components/ui';

export const metadata = buildMetadata({
  title: 'Dashboard',
  description: 'Access the Zeo authenticated workspace for governance dashboards and decision analysis.',
  canonicalPath: '/dashboard',
  noindex: true,
});

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Dashboard access</h1>
      <p className="mt-3 text-muted-foreground">This route is reserved for authenticated workspace sessions.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/" variant="outline">Return home</ButtonLink>
        <ButtonLink href="/quickstart">Open quickstart</ButtonLink>
      </div>
    </main>
  );
}
