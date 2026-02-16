import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Terms',
  description: 'Zeo terms of service for literature and evidence mapping tools.',
};

export default function TermsPage() {
  return (
    <PublicShell title="Terms">
      <Card className="p-6">
        <p className="text-muted-foreground">Zeo supports literature and evidence mapping. It does not provide operational instructions for illegal abuse or medical diagnosis.</p>
      </Card>
    </PublicShell>
  );
}
