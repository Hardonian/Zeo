import { PublicShell } from '@/components/site/PublicShell';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';
import { installMethods } from '@/content/docs';
import { CopyButton } from '@/components/public/CopyButton';

export const metadata = {
  title: 'Install',
  description: 'Install Zeo with the repository-supported pnpm workflow and verify your environment.',
};

export default function InstallPage() {
  return (
    <PublicShell title="Install Zeo">
      <div className="max-w-4xl space-y-6">
        <p className="text-muted-foreground">
          Zeo currently supports a pnpm-based install from source. Use the pinned toolchain versions from package.json to keep builds deterministic.
        </p>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground">macOS / Linux / Windows (Node + pnpm)</h2>
          <div className="mt-3 flex justify-end">
            <CopyButton text={`node --version\npnpm --version\n${installMethods.packageManager.join('\n')}`} label="Copy install commands" />
          </div>
          <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">
{`node --version
pnpm --version
${installMethods.packageManager.join('\n')}`}
          </pre>
          <p className="mt-3 text-sm text-muted-foreground">
            Windows users can run the same commands in PowerShell after installing Node and pnpm.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground">Run diagnostics</h2>
          <div className="mt-3 flex justify-end">
            <CopyButton text={installMethods.diagnostics} label="Copy diagnostics command" />
          </div>
          <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">{installMethods.diagnostics}</pre>
          <p className="mt-3 text-sm text-muted-foreground">This checks local setup and integration prerequisites before you run the app.</p>
        </Card>
      </div>
    </PublicShell>
  );
}
