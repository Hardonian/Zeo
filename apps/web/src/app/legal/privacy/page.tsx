import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Zeo privacy policy for docs site, CLI telemetry defaults, and support communications.',
};

export default function LegalPrivacyPage() {
  return (
    <PublicShell title="Privacy policy">
      <Card className="max-w-4xl space-y-4 p-6 text-sm text-muted-foreground">
        <p>Zeo defaults to minimal data collection in public web pages and emphasizes local-first CLI execution when feasible.</p>
        <p>Do not submit secrets in public forms or issue trackers. Sensitive reports should follow the repository security process.</p>
        <p>Operational logs and evidence artifacts are controlled by your deployment settings. Review your retention policies before storing sensitive material.</p>
      </Card>
    </PublicShell>
  );
}
