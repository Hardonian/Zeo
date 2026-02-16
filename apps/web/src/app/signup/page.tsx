import { buildMetadata } from '@/lib/seo/metadata';
import { OAUTH_CONSENT_URL } from '@/content/site';
import { PublicShell } from '@/components/site/PublicShell';
import { AuthCard } from '@/components/auth/AuthCard';
import { ButtonLink } from '@/components/ui';

export const metadata = buildMetadata({
  title: 'Sign up',
  description: 'Create a Zeo account to access governance workflows and workspace features.',
  canonicalPath: '/signup',
  noindex: true,
});

export default function SignUpPage() {
  return (
    <PublicShell title="Create account">
      <AuthCard mode="signup" />
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?
        <ButtonLink href={OAUTH_CONSENT_URL} variant="ghost" size="sm" className="ml-2 inline-flex">Sign in</ButtonLink>
      </p>
    </PublicShell>
  );
}
