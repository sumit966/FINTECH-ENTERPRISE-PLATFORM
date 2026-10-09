import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { documentService, DocumentRow, DocumentsSummary } from '../../services/documentService';

function formatBytes(b: number): string {
  if (b >= 1024 * 1024) return (b / (1024 * 1024)).toFixed(2) + ' MB';
  if (b >= 1024) return (b / 1024).toFixed(1) + ' KB';
  return b + ' B';
}

export default function DocumentsPage() {
  const [summary, setSummary] = useState<DocumentsSummary | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DocumentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { documentService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    documentService.list({ page, pageSize: 20, search: searchDeb || undefined, category: category || undefined, accessLevel: accessLevel || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load documents'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, category, accessLevel]);

  useEffect(() => { setPage(1); }, [searchDeb, category, accessLevel]);

  const cols: Column<DocumentRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.documentCode}</span> },
    { key: 'title', header: 'Document', render: (r) => (
      <div className="flex items-start gap-2">
        <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium text-sm">{r.title}</div>
          <div className="text-[11px] text-slate-500">{r.mimeType} &middot; v{r.version}</div>
        </div>
      </div>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <Badge tone="brand">{r.category}</Badge> },
    { key: 'access', header: 'Access', render: (r) => <Badge tone={r.accessLevel === 'RESTRICTED' ? 'danger' : r.accessLevel === 'INTERNAL' ? 'info' : 'neutral'}>{r.accessLevel}</Badge> },
    { key: 'size', header: 'Size', className: 'text-right', render: (r) => <span className="text-xs">{formatBytes(r.sizeBytes)}</span> },
    { key: 'owner', header: 'Owner', render: (r) => r.ownerName ? (
      <Link to={'/employees/' + r.ownerId} className="text-xs hover:text-brand-500">{r.ownerName}</Link>
    ) : '\u2014' },
    { key: 'tags', header: 'Tags', render: (r) => (
      <div className="flex flex-wrap gap-1">
        {r.tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{t}</span>)}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Document management &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Documents" value={summary.total} hint={summary.byCategory.length + ' categories'} />
          <StatCard label="Total Storage" value={formatBytes(summary.totalSizeBytes)} hint="Aggregate size" />
          <StatCard label="Restricted" value={summary.byAccessLevel.find((a) => a.accessLevel === 'RESTRICTED')?.count || 0} hint="Restricted access" />
          <StatCard label="Internal" value={summary.byAccessLevel.find((a) => a.accessLevel === 'INTERNAL')?.count || 0} hint="Internal use" />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search document title, code, or owner" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All categories</option>
            {summary?.byCategory.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
          </select>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All access levels</option>
            <option value="PUBLIC">Public</option>
            <option value="INTERNAL">Internal</option>
            <option value="RESTRICTED">Restricted</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No documents" /></Card>}

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