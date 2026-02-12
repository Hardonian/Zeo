import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Status | Zeo',
  description: 'Static system status and troubleshooting pointers for Zeo local and hosted workflows.',
};

export default function StatusPage() {
  return (
    <PublicShell title="Status & troubleshooting">
      <div className="max-w-4xl space-y-5 text-gray-700">
        <section className="rounded-lg border border-green-200 bg-green-50 p-5">
          <h2 className="font-semibold text-green-800">Current status: Operational</h2>
          <p className="mt-2 text-sm text-green-900">No active incidents are published in this static status page. For live issue reports, use GitHub Issues.</p>
        </section>
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">If Zeo is not starting</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-sm">
            <li>Run <code className="rounded bg-gray-100 px-1">pnpm doctor</code> to identify missing tools or env variables.</li>
            <li>Verify Node 20.11.0 and pnpm 9.15.5.</li>
            <li>Rebuild workspace packages with <code className="rounded bg-gray-100 px-1">pnpm -r build</code>.</li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
