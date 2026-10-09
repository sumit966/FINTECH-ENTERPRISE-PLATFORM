import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, GitBranch, Rocket } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Table, { Column } from '../../components/ui/Table';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { projectService, ProjectDetail } from '../../services/projectService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProjectDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [p, setP] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setP(await projectService.detail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load project'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonTable rows={5} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!p) return <ErrorState message="Project not found" />;

  const memberCols: Column<ProjectDetail['members'][0]>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { key: 'name', header: 'Name', render: (r) => <Link className="hover:text-brand-500" to={'/employees/' + r.employeeId}>{r.fullName}</Link> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-slate-500">{r.email}</span> },
    { key: 'role', header: 'Role', render: (r) => <Badge tone="brand">{r.role}</Badge> },
    { key: 'alloc', header: 'Allocation', className: 'text-right', render: (r) => <span className="text-xs">{r.allocation}%</span> },
  ];

  const taskCols: Column<ProjectDetail['tasks'][0]>[] = [
    { key: 'code', header: 'Task', render: (r) => <span className="font-mono text-xs">{r.taskCode}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="text-sm">{r.title}</span> },
    { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'est', header: 'Estimate', className: 'text-right', render: (r) => <span className="text-xs">{r.estimateHrs ?? '\u2014'}h</span> },
    { key: 'spent', header: 'Spent', className: 'text-right', render: (r) => <span className="text-xs">{r.spentHrs ?? '\u2014'}h</span> },
  ];

  const invoiceCols: Column<ProjectDetail['invoices'][0]>[] = [
    { key: 'num', header: 'Invoice', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'issue', header: 'Issued', render: (r) => <span className="text-xs">{formatDate(r.issueDate)}</span> },
    { key: 'due', header: 'Due', render: (r) => <span className="text-xs">{formatDate(r.dueDate)}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.total)}</span> },
    { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.paidAmount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono text-slate-500 mb-1">{p.projectCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {p.industry} &middot; {p.country} &middot; Client: <Link to={'/clients/' + p.client.clientCode} className="text-brand-500 hover:underline">{p.client.companyName}</Link>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={p.status} />
              <Badge tone="brand">{p.progressPercent}% complete</Badge>
              {p.healthScore != null && <Badge tone={p.healthScore >= 4.2 ? 'success' : p.healthScore >= 3.5 ? 'warn' : 'danger'}>Health {p.healthScore.toFixed(2)}</Badge>}
              {p.riskScore != null && <Badge tone={p.riskScore >= 2.5 ? 'danger' : p.riskScore >= 1.8 ? 'warn' : 'success'}>Risk {p.riskScore.toFixed(2)}</Badge>}
            </div>
          </div>
          {p.repository && (
            <a href={p.repository} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
              <GitBranch size={14} /> Repository
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Budget" value={formatINR(p.budget)} hint={formatINR(p.cost) + ' spent'} />
        <StatCard label="Revenue" value={formatINR(p.revenue)} hint={formatINR(p.profit) + ' profit'} />
        <StatCard label="Timeline" value={formatDate(p.startDate) + ' \u2192 ' + formatDate(p.expectedEndDate)} hint={p.actualEndDate ? 'Actual: ' + formatDate(p.actualEndDate) : 'In progress'} />
        <StatCard label="Team" value={p.members.length} hint={p.projectManager ? 'PM: ' + p.projectManager.fullName : 'No PM'} />
      </div>

      <Card>
        <CardHeader title="Tech Stack" subtitle="Architecture and integrations" />
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Frontend', items: p.techFrontend },
            { label: 'Backend', items: p.techBackend },
            { label: 'Database', items: p.techDatabase },
            { label: 'Cloud', items: p.techCloud },
            { label: 'AI/ML', items: p.techAI },
            { label: 'Integrations', items: p.integrations },
          ].map((g) => g.items.length > 0 && (
            <div key={g.label}>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{g.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Team Members" subtitle={p.members.length + ' people on this project'} />
        <Table columns={memberCols} data={p.members} rowKey={(r) => r.id} emptyMessage="No members" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Milestones" subtitle={p.milestones.length + ' milestones'} />
          <div className="space-y-3">
            {p.milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-3">
                <div className={'mt-0.5 h-3 w-3 rounded-full shrink-0 ' + (m.status === 'COMPLETED' ? 'bg-emerald-500' : m.status === 'IN_PROGRESS' ? 'bg-amber-500' : m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-slate-300')} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-slate-500">
                    Due {formatDate(m.dueDate)}
                    {m.completedAt && ' \u00B7 Completed ' + formatDate(m.completedAt)}
                    <span className="ml-2"><StatusBadge status={m.status} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Risks" subtitle={p.risks.length + ' on register'} />
          <div className="space-y-3">
            {p.risks.map((r) => (
              <div key={r.id} className="text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.severity} />
                  <span className="font-medium">{r.title}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>
                <div className="text-xs text-slate-400 mt-1">Mitigation: {r.mitigation}</div>
              </div>
            ))}
            {p.risks.length === 0 && <div className="text-xs text-slate-500">No risks on register</div>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Tasks" subtitle={p.tasks.length + ' tasks'} />
        <Table columns={taskCols} data={p.tasks} rowKey={(r) => r.id} emptyMessage="No tasks" />
      </Card>

      <Card>
        <CardHeader title="Invoices" subtitle={p.invoices.length + ' invoices'} />
        <Table columns={invoiceCols} data={p.invoices} rowKey={(r) => r.id} emptyMessage="No invoices" />
      </Card>

      {p.deployments.length > 0 && (
        <Card>
          <CardHeader title="Recent Deployments" subtitle="Last 10" />
          <div className="space-y-2">
            {p.deployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Rocket size={14} className="text-slate-400" />
                  <span className="font-mono text-xs">{d.deploymentCode}</span>
                  <Badge tone="neutral">{d.environment}</Badge>
                  <span className="text-xs text-slate-500">v{d.version}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <StatusBadge status={d.status} />
                  <span>{formatDate(d.deployedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}