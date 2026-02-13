import { PublicShell } from '@/components/site/PublicShell';
import { FaqAccordion } from '@/components/public/FaqAccordion';

export const metadata = {
  title: 'FAQ | Zeo',
  description: 'Common questions about Zeo setup, governance workflows, and support channels.',
};

export default function FaqPage() {
  const items = [
    { question: 'Is Zeo only a CLI?', answer: 'Zeo includes a CLI for local workflows and a web interface for governance dashboards and docs.' },
    { question: 'Do I need cloud hosting to use Zeo?', answer: 'No. Core workflows can run locally from source using pnpm install and workspace build commands.' },
    { question: 'How are uncertainties represented?', answer: 'Zeo emphasizes confidence ranges, assumptions, provenance, and sensitivity instead of single-point certainty.' },
    { question: 'How do I report bugs?', answer: 'Use GitHub Issues for product bugs and feature requests. Security-sensitive reports should follow SECURITY.md disclosure guidance.' },
  ];

  return (
    <PublicShell title="Frequently Asked Questions">
      <div className="max-w-4xl space-y-4">
        <FaqAccordion items={items} />
      </div>
    </PublicShell>
  );
}
