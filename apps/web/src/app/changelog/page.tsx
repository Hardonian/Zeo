import { PublicShell } from '@/components/site/PublicShell';

import { PublicShell } from '@/components/site/PublicShell';
import { Card } from '@/components/ui';

export const metadata = {
  title: 'Changelog',
  description: 'Recent Zeo release notes and highlights.',
};

const CHANGELOG_ITEMS = [
  {
    version: 'v1.1.0',
    date: '2026-01-18',
    notes: [
      'ReadyLayer and ControlPlane components integrated into the Zeo monorepo.',
      'Async webhook processing and retry handling refined for deterministic behavior.',
      'Policy status dashboard updates for clearer governance visibility.',
    ],
  },
  {
    version: 'v1.0.0',
    date: '2025-11-02',
    notes: [
      'Initial production release of governance engine, evidence contracts, and CLI.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PublicShell title="Changelog">
      <div className="max-w-4xl space-y-4">
        {CHANGELOG_ITEMS.map((item) => (
          <Card key={item.version} className="p-5">
            <h2 className="text-lg font-semibold text-foreground">{item.version}</h2>
            <p className="text-sm text-muted-foreground">{item.date}</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {item.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </PublicShell>
  );
}
