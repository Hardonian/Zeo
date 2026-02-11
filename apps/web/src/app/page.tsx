import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Zeo <span className="text-blue-600">Accountability Layer</span>
        </h1>
        <p className="text-lg text-gray-600">
          Deterministic decision intelligence with replayable evidence. Policy-aware, local-first, and gracefully degrading.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/quickstart"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Quick Start
          </Link>
          <Link
            href="/demo"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Open Demo
          </Link>
          <Link
            href="/intake"
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            New Intake
          </Link>
          <a
            href="https://github.com/anomalyco/Zeo"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>

        <section className="pt-8 border-t border-gray-200 text-left">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Try in 60 seconds</h2>
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <p className="text-sm"><code>zeo help start</code></p>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li><code>zeo analyze-pr examples/analyze-pr-auth/diff.patch</code></li>
              <li><code>zeo view &lt;run_id&gt; --persona exec</code></li>
              <li><code>zeo export bundle --decision &lt;decision_id&gt;</code></li>
            </ol>
            <Link href="/view/example" className="inline-block rounded border px-3 py-1 text-sm">Load example dashboard</Link>
          </div>
        </section>

        <section className="pt-8 border-t border-gray-200 text-left">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Live Example</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
            <p className="text-sm text-gray-700"><strong>Start here:</strong> <code>zeo analyze-pr examples/analyze-pr-auth/diff.patch --policy packs/security-review-pack/pack.json --explain</code></p>
            <div className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
              {`=== Accountability summary ===\nrisk score: 64\nMust review:\n- [high] src/auth/session.ts: Authentication or session surface changed\nPolicy triggers:\n- security-review-required\nReplay hash: <manifest-hash>`}
            </div>
            <p className="text-xs text-gray-600">Zeo Verified (replayable): outputs include run_id and hash manifest for deterministic replay.</p>
          </div>
        </section>

        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Governance (New)
          </h2>
          <div className="grid grid-cols-2 gap-4 text-left">
            <Link href="/audit" className="p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors">
              <h3 className="font-medium text-blue-900">Evidence Chain</h3>
              <p className="text-sm text-blue-700">Audit logs with tamper-evident cryptographic proofs</p>
            </Link>
            <Link href="/policy-packs" className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors">
              <h3 className="font-medium text-emerald-900">Policy Packs</h3>
              <p className="text-sm text-emerald-700">Enterprise governance and compliance as code</p>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
