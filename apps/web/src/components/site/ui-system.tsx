import Link from 'next/link';
import type { ReactNode } from 'react';

export const uiTokens = {
  container: 'mx-auto w-full max-w-6xl px-6',
  sectionSpacing: 'py-10 md:py-12',
  pageStack: 'space-y-10 md:space-y-12',
  heading: 'text-3xl font-semibold tracking-tight text-slate-900',
  lead: 'text-base leading-7 text-slate-600 md:text-lg',
  card: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
  cardMuted: 'rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6',
  buttonPrimary:
    'inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
  buttonSecondary:
    'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
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
    <section className="rounded-2xl border border-blue-200/70 bg-gradient-to-b from-blue-50 to-white p-6 md:p-8">
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
    </section>
  );
}
