import { PublicShell } from '@/components/site/PublicShell';
import { githubGuide } from '@/content/docs';

export const metadata = {
  title: 'GitHub Connection | Zeo Docs',
  description: 'Client-side setup guide for connecting Zeo workflows with GitHub App permissions and webhook security.',
};

export default function DocsGithubPage() {
  return (
    <PublicShell title="Connect Zeo to GitHub">
      <div className="max-w-4xl space-y-6 text-gray-700">
        <p>
          Zeo&apos;s GitHub integration is configured through repository settings and local environment variables. This page does not require any hosted signup or secret exchange in the browser.
        </p>
        <ol className="list-decimal space-y-2 pl-6">
          {githubGuide.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Security notes</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm">
            <li>Use least-privilege permissions for GitHub Apps and personal tokens.</li>
            <li>Never commit credentials to source control; keep values in .env files only.</li>
            <li>Rotate credentials after team changes or suspected exposure.</li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
