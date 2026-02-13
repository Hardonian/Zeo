import { PublicShell } from '@/components/site/PublicShell';
import { ZeoCliAssistLayer } from '@/components/panels/ZeoCliAssistLayer';
import { ZeoCliDemo } from '@/components/panels/ZeoCliDemo';

export const metadata = {
  title: 'CLI | Zeo',
  description: 'Zeo CLI: deterministic command planning, git diff awareness, key/token scoping, and intent validation.',
};

export default function CliPage() {
  return (
    <PublicShell title="Zeo CLI">
      <div className="max-w-4xl space-y-10">
        <section>
          <p className="text-gray-700 leading-relaxed">
            The Zeo CLI provides deterministic command execution with built-in guardrails.
            Every invocation is git-aware, token-scoped, and produces cryptographically
            signed evidence bundles for full auditability.
          </p>
        </section>

        {/* Key Capabilities */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium text-gray-900">Deterministic Execution</h3>
              <p className="text-sm text-gray-600 mt-1">
                Commands produce identical results given identical inputs. Every run generates
                a reproducible evidence bundle.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium text-gray-900">Git Diff Awareness</h3>
              <p className="text-sm text-gray-600 mt-1">
                The CLI understands your repository state: branch, uncommitted changes,
                ahead/behind counts, and dirty file tracking.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium text-gray-900">Key / Token Isolation</h3>
              <p className="text-sm text-gray-600 mt-1">
                API keys and tokens are scoped per session. No cross-session leakage.
                Missing credentials are surfaced before execution.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium text-gray-900">Intent Validation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Before executing destructive operations, the CLI validates intent through
                flag suggestions, warnings, and confirmation gates.
              </p>
            </div>
          </div>
        </section>

        {/* CLI Assist Panel */}
        <section>
          <h2 className="text-lg font-semibold mb-4">CLI Assist Layer</h2>
          <p className="text-sm text-gray-600 mb-4">
            The assist layer shows command context, warnings, missing inputs, and suggested flags
            before execution.
          </p>
          <div className="max-w-md">
            <ZeoCliAssistLayer />
          </div>
        </section>

        {/* Interactive Demo */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Interactive Demo</h2>
          <p className="text-sm text-gray-600 mb-4">
            A simulated walkthrough of a deterministic audit flow. No backend calls or
            CLI execution occurs; this is a client-side demonstration only.
          </p>
          <ZeoCliDemo />
        </section>

        {/* Install */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-950 p-4 font-mono text-sm text-gray-300 space-y-1">
            <div><span className="text-blue-400">$</span> pnpm install</div>
            <div><span className="text-blue-400">$</span> pnpm -C apps/cli start -- --example negotiation</div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
