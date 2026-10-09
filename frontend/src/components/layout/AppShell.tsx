import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumbs from './Breadcrumbs';

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('nexus.sidebar') === '1'; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('nexus.sidebar', collapsed ? '1' : '0'); } catch { /* ignore */ }
  }, [collapsed]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-6">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          {children}
        </main>
        <footer className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          Nexus Enterprise Platform &middot; FINTECH IT SOLUTIONS &middot; Prototype build
        </footer>
      </div>
    </div>
  );
}