import Link from 'next/link';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { PublicShell } from '@/components/site/PublicShell';
import { ButtonLink, Card } from '@/components/ui';
import { OAUTH_CONSENT_URL } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to access authenticated Zeo governance and decision workspaces.',
  canonicalPath: '/signin',
  noindex: true,
});

export default function SignInPage() {
  return (
    <PublicShell title="Sign in">
      <Card className="max-w-3xl space-y-4 p-6">
        <p className="text-muted-foreground">
          Sign-in is managed through Supabase OAuth consent.
        </p>
        <ButtonLink href={OAUTH_CONSENT_URL}>Continue to OAuth consent</ButtonLink>
        <p className="text-sm text-muted-foreground">
          Need an account? <Link href="/signup" className="font-medium text-primary hover:underline">Sign up</Link>.
        </p>
      </Card>
    </PublicShell>
  );
}
