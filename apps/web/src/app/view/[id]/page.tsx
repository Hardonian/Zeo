"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { DashboardPersona, DashboardViewModel } from "@zeo/contracts";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { IntegrityBadges } from "@/components/dashboard/IntegrityBadges";
import { RiskTrajectoryChart } from "@/components/dashboard/RiskTrajectoryChart";
import { DriftTimeline } from "@/components/dashboard/DriftTimeline";
import { EvidenceQualityPanel } from "@/components/dashboard/EvidenceQualityPanel";
import { PolicyTriggersPanel } from "@/components/dashboard/PolicyTriggersPanel";
import { FindingsTable } from "@/components/dashboard/FindingsTable";
import { NextStepsPanel } from "@/components/dashboard/NextStepsPanel";
import { PersonaSwitcher } from "@/components/dashboard/PersonaSwitcher";

export default function ViewPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const initialPersona = (searchParams.get("persona") === "tech" || searchParams.get("persona") === "security" ? searchParams.get("persona") : "exec") as DashboardPersona;
  const [persona, setPersona] = useState<DashboardPersona>(initialPersona);
  const [severityFilter, setSeverityFilter] = useState<number>(1);
  const [model, setModel] = useState<DashboardViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hook: UI consumes persisted deterministic viewmodel written by `zeo view <id>`.
    fetch(`/api/dashboard/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).hint ?? `HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setModel(data as DashboardViewModel))
      .catch((caught) => setError((caught as Error).message));
  }, [id]);

  const topFindings = useMemo(() => (model?.lists.findings ?? []).slice(0, 3), [model]);

  if (error) return <div className="p-6">Dashboard unavailable: {error}</div>;
  if (!model) return <div className="p-6">Loading dashboard...</div>;

  const showDense = persona !== "exec";

  return <main className="p-4 md:p-8 space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Zeo Dashboard · {model.id}</h1><PersonaSwitcher value={persona} onChange={setPersona} /></div>

    <section className="rounded border p-3">
      <h2 className="font-semibold">Story</h2>
      <p>{model.story.statusLine}</p><p>{model.story.changeLine}</p><p>{model.story.causeLine}</p><p>{model.story.actionLine}</p>
    </section>

    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2"><KpiCards model={model} onFilter={(next) => setSeverityFilter(next ?? 1)} /></div>
      <IntegrityBadges model={model} />
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2"><RiskTrajectoryChart model={model} /></div>
      <DriftTimeline model={model} />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <EvidenceQualityPanel model={model} />
      <PolicyTriggersPanel model={model} />
    </div>

    {showDense ? <FindingsTable model={model} minSeverity={severityFilter} /> : <section className="rounded border p-3"><h3 className="font-semibold">Top risks</h3><ul className="mt-2 text-sm">{topFindings.map((finding) => <li key={finding.id}>{finding.id} · S{finding.severity} · {finding.title}</li>)}</ul></section>}

    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <section className="rounded border p-3"><h3 className="font-semibold">Filters</h3><div className="mt-2 flex gap-2"><button className="rounded border px-2 py-1 text-sm" onClick={() => setSeverityFilter(1)}>Severity ≥1</button><button className="rounded border px-2 py-1 text-sm" onClick={() => setSeverityFilter(3)}>Severity ≥3</button><button className="rounded border px-2 py-1 text-sm" onClick={() => setSeverityFilter(5)}>Severity ≥5</button><button className="rounded border px-2 py-1 text-sm" onClick={() => setSeverityFilter(1)}>Reset filters</button></div></section>
      <NextStepsPanel model={model} />
    </div>
  </main>;
}
