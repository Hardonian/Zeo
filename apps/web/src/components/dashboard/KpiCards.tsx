import type { DashboardViewModel } from "@zeo/contracts";

export function KpiCards({ model, onFilter }: { model: DashboardViewModel; onFilter: (value: number | null) => void }) {
  const items = [
    { label: "Risk score", value: model.summary.riskScore, help: "Composite decision risk (0-100)." },
    { label: "Evidence completeness", value: model.summary.evidenceCompleteness, help: "How complete supporting evidence is (0-100)." },
    { label: "Policy compliance", value: model.summary.policyCompliance, help: "Current policy pass posture (0-100)." },
    { label: "Replay stability", value: model.summary.replayStability, help: "Deterministic replay agreement (0-100)." },
  ];
  return <div className="grid gap-3 md:grid-cols-4">{items.map((item) => <button key={item.label} className="rounded border p-3 text-left" onClick={() => onFilter(item.value < 60 ? 5 : 3)} aria-label={`${item.label} ${item.value}`}>
    <div className="text-xs text-gray-500" title={item.help}>{item.label}</div><div className="text-2xl font-semibold">{item.value}</div>
  </button>)}</div>;
}
