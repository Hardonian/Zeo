import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';
import { CTASection, Section, uiTokens } from '@/components/site/ui-system';

export const metadata = {
  title: 'Support | Zeo',
  description: 'Find Zeo support channels, troubleshooting docs, and status updates.',
};

const supportLinks = [
  { href: '/docs', label: 'Documentation and quickstart', description: 'Setup, install, and walkthrough guides for static-first usage.' },
  { href: '/faq', label: 'Frequently asked questions', description: 'Answers for common adoption and governance questions.' },
  { href: '/status', label: 'Service and release status', description: 'Current release health and known incidents.' },
  { href: '/contact', label: 'Contact and reporting channels', description: 'Reach maintainers for support and responsible reporting.' },
];

export default function SupportPage() {
  return (
    <PublicShell title="Support">
      <div className={uiTokens.pageStack}>
        <Section className="max-w-4xl">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Help paths</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Need help with installation, workflows, or governance checks? Use the support paths below.</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-2">
            {supportLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <CTASection
          title="Still blocked?"
          description="If documentation does not resolve your issue, use contact channels and include reproduction details for faster triage."
          primaryHref="/contact"
          primaryLabel="Contact support"
          secondaryHref="/docs"
          secondaryLabel="Read docs"
        />
      </div>
    </PublicShell>
  );
}
