'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProd = process.env.NODE_ENV === 'production';

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="mt-2 text-gray-600">
            {isProd
              ? 'The request could not be completed. Please try again.'
              : 'An error occurred while rendering this page.'}
          </p>
        </div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-mono">
            {isProd ? 'Unexpected application error.' : error.message}
          </p>
          {error.digest && <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>}
        </div>
        <button
          onClick={reset}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
