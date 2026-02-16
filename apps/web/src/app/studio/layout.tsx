import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zeo Studio — Local Decision Workbench',
  description: 'Run, replay, diff, and export deterministic decision analyses. Local-first, fully offline.',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
