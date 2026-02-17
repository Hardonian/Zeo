import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { installMethods, troubleshooting } from '@/content/docs';
import { CTASection, Section, uiTokens } from '@/components/site/ui-system';

export const metadata = buildMetadata({
  title: 'Docs | Zeo',
  description: 'Install, quickstart, GitHub integration, and troubleshooting for the Zeo CLI and web workspace.',
  canonicalPath: '/docs',
});

const docLinks = [
  { href: '/docs/install', title: 'Install', description: 'Set up dependencies and build the workspace.' },
  { href: '/docs/quickstart', title: 'Quickstart', description: 'Run Zeo locally in web and CLI modes.' },
  { href: '/docs/github', title: 'GitHub Connection', description: 'Configure app permissions and secure webhooks.' },
];

export default function DocsIndexPage() {
  return (
    <PublicShell title="Documentation">
      <div className={`${uiTokens.pageStack} max-w-5xl`}>
        <Section>
          <p className="text-sm leading-7 text-slate-700 md:text-base">
            Zeo is a governance and evidence-mapping platform for decisions under uncertainty. The CLI handles policy and analysis workflows, while this site provides static-first onboarding, docs, and support paths.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-700">
            <li>Deterministic policy evaluation and audit-friendly evidence bundles.</li>
            <li>CLI and web flows for governance checks, replay analysis, and provenance review.</li>
            <li>GitHub integration options for checks and webhook processing.</li>
          </ul>
        </Section>

        <section className="grid gap-4 md:grid-cols-3">
          {docLinks.map((entry) => (
            <Link key={entry.href} href={entry.href} className={`${uiTokens.card} transition-all hover:border-blue-300 hover:shadow-sm`}>
              <h2 className="text-lg font-semibold text-slate-900">{entry.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{entry.description}</p>
            </Link>
          ))}
        </section>

        <Section>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Most used commands</h2>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
{`pnpm install
pnpm -r build
${installMethods.diagnostics}
${installMethods.quickstartWeb}`}
          </pre>
        </Section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Troubleshooting</h2>
          <div className="mt-3 space-y-3">
            {troubleshooting.map((entry) => (
              <article key={entry.issue} className={uiTokens.card}>
                <h3 className="font-semibold text-slate-900">{entry.issue}</h3>
                <p className="mt-1 text-sm text-slate-600">{entry.resolution}</p>
              </article>
            ))}
          </div>
        </section>

        <CTASection
          title="Ready to run Zeo?"
          description="Use quickstart for the fastest local validation path, then connect GitHub for policy-aware workflows."
          primaryHref="/docs/quickstart"
          primaryLabel="Open quickstart"
          secondaryHref="/github"
          secondaryLabel="Connect GitHub"
        />
      </div>
    </PublicShell>
  );
}
