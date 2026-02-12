import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'FAQ | Zeo',
  description: 'Common questions about Zeo setup, governance workflows, and support channels.',
};

export default function FaqPage() {
  return (
    <PublicShell title="Frequently Asked Questions">
      <div className="max-w-4xl space-y-4">
        {[
          ['Is Zeo only a CLI?', 'Zeo includes a CLI for local workflows and a web interface for governance dashboards and docs.'],
          ['Do I need cloud hosting to use Zeo?', 'No. Core workflows can run locally from source using pnpm install and workspace build commands.'],
          ['How are uncertainties represented?', 'Zeo emphasizes confidence ranges, assumptions, provenance, and sensitivity instead of single-point certainty.'],
          ['How do I report bugs?', 'Use GitHub Issues for product bugs and feature requests. Security-sensitive reports should follow SECURITY.md disclosure guidance.'],
        ].map(([question, answer]) => (
          <article key={question} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">{question}</h2>
            <p className="mt-2 text-sm text-gray-600">{answer}</p>
          </article>
        ))}
      </div>
    </PublicShell>
  );
}
