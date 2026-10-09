import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { auditService, AuditLogRow, AuditSummary } from '../../services/auditService';

const PIE_COLORS = ['#3358ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b'];

const ACTION_TONE: Record<string, 'brand' | 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  CREATE: 'success', UPDATE: 'info', DELETE: 'danger', APPROVE: 'brand',
  LOGIN: 'neutral', LOGOUT: 'neutral', EXPORT: 'warn',
};

export default function AuditPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [module, setModule] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { auditService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    auditService.list({ page, pageSize: 50, search: searchDeb || undefined, action: action || undefined, module: module || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load audit logs'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, action, module]);

  useEffect(() => { setPage(1); }, [searchDeb, action, module]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const actionData = summary?.byAction.map((a) => ({ name: a.action, value: a.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit &amp; Governance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete audit trail of platform activity &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Events" value={summary.total.toLocaleString('en-IN')} hint={summary.byModule.length + ' modules'} />
          <StatCard label="Last 24 hours" value={summary.last24h} hint="Recent activity" />
          <StatCard label="Last 7 days" value={summary.last7d} hint="Weekly volume" />
          <StatCard label="Active Users" value={summary.topUsers.length} hint="In top-10 activity" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="By Action" subtitle="Distribution of audit actions" />
          {actionData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={actionData} dataKey="value" nameKey="name" outerRadius={70} label={(e: any) => e.name} labelLine={false}>
                    {actionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="By Module" subtitle="Which parts of the platform see the most activity" />
          {!summary ? <SkeletonTable rows={3} /> : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {summary.byModule.slice(0, 15).map((m) => {
                const max = summary.byModule[0]?.count || 1;
                const pct = (m.count / max) * 100;
                return (
                  <div key={m.module}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-slate-500">{m.module}</span>
                      <span className="font-medium">{m.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-brand-500" style={{ width: pct + '%' }} />
                    </div>
                  </div>
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
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All actions</option>
            {summary?.byAction.map((a) => <option key={a.action} value={a.action}>{a.action} ({a.count})</option>)}
          </select>
          <select value={module} onChange={(e) => setModule(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All modules</option>
            {summary?.byModule.map((m) => <option key={m.module} value={m.module}>{m.module} ({m.count})</option>)}
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={15} /> : (
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
                      <div className="text-sm">{row.module}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(row.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-16 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Record ID</div>
                        <div className="font-mono">{row.recordId || '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">IP / Agent</div>
                        <div className="font-mono text-[11px] truncate">{row.ipAddress} · {row.userAgent?.slice(0, 60)}</div>
                      </div>
                      {(row.oldValue || row.newValue) && (
                        <>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Old value</div>
                            <pre className="rounded bg-slate-50 dark:bg-slate-900 p-2 overflow-x-auto max-h-40 text-[10px]">{JSON.stringify(row.oldValue, null, 2) || '—'}</pre>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">New value</div>
                            <pre className="rounded bg-slate-50 dark:bg-slate-900 p-2 overflow-x-auto max-h-40 text-[10px]">{JSON.stringify(row.newValue, null, 2) || '—'}</pre>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {data.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No audit logs match your filters.</div>}
          </div>
        </Card>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(page - 1) * 50 + 1}-{Math.min(page * 50, total)} of {total.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}