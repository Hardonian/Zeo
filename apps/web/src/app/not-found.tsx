import Link from 'next/link';

const RECOVERY_LINKS = [
  { href: '/docs', label: 'Read the docs' },
  { href: '/platform', label: 'Explore the platform' },
  { href: '/pricing', label: 'Review pricing' },
  { href: '/support', label: 'Contact support' },
];

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-gray-600">The page you requested could not be found. Try one of the links below.</p>
      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
        {RECOVERY_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100">
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/" className="mt-5 text-sm text-blue-700 hover:underline">Return home</Link>
    </main>
  );
}
