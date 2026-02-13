import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { installMethods } from '@/content/docs';

export const metadata = {
  title: 'Install | Zeo',
  description: 'Install Zeo with the supported pnpm workflow and verify the local environment.',
};

export default function InstallPage() {
  return (
    <PublicShell title="Install Zeo">
      <div className="max-w-3xl space-y-4 text-gray-700">
        <p>Use the repository-supported setup to keep builds deterministic across local and preview environments.</p>
        <pre className="overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">{installMethods.packageManager.join('\n')}</pre>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/install" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Full install guide</Link>
          <Link href="/docs/quickstart" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Quickstart</Link>
        </div>
      </div>
    </PublicShell>
  );
}
