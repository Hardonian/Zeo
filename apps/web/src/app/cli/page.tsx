import type { Metadata } from "next";
import { PublicShell } from "@/components/site/PublicShell";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CLI — Zeo",
  description:
    "Command-line interface for Zeo decision intelligence. Automate decisions, run simulations, and integrate with CI/CD pipelines.",
};

export default function CliPage() {
  return (
    <PublicShell title="Command Line Interface">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-zeo-dark pb-24 pt-16 sm:pb-32">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Zeo CLI
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Command-line interface for deterministic decision intelligence.
              Automate simulations, run batch analysis, and integrate with your
              CI/CD pipelines.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/install" className="btn-zeo-primary">
                Install CLI
              </Link>
              <a
                href="https://github.com/scott/zeo/tree/main/apps/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold leading-6 text-white"
              >
                View Source <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Installation
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Get started with Zeo CLI in seconds.
            </p>
          </div>

          <div className="mt-16 max-w-3xl mx-auto space-y-8">
            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                npm / pnpm
              </h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                <code>pnpm add -g @zeo/cli</code>
              </pre>
            </div>

            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Homebrew (macOS/Linux)
              </h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                <code>brew install zeo</code>
              </pre>
            </div>

            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Verify Installation
              </h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
                <code>zeo --version</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Commands */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Core Commands
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Essential commands for decision automation.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Decision Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo decision
              </h3>
              <p className="mt-2 text-slate-600">
                Run a decision from a spec file. Generates branch graph,
                evaluates actions, and outputs recommendations.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo decision run --spec ./decision.json</code>
              </pre>
            </div>

            {/* Simulate Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo simulate
              </h3>
              <p className="mt-2 text-slate-600">
                Run Monte Carlo simulations to understand outcome distributions
                and tail risks.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo simulate --spec ./decision.json --iterations 10000</code>
              </pre>
            </div>

            {/* Replay Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo replay
              </h3>
              <p className="mt-2 text-slate-600">
                Replay historical decisions against actual outcomes for
                calibration and learning.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo replay --dataset ./history.json</code>
              </pre>
            </div>

            {/* Export Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo export
              </h3>
              <p className="mt-2 text-slate-600">
                Export deterministic bundles with full provenance for sharing
                or archiving.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo export --deterministic --out ./bundle.tar</code>
              </pre>
            </div>

            {/* MCP Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo mcp
              </h3>
              <p className="mt-2 text-slate-600">
                Start the Model Context Protocol server for IDE integration.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo mcp serve</code>
              </pre>
            </div>

            {/* Doctor Command */}
            <div className="card-zeo">
              <div className="flex items-center gap-x-3 mb-4">
                <span className="px-2 py-1 rounded bg-zeo-accent/10 text-zeo-accent text-xs font-mono font-semibold">
                  COMMAND
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                zeo doctor
              </h3>
              <p className="mt-2 text-slate-600">
                Verify environment, check dependencies, and diagnose common
                issues.
              </p>
              <pre className="mt-4 bg-slate-900 text-slate-50 p-3 rounded text-sm overflow-x-auto">
                <code>zeo doctor</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CI/CD Integration */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              CI/CD Integration
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Integrate decision validation into your deployment pipelines.
            </p>
          </div>

          <div className="mt-16 max-w-3xl mx-auto">
            <div className="card-zeo">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                GitHub Actions Example
              </h3>
              <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">{`.github/workflows/decision-check.yml

name: Decision Check
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Zeo
        run: npm install -g @zeo/cli
      
      - name: Validate Decisions
        run: zeo decision run --spec ./decisions/*.json --fail-on-warning
      
      - name: Run Simulations
        run: zeo simulate --spec ./decisions/critical.json --iterations 1000`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-zeo-dark">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Automate Your Decisions
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Start using Zeo CLI to bring deterministic decision intelligence to
            your workflows.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/docs/quickstart" className="btn-zeo-primary">
              Quickstart Guide
            </Link>
            <Link
              href="/docs"
              className="text-sm font-semibold leading-6 text-white"
            >
              Full Documentation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
