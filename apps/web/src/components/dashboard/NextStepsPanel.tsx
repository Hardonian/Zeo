import type { DashboardViewModel } from "@zeo/contracts";

export function NextStepsPanel({ model }: { model: DashboardViewModel }) {
  async function copySummary() {
    const summary = `${model.story.statusLine}\n${model.story.changeLine}\n${model.story.causeLine}\n${model.story.actionLine}\nRisk=${model.summary.riskScore} Compliance=${model.summary.policyCompliance}`;
    await navigator.clipboard.writeText(summary);
  }

  return <div className="rounded border p-3"><h3 className="font-semibold">Next steps</h3><ul className="mt-2 space-y-2 text-sm">{model.ctas.map((cta) => <li key={cta.command}><div className="font-medium">{cta.label}</div><code className="text-xs">{cta.command}</code></li>)}</ul><div className="mt-3 flex gap-2"><a className="rounded border px-2 py-1 text-xs" href={`/api/dashboard/${model.id}`} download={`${model.id}.dashboard.json`}>Download JSON</a><button className="rounded border px-2 py-1 text-xs" onClick={copySummary}>Copy summary</button></div></div>;
}
