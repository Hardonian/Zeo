import Link from 'next/link';
import { hasPublicSupabaseEnv } from '@/lib/env';
import { getCurrentOrgId, listUserOrgs } from '@/lib/console-data';
import { OrgSwitcher } from '@/components/console/OrgSwitcher';

export const dynamic = 'force-dynamic';

const links = ['','/orgs','/projects','/repos','/runs','/keys','/settings'];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasPublicSupabaseEnv()) {
    return <div className="p-8">Console unavailable: Supabase environment variables are not configured.</div>;
  }

  const orgs = await listUserOrgs();
  const currentOrgId = await getCurrentOrgId();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Zeo Console</h1>
          <OrgSwitcher orgs={orgs.map((o) => ({ orgId: o.orgId, name: o.org?.name ?? o.orgId }))} currentOrgId={currentOrgId} />
        </div>
        <nav className="mb-6 flex flex-wrap gap-4">
          {links.map((link) => <Link className="text-sm text-blue-700 hover:underline" key={link || 'root'} href={`/app${link}`}>{link === '' ? 'dashboard' : link.slice(1)}</Link>)}
        </nav>
        {children}
      </div>
    </div>
  );
}
