'use client';

import { FormEvent, useState } from 'react';
import { PublicShell } from '@/components/site/PublicShell';


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address before opening your mail client.');
      return;
    }

    setError('');
    const subject = encodeURIComponent('Zeo signup request');
    const body = encodeURIComponent(`Name: ${name || 'Not provided'}\nEmail: ${email}\nUse case: `);
    window.location.href = `mailto:hello@zeo.dev?subject=${subject}&body=${body}`;
  }

  return (
    <PublicShell title="Sign up / waitlist">
      <div className="max-w-3xl space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Email signup (no backend required)</h2>
          <p className="mt-2 text-sm text-gray-600">
            This form opens your local mail client with a pre-filled request. Zeo does not collect browser-submitted secrets on this page.
          </p>
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <label className="block text-sm">
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" />
            </label>
            <label className="block text-sm">
              Work email
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2" required />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Open email draft</button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Join via GitHub</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-sm text-gray-600">
            <li>Star and watch the repository for releases and roadmap updates.</li>
            <li>Open or comment on GitHub Discussions to share your use case.</li>
            <li>Track changelog entries to evaluate readiness for your workflow.</li>
          </ul>
          <a href="https://github.com/scott/zeo" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-blue-700 hover:underline">
            Visit github.com/scott/zeo →
          </a>
        </section>
      </div>
    </PublicShell>
  );
}
