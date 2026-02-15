import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { PublicShell } from '@/components/site/PublicShell';
import { OAUTH_CONSENT_URL } from '@/content/site';

export const metadata = buildMetadata({
  title: 'Sign in | Zeo',
  description: 'Sign in to access authenticated Zeo governance and decision workspaces.',
  canonicalPath: '/signin',
  noindex: true,
});

export default function SignInPage() {
  return (
    <PublicShell title="Sign in">
      <div className="max-w-3xl space-y-4 text-gray-700">
        <p>
          Sign-in is managed through Supabase OAuth consent.
        </p>
        <a href={OAUTH_CONSENT_URL} className="inline-flex rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Continue to OAuth consent
        </a>
        <p className="text-sm text-gray-600">
          Need an account? <Link href="/signup" className="text-blue-700 hover:underline">Sign up</Link>.
        </p>
      </div>
    </PublicShell>
  );
}
