import Link from 'next/link';
import { PublicShell } from '@/components/site/PublicShell';

export const metadata = {
  title: 'Pricing | Zeo',
  description: 'Zeo pricing tiers — Community edition for open-source usage and Enterprise for policy packs, governance integrations, and audit support.',
};

export default function PricingPage() {
  return (
    <PublicShell title="Pricing">
      <div className="max-w-4xl space-y-8">
        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Community */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Community</h2>
              <p className="text-gray-600 mt-1">Open-source usage</p>
              <p className="text-2xl font-bold mt-3">Free</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Local deployment
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Self-managed provenance storage
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Core decision branching tools
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Basic governance dashboards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Community support
              </li>
            </ul>
            <Link 
              href="/quickstart" 
              className="mt-6 block w-full rounded border border-gray-300 px-4 py-2 text-center hover:bg-gray-50 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Enterprise */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Enterprise</h2>
              <p className="text-gray-600 mt-1">For teams that need governance</p>
              <p className="text-2xl font-bold mt-3">Contact Us</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                Everything in Community, plus:
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                Policy packs and custom rules
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                GitHub App integration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                Audit-focused rollout support
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                SSO and team management
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">✓</span>
                Priority support
              </li>
            </ul>
            <Link 
              href="/contact" 
              className="mt-6 block w-full rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">What&apos;s included in the Community edition?</h3>
              <p className="text-sm text-gray-600 mt-2">
                The Community edition includes all core decision intelligence tools, governance 
                dashboards, and epistemic tooling. It&apos;s designed for individual users and small 
                teams who can self-host and manage their own infrastructure.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">When should I consider Enterprise?</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enterprise is recommended for teams that need policy enforcement across repositories, 
                GitHub integration for PR governance, SSO for team management, or audit support for 
                compliance requirements.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-medium">Is Zeo open source?</h3>
              <p className="text-sm text-gray-600 mt-2">
                Yes. The core Zeo platform is open source under the MIT license. Enterprise features 
                are offered as a hosted service with additional support and integrations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
