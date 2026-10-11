import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, Building2, ShoppingCart, Globe, DollarSign } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { vendorService, VendorRow, PurchaseOrderRow, VendorSummary } from '../../services/vendorService';

type Tab = 'vendors' | 'purchase-orders';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function VendorsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = ((params.get('tab') as Tab) || 'vendors') as Tab;
  const searchFromUrl = params.get('q') || '';
  const vendorFilterFromUrl = params.get('vendor') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [pos, setPos] = useState<PurchaseOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openPO, setOpenPO] = useState<PurchaseOrderRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };
  const setTab = (t: Tab) => setUrl({ tab: t === 'vendors' ? null : t, page: null, vendor: null });
  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };

  useEffect(() => { vendorService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    const p = tab === 'vendors'
      ? vendorService.list({ page: pageFromUrl, pageSize: 20, search: debounced || undefined })
          .then((r) => { if (cancelled) return; setVendors(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      : vendorService.purchaseOrders({ page: pageFromUrl, pageSize: 20, search: debounced || undefined, vendorCode: vendorFilterFromUrl || undefined })
          .then((r) => { if (cancelled) return; setPos(r.items); setTotal(r.total); setTotalPages(r.totalPages); });
    p.catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, pageFromUrl, debounced, vendorFilterFromUrl]);

  const vendorCols: Column<VendorRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.vendorCode}</span> },
    { key: 'name', header: 'Vendor', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.name}</div>
        <div className="text-[11px] text-slate-500">{r.country}</div>
      </div>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <Badge tone="brand">{r.category}</Badge> },
    { key: 'contact', header: 'Contact', render: (r) => <span className="text-xs">{r.contactName}</span> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-slate-500">{r.email}</span> },
    { key: 'gst', header: 'GST', render: (r) => <span className="text-[11px] font-mono text-slate-500">{r.gstNumber || '\u2014'}</span> },
    { key: 'pos', header: 'POs', className: 'text-right', render: (r) => <span className="text-xs">{r.poCount}</span> },
    { key: 'rating', header: 'Rating', className: 'text-right', render: (r) => r.rating != null ? <span className="text-xs font-medium">{r.rating.toFixed(1)}</span> : '\u2014' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const poCols: Column<PurchaseOrderRow>[] = [
    { key: 'code', header: 'PO', render: (r) => <span className="font-mono text-xs">{r.poNumber}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="text-sm">{r.title}</span> },
    { key: 'vendor', header: 'Vendor', render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); setTab('vendors'); setUrl({ vendor: r.vendorCode, page: null }); }}
        className="text-xs hover:text-brand-500 transition-colors text-left"
      >
        {r.vendorName}
        <div className="text-[10px] text-slate-500">{r.vendorCountry}</div>
      </button>
    ) },
    { key: 'issued', header: 'Issued', render: (r) => <span className="text-xs">{new Date(r.issuedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'delivered', header: 'Delivered', render: (r) => <span className="text-xs">{r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString('en-IN') : '\u2014'}</span> },
    { key: 'amount', header: 'Amount', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.currency} {(r.amount / 100000).toFixed(2)}L</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const activeFilterCount = [debounced, vendorFilterFromUrl].filter(Boolean).length;
  const tabs = [
    { key: 'vendors', label: 'Vendors' },
    { key: 'purchase-orders', label: 'Purchase Orders' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Procurement</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tab === 'vendors' ? total + ' vendors' : total + ' purchase orders'} &middot; live from PostgreSQL
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Clear filters</Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Vendors" value={summary.total} hint={summary.byCategory.length + ' categories'}
            icon={<Building2 size={18} />} accent="brand"
            onClick={() => setTab('vendors')} />
          <Kpi label="Purchase Orders" value={summary.poTotal} hint={formatINR(summary.totalPoValue) + ' total'}
            icon={<ShoppingCart size={18} />} accent="violet"
            onClick={() => setTab('purchase-orders')} />
          <Kpi label="Countries" value={summary.byCountry.length} hint="Vendor footprint"
            icon={<Globe size={18} />} accent="teal" />
          <Kpi label="Top Category" value={summary.byCategory[0]?.count || 0}
            hint={(summary.byCategory[0]?.category || '\u2014') + ' vendors'}
            icon={<DollarSign size={18} />} accent="amber" />
        </div>
      )}

      <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />

      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'vendors' ? 'Search vendor name or code' : 'Search PO number, title, or vendor'} className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
        </div>
      </Card>

      {vendorFilterFromUrl && tab === 'purchase-orders' && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Filtered by vendor:</span>
          <Badge tone="brand">{vendorFilterFromUrl}</Badge>
          <button onClick={() => setUrl({ vendor: null, page: null })} className="text-brand-500 hover:underline ml-2">Clear</button>
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       (tab === 'vendors' && vendors.length === 0) || (tab === 'purchase-orders' && pos.length === 0) ? (
        <EmptyState title="No records match the filters" description="Try widening the search." />
       ) : (
        <Card padded={false}>
          {tab === 'vendors'
            ? <Table columns={vendorCols} data={vendors} rowKey={(r) => r.id} emptyMessage="No vendors"
                onRowClick={(r) => { setTab('purchase-orders'); setUrl({ vendor: r.vendorCode, page: null }); }} />
            : <Table columns={poCols} data={pos} rowKey={(r) => r.id} emptyMessage="No purchase orders"
                onRowClick={(r) => setOpenPO(r)} />}
        </Card>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(pageFromUrl - 1) * 20 + 1}&ndash;{Math.min(pageFromUrl * 20, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}

      {openPO && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenPO(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openPO.poNumber}</span>
                <StatusBadge status={openPO.status} />
              </div>
              <button onClick={() => setOpenPO(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="text-lg font-semibold">{openPO.title}</div>
              {openPO.description && <div className="text-slate-600 dark:text-slate-300">{openPO.description}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Vendor</div>
                  <button
                    onClick={() => { setOpenPO(null); setTab('vendors'); setUrl({ vendor: openPO.vendorCode, page: null }); }}
                    className="font-medium hover:text-brand-500 transition-colors text-left"
                  >
                    {openPO.vendorName}
                    <div className="text-xs text-slate-500">{openPO.vendorCode} &middot; {openPO.vendorCountry}</div>
                  </button>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Amount</div>
                  <div className="font-medium">{openPO.currency} {openPO.amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Issued</div>
                  <div>{new Date(openPO.issuedAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Delivered</div>
                  <div>{openPO.deliveredAt ? new Date(openPO.deliveredAt).toLocaleDateString('en-IN') : '\u2014'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
