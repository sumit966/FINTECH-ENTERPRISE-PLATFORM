import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ScrollText, X, Activity, Clock, Users, Database } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { auditService, AuditLogRow, AuditSummary } from '../../services/auditService';

const PIE_COLORS = ['#3358ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

const ACTION_TONE: Record<string, 'brand' | 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  CREATE: 'success', UPDATE: 'info', DELETE: 'danger', APPROVE: 'brand',
  LOGIN: 'neutral', LOGOUT: 'neutral', EXPORT: 'warn',
};

export default function AuditPage() {
  const [params, setParams] = useSearchParams();
  const searchFromUrl = params.get('q') || '';
  const actionFromUrl = params.get('action') || '';
  const moduleFromUrl = params.get('module') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [data, setData] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  useEffect(() => { auditService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    auditService.list({
      page: pageFromUrl, pageSize: 50,
      search: debounced || undefined,
      action: actionFromUrl || undefined,
      module: moduleFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load audit logs'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, actionFromUrl, moduleFromUrl]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const actionData = summary?.byAction.map((a) => ({ name: a.action, value: a.count })) || [];
  const activeFilterCount = [actionFromUrl, moduleFromUrl, debounced].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit &amp; Governance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} events &middot; complete audit trail &middot; click a row to expand
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); }}>
            <X size={14} /> Clear filters
          </Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Events" value={summary.total} hint={summary.byModule.length + ' modules'}
            icon={<Database size={18} />} accent="brand" />
          <Kpi label="Last 24 hours" value={summary.last24h} hint="Recent activity"
            icon={<Activity size={18} />} accent="violet" />
          <Kpi label="Last 7 days" value={summary.last7d} hint="Weekly volume"
            icon={<Clock size={18} />} accent="teal" />
          <Kpi label="Active Users" value={summary.topUsers.length} hint="In top-10 activity"
            icon={<Users size={18} />} accent="amber" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="By Action" subtitle="Click a slice to filter" />
          {actionData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={actionData} dataKey="value" nameKey="name" outerRadius={70}
                    label={(e: any) => e.name} labelLine={false} cursor="pointer"
                    onClick={(d: any) => { const a = d?.name || d?.payload?.name; if (a) setUrl({ action: a, page: null }); }}>
                    {actionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="By Module" subtitle="Click a module to filter" />
          {!summary ? <SkeletonTable rows={3} /> : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {summary.byModule.slice(0, 15).map((m) => {
                const max = summary.byModule[0]?.count || 1;
                const pct = (m.count / max) * 100;
                return (
                  <button
                    key={m.module}
                    onClick={() => setUrl({ module: m.module, page: null })}
                    className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded px-2 py-1"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-500">{m.module}</span>
                      <span className="font-medium">{m.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: pct + '%' }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by user, module, or record" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={actionFromUrl} onChange={(e) => setUrl({ action: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All actions</option>
            {summary?.byAction.map((a) => <option key={a.action} value={a.action}>{a.action} ({a.count})</option>)}
          </select>
          <select value={moduleFromUrl} onChange={(e) => setUrl({ module: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All modules</option>
            {summary?.byModule.map((m) => <option key={m.module} value={m.module}>{m.module} ({m.count})</option>)}
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {actionFromUrl && <Badge tone="brand">Action: {actionFromUrl}</Badge>}
          {moduleFromUrl && <Badge tone="brand">Module: {moduleFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={15} /> :
       data.length === 0 ? <EmptyState title="No audit events match the filters" description="Try widening the search." /> :
       (
        <Card padded={false}>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.map((row) => {
              const isExpanded = expanded.has(row.id);
              return (
                <div key={row.id}>
                  <button
                    onClick={() => toggle(row.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center shrink-0">
                      <ScrollText size={14} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div className="truncate">
                        <div className="text-sm font-medium">{row.userName || row.userEmail || 'system'}</div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">{row.userEmail}</div>
                      </div>
                      <div><Badge tone={ACTION_TONE[row.action] || 'neutral'}>{row.action}</Badge></div>
                      <div className="text-sm">
                        <button
                          onClick={(e) => { e.stopPropagation(); setUrl({ module: row.module, page: null }); }}
                          className="hover:text-brand-500 transition-colors"
                        >
                          {row.module}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(row.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-16 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Record ID</div>
                        <div className="font-mono">{row.recordId || '\u2014'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">IP / Agent</div>
                        <div className="font-mono text-[11px] truncate">{row.ipAddress || '\u2014'} &middot; {row.userAgent?.slice(0, 60) || '\u2014'}</div>
                      </div>
                      {(row.oldValue || row.newValue) && (
                        <>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Old value</div>
                            <pre className="rounded bg-slate-50 dark:bg-slate-900 p-2 overflow-x-auto max-h-40 text-[10px]">{row.oldValue ? JSON.stringify(row.oldValue, null, 2) : '\u2014'}</pre>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">New value</div>
                            <pre className="rounded bg-slate-50 dark:bg-slate-900 p-2 overflow-x-auto max-h-40 text-[10px]">{row.newValue ? JSON.stringify(row.newValue, null, 2) : '\u2014'}</pre>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(pageFromUrl - 1) * 50 + 1}&ndash;{Math.min(pageFromUrl * 50, total)} of {total.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
