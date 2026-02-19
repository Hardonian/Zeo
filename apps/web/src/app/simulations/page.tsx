import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import { HeroMedia } from "@/components/hero/HeroMedia";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Decision Simulations — Zeo",
  description:
    "Run deterministic decision simulations. Explore branching outcomes, stress-test strategies, and validate assumptions before committing.",
};

export default function SimulationsPage() {
  return (
    <PublicShell>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-zeo-dark pb-24 pt-16 sm:pb-32">
        <HeroMedia
          src="/hero/zeo-fullspread-hero.png"
          alt="Zeo Decision Simulations"
          priority
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Decision Simulations
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Run deterministic simulations to explore branching outcomes,
              stress-test strategies, and validate assumptions before committing
              to critical decisions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/studio"
                className="btn-zeo-primary"
              >
                Launch Studio
              </Link>
              <Link
                href="/docs"
                className="text-sm font-semibold leading-6 text-white"
              >
                View Documentation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simulation Types */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simulation Types
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Choose the right simulation mode for your decision context.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Branching Simulation */}
            <div className="card-zeo">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zeo-accent/10">
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
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18-.324-.287-.696-.287-1.093m0 2.186l3.127-1.587m-3.127 1.587l3.127 1.587m-3.127-1.587l-2.94 4.494a2.25 2.25 0 00-.094 2.324l.875 1.75a2.25 2.25 0 002.012 1.239h1.846c.826 0 1.59-.453 1.982-1.18l1.036-1.94m-2.94-6.687l6.003-3.127M10.093 12.38l6.003 3.127m0 0a2.25 2.25 0 102.238-3.885m-2.238 3.885c.18-.324.287-.696.287-1.093m0 1.093c-.18.324-.287.696-.287 1.093m0-2.186l3.127-1.587m-3.127 1.587l3.127 1.587"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Branching Simulation
              </h3>
              <p className="mt-2 text-slate-600">
                Explore multi-step decision trees with probabilistic branches.
                See how initial choices cascade into downstream outcomes.
              </p>
            </div>

            {/* Monte Carlo */}
            <div className="card-zeo">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zeo-accent/10">
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
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Monte Carlo Analysis
              </h3>
              <p className="mt-2 text-slate-600">
                Run thousands of randomized scenarios to understand distribution
                of outcomes and identify tail risks.
              </p>
            </div>

            {/* Sensitivity Analysis */}
            <div className="card-zeo">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zeo-accent/10">
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
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                Sensitivity Analysis
              </h3>
              <p className="mt-2 text-slate-600">
                Identify which assumptions drive your decision. See exactly what
                would change your recommendation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How Simulations Work
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex gap-x-4">
                <div className="flex-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zeo-accent text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Define Decision Spec
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Describe your decision context, available actions, and key
                    assumptions with uncertainty bounds.
                  </p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div className="flex-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zeo-accent text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Configure Simulation
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Choose simulation type, depth, and iterations. Set random
                    seed for reproducibility.
                  </p>
                </div>
              </div>

              <div className="flex gap-x-4">
                <div className="flex-none">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zeo-accent text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Run & Analyze
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Execute simulation and explore results. Identify robust
                    actions and critical flip points.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Deterministic by Design
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-x-3">
                  <svg
                    className="h-6 w-6 text-green-600 flex-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Same seed produces identical results
                </li>
                <li className="flex items-start gap-x-3">
                  <svg
                    className="h-6 w-6 text-green-600 flex-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  All outputs are hash-verifiable
                </li>
                <li className="flex items-start gap-x-3">
                  <svg
                    className="h-6 w-6 text-green-600 flex-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Full audit trail with provenance
                </li>
                <li className="flex items-start gap-x-3">
                  <svg
                    className="h-6 w-6 text-green-600 flex-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Replay any simulation from transcript
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-zeo-dark">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start Simulating
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Run your first decision simulation in under 5 minutes. No credit
            card required.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/studio" className="btn-zeo-primary">
              Open Studio
            </Link>
            <Link
              href="/quickstart"
              className="text-sm font-semibold leading-6 text-white"
            >
              View Quickstart <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
