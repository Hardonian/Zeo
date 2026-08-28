import { buildMetadata } from '@/lib/seo/metadata';
import { AppShell } from './AppShell';

export const metadata = buildMetadata({
  title: 'Zeo Dashboard',
  description: 'Private Zeo decision runtime dashboard for jobs, approvals, and governance status.',
  canonicalPath: '/app',
  noindex: true,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
