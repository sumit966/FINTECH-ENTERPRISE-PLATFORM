import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Network, CalendarCheck, Plane, Wallet, Landmark,
  FolderKanban, Handshake, ShoppingCart, Package, UserPlus, GraduationCap,
  Code2, Cloud, ShieldCheck, Sparkles, Activity, FileText, BookOpen,
  Bell, Calendar, ScrollText, Settings, Search, ArrowRight, Plus, FileBadge,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { searchService, SearchHit } from '../services/searchService';
import { useDebounce } from '../hooks/useDebounce';

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: any;
  action: () => void;
  keywords?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 200);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [busy, setBusy] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navCommands: PaletteItem[] = useMemo(() => {
    const all: PaletteItem[] = [
      { id: 'nav-/',           label: 'Go to Founder Command Center', icon: LayoutDashboard, action: () => navigate('/'),            keywords: 'founder home dashboard' },
      { id: 'nav/executive',   label: 'Go to Executive Dashboard',    icon: Activity,        action: () => navigate('/executive'),   keywords: 'kpi overview' },
      { id: 'nav/pulse',       label: 'Go to Pulse Intelligence',     icon: Sparkles,        action: () => navigate('/pulse'),       keywords: 'kpi intelligence' },
      { id: 'nav/ai',          label: 'Open AI Command Center',       icon: Sparkles,        action: () => navigate('/ai'),          keywords: 'ai assistant llm' },
      { id: 'nav/employees',   label: 'Open Employee Directory',      icon: Users,           action: () => navigate('/employees'),   keywords: 'people hr' },
      { id: 'nav/org',         label: 'Open Organisation Chart',      icon: Network,         action: () => navigate('/org'),         keywords: 'hierarchy tree' },
      { id: 'nav/attendance',  label: 'Open Attendance',              icon: CalendarCheck,   action: () => navigate('/attendance'),  keywords: 'check-in wfh' },
      { id: 'nav/leave',       label: 'Open Leave',                   icon: Plane,           action: () => navigate('/leave'),       keywords: 'pto' },
      { id: 'nav/payroll',     label: 'Open Payroll',                 icon: Wallet,          action: () => navigate('/payroll'),     keywords: 'salary payslip' },
      { id: 'nav/finance',     label: 'Open Finance',                 icon: Landmark,        action: () => navigate('/finance'),     keywords: 'invoices expenses pnl' },
      { id: 'nav/projects',    label: 'Open Projects',                icon: FolderKanban,    action: () => navigate('/projects'),    keywords: 'delivery' },
      { id: 'nav/clients',     label: 'Open Clients',                 icon: Handshake,       action: () => navigate('/clients'),     keywords: 'crm accounts' },
      { id: 'nav/procurement', label: 'Open Procurement',             icon: ShoppingCart,    action: () => navigate('/procurement'),keywords: 'vendors purchase orders' },
      { id: 'nav/assets',      label: 'Open Assets',                  icon: Package,         action: () => navigate('/assets'),      keywords: 'hardware laptops' },
      { id: 'nav/licenses',    label: 'Open Licenses',                icon: FileBadge,       action: () => navigate('/licenses'),    keywords: 'saas subscriptions' },
      { id: 'nav/recruitment', label: 'Open Recruitment',             icon: UserPlus,        action: () => navigate('/recruitment'), keywords: 'ats candidates jobs' },
      { id: 'nav/exams',       label: 'Open Exams',                   icon: GraduationCap,   action: () => navigate('/exams'),       keywords: 'assessments' },
      { id: 'nav/engineering', label: 'Open Engineering',             icon: Code2,           action: () => navigate('/engineering'), keywords: 'repos builds deployments' },
      { id: 'nav/cloud',       label: 'Open Cloud',                   icon: Cloud,           action: () => navigate('/cloud'),       keywords: 'aws azure gcp' },
      { id: 'nav/security',    label: 'Open Security Center',         icon: ShieldCheck,     action: () => navigate('/security'),    keywords: 'events vulns' },
      { id: 'nav/documents',   label: 'Open Documents',               icon: FileText,        action: () => navigate('/documents'),   keywords: 'files' },
      { id: 'nav/knowledge',   label: 'Open Knowledge',               icon: BookOpen,        action: () => navigate('/knowledge'),   keywords: 'articles sop policies' },
      { id: 'nav/calendar',    label: 'Open Calendar',                icon: Calendar,        action: () => navigate('/calendar'),    keywords: 'events holidays' },
      { id: 'nav/notifications',label: 'Open Notifications',          icon: Bell,            action: () => navigate('/notifications'),keywords: 'alerts' },
      { id: 'nav/audit',       label: 'Open Audit Logs',              icon: ScrollText,      action: () => navigate('/audit'),       keywords: 'governance' },
      { id: 'nav/settings',    label: 'Open Settings',                icon: Settings,        action: () => navigate('/settings'),    keywords: 'admin integrations' },
    ];
    return all.filter((c) => {
      const check = (path: string, perm: string) => hasPermission(perm);
      if (c.id === 'nav/employees' || c.id === 'nav/org') return check(c.id, 'employees.read');
      if (c.id === 'nav/attendance') return check(c.id, 'attendance.read');
      if (c.id === 'nav/leave') return check(c.id, 'leave.read');
      if (c.id === 'nav/payroll') return check(c.id, 'payroll.read');
      if (c.id === 'nav/finance') return check(c.id, 'finance.read');
      if (c.id === 'nav/projects') return check(c.id, 'projects.read');
      if (c.id === 'nav/clients') return check(c.id, 'clients.read');
      if (c.id === 'nav/procurement') return check(c.id, 'vendors.read');
      if (c.id === 'nav/assets' || c.id === 'nav/licenses') return check(c.id, 'assets.read');
      if (c.id === 'nav/recruitment') return check(c.id, 'recruitment.read');
      if (c.id === 'nav/exams') return check(c.id, 'exams.read');
      if (c.id === 'nav/engineering' || c.id === 'nav/cloud') return check(c.id, 'engineering.read');
      if (c.id === 'nav/security') return check(c.id, 'security.read');
      if (c.id === 'nav/documents') return check(c.id, 'documents.read');
      if (c.id === 'nav/knowledge') return check(c.id, 'knowledge.read');
      if (c.id === 'nav/audit') return check(c.id, 'audit.read');
      if (c.id === 'nav/settings') return check(c.id, 'settings.read');
      return true;
    });
  }, [hasPermission, navigate]);

  const actions: PaletteItem[] = useMemo(() => [
    { id: 'act/search-employees', label: 'Search employees…',      icon: Search, action: () => { setQuery(''); inputRef.current?.focus(); } },
    { id: 'act/new-project',      label: 'Create a new project',   icon: Plus,   action: () => navigate('/projects') },
    { id: 'act/new-job',          label: 'Create a new job opening', icon: Plus, action: () => navigate('/recruitment') },
    { id: 'act/view-payroll',     label: 'View this month payroll', icon: Wallet, action: () => navigate('/payroll') },
    { id: 'act/reports',          label: 'Open reports',           icon: FileText, action: () => navigate('/finance') },
  ], [navigate]);

  // Search hits
  useEffect(() => {
    if (!open) return;
    if (debounced.trim().length < 2) { setHits([]); return; }
    setBusy(true);
    searchService.search(debounced)
      .then((r) => setHits(r.hits))
      .catch(() => setHits([]))
      .finally(() => setBusy(false));
  }, [debounced, open]);

  // Reset on open
  useEffect(() => {
    if (open) { setQuery(''); setActiveIndex(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  // Combine into flat list
  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...actions, ...navCommands];
    return [...actions, ...navCommands].filter((c) => c.label.toLowerCase().includes(q) || (c.keywords || '').includes(q));
  }, [actions, navCommands, query]);

  const flat = useMemo(() => {
    const items: ({ type: 'command'; item: PaletteItem } | { type: 'hit'; item: SearchHit })[] = [];
    for (const c of filteredCommands) items.push({ type: 'command', item: c });
    for (const h of hits) items.push({ type: 'hit', item: h });
    return items;
  }, [filteredCommands, hits]);

  useEffect(() => { setActiveIndex(0); }, [flat.length]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(flat.length - 1, i + 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((i) => Math.max(0, i - 1)); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const entry = flat[activeIndex];
        if (!entry) return;
        if (entry.type === 'command') {
          entry.item.action();
          if (!entry.item.id.startsWith('act/search')) onClose();
        } else {
          navigate(entry.item.link);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flat, activeIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search employees, projects, clients…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <kbd className="text-[10px] rounded border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-slate-500">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredCommands.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-slate-500">Commands</div>
              {filteredCommands.slice(0, 8).map((c, i) => {
                const globalIdx = i;
                const active = globalIdx === activeIndex;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    onClick={() => { c.action(); if (!c.id.startsWith('act/search')) onClose(); }}
                    className={'w-full flex items-center gap-3 px-4 py-2 text-left text-sm ' + (active ? 'bg-brand-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
                  >
                    <Icon size={16} className="text-slate-400 shrink-0" />
                    <span className="flex-1">{c.label}</span>
                    <ArrowRight size={12} className={'text-slate-400 ' + (active ? 'opacity-100' : 'opacity-0')} />
                  </button>
                );
              })}
            </div>
          )}

          {(hits.length > 0 || busy) && (
            <div>
              <div className="px-4 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                Search {busy && <span className="text-brand-500">· searching…</span>}
              </div>
              {hits.map((h, i) => {
                const globalIdx = filteredCommands.length + i;
                const active = globalIdx === activeIndex;
                return (
                  <button
                    key={h.kind + h.id}
                    onMouseEnter={() => setActiveIndex(globalIdx)}
                    onClick={() => { navigate(h.link); onClose(); }}
                    className={'w-full flex items-center gap-3 px-4 py-2 text-left text-sm ' + (active ? 'bg-brand-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
                  >
                    <span className="text-[10px] uppercase tracking-wider w-20 text-slate-500">{h.kind}</span>
                    <span className="flex-1">
                      <span className="font-medium">{h.title}</span>
                      <span className="text-slate-500 ml-2 text-xs">{h.subtitle}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{h.code}</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredCommands.length === 0 && hits.length === 0 && !busy && query.trim().length >= 2 && (
            <div className="px-4 py-8 text-center text-sm text-slate-500">No results.</div>
          )}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
          <span><kbd className="rounded border border-slate-300 dark:border-slate-700 px-1">↑↓</kbd> navigate</span>
          <span><kbd className="rounded border border-slate-300 dark:border-slate-700 px-1">↵</kbd> open</span>
          <span><kbd className="rounded border border-slate-300 dark:border-slate-700 px-1">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}