import type { DashboardViewModel } from "@zeo/contracts";

export function EvidenceQualityPanel({ model }: { model: DashboardViewModel }) {
  return <div className="rounded border p-3"><h3 className="font-semibold">Evidence quality</h3><ul className="mt-2 space-y-1 text-sm">{model.lists.evidence.slice(0, 8).map((item) => <li key={item.id}>{item.id} · {item.qualityScore} · {item.freshness} ({item.ageDays}d)</li>)}</ul></div>;
}
