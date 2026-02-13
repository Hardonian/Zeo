'use client';

const STATUS_ROWS = [
  { label: 'Last Execution', value: 'Today, 10:42 AM' },
  { label: 'Exit Reason', value: 'Success', badge: true },
  { label: 'CLI Session ID', value: 'zeo-cli-a3f8...', mono: true },
  { label: 'Command Latency', value: '142ms' },
  { label: 'Uptime', value: '4d 12h 30m' },
];

const MCP_STATE = {
  status: 'connected' as const,
  server: 'localhost:3100',
  protocol: 'MCP v1.0',
  lastHandshake: '2s ago',
};

const TOKEN_USAGE = {
  inputTokens: 1247,
  outputTokens: 834,
  budget: 10000,
  model: 'claude-3.5-sonnet',
};

export function ZeoRuntimeStatusPanel() {
  const tokenPercent = ((TOKEN_USAGE.inputTokens + TOKEN_USAGE.outputTokens) / TOKEN_USAGE.budget * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm max-w-sm mx-auto">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
        <div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-lg font-mono font-semibold text-gray-900 tracking-tight">zeo-cli</h2>
          </div>
          <p className="text-xs font-mono text-gray-500 mt-1">v0.1.0-alpha</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-medium text-green-700">Running</span>
        </div>
      </div>

      {/* CLI Hot Path State */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-1 gap-y-0 text-sm">
          {STATUS_ROWS.map((row) => (
            <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-dashed border-gray-200 last:border-0">
              <span className="text-gray-500">{row.label}</span>
              {row.badge ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  {row.value}
                </span>
              ) : (
                <span className={`text-gray-900 ${row.mono ? 'font-mono text-xs' : ''}`}>{row.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MCP Handshake Indicator */}
      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">MCP Handshake</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-mono mb-0.5">Status</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <p className="text-gray-900 text-xs font-medium capitalize">{MCP_STATE.status}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-mono mb-0.5">Server</p>
            <p className="text-gray-900 text-xs font-mono">{MCP_STATE.server}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-mono mb-0.5">Protocol</p>
            <p className="text-gray-900 text-xs font-medium">{MCP_STATE.protocol}</p>
          </div>
          <div>
            <p className="text-gray-400 text-[10px] uppercase font-mono mb-0.5">Last Handshake</p>
            <p className="text-gray-900 text-xs font-medium">{MCP_STATE.lastHandshake}</p>
          </div>
        </div>
      </div>

      {/* Token Usage Snapshot */}
      <div className="px-5 py-4 border-t border-gray-200">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">Token Usage</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Model: <span className="text-gray-700 font-medium">{TOKEN_USAGE.model}</span></span>
            <span>{tokenPercent}% of budget</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${tokenPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>In: {TOKEN_USAGE.inputTokens.toLocaleString()}</span>
            <span>Out: {TOKEN_USAGE.outputTokens.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-1.5 w-full py-2 px-4 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">
            Rerun
          </button>
          <button className="flex items-center justify-center gap-1.5 w-full py-2 px-4 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors text-gray-700 text-sm font-medium">
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}
