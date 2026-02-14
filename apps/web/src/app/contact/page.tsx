import { PublicShell } from '@/components/site/PublicShell';
import { IconGitHub, IconShield, IconAudit, IconProvenance } from '@/components/icons/ZeoIcons';

export const metadata = {
  title: 'Contact | Zeo',
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
          <p className="text-gray-700 leading-relaxed">
            We are here to help with product questions, security issues, and enterprise inquiries.
            Choose the appropriate channel below to get in touch with the Zeo team.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.title} className="rounded-xl border border-gray-200 bg-white p-6 card-hover">
                <div className={`inline-flex rounded-lg p-2 ${ch.color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-gray-900 text-lg mb-2">{ch.title}</h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{ch.description}</p>
                {ch.external ? (
                  <a href={ch.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                    {ch.linkLabel} <span aria-hidden="true">&rarr;</span>
                  </a>
                ) : (
                  <a href={ch.link} className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline">
                    {ch.linkLabel} <span aria-hidden="true">&rarr;</span>
                  </a>
                )}
              </div>
            );
          })}
        </section>

        <section className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Response Times</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'GitHub Issues', time: 'Within 48 hours' },
              { label: 'Security Reports', time: 'Within 24 hours' },
              { label: 'Enterprise Inquiries', time: 'Within 1 business day' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-white border border-gray-100 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">{item.label}</p>
                <p className="font-semibold text-gray-900">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
