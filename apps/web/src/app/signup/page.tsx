import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata = { title: 'Signup | Zeo' };

export default function SignUpPage() {
  return (
    <PublicShell title="Create account">
      <AuthCard mode="signup" />
      <p className="mt-4 text-sm text-gray-600">Already have an account? <Link href="/login" className="text-blue-700 hover:underline">Sign in</Link>.</p>
    </PublicShell>
  );
}
