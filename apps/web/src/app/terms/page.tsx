import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Terms | Zeo',
  description: 'Zeo terms of service for literature and evidence mapping tools.',
};

export default function TermsPage() {
  return (
    <PublicShell title="Terms">
      <p className="text-gray-700">Zeo supports literature and evidence mapping. It does not provide operational instructions for illegal abuse or medical diagnosis.</p>
    </PublicShell>
  );
}
