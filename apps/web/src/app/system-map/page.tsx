import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System Map — Zeo",
  description:
    "Explore the Zeo system architecture. Understand how decision intelligence, governance, and verification layers work together.",
};

export default function SystemMapPage() {
  return (
    <PublicShell title="System Map">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-zeo-dark pb-24 pt-16 sm:pb-32">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              System Map
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Understand how Zeo&apos;s decision intelligence, governance, and
              verification layers work together to deliver deterministic,
              auditable outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Architecture Layers
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Zeo is built in layers, each with specific responsibilities and
              trust boundaries.
            </p>
          </div>

          <div className="mt-16 space-y-8">
            {/* Layer 1: Core Engine */}
            <div className="card-zeo relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-zeo-accent" />
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zeo-accent/10 text-zeo-accent font-bold text-sm">
                      1
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Core Decision Engine
                    </h3>
                  </div>
                  <p className="mt-4 text-slate-600">
                    The deterministic heart of Zeo. Takes decision specs,
                    branches them into possible futures, and evaluates actions
                    against value functions. Pure computation—no side effects,
                    no network calls.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Branch generation with probability intervals</li>
                    <li>• Value function evaluation</li>
                    <li>• Constraint propagation</li>
                    <li>• Deterministic RNG with seed support</li>
                  </ul>
                </div>
                <div className="lg:w-64 flex-shrink-0">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Key Packages
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>@zeo/core</li>
                      <li>@zeo/contracts</li>
                      <li>@zeo/decisions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 2: Quant Engine */}
            <div className="card-zeo relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm">
                      2
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Quant Engine
                    </h3>
                  </div>
                  <p className="mt-4 text-slate-600">
                    Analytical rigor through statistical models. Handles
                    calibration, correlation analysis, regression, and causal
                    inference with epistemic discipline.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Calibration tracking and Brier scoring</li>
                    <li>• Correlation and regression analysis</li>
                    <li>• Causal skeleton proposals (never claims)</li>
                    <li>• Time series and volatility modeling</li>
                  </ul>
                </div>
                <div className="lg:w-64 flex-shrink-0">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Key Packages
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>@zeo/calibration</li>
                      <li>@zeo/analytics</li>
                      <li>@zeo/causal</li>
                      <li>@zeo/timeseries</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3: Governance */}
            <div className="card-zeo relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-purple-500" />
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 font-bold text-sm">
                      3
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Governance Layer
                    </h3>
                  </div>
                  <p className="mt-4 text-slate-600">
                    Policy enforcement, trust boundaries, and audit. Ensures
                    decisions comply with organizational rules and maintains
                    complete provenance.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Policy pack evaluation</li>
                    <li>• Evidence provenance tracking</li>
                    <li>• Audit trail generation</li>
                    <li>• Constraint enforcement</li>
                  </ul>
                </div>
                <div className="lg:w-64 flex-shrink-0">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Key Packages
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>@zeo/governance</li>
                      <li>@zeo/constraints</li>
                      <li>@zeo/trust</li>
                      <li>@zeo/audit</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 4: Reality Signal */}
            <div className="card-zeo relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 font-bold text-sm">
                      4
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Reality Signal Layer
                    </h3>
                  </div>
                  <p className="mt-4 text-slate-600">
                    Integrates external data sources with bias counterweights.
                    Converts market data, news, and macro indicators into
                    decision-relevant state variables.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Market and macro data ingestion</li>
                    <li>• News sentiment with skepticism</li>
                    <li>• Regime change detection</li>
                    <li>• Bias counterweight application</li>
                  </ul>
                </div>
                <div className="lg:w-64 flex-shrink-0">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Key Packages
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>@zeo/rsl</li>
                      <li>@zeo/regimes</li>
                      <li>@zeo/external</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 5: UI/UX */}
            <div className="card-zeo relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-sm">
                      5
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">
                      Interface Layer
                    </h3>
                  </div>
                  <p className="mt-4 text-slate-600">
                    User-facing applications and APIs. Studio for interactive
                    decisions, CLI for automation, MCP for IDE integration.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li>• Decision Studio web interface</li>
                    <li>• CLI for automation and CI/CD</li>
                    <li>• MCP server for IDE integration</li>
                    <li>• Panel system for extensibility</li>
                  </ul>
                </div>
                <div className="lg:w-64 flex-shrink-0">
                  <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Applications
                    </h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>apps/web (Studio)</li>
                      <li>apps/cli</li>
                      <li>packages/mcp-server</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Data Flow
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              How information moves through the Zeo system.
            </p>
          </div>

          <div className="mt-16">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zeo-accent/10">
                    <svg
                      className="h-6 w-6 text-zeo-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Input
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Decision specs, evidence, and assumptions enter through
                    Studio, CLI, or API.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zeo-accent/10">
                    <svg
                      className="h-6 w-6 text-zeo-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Process
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Core engine branches decisions, applies constraints, and
                    evaluates with quant tools.
                  </p>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zeo-accent/10">
                    <svg
                      className="h-6 w-6 text-zeo-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    Output
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Branch graphs, recommendations, and evidence packets with
                    full provenance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Boundaries */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Trust Boundaries
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Clear separation of concerns ensures safety and auditability.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900">
                AI / ML Layer
              </h3>
              <p className="mt-2 text-slate-600">
                Proposes hypotheses, suggests branches. All outputs tagged as
                requiring validation.
              </p>
              <div className="mt-4 text-sm text-amber-600 font-medium">
                Trust Level: Proposals Only
              </div>
            </div>

            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900">
                Deterministic Code
              </h3>
              <p className="mt-2 text-slate-600">
                Verifies, computes, propagates. Reproducible given same inputs.
                No randomness without seed.
              </p>
              <div className="mt-4 text-sm text-green-600 font-medium">
                Trust Level: Verified
              </div>
            </div>

            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900">
                Data / Evidence
              </h3>
              <p className="mt-2 text-slate-600">
                Ground truth inputs. Provenance required for facts. Confidence
                bands for beliefs.
              </p>
              <div className="mt-4 text-sm text-blue-600 font-medium">
                Trust Level: Traceable
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-zeo-dark">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Explore the Code
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Zeo is open source. Inspect the architecture, verify the logic, and
            contribute improvements.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="https://github.com/scott/zeo"
              className="btn-zeo-primary"
            >
              View on GitHub
            </Link>
            <Link
              href="/docs/architecture"
              className="text-sm font-semibold leading-6 text-white"
            >
              Read Architecture Docs <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
