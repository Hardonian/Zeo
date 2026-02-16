import { PublicShell } from '@/components/site/PublicShell';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';
import { githubGuide, oauthEnvGuide } from '@/content/docs';

export const metadata = {
  title: 'GitHub Connection',
  description: 'Client-side setup guide for connecting Zeo workflows with GitHub App permissions and webhook security.',
};

export default function DocsGithubPage() {
  return (
    <PublicShell title="Connect Zeo to GitHub">
      <div className="max-w-4xl space-y-6">
        <p className="text-muted-foreground">
          Zeo&apos;s GitHub integration is configured through repository settings and local environment variables. This page does not require any hosted signup or secret exchange in the browser.
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          {githubGuide.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <Card id="oauth-environment-variables" className="p-5 scroll-mt-24">
          <h2 className="text-lg font-semibold text-foreground">OAuth environment variables</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure these public variables to make OAuth consent routing explicit across preview and production deployments.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-semibold">Variable</th>
                  <th className="px-3 py-2 font-semibold">Required</th>
                  <th className="px-3 py-2 font-semibold">Default</th>
                  <th className="px-3 py-2 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {oauthEnvGuide.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs text-foreground">{row.key}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.required}</td>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.defaultValue}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-foreground">Security notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li>Use least-privilege permissions for GitHub Apps and personal tokens.</li>
            <li>Never commit credentials to source control; keep values in .env files only.</li>
            <li>Rotate credentials after team changes or suspected exposure.</li>
          </ul>
        </Card>
      </div>
    </PublicShell>
  );
}
