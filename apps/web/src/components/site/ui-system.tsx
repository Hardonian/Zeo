import Link from 'next/link';
import type { ReactNode } from 'react';

export const uiTokens = {
  container: 'mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8',
  sectionSpacing: 'py-10 md:py-12',
  pageStack: 'space-y-10 md:space-y-12',
  heading: 'text-3xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-4xl',
  lead: 'text-base leading-7 text-slate-600 md:text-lg',
  card: 'rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]',
  cardMuted: 'rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6',
  buttonPrimary:
    'inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  buttonSecondary:
    'inline-flex items-center justify-center rounded-xl border border-slate-300/80 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
};

export function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`${uiTokens.card} ${className}`.trim()}>{children}</section>;
}

export function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <section className="max-w-3xl">
      <h1 className={uiTokens.heading}>{title}</h1>
      <p className={`mt-3 ${uiTokens.lead}`}>{description}</p>
    </section>
  );
}

export function CTASection({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-[var(--shadow-soft)] md:p-8">
      <div className="zeo-orb -right-36 -top-48 bg-blue-400" />
      <div className="relative">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={primaryHref} className={uiTokens.buttonPrimary}>
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className={uiTokens.buttonSecondary}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
      </div>
    </section>
  );
}
