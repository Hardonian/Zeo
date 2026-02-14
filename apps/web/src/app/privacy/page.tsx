import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Privacy | Zeo',
  description: 'Zeo privacy practices: edge-first processing and minimal storage of sensitive artifacts.',
};

export default function PrivacyPage() {
  return (
    <PublicShell title="Privacy">
      <p className="text-gray-700">Zeo defaults to edge-first processing and minimizes storage of raw sensitive artifacts. Public site pages are static and do not require authentication.</p>
    </PublicShell>
  );
}
