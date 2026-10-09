import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { clientService, ClientListItem, ClientSummary } from '../../services/clientService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 350);
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<ClientListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ClientSummary | null>(null);

  useEffect(() => { clientService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    clientService
      .list({
        page, pageSize,
        search: debounced || undefined,
        country: country || undefined,
        industry: industry || undefined,
        status: status || undefined,
      })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load clients'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, debounced, country, industry, status]);

  useEffect(() => { setPage(1); }, [debounced, country, industry, status, pageSize]);

  const columns: Column<ClientListItem>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.clientCode}</span> },
    { key: 'name', header: 'Client', render: (r) => (
      <div>
        <Link to={'/clients/' + r.clientCode} className="font-medium text-sm hover:text-brand-500">{r.companyName}</Link>
        <div className="text-[11px] text-slate-500">{r.country} &middot; {r.industry}</div>
      </div>
    ) },
    { key: 'sla', header: 'SLA', render: (r) => <StatusBadge status={r.slaTier} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'projects', header: 'Projects', className: 'text-right', render: (r) => <span className="text-xs">{r.projectCount}</span> },
    { key: 'revenue', header: 'Revenue', className: 'text-right', render: (r) => <span className="text-xs font-medium">{formatINR(r.revenue)}</span> },
    { key: 'contract', header: 'Contract', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.contractValue)}</span> },
    { key: 'health', header: 'Health', render: (r) => r.healthScore != null ? (
      <span className={'text-xs font-medium ' + (r.healthScore >= 4.3 ? 'text-emerald-500' : r.healthScore >= 4.0 ? 'text-amber-500' : 'text-rose-500')}>{r.healthScore.toFixed(2)}</span>
    ) : '\u2014' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          45 clients across 8 countries &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Clients" value={summary.total} hint={summary.byStatus.find((s) => s.status === 'ACTIVE')?.count + ' active'} />
          <StatCard label="Total Revenue" value={formatINR(summary.totalRevenue)} hint="Lifetime revenue" />
          <StatCard label="Contract Value" value={formatINR(summary.totalContractValue)} hint="Active MSAs" />
          <StatCard label="Countries" value={summary.byCountry.length} hint={summary.byIndustry.length + ' industries'} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All countries</option>
            {summary?.byCountry.map((c) => <option key={c.country} value={c.country}>{c.country} ({c.count})</option>)}
          </select>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All industries</option>
            {summary?.byIndustry.map((i) => <option key={i.industry} value={i.industry}>{i.industry} ({i.count})</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROSPECT">Prospect</option>
            <option value="ON_HOLD">On hold</option>
            <option value="CHURNED">Churned</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}>
        <Table columns={columns} data={data} rowKey={(r) => r.id} emptyMessage="No clients match your filters" />
      </Card>}

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