import type { DashboardViewModel } from "@zeo/contracts";

export function PolicyTriggersPanel({ model }: { model: DashboardViewModel }) {
  return <div className="rounded border p-3"><h3 className="font-semibold">Policy triggers</h3><ul className="mt-2 space-y-1 text-sm">{model.lists.policies.map((policy) => <li key={policy.id}>{policy.id} · {policy.status.toUpperCase()} · S{policy.severity}</li>)}</ul></div>;
}
