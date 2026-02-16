'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Something went wrong</h2>
      <p className="max-w-md text-muted-foreground">
        We encountered an unexpected error. Please try again or contact support if the issue persists.
      </p>
      {error.digest && (
        <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
          Trace ID: {error.digest}
        </code>
      )}
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
