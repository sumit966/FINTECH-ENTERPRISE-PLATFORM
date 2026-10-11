import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, KeyRound, AlertTriangle, Users, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { licenseService, LicenseRow, LicenseSummary } from '../../services/licenseService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function LicensesPage() {
  const [params, setParams] = useSearchParams();
  const searchFromUrl = params.get('q') || '';
  const statusFromUrl = params.get('status') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);
  const [summary, setSummary] = useState<LicenseSummary | null>(null);
  const [data, setData] = useState<LicenseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<LicenseRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };
  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };

  useEffect(() => { licenseService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    licenseService.list({ page: pageFromUrl, pageSize: 20, search: debounced || undefined, status: statusFromUrl || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load licenses'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, statusFromUrl]);

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
    { key: 'cost', header: 'Cost/seat', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {r.costPerSeat.toLocaleString('en-IN')}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {(r.totalCost / 100000).toFixed(1)}L</span> },
    { key: 'renew', header: 'Renewal', render: (r) => {
      const cls = r.daysToRenewal < 0 ? 'text-rose-500' : r.daysToRenewal < 60 ? 'text-amber-500' : 'text-slate-500';
      return <span className={'text-xs ' + cls}>{new Date(r.renewalAt).toLocaleDateString('en-IN')} ({r.daysToRenewal}d)</span>;
    } },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const activeFilterCount = [statusFromUrl, debounced].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Software Licenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} SaaS subscriptions &middot; renewal tracking &middot; click a row for details
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Clear filters</Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Licenses" value={summary.total} hint={summary.expiringIn60Days + ' expiring in 60 days'}
            icon={<KeyRound size={18} />} accent="brand" onClick={clearFilters} />
          <Kpi label="Seats" value={summary.totalSeats} hint={summary.usedSeats.toLocaleString('en-IN') + ' in use'}
            icon={<Users size={18} />} accent="violet" onClick={clearFilters} />
          <Kpi label="Utilisation" value={summary.overallUtilisation} format={(n) => n + '%'} hint="Overall seat usage"
            accent="emerald" />
          <Kpi label="Total Cost" value={summary.totalCost} format={formatINR} hint="Annual"
            icon={<DollarSign size={18} />} accent="amber" onClick={clearFilters} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or license code" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={statusFromUrl} onChange={(e) => setUrl({ status: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING">Expiring</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {statusFromUrl && <Badge tone="brand">Status: {statusFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       data.length === 0 ? <EmptyState title="No licenses match the filters" description="Try widening the search." /> :
       <Card padded={false}>
         <Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No licenses"
           onRowClick={(r) => setOpen(r)} />
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

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{open.licenseCode}</span>
                <StatusBadge status={open.status} />
              </div>
              <button onClick={() => setOpen(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="text-lg font-semibold">{open.product}</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Seats used</div>
                  <div className="font-medium">{open.usedSeats} / {open.seats}</div>
                  <div className="text-xs text-slate-500">{open.utilisation}% utilisation</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Cost / seat</div>
                  <div>{open.currency} {open.costPerSeat.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-slate-500">Total {open.currency} {open.totalCost.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Purchased</div>
                  <div>{new Date(open.purchasedAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Renewal</div>
                  <div className={open.daysToRenewal < 0 ? 'text-rose-500' : open.daysToRenewal < 60 ? 'text-amber-500' : ''}>
                    {new Date(open.renewalAt).toLocaleDateString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-500">
                    {open.daysToRenewal < 0 ? 'Expired ' + Math.abs(open.daysToRenewal) + ' days ago' : open.daysToRenewal + ' days remaining'}
                  </div>
                </div>
              </div>
              {open.daysToRenewal < 60 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <div>This license {open.daysToRenewal < 0 ? 'has expired' : 'is expiring soon'}. Review with the vendor before the renewal date.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
