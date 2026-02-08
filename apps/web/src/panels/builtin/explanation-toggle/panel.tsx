import React, { useState } from 'react';

interface ExplanationToggleProps {
  // Props from context
}

export default function ExplanationToggle(_props: ExplanationToggleProps) {
  const [level, setLevel] = useState(2);

  const levels = [
    { value: 0, label: 'Action Only', icon: '⚡' },
    { value: 1, label: 'Why?', icon: '🤔' },
    { value: 2, label: 'Factors', icon: '📊' },
    { value: 3, label: 'Risks', icon: '⚠️' },
    { value: 4, label: 'Full', icon: '🔍' },
  ];

  return (
    <div className="p-2 flex items-center gap-4">
      <span className="text-sm font-medium text-gray-600">Explanation:</span>
      <div className="flex gap-1">
        {levels.map((l) => (
          <button
            key={l.value}
            onClick={() => setLevel(l.value)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              level === l.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={l.label}
          >
            {l.icon}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">{levels[level].label}</span>
    </div>
  );
}
