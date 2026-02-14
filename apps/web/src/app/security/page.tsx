import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Security | Zeo',
  description: 'Zeo security practices: least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs.',
};

export default function SecurityPage() {
  return (
    <PublicShell title="Security">
      <p className="text-gray-700">Zeo uses least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs for downloads.</p>
    </PublicShell>
  );
}
