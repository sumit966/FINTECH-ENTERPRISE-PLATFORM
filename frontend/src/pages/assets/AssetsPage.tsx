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
import { assetService, AssetRow, AssetSummary } from '../../services/assetService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function AssetsPage() {
  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AssetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { assetService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    assetService.list({ page, pageSize: 20, search: searchDeb || undefined, type: type || undefined, status: status || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load assets'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, type, status]);

  useEffect(() => { setPage(1); }, [searchDeb, type, status]);

  const cols: Column<AssetRow>[] = [
    { key: 'code', header: 'Asset', render: (r) => <span className="font-mono text-xs">{r.assetCode}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="brand">{r.type}</Badge> },
    { key: 'item', header: 'Item', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.brand} {r.model}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.serialNumber}</div>
      </div>
    ) },
    { key: 'assigned', header: 'Assigned To', render: (r) => r.assignedToName ? (
      <Link to={'/employees/' + r.assignedToId} className="text-xs hover:text-brand-500">
        {r.assignedToName}
        <div className="text-[11px] text-slate-500">{r.assignedToCode}</div>
      </Link>
    ) : <span className="text-xs text-slate-500">Unassigned</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity || '\u2014'}</span> },
    { key: 'purch', header: 'Purchased', render: (r) => <span className="text-xs">{new Date(r.purchasedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'warr', header: 'Warranty', render: (r) => {
      if (!r.warrantyUntil) return '\u2014';
      const days = Math.floor((new Date(r.warrantyUntil).getTime() - Date.now()) / (24*3600*1000));
      const cls = days < 0 ? 'text-rose-500' : days < 90 ? 'text-amber-500' : 'text-slate-500';
      return <span className={'text-xs ' + cls}>{new Date(r.warrantyUntil).toLocaleDateString('en-IN')}</span>;
    } },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'cost', header: 'Cost', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.cost)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hardware and accessories inventory &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Assets" value={summary.total} hint={summary.byType.length + ' types'} />
          <StatCard label="Total Value" value={formatINR(summary.totalValue)} hint={'Avg ' + formatINR(summary.avgCost)} />
          <StatCard label="Expiring Warranty" value={summary.expiringWarrantyCount} hint="Within 90 days" />
          <StatCard label="Top Type" value={summary.byType[0]?.type || '\u2014'} hint={(summary.byType[0]?.count || 0) + ' units'} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset code, serial, brand, or assignee" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All types</option>
            {summary?.byType.map((t) => <option key={t.type} value={t.type}>{t.type} ({t.count})</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="IN_USE">In use</option>
            <option value="IN_STOCK">In stock</option>
            <option value="REPAIR">Repair</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No assets" /></Card>}

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