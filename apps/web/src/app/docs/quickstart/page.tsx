import { PublicShell } from '@/components/site/PublicShell';
import { installMethods, quickstartSteps } from '@/content/docs';

export const metadata = {
  title: 'Quickstart | Zeo Docs',
  description: 'Run Zeo in local web and CLI modes with repository-verified commands.',
};

export default function DocsQuickstartPage() {
  return (
    <PublicShell title="Quickstart">
      <div className="max-w-4xl space-y-6">
        <p className="text-gray-700">
          Use this flow when you want a stable local run with diagnostics before launching either the web app or CLI examples.
        </p>
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Recommended flow</h2>
          <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-4 text-sm text-gray-100">{quickstartSteps.join('\n')}</pre>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="font-semibold">CLI example</h3>
            <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">{installMethods.quickstartCli}</pre>
          </article>
          <article className="rounded-lg border border-gray-200 bg-white p-5">
            <h3 className="font-semibold">Replay demo</h3>
            <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">{installMethods.quickstartDemo}</pre>
          </article>
        </section>
      </div>
    </PublicShell>
  );
}
