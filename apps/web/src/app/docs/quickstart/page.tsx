import { PublicShell } from '@/components/site/PublicShell';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';
import { installMethods, quickstartSteps } from '@/content/docs';

export const metadata = {
  title: 'Quickstart',
  description: 'Run Zeo in local web and CLI modes with repository-verified commands.',
};

export default function DocsQuickstartPage() {
  return (
    <PublicShell title="Quickstart">
      <div className="max-w-4xl space-y-6">
        <p className="text-muted-foreground">
          Use this flow when you want a stable local run with diagnostics before launching either the web app or CLI examples.
        </p>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground">Recommended flow</h2>
          <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-gray-100">{quickstartSteps.join('\n')}</pre>
        </Card>
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-semibold text-foreground">CLI example</h3>
            <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">{installMethods.quickstartCli}</pre>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Replay demo</h3>
            <pre className="mt-3 overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">{installMethods.quickstartDemo}</pre>
          </Card>
        </section>
      </div>
    </PublicShell>
  );
}
