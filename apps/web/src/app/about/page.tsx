import { PublicShell } from '@/components/site/PublicShell';

export default function AboutPage() {
  return (
    <PublicShell title="About Zeo">
      <p className="max-w-3xl text-gray-700">Zeo is an evidence-mapping workspace for decisions made under uncertainty. It focuses on provenance, confidence ranges, and sensitivity instead of single-point certainty claims.</p>
    </PublicShell>
  );
}
