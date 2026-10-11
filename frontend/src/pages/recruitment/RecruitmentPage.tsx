import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Briefcase, Users, ClipboardCheck, Layers } from 'lucide-react';
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
import { recruitmentService, JobRow, CandidateRow, PipelineStage, RecruitmentSummary } from '../../services/recruitmentService';

type Tab = 'jobs' | 'candidates' | 'pipeline';

const PIPELINE_ORDER = ['APPLIED','SCREENING','ASSESSMENT','TECHNICAL_INTERVIEW','MANAGER_INTERVIEW','HR_INTERVIEW','SELECTED','OFFER','JOINED','REJECTED'];

function formatINR(v: number | null): string {
  if (v == null) return '\u2014';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(1) + 'L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function RecruitmentPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = ((params.get('tab') as Tab) || 'jobs') as Tab;
  const jobSearchFromUrl = params.get('q') || '';
  const jobStatusFromUrl = params.get('status') || '';
  const candStageFromUrl = params.get('stage') || '';
  const candJobFromUrl = params.get('job') || '';
  const jobPageFromUrl = params.get('jp') ? Number(params.get('jp')) : 1;
  const candPageFromUrl = params.get('cp') ? Number(params.get('cp')) : 1;

  const [summary, setSummary] = useState<RecruitmentSummary | null>(null);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [candTotal, setCandTotal] = useState(0);
  const [candTotalPages, setCandTotalPages] = useState(1);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [jobSearch, setJobSearch] = useState(jobSearchFromUrl);
  const [candSearch, setCandSearch] = useState('');
  const jobSearchDeb = useDebounce(jobSearch, 350);
  const candSearchDeb = useDebounce(candSearch, 350);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const setTab = (t: Tab) => setUrl({ tab: t === 'jobs' ? null : t, jp: null, cp: null });

  useEffect(() => {
    recruitmentService.summary().then(setSummary).catch(() => {});
    recruitmentService.pipeline().then((r) => setPipeline(r.stages)).catch(() => {});
  }, []);

  // Sync job search into URL
  useEffect(() => {
    const np = new URLSearchParams(params);
    if (jobSearchDeb && jobSearchDeb !== (np.get('q') || '')) { np.set('q', jobSearchDeb); np.delete('jp'); setParams(np, { replace: true }); }
    else if (!jobSearchDeb && np.has('q')) { np.delete('q'); np.delete('jp'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSearchDeb]);

  useEffect(() => {
    if (tab !== 'jobs') return;
    let cancelled = false;
    setLoading(true); setError(null);
    recruitmentService.jobs({ page: jobPageFromUrl, pageSize: 20, search: jobSearchDeb || undefined, status: jobStatusFromUrl || undefined })
      .then((r) => { if (cancelled) return; setJobs(r.items); setJobTotal(r.total); setJobTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load jobs'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, jobPageFromUrl, jobSearchDeb, jobStatusFromUrl]);

  useEffect(() => {
    if (tab !== 'candidates') return;
    let cancelled = false;
    setLoading(true); setError(null);
    recruitmentService.candidates({
      page: candPageFromUrl, pageSize: 20,
      search: candSearchDeb || undefined,
      stage: candStageFromUrl || undefined,
      jobCode: candJobFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setCandidates(r.items); setCandTotal(r.total); setCandTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load candidates'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, candPageFromUrl, candSearchDeb, candStageFromUrl, candJobFromUrl]);

  const jobCols: Column<JobRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.jobCode}</span> },
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium text-sm">{r.title}</span> },
    { key: 'dept', header: 'Department', render: (r) => <span className="text-xs">{r.departmentName}</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity}</span> },
    { key: 'level', header: 'Level', render: (r) => <Badge tone="brand">{r.level}</Badge> },
    { key: 'exp', header: 'Experience', render: (r) => <span className="text-xs">{r.minExperience}-{r.maxExperience}y</span> },
    { key: 'open', header: 'Openings', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.openings}</span> },
    { key: 'cand', header: 'Candidates', className: 'text-right', render: (r) => <span className="text-xs">{r.candidateCount}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const candCols: Column<CandidateRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-[11px]">{r.candidateCode}</span> },
    { key: 'name', header: 'Candidate', render: (r) => (
      <div>
        <span className="font-medium text-sm">{r.fullName}</span>
        <div className="text-[11px] text-slate-500">{r.currentCompany || r.email}</div>
      </div>
    ) },
    { key: 'job', header: 'Applied for', render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); setTab('candidates'); setUrl({ job: r.jobCode, cp: null }); }}
        className="text-xs hover:text-brand-500 transition-colors text-left"
      >
        {r.jobTitle}
      </button>
    ) },
    { key: 'stage', header: 'Stage', render: (r) => <StatusBadge status={r.stage} /> },
    { key: 'score', header: 'Score', render: (r) => r.score != null ? <span className="text-xs font-medium">{r.score.toFixed(2)}</span> : '\u2014' },
    { key: 'notice', header: 'Notice', className: 'text-right', render: (r) => <span className="text-xs">{r.noticePeriod ?? '\u2014'}d</span> },
    { key: 'exp', header: 'Expected', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.expectedCtc)}</span> },
    { key: 'source', header: 'Source', render: (r) => <span className="text-[11px] text-slate-500">{r.source}</span> },
  ];

  const tabs = [
    { key: 'jobs', label: 'Jobs' },
    { key: 'candidates', label: 'Candidates' },
    { key: 'pipeline', label: 'Pipeline' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">Talent acquisition</div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Recruitment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Jobs, candidates, and pipeline &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="Open Jobs"
            value={summary.openJobs}
            hint={(summary.totalJobs - summary.openJobs) + ' non-open \u00B7 ' + summary.totalOpeningsRequested + ' openings requested'}
            icon={<Briefcase size={18} />}
            accent="brand"
            onClick={() => { setTab('jobs'); setUrl({ status: 'OPEN', jp: null }); }}
          />
          <Kpi
            label="Total Candidates"
            value={summary.totalCandidates}
            hint={summary.scheduledInterviews + ' interviews scheduled'}
            icon={<Users size={18} />}
            accent="violet"
            onClick={() => setTab('candidates')}
          />
          <Kpi
            label="Exam Attempts"
            value={summary.totalExamAttempts}
            hint="Assessment submissions"
            icon={<ClipboardCheck size={18} />}
            accent="teal"
            onClick={() => navigate('/exams')}
          />
          <Kpi
            label="Pipeline Stages"
            value={summary.byStage.length}
            hint="Active stages with candidates"
            icon={<Layers size={18} />}
            accent="amber"
            onClick={() => setTab('pipeline')}
          />
        </div>
      )}

      
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Source of Hire" subtitle="Where candidates come from" />
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={summary.bySource.map((x) => ({ name: x.source, value: x.count }))} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40} label={(e: any) => e.name + ': ' + e.value} labelLine={false}>
                    {summary.bySource.map((_, i) => <Cell key={i} fill={['#3358ff','#8b5cf6','#14b8a6','#f59e0b','#ef4444','#06b6d4'][i % 6]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

<Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />

      {tab === 'jobs' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="Search job code or title" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={jobStatusFromUrl} onChange={(e) => setUrl({ status: e.target.value || null, jp: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="ON_HOLD">On hold</option>
                <option value="CLOSED">Closed</option>
                <option value="FILLED">Filled</option>
              </select>
            </div>
          </Card>
          {error ? <ErrorState message={error} onRetry={() => setUrl({ jp: null })} /> :
           loading ? <SkeletonTable rows={10} /> :
           jobs.length === 0 ? (
            <EmptyState title="No jobs match the filters" description="Try widening the search." />
           ) : (
            <Card padded={false}>
              <Table
                columns={jobCols}
                data={jobs}
                rowKey={(r) => r.id}
                emptyMessage="No jobs"
                onRowClick={(r) => { setTab('candidates'); setUrl({ job: r.jobCode, cp: null }); }}
              />
            </Card>
          )}
          {jobTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(jobPageFromUrl - 1) * 20 + 1}&ndash;{Math.min(jobPageFromUrl * 20, jobTotal)} of {jobTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={jobPageFromUrl <= 1} onClick={() => setUrl({ jp: jobPageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {jobPageFromUrl} of {jobTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={jobPageFromUrl >= jobTotalPages} onClick={() => setUrl({ jp: jobPageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'candidates' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={candSearch} onChange={(e) => setCandSearch(e.target.value)} placeholder="Search candidate code, name, or email" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={candStageFromUrl} onChange={(e) => setUrl({ stage: e.target.value || null, cp: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All stages</option>
                {PIPELINE_ORDER.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </Card>

          {(candStageFromUrl || candJobFromUrl) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500">Active:</span>
              {candStageFromUrl && <Badge tone="brand">Stage: {candStageFromUrl.replace(/_/g, ' ')}</Badge>}
              {candJobFromUrl && <Badge tone="brand">Job: {candJobFromUrl}</Badge>}
              <button onClick={() => setUrl({ stage: null, job: null, cp: null })} className="text-brand-500 hover:underline ml-2">Clear</button>
            </div>
          )}

          {error ? <ErrorState message={error} onRetry={() => setUrl({ cp: null })} /> :
           loading ? <SkeletonTable rows={10} /> :
           candidates.length === 0 ? (
            <EmptyState title="No candidates match the filters" description="Try widening the search." />
           ) : (
            <Card padded={false}>
              <Table
                columns={candCols}
                data={candidates}
                rowKey={(r) => r.id}
                emptyMessage="No candidates"
                onRowClick={(r) => navigate('/recruitment/candidates/' + encodeURIComponent(r.candidateCode))}
              />
            </Card>
          )}
          {candTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(candPageFromUrl - 1) * 20 + 1}&ndash;{Math.min(candPageFromUrl * 20, candTotal)} of {candTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={candPageFromUrl <= 1} onClick={() => setUrl({ cp: candPageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {candPageFromUrl} of {candTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={candPageFromUrl >= candTotalPages} onClick={() => setUrl({ cp: candPageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'pipeline' && (
        <div className="overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            {PIPELINE_ORDER.map((stage) => {
              const p = pipeline.find((x) => x.stage === stage);
              const count = p?.count ?? 0;
              return (
                <div key={stage} className="w-64 shrink-0">
                  <button
                    onClick={() => { setTab('candidates'); setUrl({ stage, cp: null }); }}
                    className="w-full flex items-center justify-between mb-2 px-1 hover:text-brand-500 transition"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stage.replace(/_/g, ' ')}</span>
                    <Badge tone="brand">{count}</Badge>
                  </button>
                  <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-2 min-h-[200px]">
                    {p?.samples.map((c) => (
                      <Link key={c.id} to={'/recruitment/candidates/' + encodeURIComponent(c.candidateCode)} className="block rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-brand-500 transition">
                        <div className="text-sm font-medium">{c.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.candidateCode}</div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate">{c.jobTitle}</div>
                        {c.score != null && <div className="mt-2 text-xs font-medium">Score {c.score.toFixed(2)}</div>}
                      </Link>
                    ))}
                    {p && p.count > p.samples.length && (
                      <button
                        onClick={() => { setTab('candidates'); setUrl({ stage, cp: null }); }}
                        className="w-full text-[11px] text-center text-brand-500 hover:underline py-2"
                      >
                        View all {p.count} in this stage
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
