"use client";
import Link from 'next/link';

export default function GlobalError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl shadow-sm max-w-md w-full p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-base leading-7 text-slate-600 mb-6">
          We&apos;re sorry for the inconvenience. An unexpected error occurred.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-90"
          >
            Retry
          </button>
          <Link href="/">
            <button
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Home
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-8 text-sm text-slate-400">
        <p>Reference ID: {error.message}</p>
      </div>
    </div>
  );
}
