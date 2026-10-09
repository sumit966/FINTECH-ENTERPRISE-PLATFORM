import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { engineeringService, RepoRow, PRRow, BuildRow, DeploymentRow, EngineeringSummary } from '../../services/engineeringService';

const PIE_COLORS = ['#3358ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b','#eab308'];

type Tab = 'repos' | 'pull-requests' | 'builds' | 'deployments';

function shortSha(s: string): string { return s.slice(0, 7); }
function fmtDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
}

export default function EngineeringPage() {
  const [tab, setTab] = useState<Tab>('repos');
  const [summary, setSummary] = useState<EngineeringSummary | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [repos, setRepos] = useState<RepoRow[]>([]);
  const [prs, setPRs] = useState<PRRow[]>([]);
  const [builds, setBuilds] = useState<BuildRow[]>([]);
  const [deploys, setDeploys] = useState<DeploymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => { engineeringService.summary().then(setSummary).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    const params = { page, pageSize: 20, search: searchDeb || undefined };
    const loader =
      tab === 'repos'         ? engineeringService.repos(params).then((r) => { setRepos(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
      tab === 'pull-requests' ? engineeringService.pullRequests(params).then((r) => { setPRs(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
      tab === 'builds'        ? engineeringService.builds(params).then((r) => { setBuilds(r.items); setTotal(r.total); setTotalPages(r.totalPages); }) :
                                engineeringService.deployments(params).then((r) => { setDeploys(r.items); setTotal(r.total); setTotalPages(r.totalPages); });
    loader.catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load'); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, page, searchDeb]);

  useEffect(() => { setPage(1); }, [tab, searchDeb]);

  const repoCols: Column<RepoRow>[] = [
    { key: 'code', header: 'Repo', render: (r) => (
      <div>
        <Link to={'/engineering/repos/' + r.repoCode} className="font-mono text-xs font-medium hover:text-brand-500">{r.repoCode}</Link>
        <div className="text-[11px] text-slate-500 truncate max-w-md">{r.name}</div>
      </div>
    ) },
    { key: 'project', header: 'Project', render: (r) => r.projectCode ? <Link to={'/projects/' + r.projectCode} className="text-xs hover:text-brand-500">{r.projectCode}</Link> : '\u2014' },
    { key: 'lang', header: 'Language', render: (r) => <Badge tone="brand">{r.language}</Badge> },
    { key: 'prs', header: 'PRs', className: 'text-right', render: (r) => <span className="text-xs">{r.prCount}</span> },
    { key: 'builds', header: 'Builds', className: 'text-right', render: (r) => <span className="text-xs">{r.buildCount}</span> },
    { key: 'provider', header: 'Provider', render: (r) => <span className="text-xs">{r.provider}</span> },
  ];

  const prCols: Column<PRRow>[] = [
    { key: 'num', header: '#', render: (r) => <span className="font-mono text-xs">#{r.prNumber}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="text-sm">{r.title}</span> },
    { key: 'repo', header: 'Repo', render: (r) => r.repoCode ? <span className="font-mono text-xs">{r.repoCode}</span> : '\u2014' },
    { key: 'branch', header: 'Branch', render: (r) => <span className="text-[11px] font-mono text-slate-500">{r.sourceBranch} \u2192 {r.targetBranch}</span> },
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
    { key: 'proj', header: 'Project', render: (r) => r.projectCode ? <Link to={'/projects/' + r.projectCode} className="text-xs hover:text-brand-500">{r.projectName}</Link> : '\u2014' },
    { key: 'env', header: 'Environment', render: (r) => <Badge tone={r.environment === 'PROD' ? 'success' : r.environment === 'STAGING' ? 'info' : 'neutral'}>{r.environment}</Badge> },
    { key: 'ver', header: 'Version', render: (r) => <span className="font-mono text-xs">v{r.version}</span> },
    { key: 'date', header: 'Deployed', render: (r) => <span className="text-xs">{fmtDate(r.deployedAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const langData = summary?.languageBreakdown.map((l) => ({ name: l.language, value: l.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Engineering</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Repos, PRs, builds and deployments &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Repositories" value={summary.repoCount} hint={summary.languageBreakdown.length + ' languages'} />
          <StatCard label="Pull Requests" value={summary.prTotal} hint={summary.prMerged + ' merged \u00B7 ' + summary.prOpen + ' open'} />
          <StatCard label="Build Success" value={summary.buildSuccessRate.toFixed(1) + '%'} hint={summary.buildSuccess + ' / ' + summary.buildTotal + ' builds'} />
          <StatCard label="Deployments" value={summary.deployTotal} hint={'Avg coverage ' + summary.averageCoverage.toFixed(1) + '%'} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Build Outcomes" subtitle="Across all builds" />
          {!summary ? <SkeletonTable rows={3} /> : (
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={summary.buildByStatus}>
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Builds" fill="#3358ff" radius={[4,4,0,0]} />
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
                  <Pie data={langData} dataKey="value" nameKey="name" outerRadius={60} label={(e) => e.name} labelLine={false}>
                    {langData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 flex-wrap">
        {(['repos','pull-requests','builds','deployments'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 text-sm font-medium border-b-2 capitalize ' + (tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}>
        {tab === 'repos'         && <Table columns={repoCols}   data={repos}   rowKey={(r) => r.id} emptyMessage="No repos" />}
        {tab === 'pull-requests' && <Table columns={prCols}     data={prs}     rowKey={(r) => r.id} emptyMessage="No PRs" />}
        {tab === 'builds'        && <Table columns={buildCols}  data={builds}  rowKey={(r) => r.id} emptyMessage="No builds" />}
        {tab === 'deployments'   && <Table columns={deployCols} data={deploys} rowKey={(r) => r.id} emptyMessage="No deployments" />}
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