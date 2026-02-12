import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Pricing | Zeo',
  description: 'Static-first pricing overview for Zeo deployments.',
};

export default function PricingPage() {
  return (
    <PublicShell title="Pricing">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Community</h2>
          <p className="mt-2 text-sm text-gray-600">Open-source usage with local deployment and self-managed provenance storage.</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Enterprise</h2>
          <p className="mt-2 text-sm text-gray-600">Policy packs, governance integrations, and audit-focused rollout support.</p>
        </div>
      </div>
    </PublicShell>
  );
}
