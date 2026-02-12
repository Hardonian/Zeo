import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Privacy Policy | Zeo',
  description: 'Zeo privacy policy for docs site, CLI telemetry defaults, and support communications.',
};

export default function LegalPrivacyPage() {
  return (
    <PublicShell title="Privacy policy">
      <div className="max-w-4xl space-y-4 text-sm text-gray-700">
        <p>Zeo defaults to minimal data collection in public web pages and emphasizes local-first CLI execution when feasible.</p>
        <p>Do not submit secrets in public forms or issue trackers. Sensitive reports should follow the repository security process.</p>
        <p>Operational logs and evidence artifacts are controlled by your deployment settings. Review your retention policies before storing sensitive material.</p>
      </div>
    </PublicShell>
  );
}
