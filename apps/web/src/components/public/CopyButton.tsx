'use client';

import { useState } from 'react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');

  async function handleCopy() {
    if (!navigator?.clipboard) {
      setStatus('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 1800);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2200);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
      aria-live="polite"
    >
      {status === 'done' ? 'Copied' : status === 'error' ? 'Copy unavailable' : label}
    </button>
  );
}
