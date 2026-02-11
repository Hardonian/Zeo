import type { DashboardViewModel } from "@zeo/contracts";

export function RiskTrajectoryChart({ model }: { model: DashboardViewModel }) {
  const points = model.trends.riskTrajectory;
  const width = 420;
  const height = 160;
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${(index / Math.max(1, points.length - 1)) * width},${height - (point.v / 100) * height}`).join(" ");
  return <div className="rounded border p-3"><h3 className="font-semibold">Risk trajectory</h3>
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" aria-label="Risk trajectory chart"><path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      {points.map((point, index) => <circle key={`${point.t}:${index}`} cx={(index / Math.max(1, points.length - 1)) * width} cy={height - (point.v / 100) * height} r="3"><title>{`${point.t} value=${point.v} source=${point.source ?? "unknown"}`}</title></circle>)}
    </svg></div>;
}
