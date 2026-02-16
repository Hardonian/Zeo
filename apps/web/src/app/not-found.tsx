import Link from 'next/link';
import { ZeoMark } from '@/components/icons/ZeoIcons';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      <ZeoMark className="h-12 w-12 text-gray-400 grayscale" />
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">Page Not Found</h2>
      <p className="max-w-md text-gray-500">
        Could not find the requested resource. It might have been moved or deleted.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Return Home
      </Link>
    </div>
  );
}
