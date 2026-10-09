import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { licenseService, LicenseRow, LicenseSummary } from '../../services/licenseService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function LicensesPage() {
  const [summary, setSummary] = useState<LicenseSummary | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LicenseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { licenseService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    licenseService.list({ page, pageSize: 20, search: searchDeb || undefined, status: status || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load licenses'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, status]);

  useEffect(() => { setPage(1); }, [searchDeb, status]);

  const cols: Column<LicenseRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.licenseCode}</span> },
    { key: 'prod', header: 'Product', render: (r) => <span className="font-medium text-sm">{r.product}</span> },
    { key: 'seats', header: 'Seats', render: (r) => (
      <div className="flex items-center gap-2 w-32">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className={'h-full ' + (r.utilisation >= 90 ? 'bg-rose-500' : r.utilisation >= 70 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: Math.min(100, r.utilisation) + '%' }} />
        </div>
        <span className="text-xs text-slate-500 w-16 text-right">{r.usedSeats}/{r.seats}</span>
      </div>
    ) },
    { key: 'util', header: 'Util', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.utilisation}%</span> },
    { key: 'cost', header: 'Cost/seat', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {r.costPerSeat}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {(r.totalCost/100000).toFixed(1)}L</span> },
    { key: 'renew', header: 'Renewal', render: (r) => {
      const cls = r.daysToRenewal < 0 ? 'text-rose-500' : r.daysToRenewal < 60 ? 'text-amber-500' : 'text-slate-500';
      return <span className={'text-xs ' + cls}>{new Date(r.renewalAt).toLocaleDateString('en-IN')} ({r.daysToRenewal}d)</span>;
    } },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Software Licenses</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          SaaS subscriptions and renewal tracking &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Licenses" value={summary.total} hint={summary.expiringIn60Days + ' expiring in 60 days'} />
          <StatCard label="Seats" value={summary.totalSeats.toLocaleString('en-IN')} hint={summary.usedSeats.toLocaleString('en-IN') + ' in use'} />
          <StatCard label="Utilisation" value={summary.overallUtilisation + '%'} hint="Overall seat usage" />
          <StatCard label="Total Cost" value={formatINR(summary.totalCost)} hint="Annual" />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or license code" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING">Expiring</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No licenses" /></Card>}

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