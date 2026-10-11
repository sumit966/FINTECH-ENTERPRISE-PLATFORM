import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, BookOpen, Eye, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { knowledgeService, KnowledgeRow, KnowledgeSummary } from '../../services/knowledgeService';

export default function KnowledgePage() {
  const [params, setParams] = useSearchParams();
  const searchFromUrl = params.get('q') || '';
  const categoryFromUrl = params.get('category') || '';
  const slugFromUrl = params.get('slug') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<KnowledgeSummary | null>(null);
  const [data, setData] = useState<KnowledgeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<KnowledgeRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  useEffect(() => { knowledgeService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    knowledgeService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      category: categoryFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load articles'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, categoryFromUrl]);

  // Select based on slug from URL when the data list loads
  useEffect(() => {
    if (!slugFromUrl) { setSelected(null); return; }
    const match = data.find((a) => a.slug === slugFromUrl);
    if (match) setSelected(match);
  }, [slugFromUrl, data]);

  const openArticle = (a: KnowledgeRow) => {
    setUrl({ slug: a.slug });
    setSelected(a);
  };
  const closeArticle = () => {
    setUrl({ slug: null });
    setSelected(null);
  };

  const activeFilterCount = [categoryFromUrl, debounced].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} articles &middot; search and read
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
          <Kpi label="Articles" value={summary.total} hint={summary.byCategory.length + ' categories'}
            icon={<BookOpen size={18} />} accent="brand"
            onClick={() => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); }} />
          <Kpi label="Total Views" value={summary.byCategory.reduce((s, c) => s + c.totalViews, 0)}
            format={(n) => n.toLocaleString('en-IN')} hint="Across all articles"
            icon={<Eye size={18} />} accent="violet" />
          <Kpi label="Top Category" value={summary.byCategory[0]?.count || 0} hint={summary.byCategory[0]?.category || '\u2014'}
            accent="emerald"
            onClick={() => setUrl({ category: summary.byCategory[0]?.category || null, page: null })} />
          <Kpi label="Most Viewed" value={summary.topViewed[0]?.viewCount || 0}
            format={(n) => n.toLocaleString('en-IN')} hint={summary.topViewed[0]?.title || '\u2014'}
            accent="amber"
            onClick={() => { if (summary.topViewed[0]) setUrl({ slug: summary.topViewed[0].slug, page: null }); }} />
        </div>
      )}

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles by title or content" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={categoryFromUrl} onChange={(e) => setUrl({ category: e.target.value || null, page: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All categories</option>
            {summary?.byCategory.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={8} /> :
       data.length === 0 ? <EmptyState title="No articles match the filters" description="Try widening the search." /> :
       (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            {data.map((a) => (
              <button
                key={a.id}
                onClick={() => openArticle(a)}
                className={'w-full text-left rounded-lg border p-4 transition ' + (selected?.id === a.id ? 'border-brand-500 bg-brand-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <BookOpen size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{a.title}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{a.slug}</div>
                    </div>
                  </div>
                  <Badge tone="brand">{a.category}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Eye size={11} /> {a.viewCount}</span>
                  {a.tags.length > 0 && <span className="truncate">{a.tags.slice(0, 3).join(', ')}</span>}
                  {!a.published && <span className="text-amber-500 font-medium">Draft</span>}
                </div>
              </button>
            ))}
            {total > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages}</div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
                  <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
                </div>
              </div>
            )}
          </div>

          <div>
            {selected ? (
              <Card className="sticky top-20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="brand">{selected.category}</Badge>
                    <h2 className="text-lg font-semibold mt-2">{selected.title}</h2>
                    <div className="text-xs text-slate-500 font-mono mt-1">{selected.slug}</div>
                  </div>
                  <button onClick={closeArticle} className="text-slate-500 hover:text-slate-700"><X size={14} /></button>
                </div>
                <div className="mt-4 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selected.body}</div>
                {selected.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {selected.tags.map((t) => <span key={t} className="text-[10px] rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{t}</span>)}
                  </div>
                )}
              </Card>
            ) : (
              <Card>
                <div className="text-center text-sm text-slate-500 py-12">Select an article to preview it here.</div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
