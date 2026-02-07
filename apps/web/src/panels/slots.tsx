'use client';

import React from 'react';
import { PanelHost } from './PanelHost';
import type { UiPanelManifest } from '@zeo/contracts';

interface SlotProps {
  slot: string;
  panels: UiPanelManifest[];
  className?: string;
}

export function PanelSlot({ slot, panels, className = '' }: SlotProps) {
  const slotPanels = panels.filter((p) => p.slot === slot);

  if (slotPanels.length === 0) {
    return null;
  }

  return (
    <div className={`panel-slot panel-slot-${slot} ${className}`}>
      {slotPanels.map((panel) => (
        <div key={panel.id} className="panel-container h-full w-full">
          <PanelHost panels={panels} panelId={panel.id} />
        </div>
      ))}
    </div>
  );
}

interface SlotsLayoutProps {
  panels: UiPanelManifest[];
}

export function SlotsLayout({ panels }: SlotsLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0">
        <PanelSlot slot="leftSidebar" panels={panels} className="h-full" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <PanelSlot slot="main" panels={panels} className="h-full" />
        </div>
        <div className="h-16 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <PanelSlot slot="footer" panels={panels} className="h-full" />
        </div>
      </div>
      <div className="w-80 border-l border-gray-200 bg-white flex-shrink-0">
        <PanelSlot slot="rightInspector" panels={panels} className="h-full" />
      </div>
    </div>
  );
}
