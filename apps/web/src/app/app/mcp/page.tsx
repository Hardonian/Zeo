'use client';

import { useCallback, useEffect, useState } from 'react';

interface McpConnection {
  id: string;
  name: string;
  transport: string;
  endpoint: string;
  isEnabled: boolean;
  allowedTools: string[];
  notes: string;
  createdAt?: string;
}

interface ToolRegistryEntry {
  name: string;
  scope: 'read' | 'write' | 'admin';
  roleAccess: string[];
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  schemaPreview: string;
}

const SAMPLE_TOOLS: ToolRegistryEntry[] = [
  { name: 'zeo.flip_distance', scope: 'read', roleAccess: ['ANALYST', 'SIMULATOR'], riskLevel: 'low', requiresApproval: false, schemaPreview: '{ query: string, params?: Record<string, unknown> }' },
  { name: 'zeo.counterfactual_run', scope: 'read', roleAccess: ['ANALYST', 'SIMULATOR', 'EVIDENCE_PLANNER'], riskLevel: 'low', requiresApproval: false, schemaPreview: '{ scenario: string, variables: string[] }' },
  { name: 'zeo.evidence_plan', scope: 'read', roleAccess: ['EVIDENCE_PLANNER', 'SCRIBE'], riskLevel: 'low', requiresApproval: false, schemaPreview: '{ objective: string }' },
  { name: 'zeo.graph_simulate', scope: 'read', roleAccess: ['ANALYST', 'SIMULATOR'], riskLevel: 'medium', requiresApproval: false, schemaPreview: '{ graph: object, params: object }' },
  { name: 'zeo.governance_audit', scope: 'admin', roleAccess: ['GOVERNANCE_AUDITOR'], riskLevel: 'high', requiresApproval: true, schemaPreview: '{ runId: string, scope: string }' },
  { name: 'zeo.budget_check', scope: 'read', roleAccess: ['GOVERNANCE_AUDITOR'], riskLevel: 'low', requiresApproval: false, schemaPreview: '{ tenantId: string }' },
  { name: 'zeo.export_audit_pack', scope: 'write', roleAccess: ['SCRIBE', 'GOVERNANCE_AUDITOR'], riskLevel: 'medium', requiresApproval: true, schemaPreview: '{ runId: string, format: "json" | "pdf" }' },
  { name: 'external.webhook_notify', scope: 'write', roleAccess: ['SCRIBE'], riskLevel: 'medium', requiresApproval: true, schemaPreview: '{ url: string, payload: object }' },
];

export default function McpPage() {
  const [connections, setConnections] = useState<McpConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  const [toolSearch, setToolSearch] = useState('');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/mcp-connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(
          (data.connections ?? []).map((c: Record<string, unknown>) => ({
            id: c.id as string,
            name: c.name as string,
            transport: c.transport as string,
            endpoint: c.endpoint as string,
            isEnabled: c.is_enabled as boolean,
            allowedTools: (c.allowed_tools as string[]) ?? [],
            notes: (c.notes as string) ?? '',
            createdAt: c.created_at as string | undefined,
          })),
        );
      }
    } catch {
      // Graceful degradation — no connections available
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleToggle = useCallback(async (id: string) => {
    const conn = connections.find((c) => c.id === id);
    if (!conn) return;
    const updated = { ...conn, isEnabled: !conn.isEnabled };
    setConnections((prev) => prev.map((c) => (c.id === id ? updated : c)));
    // Save toggle would POST to API if backend supported PATCH
  }, [connections]);

  const filteredTools = SAMPLE_TOOLS.filter((t) => {
    const scopeMatch = scopeFilter === 'all' || t.scope === scopeFilter;
    const searchMatch = !toolSearch || t.name.toLowerCase().includes(toolSearch.toLowerCase());
    return scopeMatch && searchMatch;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MCP Configuration</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage Model Context Protocol connections and explore the tool registry.
        </p>
      </div>

      {/* MCP Connections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">MCP Connections</h2>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-indigo-700"
          >
            Add Connection
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-gray-400">No MCP connections configured.</p>
            <p className="mt-1 text-sm text-gray-400">Add a connection to integrate external tool providers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${conn.isEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{conn.name}</p>
                      <p className="text-xs text-gray-500">
                        {conn.transport} — {conn.endpoint.replace(/^https?:\/\//, '').slice(0, 40)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {conn.allowedTools.length} tool(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggle(conn.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        conn.isEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={conn.isEnabled}
                      aria-label={`Toggle ${conn.name}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                          conn.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {conn.notes && (
                  <p className="mt-2 text-xs text-gray-400">{conn.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tool Registry */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Tool Registry</h2>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={toolSearch}
            onChange={(e) => setToolSearch(e.target.value)}
            placeholder="Search tools..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All scopes</option>
            <option value="read">Read</option>
            <option value="write">Write</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tool Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Scope</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role Access</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Risk</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Approval</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Schema</th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map((tool) => (
                  <tr key={tool.name} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100">
                      {tool.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        tool.scope === 'admin' ? 'badge-deny' :
                        tool.scope === 'write' ? 'badge-pending' :
                        'badge-deterministic'
                      }>
                        {tool.scope}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {tool.roleAccess.map((role) => (
                          <span key={role} className="badge-neutral text-[10px]">{role}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={
                        tool.riskLevel === 'high' ? 'badge-deny' :
                        tool.riskLevel === 'medium' ? 'badge-pending' :
                        'badge-allow'
                      }>
                        {tool.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {tool.requiresApproval ? (
                        <span className="badge-pending">Required</span>
                      ) : (
                        <span className="badge-allow">Auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                      <span className="block max-w-[200px] truncate" title={tool.schemaPreview}>
                        {tool.schemaPreview}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add Connection Modal */}
      {showAddModal && (
        <AddConnectionModal
          onClose={() => setShowAddModal(false)}
          onSave={async (conn) => {
            setConnections((prev) => [...prev, conn]);
            try {
              await fetch('/api/mcp-connections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: conn.id,
                  name: conn.name,
                  transport: conn.transport,
                  endpoint: conn.endpoint,
                  isEnabled: conn.isEnabled,
                  allowedTools: conn.allowedTools,
                  notes: conn.notes,
                }),
              });
            } catch {
              // Connection added locally even if API fails
            }
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddConnectionModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (conn: McpConnection) => void;
}) {
  const [name, setName] = useState('');
  const [transport, setTransport] = useState('stdio');
  const [endpoint, setEndpoint] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !endpoint.trim()) {
      setError('Name and endpoint are required.');
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      transport,
      endpoint: endpoint.trim(),
      isEnabled: true,
      allowedTools: [],
      notes: notes.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Add MCP Connection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mcp-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              id="mcp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="My MCP Server"
            />
          </div>
          <div>
            <label htmlFor="mcp-transport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transport</label>
            <select
              id="mcp-transport"
              value={transport}
              onChange={(e) => setTransport(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="stdio">stdio</option>
              <option value="sse">SSE</option>
              <option value="http">HTTP</option>
            </select>
          </div>
          <div>
            <label htmlFor="mcp-endpoint" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint</label>
            <input
              id="mcp-endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              placeholder="npx @zeo/mcp-server or https://..."
            />
          </div>
          <div>
            <label htmlFor="mcp-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              id="mcp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Add Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
