'use client';

import dynamic from 'next/dynamic';

const DecisionHeroInner = dynamic(
  () => import('./DecisionHero').then((m) => m.DecisionHero),
  { ssr: false },
);

export function DecisionHeroLoader() {
  return <DecisionHeroInner />;
}
