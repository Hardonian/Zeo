import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | Zeo',
  description: 'Access the Zeo authenticated workspace for governance dashboards and decision analysis.',
};

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Dashboard access</h1>
      <p className="mt-3 text-gray-600">This route is reserved for authenticated workspace sessions.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">Return home</Link>
        <Link href="/quickstart" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Open quickstart</Link>
      </div>
    </main>
  );
}
