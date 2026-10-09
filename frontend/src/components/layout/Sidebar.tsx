import { NavLink } from 'react-router-dom';
import { navConfig } from '../../data/navConfig';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, hasPermission } = useAuth();

  return (
    <aside
      className={
        'h-screen sticky top-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ' +
        (collapsed ? 'w-16' : 'w-64')
      }
    >
      <div className="flex items-center justify-between h-16 px-3 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-brand-500 grid place-items-center text-white font-bold">N</div>
            <div>
              <div className="text-sm font-semibold leading-tight">Nexus</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Enterprise</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navConfig.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (!item.permission) return true;
            return hasPermission(item.permission);
          });
          if (!visibleItems.length) return null;
          return (
            <div key={section.title}>
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors ' +
                        (isActive
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 font-medium'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800')
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {!collapsed && user && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          <div className="font-medium text-slate-700 dark:text-slate-200 truncate">{user.fullName}</div>
          <div className="truncate">{user.roles.map((r) => r.name).join(', ') || 'User'}</div>
        </div>
      )}
    </aside>
  );
}