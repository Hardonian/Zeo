import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = { title: 'Login | Zeo' };

export default function SignInPage() {
  return (
    <PublicShell title="Sign in">
      <AuthCard mode="login" />
      <p className="mt-4 text-sm text-gray-600">Need an account? <Link href="/signup" className="text-blue-700 hover:underline">Sign up</Link>.</p>
    </PublicShell>
  );
}
