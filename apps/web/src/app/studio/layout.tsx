import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Zeo Studio',
  description: 'Interactive studio for deterministic decision intelligence workflows in Zeo.',
  canonicalPath: '/studio',
  noindex: true,
});

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
