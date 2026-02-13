'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(mode === 'signup' ? '/api/auth/signup' : '/api/auth/signin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error ?? 'Authentication failed');
      setLoading(false);
      return;
    }

    router.replace('/app');
    window.location.reload();
  }

  return (
    <div className="max-w-lg rounded-lg border border-gray-200 bg-white p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm">Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        <label className="block text-sm">Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
