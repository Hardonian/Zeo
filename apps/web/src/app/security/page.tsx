import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Security',
  description: 'Zeo security practices: least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs.',
};

export default function SecurityPage() {
  return (
    <PublicShell title="Security">
      <Card className="p-6">
        <p className="text-muted-foreground">Zeo uses least-privilege access, tenant isolation, private artifact storage, and server-side signed URLs for downloads.</p>
      </Card>
    </PublicShell>
  );
}
