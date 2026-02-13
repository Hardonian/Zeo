import { PublicShell } from '@/components/site/PublicShell';
import { ZeoRuntimeStatusPanel } from '@/components/panels/ZeoRuntimeStatusPanel';
import { ZeoCliDemo } from '@/components/panels/ZeoCliDemo';

export const metadata = {
  title: 'Runtime | Zeo',
  description: 'Zeo runtime visibility: CLI hot path state, MCP handshake monitoring, token usage, and command latency.',
};

const RUNTIME_METRICS = [
  {
    title: 'CLI Hot Path State',
    description: 'Real-time visibility into the active CLI session: current command, execution stage, and completion status.',
  },
  {
    title: 'MCP Handshake Indicator',
    description: 'Connection health for MCP server integration. Shows protocol version, last handshake time, and server endpoint.',
  },
  {
    title: 'Token Usage Snapshot',
    description: 'Per-session token consumption tracking. Input/output token counts, model selection, and budget utilization.',
  },
  {
    title: 'Command Latency',
    description: 'End-to-end latency measurement for CLI operations. Tracks execution time, network overhead, and processing stages.',
  },
];

export default function RuntimePage() {
  return (
    <PublicShell title="Runtime Status">
      <div className="max-w-4xl space-y-10">
        <section>
          <p className="text-gray-700 leading-relaxed">
            The Zeo runtime provides full visibility into CLI execution, MCP server state,
            and resource consumption. All metrics are available locally without requiring
            external telemetry infrastructure.
          </p>
        </section>

        {/* Metrics */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Runtime Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {RUNTIME_METRICS.map((metric) => (
              <div key={metric.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-gray-900">{metric.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Runtime Status Panel */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Status Panel</h2>
          <p className="text-sm text-gray-600 mb-4">
            Live view of CLI session state, MCP connection health, and token budget.
          </p>
          <ZeoRuntimeStatusPanel />
        </section>

        {/* CLI Demo */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Execution Demo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Simulated CLI execution showing the full lifecycle: command planning,
            guard confirmation, and runtime status updates.
          </p>
          <ZeoCliDemo />
        </section>

        {/* Future Path */}
        <section className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Future Visibility</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Optional hosted coordination layer for cross-machine runtime aggregation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Enterprise audit dashboard with historical runtime metrics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">&#9702;</span>
              <span>Secure key orchestration visibility across deployment environments</span>
            </li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
