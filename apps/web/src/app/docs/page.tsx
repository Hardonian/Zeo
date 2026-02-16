import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { Card } from '@/components/ui';
import { installMethods, troubleshooting } from '@/content/docs';

export const metadata = buildMetadata({
  title: 'Docs',
  description: 'Install, quickstart, GitHub integration, and troubleshooting for the Zeo CLI and web workspace.',
  canonicalPath: '/docs',
});

export default function DocsIndexPage() {
  return (
    <PublicShell title="Documentation">
      <div className="space-y-8 max-w-4xl">
        <p className="text-muted-foreground">
          Zeo is a governance and evidence-mapping platform for decisions under uncertainty. The CLI handles policy and analysis workflows, while this site provides static-first onboarding, docs, and support paths.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Deterministic policy evaluation and audit-friendly evidence bundles.</li>
          <li>CLI and web flows for governance checks, replay analysis, and provenance review.</li>
          <li>GitHub integration options for checks and webhook processing.</li>
        </ul>

        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/docs/install" className="group">
            <Card className="h-full p-4 transition-colors hover:border-primary/40">
              <h2 className="font-semibold text-foreground">Install</h2>
              <p className="mt-2 text-sm text-muted-foreground">Set up dependencies and build the workspace.</p>
            </Card>
          </Link>
          <Link href="/docs/quickstart" className="group">
            <Card className="h-full p-4 transition-colors hover:border-primary/40">
              <h2 className="font-semibold text-foreground">Quickstart</h2>
              <p className="mt-2 text-sm text-muted-foreground">Run Zeo locally in web and CLI modes.</p>
            </Card>
          </Link>
          <Link href="/docs/github" className="group">
            <Card className="h-full p-4 transition-colors hover:border-primary/40">
              <h2 className="font-semibold text-foreground">GitHub Connection</h2>
              <p className="mt-2 text-sm text-muted-foreground">Configure app permissions and secure webhooks.</p>
            </Card>
          </Link>
        </section>

        <Card className="p-5">
          <h2 className="text-xl font-semibold text-foreground">Most used commands</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">
{`pnpm install
pnpm -r build
${installMethods.diagnostics}
${installMethods.quickstartWeb}`}
          </pre>
        </Card>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Troubleshooting</h2>
          <div className="mt-3 space-y-3">
            {troubleshooting.map((entry) => (
              <Card key={entry.issue} className="p-4">
                <h3 className="font-medium text-foreground">{entry.issue}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{entry.resolution}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
