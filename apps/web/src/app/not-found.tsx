import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-gray-600">The page you requested could not be found.</p>
      <Link href="/" className="mt-6 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Return home</Link>
    </main>
  );
}
