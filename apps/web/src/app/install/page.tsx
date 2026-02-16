import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { ButtonLink, Card } from '@/components/ui';
import { installMethods } from '@/content/docs';

export const metadata = {
  title: 'Install',
  description: 'Install Zeo with the supported pnpm workflow and verify the local environment.',
};

export default function InstallPage() {
  return (
    <PublicShell title="Install Zeo">
      <div className="max-w-3xl space-y-4">
        <p className="text-muted-foreground">Use the repository-supported setup to keep builds deterministic across local and preview environments.</p>
        <Card className="p-4">
          <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">{installMethods.packageManager.join('\n')}</pre>
        </Card>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/docs/install">Full install guide</ButtonLink>
          <ButtonLink href="/docs/quickstart" variant="outline">Quickstart</ButtonLink>
        </div>
      </div>
    </PublicShell>
  );
}
