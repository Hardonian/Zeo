import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Zeo Studio — Local Decision Workbench',
  description: 'Run, replay, diff, and export deterministic decision analyses. Local-first, fully offline.',
  canonicalPath: '/studio',
  noindex: true,
});

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
