import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Status',
  description: 'Static system status and troubleshooting pointers for Zeo local and hosted workflows.',
};

export default function StatusPage() {
  return (
    <PublicShell title="Status & troubleshooting">
      <div className="max-w-4xl space-y-5">
        <Card className="border-emerald-200 bg-emerald-50/60 p-5">
          <h2 className="font-semibold text-emerald-800">Current status: Operational</h2>
          <p className="mt-2 text-sm text-emerald-900">No active incidents are published in this static status page. For live issue reports, use GitHub Issues.</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold text-foreground">If Zeo is not starting</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li>Run <code className="rounded bg-muted px-1">pnpm doctor</code> to identify missing tools or env variables.</li>
            <li>Verify Node 20.11.0 and pnpm 9.15.5.</li>
            <li>Rebuild workspace packages with <code className="rounded bg-muted px-1">pnpm -r build</code>.</li>
          </ul>
        </Card>
      </div>
    </PublicShell>
  );
}
