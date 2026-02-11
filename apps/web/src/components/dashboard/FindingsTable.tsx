import type { DashboardViewModel } from "@zeo/contracts";

export function FindingsTable({ model, minSeverity }: { model: DashboardViewModel; minSeverity: number }) {
  return <div className="rounded border p-3"><h3 className="font-semibold">Findings</h3><div className="overflow-auto"><table className="w-full text-sm mt-2"><thead><tr><th>ID</th><th>Category</th><th>Severity</th><th>Why</th></tr></thead><tbody>{model.lists.findings.filter((finding) => finding.severity >= minSeverity).map((finding) => <tr key={finding.id}><td>{finding.id}</td><td>{finding.category}</td><td>{finding.severity}</td><td>{finding.rationaleRefs.join(", ") || "Unknown"}</td></tr>)}</tbody></table></div></div>;
}
