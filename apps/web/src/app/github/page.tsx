import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { GITHUB_REPO_URL } from '@/content/site';

export const metadata = {
  title: 'GitHub Connect | Zeo',
  description: 'Connect Zeo workflows to GitHub with least-privilege permissions and webhook safeguards.',
};

export default function GithubPage() {
  return (
    <PublicShell title="Connect with GitHub">
      <div className="max-w-3xl space-y-4 text-gray-700">
        <p>Configure Zeo integrations through repository settings and local environment variables; no sign-in is required to read setup guidance.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/github" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Open GitHub setup</Link>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">View source on GitHub</a>
        </div>
      </div>
    </PublicShell>
  );
}
