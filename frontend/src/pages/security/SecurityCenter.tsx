import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { securityService, SecurityEventRow, SecuritySummary } from '../../services/securityService';

const PIE_COLORS = ['#ef4444','#f59e0b','#eab308','#3358ff','#10b981'];

export default function SecurityCenter() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SecurityEventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { securityService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    securityService.list({ page, pageSize: 20, search: searchDeb || undefined, severity: severity || undefined, status: status || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, severity, status]);

  useEffect(() => { setPage(1); }, [searchDeb, severity, status]);

  const sevCols: Column<SecurityEventRow>[] = [
    { key: 'code', header: 'Event', render: (r) => <span className="font-mono text-xs">{r.eventCode}</span> },
    { key: 'title', header: 'Event', render: (r) => (
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Events, severity, and compliance posture &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Security Score" value={summary.securityScore.toFixed(0) + ' / 100'} hint={summary.openCount + ' open · ' + summary.criticalCount + ' critical'} />
          <StatCard label="Total Events" value={summary.total} hint={summary.resolvedCount + ' resolved'} />
          <StatCard label="Open" value={summary.openCount} hint="Awaiting review" />
          <StatCard label="Critical" value={summary.criticalCount} hint="Highest severity" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="By Severity" subtitle="Distribution" />
          {sevData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sevData} dataKey="value" nameKey="name" outerRadius={70} label={(e) => e.name + ': ' + e.value} labelLine={false}>
                    {sevData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="By Category" subtitle="Event categories" />
          {catData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={catData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Events" fill="#3358ff" radius={[4,4,0,0]} />
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
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={sevCols} data={data} rowKey={(r) => r.id} emptyMessage="No events" /></Card>}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</div>
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