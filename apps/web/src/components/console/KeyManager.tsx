'use client';

import { useState } from 'react';

type KeyRecord = { id: string; name: string; prefix: string; revoked_at: string | null };

export function KeyManager({ orgId, initialKeys }: { orgId: string; initialKeys: KeyRecord[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState('');
  const [plaintext, setPlaintext] = useState<string | null>(null);

  async function createKey() {
    const res = await fetch('/api/app/keys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId, name }) });
    const payload = await res.json();
    if (payload.record) {
      setKeys([payload.record, ...keys]);
      setPlaintext(payload.key);
      setName('');
    }
  }

  async function revokeKey(keyId: string) {
    await fetch('/api/app/keys', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ orgId, keyId }) });
    setKeys(keys.map((key) => (key.id === keyId ? { ...key, revoked_at: new Date().toISOString() } : key)));
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4 space-x-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border px-3 py-2" placeholder="Key name" />
        <button onClick={createKey} className="rounded bg-blue-600 px-3 py-2 text-white">Create key</button>
      </div>
      {plaintext ? <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">New API key (shown once): <code>{plaintext}</code></div> : null}
      <ul className="rounded border bg-white p-4 space-y-2">{keys.map((k) => <li key={k.id} className="flex items-center justify-between text-sm"><span>{k.name} ({k.prefix}...){k.revoked_at ? ' revoked' : ''}</span>{k.revoked_at ? null : <button onClick={() => revokeKey(k.id)} className="rounded border px-2 py-1">Revoke</button>}</li>)}</ul>
    </div>
  );
}
