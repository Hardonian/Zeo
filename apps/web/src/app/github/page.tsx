import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { ButtonLink, Card } from '@/components/ui';
import { GITHUB_REPO_URL } from '@/content/site';

export const metadata = {
  title: 'GitHub Connect',
  description: 'Connect Zeo workflows to GitHub with least-privilege permissions and webhook safeguards.',
};

export default function GithubPage() {
  return (
    <PublicShell title="Connect with GitHub">
      <div className="max-w-3xl space-y-4">
        <p className="text-muted-foreground">Configure Zeo integrations through repository settings and local environment variables; no sign-in is required to read setup guidance.</p>
        <Card className="p-5">
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/docs/github">Open GitHub setup</ButtonLink>
            <ButtonLink href={GITHUB_REPO_URL} external variant="outline">View source on GitHub</ButtonLink>
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
