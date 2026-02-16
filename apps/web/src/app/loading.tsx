import { ZeoMark } from '@/components/icons/ZeoIcons';

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
      <ZeoMark className="h-12 w-12 animate-pulse" />
      <p className="text-sm font-medium text-gray-500">Loading...</p>
    </div>
  );
}
