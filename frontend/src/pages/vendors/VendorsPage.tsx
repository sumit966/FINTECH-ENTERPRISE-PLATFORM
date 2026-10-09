import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { vendorService, VendorRow, PurchaseOrderRow, VendorSummary } from '../../services/vendorService';

type Tab = 'vendors' | 'purchase-orders';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function VendorsPage() {
  const [tab, setTab] = useState<Tab>('vendors');
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [pos, setPos] = useState<PurchaseOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { vendorService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    const loader = tab === 'vendors'
      ? vendorService.list({ page, pageSize: 20, search: searchDeb || undefined }).then((r) => { setVendors(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      : vendorService.purchaseOrders({ page, pageSize: 20, search: searchDeb || undefined }).then((r) => { setPos(r.items); setTotal(r.total); setTotalPages(r.totalPages); });
    loader.catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, page, searchDeb]);

  useEffect(() => { setPage(1); }, [tab, searchDeb]);

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
    { key: 'vendor', header: 'Vendor', render: (r) => <span className="text-xs">{r.vendorName}</span> },
    { key: 'issued', header: 'Issued', render: (r) => <span className="text-xs">{new Date(r.issuedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'delivered', header: 'Delivered', render: (r) => <span className="text-xs">{r.deliveredAt ? new Date(r.deliveredAt).toLocaleDateString('en-IN') : '\u2014'}</span> },
    { key: 'amount', header: 'Amount', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.currency} {(r.amount/100000).toFixed(2)}L</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Procurement</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Vendors and purchase orders &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Vendors" value={summary.total} hint={summary.byCategory.length + ' categories'} />
          <StatCard label="Purchase Orders" value={summary.poTotal} hint={formatINR(summary.totalPoValue) + ' total'} />
          <StatCard label="Countries" value={summary.byCountry.length} hint="Vendor footprint" />
          <StatCard label="Top Category" value={summary.byCategory[0]?.category || '\u2014'} hint={(summary.byCategory[0]?.count || 0) + ' vendors'} />
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setTab('vendors')} className={'px-4 py-2 text-sm font-medium border-b-2 ' + (tab === 'vendors' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>Vendors</button>
        <button onClick={() => setTab('purchase-orders')} className={'px-4 py-2 text-sm font-medium border-b-2 ' + (tab === 'purchase-orders' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>Purchase Orders</button>
      </div>

      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tab === 'vendors' ? 'Search vendor name or code' : 'Search PO number, title, or vendor'} className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}>
        {tab === 'vendors'
          ? <Table columns={vendorCols} data={vendors} rowKey={(r) => r.id} emptyMessage="No vendors" />
          : <Table columns={poCols} data={pos} rowKey={(r) => r.id} emptyMessage="No purchase orders" />}
      </Card>}

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