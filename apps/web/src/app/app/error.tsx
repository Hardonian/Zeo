'use client';

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
      <h2 className="text-lg font-semibold">Workspace error</h2>
      <p className="mt-2 text-sm">The app hit an unexpected state. Retry this view or return to the dashboard.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={reset} className="rounded bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800">Retry</button>
        <a href="/app" className="rounded border border-red-300 px-3 py-1.5 text-sm hover:bg-red-100">Dashboard</a>
      </div>
    </div>
  );
}
