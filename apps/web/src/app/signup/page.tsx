import { buildMetadata } from '@/lib/seo/metadata';
import { OAUTH_CONSENT_URL } from '@/content/site';
import { PublicShell } from '@/components/site/PublicShell';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = buildMetadata({
  title: 'Sign up | Zeo',
  description: 'Create a Zeo account to access governance workflows and workspace features.',
  canonicalPath: '/signup',
  noindex: true,
});

export default function SignUpPage() {
  return (
    <PublicShell title="Create account">
      <AuthCard mode="signup" />
      <p className="mt-4 text-sm text-gray-600">Already have an account? <a href={OAUTH_CONSENT_URL} className="text-blue-700 hover:underline">Sign in</a>.</p>
    </PublicShell>
  );
}
