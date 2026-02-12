import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Sign In | Zeo',
  description: 'Sign in to access authenticated Zeo workspace routes.',
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/dashboard';

  return (
    <PublicShell title="Sign in">
      <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-600">
          Sign in to access workspace routes such as dashboard, inbox, policy packs, and audit views.
        </p>
        <form action="/api/auth/signin" method="post" className="mt-4 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
          </label>
          <label className="block text-sm">
            Access key (optional)
            <input name="accessKey" type="password" className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
          </label>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Sign in
          </button>
        </form>
      </div>
    </PublicShell>
  );
}
