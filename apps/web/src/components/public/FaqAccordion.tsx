'use client';

import { useState } from 'react';

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <article key={item.question} className="rounded-lg border border-gray-200 bg-white">
            <h2>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                aria-expanded={open}
                aria-controls={`faq-panel-${index}`}
                id={`faq-trigger-${index}`}
              >
                <span>{item.question}</span>
                <span aria-hidden="true" className="text-gray-500">{open ? '−' : '+'}</span>
              </button>
            </h2>
            {open ? (
              <p id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-trigger-${index}`} className="px-5 pb-5 text-sm text-gray-600">
                {item.answer}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
