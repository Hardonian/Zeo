import { PublicShell } from '@/components/site/PublicShell';
import { PublicShell } from '@/components/site/PublicShell';
import { IconGitHub, IconShield, IconAudit, IconProvenance } from '@/components/icons/ZeoIcons';
import { ButtonLink, Card } from '@/components/ui';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with the Zeo team for product questions, security issues, or enterprise inquiries.',
};

const channels = [
  {
    icon: IconGitHub,
    title: 'Product Questions',
    description: 'For feature requests, bug reports, and general product questions, please open an issue in our GitHub repository.',
    link: 'https://github.com/scott/zeo/issues',
    linkLabel: 'Open GitHub Issue',
    external: true,
    color: 'bg-gray-100 text-gray-700',
  },
  {
    icon: IconShield,
    title: 'Security Issues',
    description: 'For security vulnerabilities, please review our security policy and report through appropriate channels.',
    link: '/security',
    linkLabel: 'View Security Policy',
    external: false,
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: IconAudit,
    title: 'Enterprise Sales',
    description: 'For enterprise licensing, custom deployments, and dedicated support options, please reach out to our sales team.',
    link: 'mailto:enterprise@zeo.dev',
    linkLabel: 'enterprise@zeo.dev',
    external: true,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: IconProvenance,
    title: 'Documentation',
    description: 'Check out our documentation for setup guides, API references, and best practices.',
    link: '/quickstart',
    linkLabel: 'View Quickstart',
    external: false,
    color: 'bg-emerald-50 text-emerald-600',
  },
];

export default function ContactPage() {
  return (
    <PublicShell title="Contact">
      <div className="max-w-4xl space-y-10">
        <section className="max-w-2xl">
          <p className="text-muted-foreground leading-relaxed">
            We are here to help with product questions, security issues, and enterprise inquiries.
            Choose the appropriate channel below to get in touch with the Zeo team.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <Card key={ch.title} className="p-6">
                <div className={`inline-flex rounded-md p-2 ${ch.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-foreground text-lg mb-2">{ch.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{ch.description}</p>
                <ButtonLink href={ch.link} external={ch.external} variant="outline" size="sm">
                  {ch.linkLabel}
                </ButtonLink>
              </Card>
            );
          })}
        </section>

        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4">Response Times</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'GitHub Issues', time: 'Within 48 hours' },
              { label: 'Security Reports', time: 'Within 24 hours' },
              { label: 'Enterprise Inquiries', time: 'Within 1 business day' },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-border bg-surface p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                <p className="font-semibold text-foreground">{item.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PublicShell>
  );
}
