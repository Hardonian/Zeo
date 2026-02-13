'use client';

const COMPLIANCE_CHECKS = [
  { name: 'Header Checks', status: 'pass' as const, detail: '12ms' },
  { name: 'Dependency Audit', status: 'pass' as const, detail: '0 vulns' },
  { name: 'Binary File Scan', status: 'fail' as const, detail: '1 DETECTED' },
  { name: 'Secret Detection', status: 'pass' as const, detail: 'Clean' },
  { name: 'Branch Protection', status: 'pass' as const, detail: 'Active' },
  { name: 'Key Rotation Status', status: 'pass' as const, detail: 'Current' },
  { name: 'API Surface Audit', status: 'pass' as const, detail: '23 endpoints' },
];

const CONTRIBUTION_RULES = [
  { label: 'CLA Status', value: 'REQUIRED' },
  { label: 'DCO Sign', value: 'SIGNED' },
  { label: 'COC Version', value: 'v2.1' },
  { label: 'Maintainers', value: '4 ACTIVE' },
];

export function ZeoOssIntegrityView() {
  const passCount = COMPLIANCE_CHECKS.filter((c) => c.status === 'pass').length;
  const failCount = COMPLIANCE_CHECKS.filter((c) => c.status === 'fail').length;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="text-blue-400 flex h-8 w-8 shrink-0 items-center justify-center bg-blue-500/10 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white text-sm font-bold leading-tight tracking-wider uppercase">Zeo OSS Integrity</h2>
            <span className="text-xs text-gray-400 font-mono tracking-tight">governance::active</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
          </span>
          <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">MONITORING</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* System Status */}
        <div className="flex items-center justify-between border-l-4 border-blue-500 bg-gray-900 pl-3 pr-2 py-2 rounded-r">
          <h3 className="text-white tracking-widest text-sm font-bold">SYSTEM STATUS</h3>
          <span className="text-blue-400 font-mono text-sm">NORMAL</span>
        </div>

        {/* License Info */}
        <section className="rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-500 text-xs font-mono tracking-widest uppercase">CURRENT LICENSE</p>
                <h3 className="text-white text-2xl font-bold tracking-tight">MIT LICENSE</h3>
              </div>
              <div className="h-10 w-10 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-400 -rotate-12 opacity-80">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-700 pt-4">
              <div>
                <p className="text-gray-500 text-[10px] font-mono uppercase mb-1">PERMISSION TYPE</p>
                <p className="text-white text-sm font-medium">PERMISSIVE</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-[10px] font-mono uppercase mb-1">VALIDITY</p>
                <p className="text-blue-400 text-sm font-bold">VERIFIED</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contribution Rules */}
        <section>
          <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2 px-1">CONTRIBUTION RULES</h3>
          <div className="grid grid-cols-2 gap-px bg-gray-800 rounded-lg overflow-hidden border border-gray-800">
            {CONTRIBUTION_RULES.map((rule) => (
              <div key={rule.label} className="bg-gray-900 p-3">
                <p className="text-gray-500 text-[10px] uppercase font-mono">{rule.label}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <p className="text-white text-xs font-medium">{rule.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Matrix */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-gray-400 text-xs font-bold tracking-widest uppercase">COMPLIANCE MATRIX</h3>
            <span className="text-[10px] font-mono text-gray-600">
              {passCount} PASS / {failCount} FAIL
            </span>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 font-mono text-xs space-y-1">
            {COMPLIANCE_CHECKS.map((check) => (
              <div
                key={check.name}
                className={`flex items-center justify-between p-2 rounded transition-colors ${
                  check.status === 'fail' ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${check.status === 'pass' ? 'text-blue-400' : 'text-red-500'}`}>
                    [{check.status.toUpperCase()}]
                  </span>
                  <span className={check.status === 'fail' ? 'text-white' : 'text-gray-300'}>{check.name}</span>
                </div>
                <span className={check.status === 'fail' ? 'text-red-400 text-[10px]' : 'text-gray-600 text-[10px]'}>
                  {check.detail}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Footer */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 hover:border-blue-500/50 transition-all">
            <span className="text-xs font-bold text-white tracking-wide">POLICY.MD</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800 hover:border-blue-500/50 transition-all">
            <span className="text-xs font-bold text-white tracking-wide">AUDIT LOG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
