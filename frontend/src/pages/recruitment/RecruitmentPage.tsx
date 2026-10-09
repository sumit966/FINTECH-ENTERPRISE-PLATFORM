import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
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
  const [tab, setTab] = useState<Tab>('jobs');
  const [summary, setSummary] = useState<RecruitmentSummary | null>(null);

  const [jobSearch, setJobSearch] = useState('');
  const [jobStatus, setJobStatus] = useState('');
  const [jobPage, setJobPage] = useState(1);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobTotalPages, setJobTotalPages] = useState(1);

  const [candSearch, setCandSearch] = useState('');
  const [candStage, setCandStage] = useState('');
  const [candPage, setCandPage] = useState(1);
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [candTotal, setCandTotal] = useState(0);
  const [candTotalPages, setCandTotalPages] = useState(1);

  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const jobSearchDeb = useDebounce(jobSearch, 350);
  const candSearchDeb = useDebounce(candSearch, 350);

  useEffect(() => { recruitmentService.summary().then(setSummary).catch(() => {}); }, []);
  useEffect(() => { recruitmentService.pipeline().then((r) => setPipeline(r.stages)).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    recruitmentService.jobs({ page: jobPage, pageSize: 20, search: jobSearchDeb || undefined, status: jobStatus || undefined })
      .then((r) => { if (cancelled) return; setJobs(r.items); setJobTotal(r.total); setJobTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load jobs'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [jobPage, jobSearchDeb, jobStatus]);

  useEffect(() => {
    let cancelled = false;
    recruitmentService.candidates({ page: candPage, pageSize: 20, search: candSearchDeb || undefined, stage: candStage || undefined })
      .then((r) => { if (cancelled) return; setCandidates(r.items); setCandTotal(r.total); setCandTotalPages(r.totalPages); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [candPage, candSearchDeb, candStage]);

  useEffect(() => { setJobPage(1); }, [jobSearchDeb, jobStatus]);
  useEffect(() => { setCandPage(1); }, [candSearchDeb, candStage]);

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
        <Link to={'/recruitment/candidates/' + r.candidateCode} className="font-medium text-sm hover:text-brand-500">{r.fullName}</Link>
        <div className="text-[11px] text-slate-500">{r.currentCompany || r.email}</div>
      </div>
    ) },
    { key: 'job', header: 'Applied for', render: (r) => <span className="text-xs">{r.jobTitle}</span> },
    { key: 'stage', header: 'Stage', render: (r) => <StatusBadge status={r.stage} /> },
    { key: 'score', header: 'Score', render: (r) => r.score != null ? <span className="text-xs font-medium">{r.score.toFixed(2)}</span> : '\u2014' },
    { key: 'notice', header: 'Notice', className: 'text-right', render: (r) => <span className="text-xs">{r.noticePeriod ?? '\u2014'}d</span> },
    { key: 'exp', header: 'Expected', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.expectedCtc)}</span> },
    { key: 'source', header: 'Source', render: (r) => <span className="text-[11px] text-slate-500">{r.source}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recruitment</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Jobs, candidates, and pipeline &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Open Jobs" value={summary.openJobs + ' / ' + summary.totalJobs} hint={summary.totalOpeningsRequested + ' total openings'} />
          <StatCard label="Total Candidates" value={summary.totalCandidates} hint={summary.scheduledInterviews + ' interviews scheduled'} />
          <StatCard label="Exam Attempts" value={summary.totalExamAttempts} hint="Assessment submissions" />
          <StatCard label="Pipeline Stages" value={summary.byStage.length} hint="Active stages" />
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['jobs','candidates','pipeline'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 text-sm font-medium border-b-2 capitalize ' + (tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="Search job code or title" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={jobStatus} onChange={(e) => setJobStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="OPEN">Open</option>
                <option value="DRAFT">Draft</option>
                <option value="ON_HOLD">On hold</option>
                <option value="CLOSED">Closed</option>
                <option value="FILLED">Filled</option>
              </select>
            </div>
          </Card>
          {error ? <ErrorState message={error} onRetry={() => setJobPage((p) => p)} /> :
           loading ? <SkeletonTable rows={10} /> :
           <Card padded={false}><Table columns={jobCols} data={jobs} rowKey={(r) => r.id} emptyMessage="No jobs" /></Card>}
          {jobTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(jobPage - 1) * 20 + 1}-{Math.min(jobPage * 20, jobTotal)} of {jobTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={jobPage <= 1} onClick={() => setJobPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {jobPage} of {jobTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={jobPage >= jobTotalPages} onClick={() => setJobPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
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
              <select value={candStage} onChange={(e) => setCandStage(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All stages</option>
                {PIPELINE_ORDER.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
              </select>
            </div>
          </Card>
          <Card padded={false}><Table columns={candCols} data={candidates} rowKey={(r) => r.id} emptyMessage="No candidates" /></Card>
          {candTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(candPage - 1) * 20 + 1}-{Math.min(candPage * 20, candTotal)} of {candTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={candPage <= 1} onClick={() => setCandPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {candPage} of {candTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={candPage >= candTotalPages} onClick={() => setCandPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
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
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stage.replace(/_/g,' ')}</span>
                    <Badge tone="brand">{p?.count ?? 0}</Badge>
                  </div>
                  <div className="space-y-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-2 min-h-[200px]">
                    {p?.samples.map((c) => (
                      <Link key={c.id} to={'/recruitment/candidates/' + c.candidateCode} className="block rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-brand-500 transition">
                        <div className="text-sm font-medium">{c.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.candidateCode}</div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate">{c.jobTitle}</div>
                        {c.score != null && <div className="mt-2 text-xs font-medium">Score {c.score.toFixed(2)}</div>}
                      </Link>
                    ))}
                    {p && p.count > p.samples.length && (
                      <div className="text-[11px] text-center text-slate-500 py-2">+ {p.count - p.samples.length} more</div>
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