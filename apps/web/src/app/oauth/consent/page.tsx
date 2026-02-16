import Link from 'next/link';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { PublicShell } from '@/components/site/PublicShell';
import { ButtonLink, Card } from '@/components/ui';
import { OAUTH_DEFAULT_PROVIDER, OAUTH_REDIRECT_TO } from '@/content/site';

export const metadata = buildMetadata({
  title: 'OAuth Consent',
  description: 'Sign in with Supabase-hosted OAuth consent for Zeo.',
  canonicalPath: '/oauth/consent',
  noindex: true,
});

function getAuthorizeUrl(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return null;
  }

  const normalizedBase = supabaseUrl.replace(/\/$/, '');
  const provider = encodeURIComponent(OAUTH_DEFAULT_PROVIDER);
  const redirectTo = encodeURIComponent(OAUTH_REDIRECT_TO);
  return `${normalizedBase}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
}

export default function OauthConsentPage() {
  const authorizeUrl = getAuthorizeUrl();

  return (
    <PublicShell title="OAuth consent">
      <Card className="max-w-3xl space-y-6 p-6">
        <p className="text-muted-foreground">
          Authentication is managed by Supabase OAuth. Continue to hosted consent to complete sign-in.
        </p>

        {authorizeUrl ? (
          <ButtonLink href={authorizeUrl} external>
            Continue with {OAUTH_DEFAULT_PROVIDER}
          </ButtonLink>
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Supabase OAuth is not configured in this environment. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> to enable hosted consent.
            <div className="mt-2">
              <Link href="/docs/github#oauth-environment-variables" className="font-medium text-amber-900 underline hover:text-amber-700">
                View OAuth environment variable reference
              </Link>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Need setup instructions? <Link href="/docs/github" className="font-medium text-primary hover:underline">Read the GitHub + auth guide</Link>.
        </p>
      </Card>
    </PublicShell>
  );
}
