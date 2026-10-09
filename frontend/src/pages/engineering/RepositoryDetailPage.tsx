import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Table, { Column } from '../../components/ui/Table';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { engineeringService, RepoDetail, PRRow, BuildRow } from '../../services/engineeringService';

export default function RepositoryDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [r, setR] = useState<RepoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setR(await engineeringService.repoDetail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonTable rows={5} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!r) return <ErrorState message="Repository not found" />;

  const prCols: Column<PRRow>[] = [
    { key: 'num', header: '#', render: (pr) => <span className="font-mono text-xs">#{pr.prNumber}</span> },
    { key: 'title', header: 'Title', render: (pr) => <span className="text-sm">{pr.title}</span> },
    { key: 'branch', header: 'Branch', render: (pr) => <span className="text-[11px] font-mono text-slate-500">{pr.sourceBranch} \u2192 {pr.targetBranch}</span> },
    { key: 'diff', header: 'Diff', className: 'text-right', render: (pr) => <span className="text-xs"><span className="text-emerald-500">+{pr.additions}</span> <span className="text-rose-500">-{pr.deletions}</span></span> },
    { key: 'status', header: 'Status', render: (pr) => <StatusBadge status={pr.status} /> },
  ];

  const buildCols: Column<BuildRow>[] = [
    { key: 'code', header: 'Build', render: (b) => <span className="font-mono text-xs">{b.buildCode}</span> },
    { key: 'branch', header: 'Branch', render: (b) => <span className="text-xs">{b.branch}</span> },
    { key: 'sha', header: 'Commit', render: (b) => <span className="font-mono text-[11px] text-slate-500">{b.commitSha.slice(0, 7)}</span> },
    { key: 'tests', header: 'Tests', render: (b) => b.testRun ? (
      <span className="text-xs"><span className="text-emerald-500">{b.testRun.passed}</span> / <span className="text-slate-500">{b.testRun.totalTests}</span></span>
    ) : '\u2014' },
    { key: 'cov', header: 'Coverage', className: 'text-right', render: (b) => b.testRun?.coveragePct != null ? <span className="text-xs">{b.testRun.coveragePct}%</span> : '\u2014' },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div className="space-y-6">
      <Link to="/engineering" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to engineering
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono text-slate-500 mb-1">{r.repoCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{r.name}</h1>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge tone="brand">{r.language}</Badge>
              <Badge tone="neutral">{r.provider}</Badge>
              <Badge tone="neutral">{r.defaultBranch}</Badge>
              {r.project && <Link to={'/projects/' + r.project.projectCode} className="text-xs text-brand-500 hover:underline">Project: {r.project.name}</Link>}
            </div>
          </div>
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
            <ExternalLink size={14} /> Repository
          </a>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Pull Requests" value={r.pullRequests.length} hint="Recent" />
        <StatCard label="Builds" value={r.builds.length} hint="Recent" />
        <StatCard label="Avg Coverage" value={
          r.builds.length > 0
            ? (r.builds.reduce((s, b) => s + (b.testRun?.coveragePct || 0), 0) / r.builds.length).toFixed(1) + '%'
            : '\u2014'
        } hint="Recent builds" />
        <StatCard label="Build Success" value={
          r.builds.length > 0
            ? Math.round((r.builds.filter((b) => b.status === 'SUCCESS').length / r.builds.length) * 100) + '%'
            : '\u2014'
        } hint="Recent builds" />
      </div>

      <Card>
        <CardHeader title="Pull Requests" subtitle={r.pullRequests.length + ' recent'} />
        <Table columns={prCols} data={r.pullRequests} rowKey={(x) => x.id} emptyMessage="No PRs" />
      </Card>

      <Card>
        <CardHeader title="Builds" subtitle={r.builds.length + ' recent'} />
        <Table columns={buildCols} data={r.builds} rowKey={(x) => x.id} emptyMessage="No builds" />
      </Card>
    </div>
  );
}