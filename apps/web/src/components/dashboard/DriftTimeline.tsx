import type { DashboardViewModel } from "@zeo/contracts";

export function DriftTimeline({ model }: { model: DashboardViewModel }) {
  return <div className="rounded border p-3"><h3 className="font-semibold">Drift timeline</h3><ul className="mt-2 space-y-2 text-sm">{model.trends.driftEvents.map((event) => <li key={`${event.refId}:${event.t}`} className="flex justify-between"><span>{event.type} · {event.refId}</span><span aria-label={`severity ${event.severity}`}>S{event.severity}</span></li>)}</ul></div>;
}
