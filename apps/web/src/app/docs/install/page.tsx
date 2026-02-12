import { PublicShell } from '@/components/site/PublicShell';
import { installMethods } from '@/content/docs';

export const metadata = {
  title: 'Install | Zeo Docs',
  description: 'Install Zeo with the repository-supported pnpm workflow and verify your environment.',
};

export default function InstallPage() {
  return (
    <PublicShell title="Install Zeo">
      <div className="max-w-4xl space-y-6 text-gray-700">
        <p>
          Zeo currently supports a pnpm-based install from source. Use the pinned toolchain versions from package.json to keep builds deterministic.
        </p>
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">macOS / Linux / Windows (Node + pnpm)</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
{`node --version
pnpm --version
${installMethods.packageManager.join('\n')}`}
          </pre>
          <p className="mt-3 text-sm">
            Windows users can run the same commands in PowerShell after installing Node and pnpm.
          </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Run diagnostics</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">{installMethods.diagnostics}</pre>
          <p className="mt-3 text-sm">This checks local setup and integration prerequisites before you run the app.</p>
        </section>
      </div>
    </PublicShell>
  );
}
