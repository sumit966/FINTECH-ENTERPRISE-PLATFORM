import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight, X, Mail, MailOpen, Layers } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService, NotificationRow } from '../../services/notificationService';

const TYPE_TONE: Record<string, 'brand' | 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  LEAVE: 'success', PAYROLL: 'brand', INTERVIEW: 'info', PROJECT: 'info',
  SECURITY: 'danger', INVOICE: 'warn', DEADLINE: 'warn', SYSTEM: 'neutral',
};

function fmtWhen(d: string): string {
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function NotificationsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { push } = useNotifications();

  const typeFromUrl = params.get('type') || '';
  const isReadFromUrl = params.get('isRead') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [data, setData] = useState<NotificationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await notificationService.list({
        page: pageFromUrl, pageSize: 20,
        type: typeFromUrl || undefined,
        isRead: isReadFromUrl || undefined,
      });
      setData(r.items);
      setTotal(r.total);
      setUnread(r.unreadCount);
      setTotalPages(r.totalPages);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [pageFromUrl, typeFromUrl, isReadFromUrl]);

  const markRead = async (n: NotificationRow) => {
    setBusyId(n.id);
    try {
      await notificationService.markRead(n.id);
      await load();
      // If a link is present, navigate after marking read
      if (n.link) navigate(n.link);
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed to mark read', body: e?.message });
    } finally { setBusyId(null); }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      push({ variant: 'success', title: 'All notifications marked read' });
      await load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed', body: e?.message });
    } finally { setMarkingAll(false); }
  };

  const activeFilterCount = [typeFromUrl, isReadFromUrl].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} total &middot; {unread} unread &middot; click to open the related record
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setUrl({ type: null, isRead: null, page: null })}>
              <X size={14} /> Clear filters
            </Button>
          )}
          {unread > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead} loading={markingAll}>
              <CheckCheck size={14} /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total" value={total} hint="All notifications"
          icon={<Bell size={18} />} accent="brand"
          onClick={() => setUrl({ type: null, isRead: null, page: null })} />
        <Kpi label="Unread" value={unread} hint="Requires attention"
          icon={<Mail size={18} />} accent="amber"
          onClick={() => setUrl({ isRead: 'false', page: null })} />
        <Kpi label="Read" value={total - unread} hint="Archived"
          icon={<MailOpen size={18} />} accent="emerald"
          onClick={() => setUrl({ isRead: 'true', page: null })} />
        <Kpi label="Types" value={new Set(data.map((n) => n.type)).size} hint="In current view"
          icon={<Layers size={18} />} accent="violet" />
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select value={typeFromUrl} onChange={(e) => setUrl({ type: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm md:col-span-2">
            <option value="">All types</option>
            <option value="LEAVE">Leave</option>
            <option value="PAYROLL">Payroll</option>
            <option value="INTERVIEW">Interview</option>
            <option value="PROJECT">Project</option>
            <option value="SECURITY">Security</option>
            <option value="INVOICE">Invoice</option>
            <option value="DEADLINE">Deadline</option>
            <option value="SYSTEM">System</option>
          </select>
          <select value={isReadFromUrl} onChange={(e) => setUrl({ isRead: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All</option>
            <option value="false">Unread only</option>
            <option value="true">Read only</option>
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {typeFromUrl && <Badge tone="brand">Type: {typeFromUrl}</Badge>}
          {isReadFromUrl === 'false' && <Badge tone="brand">Unread only</Badge>}
          {isReadFromUrl === 'true' && <Badge tone="brand">Read only</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={load} /> :
       loading ? <SkeletonTable rows={6} /> :
       data.length === 0 ? <EmptyState title="No notifications match the filters" description="Try clearing filters." /> :
       (
        <Card padded={false}>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.map((n) => (
              <div
                key={n.id}
                className={'flex items-start gap-3 p-4 transition ' + (n.isRead ? 'hover:bg-slate-50 dark:hover:bg-slate-900/40' : 'bg-brand-500/5 hover:bg-brand-500/10')}
              >
                <div className={'h-8 w-8 rounded-full grid place-items-center shrink-0 ' + (n.isRead ? 'bg-slate-100 dark:bg-slate-800' : 'bg-brand-500/20')}>
                  <Bell size={14} className={n.isRead ? 'text-slate-500' : 'text-brand-500'} />
                </div>
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { if (n.link) navigate(n.link); if (!n.isRead) markRead(n); }}
                >
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{n.title}</span>
                    <Badge tone={TYPE_TONE[n.type] || 'neutral'}>{n.type}</Badge>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                  </div>
                  <div className="text-xs text-slate-500">{n.body}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{fmtWhen(n.createdAt)}</div>
                </button>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); markRead(n); }} loading={busyId === n.id}>
                    <Check size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages} &middot; {total} total</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
            <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
