import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, Package, AlertTriangle, DollarSign, Layers } from 'lucide-react';
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
import { assetService, AssetRow, AssetSummary } from '../../services/assetService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function AssetsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const searchFromUrl = params.get('q') || '';
  const typeFromUrl = params.get('type') || '';
  const statusFromUrl = params.get('status') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<AssetSummary | null>(null);
  const [data, setData] = useState<AssetRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAsset, setOpenAsset] = useState<AssetRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };
  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };

  useEffect(() => { assetService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    assetService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      type: typeFromUrl || undefined,
      status: statusFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load assets'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, typeFromUrl, statusFromUrl]);

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
      <Link to={'/employees/' + r.assignedToId} className="text-xs hover:text-brand-500" onClick={(e) => e.stopPropagation()}>
        {r.assignedToName}
        <div className="text-[11px] text-slate-500">{r.assignedToCode}</div>
      </Link>
    ) : <span className="text-xs text-slate-500">Unassigned</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity || '\u2014'}</span> },
    { key: 'purch', header: 'Purchased', render: (r) => <span className="text-xs">{new Date(r.purchasedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'warr', header: 'Warranty', render: (r) => {
      if (!r.warrantyUntil) return '\u2014';
      const days = Math.floor((new Date(r.warrantyUntil).getTime() - Date.now()) / (24 * 3600 * 1000));
      const cls = days < 0 ? 'text-rose-500' : days < 90 ? 'text-amber-500' : 'text-slate-500';
      return <span className={'text-xs ' + cls}>{new Date(r.warrantyUntil).toLocaleDateString('en-IN')}</span>;
    } },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'cost', header: 'Cost', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.cost)}</span> },
  ];

  const activeFilterCount = [typeFromUrl, statusFromUrl, debounced].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} hardware and accessory records &middot; click a row to view details
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Clear filters</Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Assets" value={summary.total} hint={summary.byType.length + ' types'}
            icon={<Package size={18} />} accent="brand" onClick={clearFilters} />
          <Kpi label="Total Value" value={summary.totalValue} format={formatINR} hint={'Avg ' + formatINR(summary.avgCost)}
            icon={<DollarSign size={18} />} accent="emerald" onClick={clearFilters} />
          <Kpi label="Expiring Warranty" value={summary.expiringWarrantyCount} hint="Within 90 days"
            icon={<AlertTriangle size={18} />} accent="amber" />
          <Kpi label="Top Type" value={summary.byType[0]?.count || 0}
            hint={(summary.byType[0]?.type || '\u2014') + ' units'}
            icon={<Layers size={18} />} accent="violet"
            onClick={() => setUrl({ type: summary.byType[0]?.type || null, page: null })} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search asset code, serial, brand, or assignee" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={typeFromUrl} onChange={(e) => setUrl({ type: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All types</option>
            {summary?.byType.map((t) => <option key={t.type} value={t.type}>{t.type} ({t.count})</option>)}
          </select>
          <select value={statusFromUrl} onChange={(e) => setUrl({ status: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="IN_USE">In use</option>
            <option value="IN_STOCK">In stock</option>
            <option value="REPAIR">Repair</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {typeFromUrl && <Badge tone="brand">Type: {typeFromUrl}</Badge>}
          {statusFromUrl && <Badge tone="brand">Status: {statusFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       data.length === 0 ? <EmptyState title="No assets match the filters" description="Try widening the search." /> :
       <Card padded={false}>
         <Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No assets"
           onRowClick={(r) => setOpenAsset(r)} />
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

      {openAsset && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenAsset(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openAsset.assetCode}</span>
                <StatusBadge status={openAsset.status} />
              </div>
              <button onClick={() => setOpenAsset(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="brand">{openAsset.type}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Item</div>
                  <div className="font-medium">{openAsset.brand} {openAsset.model}</div>
                  <div className="text-xs text-slate-500 font-mono">{openAsset.serialNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Assigned to</div>
                  {openAsset.assignedToId ? (
                    <Link to={'/employees/' + openAsset.assignedToId} className="font-medium hover:text-brand-500">
                      {openAsset.assignedToName} <span className="text-xs text-slate-500">({openAsset.assignedToCode})</span>
                    </Link>
                  ) : <span className="text-slate-500">Unassigned</span>}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Location</div>
                  <div>{openAsset.locationCity || '\u2014'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Purchased</div>
                  <div>{new Date(openAsset.purchasedAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Warranty until</div>
                  <div>{openAsset.warrantyUntil ? new Date(openAsset.warrantyUntil).toLocaleDateString('en-IN') : '\u2014'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Cost</div>
                  <div className="font-medium">{formatINR(openAsset.cost)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
