import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Support | Zeo',
  description: 'Find Zeo support channels, troubleshooting docs, and status updates.',
};

export default function SupportPage() {
  return (
    <PublicShell title="Support">
      <div className="max-w-3xl space-y-4 text-gray-700">
        <p>Need help with installation, workflows, or governance checks? Use the support paths below.</p>
        <ul className="list-disc space-y-2 pl-6">
          <li><Link href="/docs" className="text-blue-700 hover:underline">Documentation and quickstart</Link></li>
          <li><Link href="/faq" className="text-blue-700 hover:underline">Frequently asked questions</Link></li>
          <li><Link href="/status" className="text-blue-700 hover:underline">Service and release status</Link></li>
          <li><Link href="/contact" className="text-blue-700 hover:underline">Contact and reporting channels</Link></li>
        </ul>
      </div>
    </PublicShell>
  );
}
