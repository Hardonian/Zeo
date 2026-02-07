import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Zeo <span className="text-blue-600">Edge UI Shell</span>
        </h1>
        <p className="text-lg text-gray-600">
          Edge-first web UI with plugin-style Panel Host for Google Stitch injection.
          Safe, deterministic, and gracefully degrading.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/demo"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Open Demo
          </Link>
          <a
            href="https://github.com/anomalyco/Zeo"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Features
          </h2>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium">Panel Host</h3>
              <p className="text-sm text-gray-600">Plugin-style architecture for React and iframe panels</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium">Offline First</h3>
              <p className="text-sm text-gray-600">IndexedDB persistence with localStorage fallback</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium">Bridge Protocol</h3>
              <p className="text-sm text-gray-600">Schema-validated postMessage communication</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <h3 className="font-medium">Sandboxed iframes</h3>
              <p className="text-sm text-gray-600">No same-origin, strict capability gating</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
