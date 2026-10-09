import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Moon, Search, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent('nexus:open-palette'));
  };

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4">
      <div className="flex-1 max-w-lg">
        <button
          onClick={openPalette}
          className="w-full text-left relative group"
          title="Search or run a command (Ctrl+K)"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <div className="w-full pl-9 pr-12 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 group-hover:border-brand-500/50 transition">
            Search or run a command…
          </div>
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-slate-500">
            Ctrl K
          </kbd>
        </button>
      </div>

      <Link to="/notifications" className="relative p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" title="Notifications">
        <Bell size={18} />
      </Link>

      <button
        onClick={toggle}
        className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {user && (
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium leading-tight">{user.fullName}</div>
            <div className="text-[11px] text-slate-500 leading-tight">
              {user.roles.map((r) => r.name).join(', ') || 'User'}
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-brand-500 text-white grid place-items-center text-sm font-semibold">
            {user.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}