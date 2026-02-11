import { useMemo, useState } from "react";
import type { DashboardViewModel } from "@zeo/contracts";

function asPosition(meta: Record<string, unknown> | undefined): { x: number; y: number } {
  const raw = (meta?.position as { x?: number; y?: number } | undefined) ?? {};
  return { x: Number(raw.x ?? 0), y: Number(raw.y ?? 0) };
}

export function DecisionMapPanel({ model }: { model: DashboardViewModel }) {
  const [selected, setSelected] = useState<string | null>(null);
  const nodes = model.graph.nodes;
  const edges = model.graph.edges.filter((edge) => !selected || edge.from === selected || edge.to === selected);

  const topAssumptions = useMemo(() => model.graph.nodes
    .filter((node) => node.type === "assumption")
    .map((node) => {
      const flip = Number((node.meta?.flipCount as number | undefined) ?? 1);
      const severity = Number(node.severity ?? 1);
      return { id: node.id, label: node.label, score: severity * flip };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 3), [model]);

  return <section className="rounded border p-3 space-y-3">
    <h3 className="font-semibold">Map</h3>
    <svg viewBox="-420 -240 840 520" className="w-full h-[320px] rounded border bg-slate-50">
      {edges.map((edge) => {
        const from = nodes.find((node) => node.id === edge.from);
        const to = nodes.find((node) => node.id === edge.to);
        if (!from || !to) return null;
        const p1 = asPosition(from.meta);
        const p2 = asPosition(to.meta);
        return <line key={`${edge.from}-${edge.to}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeDasharray={edge.type === "depends_on" ? "4 4" : undefined} />;
      })}
      {nodes.map((node) => {
        const pos = asPosition(node.meta);
        const volatile = String(node.meta?.assumptionState ?? "") === "volatile";
        const expired = String(node.meta?.assumptionState ?? "") === "expired";
        const active = selected === node.id;
        return <g key={node.id} transform={`translate(${pos.x},${pos.y})`} onClick={() => setSelected(node.id)} className="cursor-pointer">
          <circle r={active ? 24 : 20} fill={node.type === "decision" ? "#0f172a" : node.type === "policy" ? "#c2410c" : node.type === "assumption" ? "#334155" : "#1d4ed8"} stroke={volatile || expired ? "#ef4444" : "#fff"} strokeWidth={volatile || expired ? 3 : 1} />
          <text x={0} y={4} textAnchor="middle" fontSize="8" fill="#fff">{node.type.slice(0, 3).toUpperCase()}</text>
          <title>{node.label} · severity {node.severity ?? 0}</title>
        </g>;
      })}
    </svg>
    <div className="text-xs text-slate-700">Click node to filter related links. Dashed edges indicate dependency assumptions.</div>
    <div>
      <h4 className="font-medium">What would change this?</h4>
      <ul className="mt-2 space-y-1 text-sm">
        {topAssumptions.map((item) => <li key={item.id}><strong>{item.label}</strong> — score {item.score}. Run: <code>{`zeo add-note --decision ${model.id} --text "evidence for ${item.id}"`}</code></li>)}
        {model.lists.findings.slice(0, 3).map((finding) => <li key={finding.id}><strong>Missing evidence:</strong> {finding.title}. Run: <code>{`zeo add-note --decision ${model.id} --text "source for ${finding.id}"`}</code></li>)}
        {model.lists.policies.slice(0, 3).map((policy) => <li key={policy.id}><strong>Policy trigger:</strong> {policy.id} ({policy.status}). Run: <code>{`zeo export bundle --decision ${model.id}`}</code></li>)}
      </ul>
    </div>
  </section>;
}
