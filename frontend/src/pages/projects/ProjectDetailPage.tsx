import { useEffect, useState } from 'react';
import ProjectCompilerTab from '../../components/project-tabs/ProjectCompilerTab';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, GitBranch, Rocket, Users, Calendar, DollarSign, AlertTriangle, Target, CheckCircle2, FileText, Workflow, Terminal, Activity } from 'lucide-react';
import { Sparkles, Info, Layers, Database } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Table, { Column } from '../../components/ui/Table';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { projectService, ProjectDetail } from '../../services/projectService';
import ProjectFinancials from './ProjectFinancials';
import ProjectReadmeTab from '../../components/project-tabs/ProjectReadmeTab';
import ProjectFlowchartTab from '../../components/project-tabs/ProjectFlowchartTab';
import ProjectDevWorkspaceTab from '../../components/project-tabs/ProjectDevWorkspaceTab';
import ProjectMonitoringTab from '../../components/project-tabs/ProjectMonitoringTab';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

type TabKey = 'overview' | 'financials' | 'members' | 'tasks' | 'milestones' | 'risks' | 'invoices' | 'deployments' | 'readme' | 'flowcharts' | 'workspace' | 'monitoring' | 'compiler';

const VALID_TABS: TabKey[] = ['overview', 'financials', 'members', 'tasks', 'milestones', 'risks', 'invoices', 'deployments', 'readme', 'flowcharts', 'workspace', 'monitoring', 'compiler'];

