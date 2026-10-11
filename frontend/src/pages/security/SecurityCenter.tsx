import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ShieldAlert, ShieldCheck, AlertTriangle, Clock, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { securityService, SecurityEventRow, SecuritySummary } from '../../services/securityService';

const PIE_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#3358ff', '#10b981'];

function fmtDateTime(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SecurityCenter() {
  const [params, setParams] = useSearchParams();
  const searchFromUrl = params.get('q') || '';
  const severityFromUrl = params.get('severity') || '';
  const statusFromUrl = params.get('status') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [data, setData] = useState<SecurityEventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<SecurityEventRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };
  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };
  const activeFilterCount = [severityFromUrl, statusFromUrl, debounced].filter(Boolean).length;

  useEffect(() => { securityService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    securityService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      severity: severityFromUrl || undefined,
      status: statusFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, severityFromUrl, statusFromUrl]);

  const sevCols: Column<SecurityEventRow>[] = [
    { key: 'code', header: 'Event', render: (r) => <span className="font-mono text-xs">{r.eventCode}</span> },
    { key: 'title', header: 'Title', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.title}</div>
        <div className="text-[11px] text-slate-500 line-clamp-1">{r.description}</div>
      </div>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <Badge tone="brand">{r.category}</Badge> },
    { key: 'sev', header: 'Severity', render: (r) => <StatusBadge status={r.severity} /> },
    { key: 'src', header: 'Source', render: (r) => <span className="text-xs text-slate-500">{r.source || '\u2014'}</span> },
    { key: 'asset', header: 'Asset', render: (r) => <span className="font-mono text-xs">{r.affectedAsset || '\u2014'}</span> },
    { key: 'date', header: 'Detected', render: (r) => <span className="text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const sevData = summary?.bySeverity.map((s) => ({ name: s.severity, value: s.count })) || [];
  const catData = summary?.byCategory.map((c) => ({ category: c.category, count: c.count })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">Security operations</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Security Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} events &middot; click a row for full details &middot; live from PostgreSQL
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Clear filters</Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Security Score" value={summary.securityScore} format={(n) => n.toFixed(0) + ' / 100'}
            hint={summary.openCount + ' open \u00B7 ' + summary.criticalCount + ' critical'}
            icon={<ShieldCheck size={18} />} accent="emerald" onClick={clearFilters} />
          <Kpi label="Total Events" value={summary.total} hint={summary.resolvedCount + ' resolved'}
            icon={<ShieldAlert size={18} />} accent="brand" onClick={clearFilters} />
          <Kpi label="Open" value={summary.openCount} hint="Awaiting review"
            icon={<Clock size={18} />} accent="amber"
            onClick={() => setUrl({ status: 'OPEN', page: null })} />
          <Kpi label="Critical" value={summary.criticalCount} hint="Highest severity"
            icon={<AlertTriangle size={18} />} accent="rose"
            onClick={() => setUrl({ severity: 'CRITICAL', page: null })} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="By Severity" subtitle="Click a slice to filter" />
          {sevData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sevData} dataKey="value" nameKey="name" outerRadius={70}
                    label={(e: any) => e.name + ': ' + e.value} labelLine={false} cursor="pointer"
                    onClick={(d: any) => { const s = d?.name || d?.payload?.name; if (s) setUrl({ severity: s, page: null }); }}>
                    {sevData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="By Category" subtitle="Click a bar to filter" />
          {catData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Events" fill="#3358ff" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(d: any) => { const c = d?.category || d?.payload?.category; if (c) setUrl({ q: c, page: null }); }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event code, title, description" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={severityFromUrl} onChange={(e) => setUrl({ severity: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={statusFromUrl} onChange={(e) => setUrl({ status: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {severityFromUrl && <Badge tone="brand">Severity: {severityFromUrl}</Badge>}
          {statusFromUrl && <Badge tone="brand">Status: {statusFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       data.length === 0 ? <EmptyState title="No events match the filters" description="Try widening the search." /> :
       <Card padded={false}>
         <Table columns={sevCols} data={data} rowKey={(r) => r.id} emptyMessage="No events"
           onRowClick={(r) => setOpenEvent(r)} />
       </Card>}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(pageFromUrl - 1) * 20 + 1}&ndash;{Math.min(pageFromUrl * 20, total)} of {total.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}

      {openEvent && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenEvent(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openEvent.eventCode}</span>
                <StatusBadge status={openEvent.severity} />
                <StatusBadge status={openEvent.status} />
              </div>
              <button onClick={() => setOpenEvent(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="text-lg font-semibold">{openEvent.title}</div>
              {openEvent.description && <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{openEvent.description}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Category</div>
                  <Badge tone="brand">{openEvent.category}</Badge>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Source</div>
                  <div>{openEvent.source || '\u2014'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Affected asset</div>
                  <div className="font-mono text-xs">{openEvent.affectedAsset || '\u2014'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Detected</div>
                  <div>{fmtDateTime(openEvent.createdAt)}</div>
                </div>
                {openEvent.resolvedAt && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Resolved</div>
                    <div>{fmtDateTime(openEvent.resolvedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
