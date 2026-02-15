'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { DecisionStudio } from '@/components/DecisionStudio';
import { WORKFLOWS, getHumanPanelsByWorkflow } from '@/lib/human-panels';

function StudioContent() {
  const searchParams = useSearchParams();

  // Support shareable links: /studio?query=encoded_input
  const queryParam = searchParams.get('query') || undefined;

  // Also support intent-based links from product page: /studio?intent=flip-distance
  const intentParam = searchParams.get('intent');

  // Map intent param to a default query
  const intentQueryMap: Record<string, string> = {
    'flip-distance': 'How stable is this recommendation?',
    'counterfactual-lab': 'What would need to change for a different outcome?',
    'evidence-planner': 'What evidence would increase confidence?',
    'decision-graph': 'What happens if we choose the aggressive path?',
    'voi-engine': 'Where should we spend resources?',
    'regret-planner': "What's the safest move?",
    'active-learning': 'How do we improve over time?',
  };

  const initialQuery = queryParam ?? (intentParam ? intentQueryMap[intentParam] : undefined);

  const panelsByWorkflow = getHumanPanelsByWorkflow();

  return (
    <div className="max-w-4xl space-y-10">
      {/* Hero */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Decision Intelligence Studio
        </h2>
        <p className="mt-2 text-gray-600">
          Ask questions in plain language. Zeo translates your query into deterministic analysis,
          runs the computation, and explains the results.
        </p>
      </div>

      {/* Decision Studio Component */}
      <DecisionStudio initialQuery={initialQuery} />

      {/* Workflow Cards */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Workflows</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {WORKFLOWS.map(workflow => (
            <div
              key={workflow.key}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h4 className="font-semibold text-gray-900">{workflow.label}</h4>
              <p className="mt-1 text-sm text-gray-500">{workflow.description}</p>
              <div className="mt-3 space-y-1">
                {panelsByWorkflow[workflow.key]?.map(panel => (
                  <button
                    key={panel.intentKey}
                    type="button"
                    onClick={() => {
                      const encodedQuery = encodeURIComponent(panel.examplePrompts[0]);
                      window.location.href = `/studio?query=${encodedQuery}`;
                    }}
                    className="block w-full text-left text-sm text-blue-600 transition-colors hover:text-blue-800"
                  >
                    {panel.humanLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back link */}
      <div className="flex items-center gap-4">
        <Link href="/platform" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Platform
        </Link>
        <Link href="/product" className="text-sm text-blue-600 hover:underline">
          View CLI Demos
        </Link>
      </div>
    </div>
  );
}

export default function StudioPage() {
  return (
    <PublicShell title="Decision Studio">
      <Suspense
        fallback={
          <div className="flex h-40 items-center justify-center text-gray-400">
            Loading studio...
          </div>
        }
      >
        <StudioContent />
      </Suspense>
    </PublicShell>
  );
}
