import { useEffect, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { projectService, ProjectListItem, ProjectSummary } from '../../services/projectService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // URL is the source of truth for status + search; local state mirrors it.
  const statusFromUrl = params.get('status') || '';
  const searchFromUrl = params.get('q') || '';
  const sortFromUrl = params.get('sort') || '';

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);
  const status = statusFromUrl;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setDataRaw] = useState<ProjectListItem[]>([]);
  const setData = (items: ProjectListItem[]) => {
    if (sortFromUrl === 'risk') {
      const sorted = [...items].sort((a, b) => (b.riskScore ?? 0) - (a.riskScore ?? 0));
      setDataRaw(sorted);
    } else if (sortFromUrl === 'profit') {
      const sorted = [...items].sort((a, b) => (b.profit ?? 0) - (a.profit ?? 0));
      setDataRaw(sorted);
    } else {
      setDataRaw(items);
    }
  };
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);

  useEffect(() => { projectService.summary().then(setSummary).catch(() => {}); }, []);

  // Sync debounced search into the URL (replace so we don't spam history)
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced && debounced !== (next.get('q') || '')) {
      next.set('q', debounced);
      setParams(next, { replace: true });
    } else if (!debounced && next.has('q')) {
      next.delete('q');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    projectService
      .list({ page, pageSize, search: debounced || undefined, status: status || undefined })
      .then((r) => {
        if (cancelled) return;
        setData(r.items);
        setTotal(r.total);
        setTotalPages(r.totalPages);
      })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load projects'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, debounced, status]);

  useEffect(() => { setPage(1); }, [debounced, status, pageSize]);

  const setStatus = (next: string) => {
    const p = new URLSearchParams(params);
    if (next) p.set('status', next); else p.delete('status');
    setParams(p, { replace: true });
  };

  const columns: Column<ProjectListItem>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.projectCode}</span> },
    { key: 'name', header: 'Project', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.name}</div>
        <div className="text-[11px] text-slate-500">{r.clientName} &middot; {r.clientCountry}</div>
      </div>
    ) },
    { key: 'industry', header: 'Industry', render: (r) => <span className="text-xs">{r.industry}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'progress', header: 'Progress', render: (r) => (
      <div className="flex items-center gap-2 w-28">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: r.progressPercent + '%' }} />
        </div>
        <span className="text-xs text-slate-500 w-8 text-right">{r.progressPercent}%</span>
      </div>
    ) },
    { key: 'health', header: 'Health', render: (r) => r.healthScore != null ? (
      <span className={'text-xs font-medium ' + (r.healthScore >= 4.2 ? 'text-emerald-500' : r.healthScore >= 3.5 ? 'text-amber-500' : 'text-rose-500')}>
        {r.healthScore.toFixed(2)}
      </span>
    ) : '\u2014' },
    { key: 'budget', header: 'Budget', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.budget)}</span> },
    { key: 'revenue', header: 'Revenue', className: 'text-right', render: (r) => <span className="text-xs font-medium">{formatINR(r.revenue)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {total} projects &middot; click a row to open the project workspace
        </p>
      </div>

            <div className="flex justify-end mb-2"><ExportButton rows={data} filename={'export-' + new Date().toISOString().slice(0,10)} /></div>
{summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Projects"
            value={summary.total}
            hint={summary.byStatus.find((s) => s.status === 'ACTIVE')?.count + ' active'}
            onClick={() => setStatus('')}
          />
          <StatCard
            label="Total Budget"
            value={formatINR(summary.totalBudget)}
            hint="Across all projects"
          />
          <StatCard
            label="Total Revenue"
            value={formatINR(summary.totalRevenue)}
            hint={formatINR(summary.totalProfit) + ' profit'}
          />
          <StatCard
            label="Avg Health"
            value={summary.avgHealth.toFixed(2)}
            hint={'Risk avg ' + summary.avgRisk.toFixed(2)}
          />
        </div>
      )}

      <Card>
        <CardHeader title="Status Distribution" subtitle="Click to filter" />
        {summary ? (
          <div className="flex flex-wrap gap-2">
            {summary.byStatus.map((s) => (
              <button
                key={s.status}
                onClick={() => setStatus(status === s.status ? '' : s.status)}
                className={'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ' +
                  (status === s.status
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
              >
                {s.status.replace(/_/g, ' ')}
                <span className="font-semibold">{s.count}</span>
              </button>
            ))}
            {status && (
              <button onClick={() => setStatus('')} className="text-xs text-slate-500 hover:text-slate-700 px-2">Clear filter</button>
            )}
          </div>
        ) : <SkeletonTable rows={2} />}
      </Card>

      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project code, name, or client"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={() => setPage((p) => p)} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : (
        <Card padded={false}>
          <Table
            columns={columns}
            data={data}
            rowKey={(r) => r.id}
            emptyMessage="No projects match your filters"
            onRowClick={(r) => navigate('/projects/' + encodeURIComponent(r.projectCode))}
          />
        </Card>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs">
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500 px-1">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}
