'use client';

import { useState, useEffect } from 'react';
import { SlotsLayout } from '@/panels/slots';
import { getAllRegisteredPanels } from '@/panels/registry';
import type { UiPanelManifest } from '@zeo/contracts';

export default function DemoPage() {
  const [panels, setPanels] = useState<UiPanelManifest[]>([]);

  useEffect(() => {
    const allPanels = getAllRegisteredPanels();
    console.log('Registered panels:', allPanels.length, allPanels.map(p => p.id));
    setPanels(allPanels);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Zeo Demo</h1>
          <span className="text-sm text-gray-500">
            {panels.length} panels registered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to Home
          </a>
        </div>
      </header>
      <main className="h-[calc(100vh-57px)]">
        <SlotsLayout panels={panels} />
      </main>
    </div>
  );
}
