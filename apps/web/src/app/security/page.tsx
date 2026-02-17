import { PublicShell } from '@/components/site/PublicShell';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Security | Zeo',
  description: 'Zeo security practices: least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs.',
  canonicalPath: '/security',
});

export default function SecurityPage() {
  return (
    <PublicShell title="Security">
      <p className="text-gray-700">Zeo uses least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs for downloads.</p>
    </PublicShell>
  );
}
