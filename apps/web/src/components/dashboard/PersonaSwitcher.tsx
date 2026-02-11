import type { DashboardPersona } from "@zeo/contracts";

export function PersonaSwitcher({ value, onChange }: { value: DashboardPersona; onChange: (v: DashboardPersona) => void }) {
  return <div className="inline-flex rounded border" role="tablist" aria-label="Persona switcher">{(["exec", "tech", "security"] as DashboardPersona[]).map((persona) => <button key={persona} className={`px-3 py-1 text-sm ${persona === value ? "bg-gray-900 text-white" : ""}`} onClick={() => onChange(persona)} role="tab" aria-selected={persona === value}>{persona}</button>)}</div>;
}
