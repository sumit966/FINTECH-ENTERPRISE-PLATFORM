import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText, Download, X, Folder, HardDrive } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { documentService, DocumentRow, DocumentsSummary } from '../../services/documentService';

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatBytes(b: number | null | undefined): string {
  if (b == null) return '\u2014';
  if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB';
  if (b >= 1024) return (b / 1024).toFixed(0) + ' KB';
  return b + ' B';
}

export default function DocumentsPage() {
  const [params, setParams] = useSearchParams();
  const searchFromUrl = params.get('q') || '';
  const categoryFromUrl = params.get('category') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<DocumentsSummary | null>(null);
  const [data, setData] = useState<DocumentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<DocumentRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  useEffect(() => { documentService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    documentService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      category: categoryFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load documents'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, categoryFromUrl]);

  const cols: Column<DocumentRow>[] = [
    { key: 'name', header: 'Document', render: (r) => (
      <div className="flex items-start gap-2">
        <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{r.title}</div>
          <div className="text-[11px] text-slate-500 font-mono truncate">{r.documentCode}</div>
        </div>
      </div>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <Badge tone="brand">{r.category}</Badge> },
    { key: 'type', header: 'Type', render: (r) => <span className="text-xs">{r.mimeType}</span> },
    { key: 'ver', header: 'Ver', className: 'text-right', render: (r) => <span className="text-xs">v{r.version}</span> },
    { key: 'size', header: 'Size', className: 'text-right', render: (r) => <span className="text-xs">{formatBytes(r.sizeBytes)}</span> },
    { key: 'access', header: 'Access', render: (r) => <Badge tone="neutral">{r.accessLevel}</Badge> },
    { key: 'uploaded', header: 'Created', render: (r) => <span className="text-xs">{fmtDate(r.createdAt)}</span> },
    { key: 'owner', header: 'Owner', render: (r) => <span className="text-xs text-slate-500">{r.ownerName || '\u2014'}</span> },
  ];

  const activeFilterCount = [categoryFromUrl, debounced].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} documents &middot; click a row for details
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); }}>
            <X size={14} /> Clear filters
          </Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Documents" value={summary.total} hint={summary.byCategory.length + ' categories'}
            icon={<Folder size={18} />} accent="brand"
            onClick={() => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); }} />
          <Kpi label="Total Size" value={summary.totalSizeBytes} format={(n) => formatBytes(n)} hint="Across all documents"
            icon={<HardDrive size={18} />} accent="violet" />
          <Kpi label="Access levels" value={summary.byAccessLevel.length} hint="Distinct"
            accent="emerald" />
          <Kpi label="Top Category" value={summary.byCategory[0]?.count || 0} hint={summary.byCategory[0]?.category || '\u2014'}
            accent="amber"
            onClick={() => setUrl({ category: summary.byCategory[0]?.category || null, page: null })} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or code" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={categoryFromUrl} onChange={(e) => setUrl({ category: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All categories</option>
            {summary?.byCategory.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {categoryFromUrl && <Badge tone="brand">Category: {categoryFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       data.length === 0 ? <EmptyState title="No documents match the filters" description="Try widening the search." /> :
       <Card padded={false}>
         <Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No documents"
           onRowClick={(r) => setOpenDoc(r)} />
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

      {openDoc && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenDoc(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-brand-500" />
                <span className="font-medium text-sm truncate max-w-[300px]">{openDoc.title}</span>
              </div>
              <button onClick={() => setOpenDoc(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="brand">{openDoc.category}</Badge>
                <Badge tone="neutral">{openDoc.mimeType}</Badge>
                <Badge tone="neutral">v{openDoc.version}</Badge>
                <Badge tone="neutral">{openDoc.accessLevel}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Code</div>
                  <div className="font-mono text-xs">{openDoc.documentCode}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Size</div>
                  <div>{formatBytes(openDoc.sizeBytes)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Owner</div>
                  <div>{openDoc.ownerName || '\u2014'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Created</div>
                  <div>{fmtDate(openDoc.createdAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Updated</div>
                  <div>{fmtDate(openDoc.updatedAt)}</div>
                </div>
              </div>
              {openDoc.tags.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tags</div>
                  <div className="flex flex-wrap gap-1.5">
                    {openDoc.tags.map((t) => <span key={t} className="text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{t}</span>)}
                  </div>
                </div>
              )}
              {openDoc.storageUrl && (
                <a
                  href={openDoc.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 text-white px-3 py-2 text-sm font-medium hover:bg-brand-600"
                >
                  <Download size={14} /> Open / download
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
