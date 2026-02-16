import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Privacy',
  description: 'Zeo privacy practices: edge-first processing and minimal storage of sensitive artifacts.',
};

export default function PrivacyPage() {
  return (
    <PublicShell title="Privacy">
      <Card className="p-6">
        <p className="text-muted-foreground">Zeo defaults to edge-first processing and minimizes storage of raw sensitive artifacts. Public site pages are static and do not require authentication.</p>
      </Card>
    </PublicShell>
  );
}
