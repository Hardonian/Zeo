import { PublicShell } from '@/components/site/PublicShell';
import { ZeoRuntimeStatusPanel } from '@/components/panels/ZeoRuntimeStatusPanel';

export const metadata = {
  title: 'MCP | Zeo',
  description: 'Zeo MCP server integration: protocol handshake, tool registration, and runtime coordination.',
};

const MCP_CAPABILITIES = [
  {
    title: 'Protocol Handshake',
    description: 'Standardized MCP handshake with version negotiation, capability discovery, and connection health monitoring.',
  },
  {
    title: 'Tool Registration',
    description: 'CLI tools are registered as MCP-callable actions. Each tool declares its input schema, output contract, and side-effect profile.',
  },
  {
    title: 'Session Isolation',
    description: 'Each MCP session operates in an isolated context with scoped credentials. No shared mutable state between sessions.',
  },
  {
    title: 'Deterministic Responses',
    description: 'MCP tool invocations return deterministic results with evidence hashes. Responses are reproducible across identical inputs.',
  },
];

const PROTOCOL_DETAILS = [
  { label: 'Protocol Version', value: 'MCP v1.0' },
  { label: 'Transport', value: 'stdio / HTTP' },
  { label: 'Auth', value: 'Token-scoped per session' },
  { label: 'Health Check', value: 'Heartbeat every 2s' },
  { label: 'Tool Count', value: 'Dynamic (registry-based)' },
  { label: 'Evidence', value: 'SHA-256 attestation per call' },
];

export default function McpPage() {
  return (
    <PublicShell title="MCP Integration">
      <div className="max-w-4xl space-y-10">
        <section>
          <p className="text-gray-700 leading-relaxed">
            Zeo implements the Model Context Protocol (MCP) as a first-class integration layer.
            The MCP server exposes CLI capabilities as structured tools that can be invoked by
            any MCP-compatible client, with full determinism and evidence guarantees.
          </p>
        </section>

        {/* Capabilities */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Capabilities</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {MCP_CAPABILITIES.map((cap) => (
              <div key={cap.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="font-medium text-gray-900">{cap.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Protocol Details */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Protocol Details</h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="divide-y divide-gray-100">
              {PROTOCOL_DETAILS.map((detail) => (
                <div key={detail.label} className="flex justify-between items-center px-5 py-3">
                  <span className="text-sm text-gray-500">{detail.label}</span>
                  <span className="text-sm text-gray-900 font-medium">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Runtime Panel */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Runtime Status</h2>
          <p className="text-sm text-gray-600 mb-4">
            The runtime status panel shows MCP handshake state, token usage, and CLI session health.
          </p>
          <ZeoRuntimeStatusPanel />
        </section>

        {/* Architecture Note */}
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Architecture Boundary</h2>
          <p className="text-sm text-gray-600">
            The MCP server package (<code className="text-xs bg-gray-200 px-1 py-0.5 rounded">@zeo/mcp-server</code>)
            is a standalone process. It does not import from the marketing frontend or share
            runtime state with the web application. Communication happens exclusively through
            the MCP protocol layer.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}
