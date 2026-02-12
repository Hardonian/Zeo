import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Terms of Service | Zeo',
  description: 'Usage terms for Zeo documentation site and open-source software distribution.',
};

export default function LegalTermsPage() {
  return (
    <PublicShell title="Terms of service">
      <div className="max-w-4xl space-y-4 text-sm text-gray-700">
        <p>Zeo software is provided under the repository license. You are responsible for your deployment security, access controls, and compliance posture.</p>
        <p>The public site provides documentation and onboarding guidance without warranty of uninterrupted service.</p>
        <p>For legal or support questions, contact hello@zeo.dev or open an issue in the Zeo repository.</p>
      </div>
    </PublicShell>
  );
}
