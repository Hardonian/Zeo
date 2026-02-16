'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { StatusBar } from '@/components/dashboard/StatusBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AppHeader sidebarCollapsed={collapsed} />
      <main
        id="main-content"
        className={`pt-14 pb-8 text-foreground transition-[margin-left] duration-200 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
      <StatusBar sidebarCollapsed={collapsed} />
    </div>
  );
}
