'use client';

import { useState } from 'react';
import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { AppHeader } from '@/components/dashboard/AppHeader';
import { StatusBar } from '@/components/dashboard/StatusBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(219,234,254,0.7),transparent_28rem),#f8fafc] dark:bg-gray-900">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <AppHeader sidebarCollapsed={collapsed} />
      <main
        id="main-content"
        className={`ml-16 pt-14 pb-12 transition-[margin-left] duration-300 ${
          collapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>
      <StatusBar sidebarCollapsed={collapsed} />
    </div>
  );
}
