import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, GitBranch, GitPullRequest, Package, Rocket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
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
import { engineeringService, RepoRow, PRRow, BuildRow, DeploymentRow, EngineeringSummary } from '../../services/engineeringService';

const PIE_COLORS = ['#3358ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b','#eab308'];

type Tab = 'repos' | 'pull-requests' | 'builds' | 'deployments';

function shortSha(s: string): string { return s.slice(0, 7); }
function fmtDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
}
function fmtDateTime(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function EngineeringPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = ((params.get('tab') as Tab) || 'repos') as Tab;
  const searchFromUrl = params.get('q') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<EngineeringSummary | null>(null);
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [prs, setPRs] = useState<PRRow[]>([]);
  const [builds, setBuilds] = useState<BuildRow[]>([]);
  const [deploys, setDeploys] = useState<DeploymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openPR, setOpenPR] = useState<PRRow | null>(null);
  const [openBuild, setOpenBuild] = useState<BuildRow | null>(null);
  const [openDeploy, setOpenDeploy] = useState<DeploymentRow | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };
  const setTab = (t: Tab) => setUrl({ tab: t === 'repos' ? null : t, page: null });
  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };

  useEffect(() => { engineeringService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    const p = { page: pageFromUrl, pageSize: 20, search: debounced || undefined };
    const loader =
      tab === 'repos'         ? engineeringService.repos(p).then((r) => { if (cancelled) return; setRepos(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
      tab === 'pull-requests' ? engineeringService.pullRequests(p).then((r) => { if (cancelled) return; setPRs(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
      tab === 'builds'        ? engineeringService.builds(p).then((r) => { if (cancelled) return; setBuilds(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
                                engineeringService.deployments(p).then((r) => { if (cancelled) return; setDeploys(r.items); setTotal(r.total); setTotalPages(r.totalPages); });
    loader.catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, pageFromUrl, debounced]);

  const repoCols: Column<RepoRow>[] = [
    { key: 'code', header: 'Repo', render: (r) => (
      <div>
        <span className="font-mono text-xs font-medium">{r.repoCode}</span>
        <div className="text-[11px] text-slate-500 truncate max-w-md">{r.name}</div>
      </div>
    ) },
    { key: 'project', header: 'Project', render: (r) => r.projectCode ? (
      <button onClick={(e) => { e.stopPropagation(); navigate('/projects/' + encodeURIComponent(r.projectCode!)); }} className="text-xs hover:text-brand-500">
        {r.projectCode}
      </button>
    ) : '\u2014' },
    { key: 'lang', header: 'Language', render: (r) => <Badge tone="brand">{r.language}</Badge> },
    { key: 'prs', header: 'PRs', className: 'text-right', render: (r) => <span className="text-xs">{r.prCount}</span> },
    { key: 'builds', header: 'Builds', className: 'text-right', render: (r) => <span className="text-xs">{r.buildCount}</span> },
    { key: 'provider', header: 'Provider', render: (r) => <span className="text-xs">{r.provider}</span> },
  ];

  const prCols: Column<PRRow>[] = [
    { key: 'num', header: '#', render: (r) => <span className="font-mono text-xs">#{r.prNumber}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="text-sm">{r.title}</span> },
    { key: 'repo', header: 'Repo', render: (r) => r.repoCode ? <span className="font-mono text-xs">{r.repoCode}</span> : '\u2014' },
    { key: 'branch', header: 'Branch', render: (r) => <span className="text-[11px] font-mono text-slate-500">{r.sourceBranch} &rarr; {r.targetBranch}</span> },
    { key: 'diff', header: 'Diff', className: 'text-right', render: (r) => <span className="text-xs"><span className="text-emerald-500">+{r.additions}</span> <span className="text-rose-500">-{r.deletions}</span></span> },
    { key: 'opened', header: 'Opened', render: (r) => <span className="text-xs">{fmtDate(r.openedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const buildCols: Column<BuildRow>[] = [
    { key: 'code', header: 'Build', render: (r) => <span className="font-mono text-xs">{r.buildCode}</span> },
    { key: 'repo', header: 'Repo', render: (r) => <span className="font-mono text-xs">{r.repoCode}</span> },
    { key: 'branch', header: 'Branch', render: (r) => <span className="text-xs">{r.branch}</span> },
    { key: 'sha', header: 'Commit', render: (r) => <span className="font-mono text-[11px] text-slate-500">{shortSha(r.commitSha)}</span> },
    { key: 'tests', header: 'Tests', render: (r) => r.testRun ? (
      <div className="text-xs">
        <span className="text-emerald-500">{r.testRun.passed}</span>
        {r.testRun.failed > 0 && <> / <span className="text-rose-500">{r.testRun.failed}</span></>}
        <span className="text-slate-500"> / {r.testRun.totalTests}</span>
      </div>
    ) : '\u2014' },
    { key: 'cov', header: 'Coverage', render: (r) => r.testRun?.coveragePct != null ? (
      <div className="flex items-center gap-2 w-24">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: r.testRun.coveragePct + '%' }} />
        </div>
        <span className="text-[11px] text-slate-500 w-8 text-right">{r.testRun.coveragePct}%</span>
      </div>
    ) : '\u2014' },
    { key: 'dur', header: 'Duration', className: 'text-right', render: (r) => <span className="text-xs">{r.durationSec}s</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const deployCols: Column<DeploymentRow>[] = [
    { key: 'code', header: 'Deployment', render: (r) => <span className="font-mono text-xs">{r.deploymentCode}</span> },
    { key: 'proj', header: 'Project', render: (r) => r.projectCode ? (
      <button onClick={(e) => { e.stopPropagation(); navigate('/projects/' + encodeURIComponent(r.projectCode!)); }} className="text-xs hover:text-brand-500">
        {r.projectName}
      </button>
    ) : '\u2014' },
    { key: 'env', header: 'Environment', render: (r) => <Badge tone={r.environment === 'PROD' ? 'success' : r.environment === 'STAGING' ? 'info' : 'neutral'}>{r.environment}</Badge> },
    { key: 'ver', header: 'Version', render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
    { key: 'date', header: 'Deployed', render: (r) => <span className="text-xs">{fmtDate(r.deployedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const langData = summary?.languageBreakdown.map((l) => ({ name: l.language, value: l.count })) || [];
  const activeFilterCount = debounced ? 1 : 0;
  const tabs = [
    { key: 'repos', label: 'Repos' },
    { key: 'pull-requests', label: 'Pull Requests' },
    { key: 'builds', label: 'Builds' },
    { key: 'deployments', label: 'Deployments' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">Delivery intelligence</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Engineering</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Repos, PRs, builds and deployments &middot; live from PostgreSQL
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Clear filters</Button>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Repositories" value={summary.repoCount} hint={summary.languageBreakdown.length + ' languages'}
            icon={<GitBranch size={18} />} accent="brand" onClick={() => setTab('repos')} />
          <Kpi label="Pull Requests" value={summary.prTotal} hint={summary.prMerged + ' merged \u00B7 ' + summary.prOpen + ' open'}
            icon={<GitPullRequest size={18} />} accent="violet" onClick={() => setTab('pull-requests')} />
          <Kpi label="Build Success" value={summary.buildSuccessRate} format={(n) => n.toFixed(1) + '%'}
            hint={summary.buildSuccess + ' / ' + summary.buildTotal + ' builds'}
            icon={<Package size={18} />} accent="emerald" onClick={() => setTab('builds')} />
          <Kpi label="Deployments" value={summary.deployTotal} hint={'Avg coverage ' + summary.averageCoverage.toFixed(1) + '%'}
            icon={<Rocket size={18} />} accent="amber" onClick={() => setTab('deployments')} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Build Outcomes" subtitle="Across all builds \u00B7 click a bar to filter" />
          {!summary ? <SkeletonTable rows={3} /> : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={summary.buildByStatus}>
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Builds" fill="#3358ff" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={() => setTab('builds')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Language" subtitle="Repo distribution" />
          {langData.length === 0 ? <SkeletonTable rows={3} /> : (
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={langData} dataKey="value" nameKey="name" outerRadius={60} label={(e: any) => e.name} labelLine={false}>
                    {langData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />

      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setUrl({ page: null })} /> :
       loading ? <SkeletonTable rows={10} /> :
       ((tab === 'repos' && repos.length === 0) ||
        (tab === 'pull-requests' && prs.length === 0) ||
        (tab === 'builds' && builds.length === 0) ||
        (tab === 'deployments' && deploys.length === 0)) ? (
        <EmptyState title="No records match the filters" description="Try widening the search." />
       ) : (
        <Card padded={false}>
          {tab === 'repos'         && <Table columns={repoCols}   data={repos}   rowKey={(r) => r.id} emptyMessage="No repos" />}
          {tab === 'pull-requests' && <Table columns={prCols}     data={prs}     rowKey={(r) => r.id} emptyMessage="No PRs"     onRowClick={(r) => setOpenPR(r)} />}
          {tab === 'builds'        && <Table columns={buildCols}  data={builds}  rowKey={(r) => r.id} emptyMessage="No builds"  onRowClick={(r) => setOpenBuild(r)} />}
          {tab === 'deployments'   && <Table columns={deployCols} data={deploys} rowKey={(r) => r.id} emptyMessage="No deployments" onRowClick={(r) => setOpenDeploy(r)} />}
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

      {/* PR drawer */}
      {openPR && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenPR(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <GitPullRequest size={16} className="text-brand-500" />
                <span className="font-mono text-sm">#{openPR.prNumber}</span>
                <StatusBadge status={openPR.status} />
              </div>
              <button onClick={() => setOpenPR(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="text-lg font-semibold">{openPR.title}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Repository</div>
                  {openPR.repoCode ? (
                    <Link to={'/engineering/repos/' + encodeURIComponent(openPR.repoCode)} className="font-mono text-xs hover:text-brand-500">{openPR.repoCode}</Link>
                  ) : '\u2014'}
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Branch</div>
                  <div className="font-mono text-xs">{openPR.sourceBranch} &rarr; {openPR.targetBranch}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Additions</div>
                  <div className="text-emerald-500 font-medium">+{openPR.additions}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Deletions</div>
                  <div className="text-rose-500 font-medium">-{openPR.deletions}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Opened</div>
                  <div>{fmtDateTime(openPR.openedAt)}</div>
                </div>
                {openPR.mergedAt && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Merged</div>
                    <div>{fmtDateTime(openPR.mergedAt)}</div>
                  </div>
                )}
                {openPR.reviewedBy && openPR.reviewedBy.length > 0 && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Reviewed by</div>
                    <div>{openPR.reviewedBy.join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Build drawer */}
      {openBuild && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenBuild(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openBuild.buildCode}</span>
                <StatusBadge status={openBuild.status} />
              </div>
              <button onClick={() => setOpenBuild(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Repository</div>
                  <Link to={'/engineering/repos/' + encodeURIComponent(openBuild.repoCode)} className="font-mono text-xs hover:text-brand-500">{openBuild.repoCode}</Link>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Branch</div>
                  <div className="font-mono text-xs">{openBuild.branch}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Commit</div>
                  <div className="font-mono text-xs">{shortSha(openBuild.commitSha)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Started</div>
                  <div>{fmtDateTime(openBuild.startedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Completed</div>
                  <div>{fmtDateTime(openBuild.completedAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Duration</div>
                  <div>{openBuild.durationSec}s</div>
                </div>
                {openBuild.triggeredBy && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Triggered by</div>
                    <div>{openBuild.triggeredBy}</div>
                  </div>
                )}
              </div>
              {openBuild.testRun && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">Test Run</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>Passed: <span className="text-emerald-500 font-medium">{openBuild.testRun.passed}</span></div>
                    <div>Failed: <span className={openBuild.testRun.failed > 0 ? 'text-rose-500 font-medium' : ''}>{openBuild.testRun.failed}</span></div>
                    <div>Skipped: <span className="text-slate-500">{openBuild.testRun.skipped}</span></div>
                    <div>Total: <span className="font-medium">{openBuild.testRun.totalTests}</span></div>
                    <div>Coverage: <span className="font-medium">{openBuild.testRun.coveragePct != null ? openBuild.testRun.coveragePct + '%' : '\u2014'}</span></div>
                    <div>Test duration: <span>{openBuild.testRun.durationSec}s</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deployment drawer */}
      {openDeploy && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenDeploy(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Rocket size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openDeploy.deploymentCode}</span>
                <StatusBadge status={openDeploy.status} />
              </div>
              <button onClick={() => setOpenDeploy(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                {openDeploy.projectCode && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Project</div>
                    <Link to={'/projects/' + encodeURIComponent(openDeploy.projectCode)} className="font-medium hover:text-brand-500">{openDeploy.projectName}</Link>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Environment</div>
                  <Badge tone={openDeploy.environment === 'PROD' ? 'success' : openDeploy.environment === 'STAGING' ? 'info' : 'neutral'}>{openDeploy.environment}</Badge>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Version</div>
                  <div className="font-mono text-xs">v{openDeploy.version}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Deployed at</div>
                  <div>{fmtDateTime(openDeploy.deployedAt)}</div>
                </div>
                {openDeploy.deployedBy && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Deployed by</div>
                    <div>{openDeploy.deployedBy}</div>
                  </div>
                )}
                {openDeploy.commitSha && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Commit</div>
                    <div className="font-mono text-xs">{shortSha(openDeploy.commitSha)}</div>
                  </div>
                )}
                {openDeploy.notes && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Notes</div>
                    <div className="text-slate-600 dark:text-slate-300">{openDeploy.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
