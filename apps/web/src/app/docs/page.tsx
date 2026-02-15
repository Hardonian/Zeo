import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { installMethods, troubleshooting } from '@/content/docs';

export const metadata = buildMetadata({
  title: 'Docs | Zeo',
  description: 'Install, quickstart, GitHub integration, and troubleshooting for the Zeo CLI and web workspace.',
  canonicalPath: '/docs',
});

export default function DocsIndexPage() {
  return (
    <PublicShell title="Documentation">
      <div className="space-y-8 max-w-4xl">
        <p className="text-gray-700">
          Zeo is a governance and evidence-mapping platform for decisions under uncertainty. The CLI handles policy and analysis workflows, while this site provides static-first onboarding, docs, and support paths.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>Deterministic policy evaluation and audit-friendly evidence bundles.</li>
          <li>CLI and web flows for governance checks, replay analysis, and provenance review.</li>
          <li>GitHub integration options for checks and webhook processing.</li>
        </ul>

        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/install" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300">
            <h2 className="font-semibold">Install</h2>
            <p className="mt-2 text-sm text-gray-600">Set up dependencies and build the workspace.</p>
          </Link>
          <Link href="/docs/quickstart" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300">
            <h2 className="font-semibold">Quickstart</h2>
            <p className="mt-2 text-sm text-gray-600">Run Zeo locally in web and CLI modes.</p>
          </Link>
          <Link href="/docs/github" className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300">
            <h2 className="font-semibold">GitHub Connection</h2>
            <p className="mt-2 text-sm text-gray-600">Configure app permissions and secure webhooks.</p>
          </Link>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Most used commands</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">
{`pnpm install
pnpm -r build
${installMethods.diagnostics}
${installMethods.quickstartWeb}`}
          </pre>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Troubleshooting</h2>
          <div className="mt-3 space-y-3">
            {troubleshooting.map((entry) => (
              <article key={entry.issue} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium">{entry.issue}</h3>
                <p className="mt-1 text-sm text-gray-600">{entry.resolution}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
