import Link from 'next/link';
import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Support',
  description: 'Find Zeo support channels, troubleshooting docs, and status updates.',
};

export default function SupportPage() {
  return (
    <PublicShell title="Support">
      <div className="max-w-3xl space-y-4">
        <p className="text-muted-foreground">Need help with installation, workflows, or governance checks? Use the support paths below.</p>
        <Card className="p-5">
          <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            <li><Link href="/docs" className="font-medium text-primary hover:underline">Documentation and quickstart</Link></li>
            <li><Link href="/faq" className="font-medium text-primary hover:underline">Frequently asked questions</Link></li>
            <li><Link href="/status" className="font-medium text-primary hover:underline">Service and release status</Link></li>
            <li><Link href="/contact" className="font-medium text-primary hover:underline">Contact and reporting channels</Link></li>
          </ul>
        </Card>
      </div>
    </PublicShell>
  );
}