export default function ProjectDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [params, setParams] = useSearchParams();
  const [p, setP] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ai, setAi] = useState<{ summary: string[]; disclaimer: string; generatedAt: string; provider: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const tabFromUrl = (params.get('tab') || 'overview') as TabKey;
  const activeTab: TabKey = VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'overview';

  const setActiveTab = (next: TabKey) => {
    const np = new URLSearchParams(params);
    if (next === 'overview') np.delete('tab'); else np.set('tab', next);
    setParams(np, { replace: true });
  };

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setP(await projectService.detail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load project'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setAiLoading(true); setAiError(null);
    projectService.aiSummary(code)
      .then((r: any) => { if (!cancelled) setAi(r); })
      .catch((e: any) => { if (!cancelled) setAiError(e?.message || 'Failed to generate summary'); })
      .finally(() => { if (!cancelled) setAiLoading(false); });
    return () => { cancelled = true; };
  }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonTable rows={5} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!p) return <ErrorState message="Project not found" />;

  const memberCols: Column<ProjectDetail['members'][0]>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { key: 'name', header: 'Name', render: (r) => <Link className="hover:text-brand-500 font-medium" to={'/employees/' + r.employeeId}>{r.fullName}</Link> },
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
    { key: 'due', header: 'Due', render: (r) => <span className="text-xs">{formatDate(r.dueDate)}</span> },
  ];

  const invoiceCols: Column<ProjectDetail['invoices'][0]>[] = [
    { key: 'num', header: 'Invoice', render: (r) => <Link to={'/finance?invoice=' + encodeURIComponent(r.invoiceNumber)} className="font-mono text-xs hover:text-brand-500">{r.invoiceNumber}</Link> },
    { key: 'issue', header: 'Issued', render: (r) => <span className="text-xs">{formatDate(r.issueDate)}</span> },
    { key: 'due', header: 'Due', render: (r) => <span className="text-xs">{formatDate(r.dueDate)}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.total)}</span> },
    { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.paidAmount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const tasksDone = p.tasks.filter((t) => t.status === 'DONE').length;
  const milestonesDone = p.milestones.filter((m) => m.status === 'COMPLETED').length;
  const totalPaid = p.invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalInvoiced = p.invoices.reduce((s, i) => s + i.total, 0);

  const tabs: { key: TabKey; label: string; count: number; icon: any }[] = [
    { key: 'overview',    label: 'Overview',    count: 0,                    icon: Users },
    { key: 'financials',  label: 'Financials',  count: 0,                    icon: DollarSign },
    { key: 'members',     label: 'Team',        count: p.members.length,     icon: Users },
    { key: 'tasks',       label: 'Tasks',       count: p.tasks.length,       icon: CheckCircle2 },
    { key: 'milestones',  label: 'Milestones',  count: p.milestones.length,  icon: Target },
    { key: 'risks',       label: 'Risks',       count: p.risks.length,       icon: AlertTriangle },
    { key: 'invoices',    label: 'Invoices',    count: p.invoices.length,    icon: DollarSign },
    { key: 'deployments', label: 'Deployments', count: p.deployments.length, icon: Rocket },
    { key: 'readme',      label: 'README',      count: 0,                    icon: FileText },
    { key: 'flowcharts',  label: 'Flowcharts',  count: 0,                    icon: Workflow },
    { key: 'workspace',   label: 'Workspace',   count: 0,                    icon: Terminal },
    { key: 'monitoring',  label: 'Monitoring',  count: 0,                    icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to projects
      </Link>

      {/* Header */}
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-slate-500 mb-1">{p.projectCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {p.industry} &middot; {p.country}
              {p.client && (
                <>
                  {' \u00B7 Client: '}
                  <Link to={'/clients/' + p.client.clientCode} className="text-brand-500 hover:underline">{p.client.companyName}</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={p.status} />
              <Badge tone="brand">{p.progressPercent}% complete</Badge>
              {p.healthScore != null && <Badge tone={p.healthScore >= 4.2 ? 'success' : p.healthScore >= 3.5 ? 'warn' : 'danger'}>Health {p.healthScore.toFixed(2)}</Badge>}
              {p.riskScore != null && <Badge tone={p.riskScore >= 2.5 ? 'danger' : p.riskScore >= 1.8 ? 'warn' : 'success'}>Risk {p.riskScore.toFixed(2)}</Badge>}
              <Badge tone="neutral">{p.environment}</Badge>
            </div>
          </div>
          {p.repository && (
            <a href={p.repository} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
              <GitBranch size={14} /> Repository
            </a>
          )}
        </div>
      </Card>

      {/* Top stats — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Budget" value={formatINR(p.budget)} hint={formatINR(p.cost) + ' spent'} onClick={() => setActiveTab('financials')} />
        <StatCard label="Revenue" value={formatINR(p.revenue)} hint={formatINR(p.profit) + ' profit'} onClick={() => setActiveTab('financials')} />
        <StatCard label="Timeline" value={formatDate(p.startDate) + ' \u2192 ' + formatDate(p.expectedEndDate)} hint={p.actualEndDate ? 'Delivered ' + formatDate(p.actualEndDate) : 'In progress'} onClick={() => setActiveTab('milestones')} />
        <StatCard label="Team" value={p.members.length} hint={p.projectManager ? 'PM: ' + p.projectManager.fullName : 'No PM assigned'} onClick={() => setActiveTab('members')} />
      </div>

      {/* Tab navigation — all 12 tabs, URL-backed */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap ' + (activeTab === t.key ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200')}
            >
              <Icon size={13} />
              {t.label}
              {t.count > 0 && <span className="ml-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{t.count}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Tech Stack" subtitle="Architecture and integrations" />
            <div className="flex flex-wrap gap-6">
              {[
                { label: 'Frontend', items: p.techFrontend },
                { label: 'Backend', items: p.techBackend },
                { label: 'Database', items: p.techDatabase },
                { label: 'Cloud', items: p.techCloud },
                { label: 'AI/ML', items: p.techAI },
                { label: 'Integrations', items: p.integrations },
              ].map((g) => g.items.length > 0 && (
                <div key={g.label}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{g.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((t) => <Badge key={t} tone="brand">{t}</Badge>)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader title="Progress" subtitle="Milestones and tasks" />
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Overall</span><span className="font-medium">{p.progressPercent}%</span></div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-brand-500" style={{ width: p.progressPercent + '%' }} />
                  </div>
                </div>
                <button onClick={() => setActiveTab('milestones')} className="w-full flex items-center gap-2 text-xs hover:text-brand-500">
                  <Target size={14} className="text-slate-400" />
                  <span className="text-slate-500">Milestones</span>
                  <span className="font-medium ml-auto">{milestonesDone} / {p.milestones.length}</span>
                </button>
                <button onClick={() => setActiveTab('tasks')} className="w-full flex items-center gap-2 text-xs hover:text-brand-500">
                  <CheckCircle2 size={14} className="text-slate-400" />
                  <span className="text-slate-500">Tasks done</span>
                  <span className="font-medium ml-auto">{tasksDone} / {p.tasks.length}</span>
                </button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Financials" subtitle="Invoiced vs paid" />
              <div className="space-y-3">
                <button onClick={() => setActiveTab('invoices')} className="w-full flex items-center gap-2 text-xs hover:text-brand-500">
                  <DollarSign size={14} className="text-slate-400" />
                  <span className="text-slate-500">Invoiced</span>
                  <span className="font-medium ml-auto">{formatINR(totalInvoiced)}</span>
                </button>
                <button onClick={() => setActiveTab('invoices')} className="w-full flex items-center gap-2 text-xs hover:text-brand-500">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span className="text-slate-500">Paid</span>
                  <span className="font-medium ml-auto">{formatINR(totalPaid)}</span>
                </button>
                <button onClick={() => setActiveTab('invoices')} className="w-full flex items-center gap-2 text-xs hover:text-brand-500">
                  <DollarSign size={14} className="text-rose-500" />
                  <span className="text-slate-500">Outstanding</span>
                  <span className="font-medium ml-auto">{formatINR(totalInvoiced - totalPaid)}</span>
                </button>
              </div>
            </Card>

            <Card>
              <CardHeader title="Meta" subtitle="Classification" />
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">API Style</span><span className="font-medium">{p.apiStyle || '\u2014'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Security</span><StatusBadge status={p.securityStatus} /></div>
                <div className="flex justify-between"><span className="text-slate-500">QA</span><StatusBadge status={p.qaStatus} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium">{p.location?.city || '\u2014'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Team</span><span className="font-medium">{p.team?.name || '\u2014'}</span></div>
              </div>
            </Card>
          </div>

          {p.projectManager && (
            <Card>
              <CardHeader title="Project Manager" subtitle="Accountability" />
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-brand-500 text-white grid place-items-center font-semibold">
                  {p.projectManager.fullName.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <Link to={'/employees/' + p.projectManager.id} className="font-medium hover:text-brand-500">{p.projectManager.fullName}</Link>
                  <div className="text-xs text-slate-500">{p.projectManager.employeeCode} &middot; {p.projectManager.email}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Classification */}
          <Card>
            <CardHeader
              title="Classification"
              subtitle="Project metadata and compliance posture"
              action={<Layers size={14} className="text-slate-400" />}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Project Type</div>
                <div className="mt-1"><Badge tone="brand">{p.projectType}</Badge></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Industry</div>
                <div className="mt-1 font-medium">{p.industry || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Country</div>
                <div className="mt-1 font-medium">{p.country || '—'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Environment</div>
                <div className="mt-1"><Badge tone="neutral">{p.environment}</Badge></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">SLA Tier</div>
                <div className="mt-1"><StatusBadge status={p.slaTier} /></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Security</div>
                <div className="mt-1"><StatusBadge status={p.securityStatus} /></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">QA</div>
                <div className="mt-1"><StatusBadge status={p.qaStatus} /></div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">API Style</div>
                <div className="mt-1 font-medium">{p.apiStyle || '—'}</div>
              </div>
            </div>
          </Card>

          {/* Data Operations */}
          <Card>
            <CardHeader
              title="Data Operations"
              subtitle="Derived from live project records"
              action={<Database size={14} className="text-slate-400" />}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Members', value: p.members.length },
                { label: 'Tasks', value: p.tasks.length },
                { label: 'Milestones', value: p.milestones.length },
                { label: 'Risks', value: p.risks.length },
                { label: 'Invoices', value: p.invoices.length },
                { label: 'Repositories', value: p.repositories.length },
                { label: 'Deployments', value: p.deployments.length },
                { label: 'Integrations', value: p.integrations.length },
              ].map((row) => (
                <div key={row.label} className="rounded-md border border-slate-200/60 dark:border-slate-800/60 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{row.label}</div>
                  <div className="text-lg font-semibold tabular-nums mt-0.5">{row.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader
              title="AI Insights"
              subtitle="Rule-based summary generated from this project's records"
              action={<Sparkles size={14} className="text-violet-500" />}
            />
            {aiLoading && <div className="text-xs text-slate-500">Generating summary…</div>}
            {aiError && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <div>{aiError}</div>
              </div>
            )}
            {ai && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone="neutral">provider: {ai.provider}</Badge>
                  <span className="text-[10px] text-slate-400">
                    generated {new Date(ai.generatedAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <ul className="space-y-2">
                  {ai.summary.map((line, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-500 italic">
                  {ai.disclaimer}
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'financials' && <ProjectFinancials projectCode={p.projectCode} />}

      {activeTab === 'members' && (
        <Card>
          <CardHeader title="Team Members" subtitle={p.members.length + ' people on this project'} />
          <Table columns={memberCols} data={p.members} rowKey={(r) => r.id} emptyMessage="No members" />
        </Card>
      )}

      {activeTab === 'tasks' && (
        <Card>
          <CardHeader title="Tasks" subtitle={p.tasks.length + ' tasks'} />
          <Table columns={taskCols} data={p.tasks} rowKey={(r) => r.id} emptyMessage="No tasks" />
        </Card>
      )}

      {activeTab === 'milestones' && (
        <Card>
          <CardHeader title="Milestones" subtitle={p.milestones.length + ' milestones'} />
          <div className="space-y-3">
            {p.milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                <div className={'mt-1 h-3 w-3 rounded-full shrink-0 ' + (m.status === 'COMPLETED' ? 'bg-emerald-500' : m.status === 'IN_PROGRESS' ? 'bg-amber-500' : m.status === 'DELAYED' ? 'bg-rose-500' : 'bg-slate-300')} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Due {formatDate(m.dueDate)}
                    {m.completedAt && ' \u00B7 Completed ' + formatDate(m.completedAt)}
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
            {p.milestones.length === 0 && <div className="text-xs text-slate-500">No milestones</div>}
          </div>
        </Card>
      )}

      {activeTab === 'risks' && (
        <Card>
          <CardHeader title="Risks Register" subtitle={p.risks.length + ' on register'} />
          <div className="space-y-3">
            {p.risks.map((r) => (
              <div key={r.id} className="rounded-md border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="font-medium text-sm">{r.title}</span>
                  <StatusBadge status={r.severity} />
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-xs text-slate-500 mb-2">{r.description}</div>
                <div className="text-xs text-slate-400 italic">Mitigation: {r.mitigation}</div>
              </div>
            ))}
            {p.risks.length === 0 && <div className="text-xs text-slate-500">No risks registered</div>}
          </div>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <CardHeader title="Invoices" subtitle={p.invoices.length + ' invoices'} />
          <Table columns={invoiceCols} data={p.invoices} rowKey={(r) => r.id} emptyMessage="No invoices" />
        </Card>
      )}

      {activeTab === 'deployments' && (
        <Card>
          <CardHeader title="Deployments" subtitle={p.deployments.length + ' deployments'} />
          <div className="space-y-2">
            {p.deployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm p-3 rounded-md border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Rocket size={14} className="text-slate-400" />
                  <span className="font-mono text-xs">{d.deploymentCode}</span>
                  <Badge tone={d.environment === 'PROD' ? 'success' : d.environment === 'STAGING' ? 'info' : 'neutral'}>{d.environment}</Badge>
                  <span className="text-xs text-slate-500">v{d.version}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <StatusBadge status={d.status} />
                  <span>{formatDate(d.deployedAt)}</span>
                </div>
              </div>
            ))}
            {p.deployments.length === 0 && <div className="text-xs text-slate-500">No deployments</div>}
          </div>
        </Card>
      )}

      {activeTab === 'readme' && <ProjectReadmeTab project={p} />}
      {activeTab === 'flowcharts' && <ProjectFlowchartTab project={p} />}
      {activeTab === 'workspace' && <ProjectDevWorkspaceTab project={p} />}
      {activeTab === 'monitoring' && <ProjectMonitoringTab project={p} />}
      {activeTab === 'compiler' && <ProjectCompilerTab projectCode={p.projectCode} />}

      {/* Reference implementation (always shown on overview) */}
      {activeTab === 'overview' && p.reference && (
        <Card className="border-brand-500/30 bg-brand-500/5">
          <CardHeader
            title={'Reference Implementation: ' + p.reference.name}
            subtitle={p.reference.description}
            action={
              <a href={p.reference.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-500 hover:underline">
                <ExternalLink size={12} /> Open repository
              </a>
            }
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Architecture</div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{p.reference.architecture}</p>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Key Features</div>
              <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                {p.reference.keyFeatures.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Reference Tech Stack</div>
              <div className="space-y-3 mb-4">
                {[
                  { label: 'Frontend', items: p.reference.techStack.frontend },
                  { label: 'Backend', items: p.reference.techStack.backend },
                  { label: 'Database', items: p.reference.techStack.database },
                  { label: 'Infrastructure', items: p.reference.techStack.infrastructure },
                ].map((g) => (
                  <div key={g.label}>
                    <div className="text-[10px] text-slate-500 mb-1">{g.label}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Install Steps</div>
              <pre className="rounded-md bg-slate-900 text-slate-100 p-3 text-[11px] font-mono overflow-x-auto">
                {p.reference.installSteps.join('\n')}
              </pre>
            </div>
          </div>
        </Card>
      )}

      {/* Related repos (overview only) */}
      {activeTab === 'overview' && p.repositories.length > 0 && (
        <Card>
          <CardHeader title="Repositories" subtitle={p.repositories.length + ' linked'} />
          <div className="space-y-2">
            {p.repositories.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-slate-400" />
                  <Link to={'/engineering/repos/' + r.repoCode} className="font-mono text-xs hover:text-brand-500">{r.repoCode}</Link>
                  <Badge tone="brand">{r.language}</Badge>
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline inline-flex items-center gap-1">
                  Open <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
