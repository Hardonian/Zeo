import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Contact | Zeo',
  description: 'Get in touch with the Zeo team for product questions, security issues, or enterprise inquiries.',
};

export default function ContactPage() {
  return (
    <PublicShell title="Contact">
      <div className="max-w-3xl space-y-8">
        <section>
          <p className="text-gray-700 leading-relaxed">
            We&apos;re here to help with product questions, security issues, and enterprise inquiries.
            Choose the appropriate channel below to get in touch with the Zeo team.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {/* GitHub Issues */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-lg mb-2">Product Questions</h2>
            <p className="text-sm text-gray-600 mb-4">
              For feature requests, bug reports, and general product questions, 
              please open an issue in our GitHub repository.
            </p>
            <a 
              href="https://github.com/scott/zeo/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline text-sm"
            >
              Open GitHub Issue →
            </a>
          </div>

          {/* Security */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-lg mb-2">Security Issues</h2>
            <p className="text-sm text-gray-600 mb-4">
              For security vulnerabilities, please review our security policy and 
              report through appropriate channels.
            </p>
            <a 
              href="/security"
              className="text-blue-700 hover:underline text-sm"
            >
              View Security Policy →
            </a>
          </div>

          {/* Enterprise */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-lg mb-2">Enterprise Sales</h2>
            <p className="text-sm text-gray-600 mb-4">
              For enterprise licensing, custom deployments, and dedicated support 
              options, please reach out to our sales team.
            </p>
            <a 
              href="mailto:enterprise@zeo.dev"
              className="text-blue-700 hover:underline text-sm"
            >
              enterprise@zeo.dev →
            </a>
          </div>

          {/* Documentation */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-lg mb-2">Documentation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Check out our documentation for setup guides, API references, and 
              best practices.
            </p>
            <a 
              href="/quickstart"
              className="text-blue-700 hover:underline text-sm"
            >
              View Quickstart →
            </a>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h2 className="font-semibold mb-3">Response Times</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>GitHub Issues:</strong> Usually within 48 hours</li>
            <li><strong>Security Reports:</strong> Within 24 hours</li>
            <li><strong>Enterprise Inquiries:</strong> Within 1 business day</li>
          </ul>
        </section>
      </div>
    </PublicShell>
  );
}
