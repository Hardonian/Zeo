import { ZeoMark } from '@/components/icons/ZeoIcons';

export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
      <ZeoMark className="h-12 w-12 motion-safe:animate-pulse" />
      <p className="text-sm font-medium text-muted-foreground">Loading...</p>
    </div>
  );
}
