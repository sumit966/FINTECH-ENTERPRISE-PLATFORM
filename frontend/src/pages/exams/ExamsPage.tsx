import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Plus, HelpCircle, FileText, Send, Award, X } from 'lucide-react';
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
import { examService, QuestionRow, AssessmentRow, AttemptRow, ExamsSummary } from '../../services/examService';

type Tab = 'questions' | 'assessments' | 'attempts';

export default function ExamsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const tab = ((params.get('tab') as Tab) || 'questions') as Tab;
  const qSearchFromUrl = params.get('q') || '';
  const qCategoryFromUrl = params.get('category') || '';
  const qDifficultyFromUrl = params.get('difficulty') || '';
  const aSearchFromUrl = params.get('aq') || '';
  const qPageFromUrl = params.get('qp') ? Number(params.get('qp')) : 1;
  const aPageFromUrl = params.get('ap') ? Number(params.get('ap')) : 1;

  const [summary, setSummary] = useState<ExamsSummary | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [qTotal, setQTotal] = useState(0);
  const [qTotalPages, setQTotalPages] = useState(1);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [aTotal, setATotal] = useState(0);
  const [aTotalPages, setATotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qSearch, setQSearch] = useState(qSearchFromUrl);
  const [aSearch, setASearch] = useState(aSearchFromUrl);
  const qSearchDeb = useDebounce(qSearch, 350);
  const aSearchDeb = useDebounce(aSearch, 350);

  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [openAttemptId, setOpenAttemptId] = useState<string | null>(null);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const setTab = (t: Tab) => setUrl({ tab: t === 'questions' ? null : t, qp: null, ap: null });
  const clearQ = () => setUrl({ q: null, category: null, difficulty: null, qp: null });

  useEffect(() => {
    examService.summary().then(setSummary).catch(() => {});
    examService.assessments().then(setAssessments).catch(() => {});
  }, []);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (qSearchDeb && qSearchDeb !== (np.get('q') || '')) { np.set('q', qSearchDeb); np.delete('qp'); setParams(np, { replace: true }); }
    else if (!qSearchDeb && np.has('q')) { np.delete('q'); np.delete('qp'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qSearchDeb]);

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (aSearchDeb && aSearchDeb !== (np.get('aq') || '')) { np.set('aq', aSearchDeb); np.delete('ap'); setParams(np, { replace: true }); }
    else if (!aSearchDeb && np.has('aq')) { np.delete('aq'); np.delete('ap'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aSearchDeb]);

  useEffect(() => {
    if (tab !== 'questions') return;
    let cancelled = false;
    setLoading(true); setError(null);
    examService.questions({
      page: qPageFromUrl, pageSize: 20,
      search: qSearchDeb || undefined,
      category: qCategoryFromUrl || undefined,
      difficulty: qDifficultyFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setQuestions(r.items); setQTotal(r.total); setQTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load questions'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, qPageFromUrl, qSearchDeb, qCategoryFromUrl, qDifficultyFromUrl]);

  useEffect(() => {
    if (tab !== 'attempts') return;
    let cancelled = false;
    setLoading(true); setError(null);
    examService.attempts({ page: aPageFromUrl, pageSize: 20, search: aSearchDeb || undefined })
      .then((r) => { if (cancelled) return; setAttempts(r.items); setATotal(r.total); setATotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load attempts'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tab, aPageFromUrl, aSearchDeb]);

  const qCols: Column<QuestionRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.questionCode}</span> },
    { key: 'prompt', header: 'Question', render: (r) => (
      <div className="max-w-xl">
        <div className="text-sm line-clamp-2">{r.prompt}</div>
        {r.options.length > 0 && <div className="text-[11px] text-slate-500 mt-0.5">{r.options.length} options</div>}
      </div>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <Badge tone="brand">{r.category}</Badge> },
    { key: 'type', header: 'Type', render: (r) => <span className="text-xs">{r.type}</span> },
    { key: 'diff', header: 'Difficulty', render: (r) => <StatusBadge status={r.difficulty} /> },
    { key: 'pts', header: 'Points', className: 'text-right', render: (r) => <span className="text-xs">{r.points}</span> },
    { key: 'time', header: 'Time', className: 'text-right', render: (r) => <span className="text-xs">{r.timeLimitSec}s</span> },
  ];

  const attemptCols: Column<AttemptRow>[] = [
    { key: 'code', header: 'Attempt', render: (r) => <span className="font-mono text-xs">{r.attemptCode}</span> },
    { key: 'candidate', header: 'Candidate', render: (r) => r.candidateName ? (
      <span className="text-sm">{r.candidateName}</span>
    ) : <span className="text-xs text-slate-500">&mdash;</span> },
    { key: 'assessment', header: 'Assessment', render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); navigate('/exams/assessments/' + encodeURIComponent(r.assessmentCode)); }}
        className="text-sm hover:text-brand-500 transition-colors text-left"
      >
        {r.assessmentTitle}
      </button>
    ) },
    { key: 'cat', header: 'Category', render: (r) => <span className="text-xs">{r.assessmentCategory}</span> },
    { key: 'started', header: 'Started', render: (r) => <span className="text-xs">{new Date(r.startedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'score', header: 'Score', className: 'text-right', render: (r) => r.score != null ? <span className="text-xs font-medium">{r.score.toFixed(1)}</span> : '\u2014' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const tabs = [
    { key: 'questions', label: 'Questions' },
    { key: 'assessments', label: 'Assessments' },
    { key: 'attempts', label: 'Attempts' },
  ];

  const openQuestion = questions.find((q) => q.id === openQuestionId) || null;
  const openAttempt = attempts.find((a) => a.id === openAttemptId) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams &amp; Assessments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Question bank, assessments, and candidate attempts &middot; live from PostgreSQL
          </p>
        </div>
        <Link to="/exams/new" className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 text-white px-3 py-2 text-sm font-medium hover:bg-brand-600">
          <Plus size={14} /> New Exam
        </Link>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="Questions"
            value={summary.totalQuestions}
            hint={summary.byCategory.length + ' categories'}
            icon={<HelpCircle size={18} />}
            accent="brand"
            onClick={() => { setTab('questions'); clearQ(); }}
          />
          <Kpi
            label="Assessments"
            value={summary.totalAssessments}
            hint={summary.byType.length + ' question types'}
            icon={<FileText size={18} />}
            accent="violet"
            onClick={() => setTab('assessments')}
          />
          <Kpi
            label="Attempts"
            value={summary.totalAttempts}
            hint="Submissions on record"
            icon={<Send size={18} />}
            accent="teal"
            onClick={() => setTab('attempts')}
          />
          <Kpi
            label="Average Score"
            value={summary.averageScore}
            format={(n) => n.toFixed(1)}
            hint="Across all attempts"
            icon={<Award size={18} />}
            accent="amber"
          />
        </div>
      )}

      <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />

      {tab === 'questions' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={qSearch} onChange={(e) => setQSearch(e.target.value)} placeholder="Search question code or prompt" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={qCategoryFromUrl} onChange={(e) => setUrl({ category: e.target.value || null, qp: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All categories</option>
                {summary?.byCategory.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
              </select>
              <select value={qDifficultyFromUrl} onChange={(e) => setUrl({ difficulty: e.target.value || null, qp: null })} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </Card>

          {(qCategoryFromUrl || qDifficultyFromUrl || qSearchDeb) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500">Active:</span>
              {qCategoryFromUrl && <Badge tone="brand">Category: {qCategoryFromUrl}</Badge>}
              {qDifficultyFromUrl && <Badge tone="brand">Difficulty: {qDifficultyFromUrl}</Badge>}
              {qSearchDeb && <Badge tone="brand">Search: &quot;{qSearchDeb}&quot;</Badge>}
              <button onClick={clearQ} className="text-brand-500 hover:underline ml-2 inline-flex items-center gap-1"><X size={11} /> Clear</button>
            </div>
          )}

          {error ? <ErrorState message={error} onRetry={() => setUrl({ qp: null })} /> :
           loading ? <SkeletonTable rows={10} /> :
           questions.length === 0 ? <EmptyState title="No questions" description="No questions match the filters." /> :
           <Card padded={false}>
             <Table columns={qCols} data={questions} rowKey={(r) => r.id} emptyMessage="No questions"
               onRowClick={(r) => setOpenQuestionId(r.id)} />
           </Card>}
          {qTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(qPageFromUrl - 1) * 20 + 1}&ndash;{Math.min(qPageFromUrl * 20, qTotal)} of {qTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={qPageFromUrl <= 1} onClick={() => setUrl({ qp: qPageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {qPageFromUrl} of {qTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={qPageFromUrl >= qTotalPages} onClick={() => setUrl({ qp: qPageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'assessments' && (
        <>
          {assessments.length === 0 ? (
            <EmptyState title="No assessments" description="Create your first exam."
              action={<Link to="/exams/new" className="rounded-md bg-brand-500 text-white px-3 py-2 text-sm">New Exam</Link>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assessments.map((a) => (
                <Link key={a.id} to={'/exams/assessments/' + a.assessmentCode} className="block">
                  <Card className="hover:border-brand-500 transition h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono text-slate-500">{a.assessmentCode}</div>
                        <div className="font-semibold mt-1">{a.title}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone="brand">{a.category}</Badge>
                        <StatusBadge status={a.isActive ? 'ACTIVE' : 'CLOSED'} />
                      </div>
                    </div>
                    {a.description && <div className="text-xs text-slate-500 mt-2 line-clamp-2">{a.description}</div>}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Duration</div>
                        <div className="text-sm font-semibold">{a.durationMins} min</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Questions</div>
                        <div className="text-sm font-semibold">{a.questionCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Attempts</div>
                        <div className="text-sm font-semibold">{a.attemptCount}</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'attempts' && (
        <>
          <Card padded={false} className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={aSearch} onChange={(e) => setASearch(e.target.value)} placeholder="Search attempt code or candidate" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </div>
          </Card>
          {error ? <ErrorState message={error} onRetry={() => setUrl({ ap: null })} /> :
           loading ? <SkeletonTable rows={10} /> :
           attempts.length === 0 ? <EmptyState title="No attempts" description="No attempts match the filters." /> :
           <Card padded={false}>
             <Table columns={attemptCols} data={attempts} rowKey={(r) => r.id} emptyMessage="No attempts"
               onRowClick={(r) => setOpenAttemptId(r.id)} />
           </Card>}
          {aTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(aPageFromUrl - 1) * 20 + 1}&ndash;{Math.min(aPageFromUrl * 20, aTotal)} of {aTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={aPageFromUrl <= 1} onClick={() => setUrl({ ap: aPageFromUrl - 1 })}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {aPageFromUrl} of {aTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={aPageFromUrl >= aTotalPages} onClick={() => setUrl({ ap: aPageFromUrl + 1 })}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Question detail drawer */}
      {openQuestion && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenQuestionId(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{openQuestion.questionCode}</span>
                <Badge tone="brand">{openQuestion.category}</Badge>
              </div>
              <button onClick={() => setOpenQuestionId(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={openQuestion.difficulty} />
                <Badge tone="neutral">{openQuestion.type}</Badge>
                <Badge tone="brand">{openQuestion.points} pts</Badge>
                <Badge tone="neutral">{openQuestion.timeLimitSec}s</Badge>
              </div>
              <div className="text-base leading-relaxed">{openQuestion.prompt}</div>
              {openQuestion.options.length > 0 && (
                <div className="space-y-1.5">
                  {openQuestion.options.map((opt, i) => {
                    const correct = opt === openQuestion.correctAnswer;
                    return (
                      <div key={i} className={'flex items-start gap-2 rounded-md border px-3 py-2 ' + (correct ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800')}>
                        <span className="text-xs text-slate-500 w-5 shrink-0">{String.fromCharCode(65 + i)}.</span>
                        <span className={correct ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {openQuestion.explanation && (
                <div className="rounded-md bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-500 italic">
                  {openQuestion.explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attempt detail drawer */}
      {openAttempt && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenAttemptId(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="font-medium text-sm">Attempt {openAttempt.attemptCode}</div>
              <button onClick={() => setOpenAttemptId(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={openAttempt.status} />
                {openAttempt.score != null && <Badge tone="brand">Score {openAttempt.score.toFixed(1)}</Badge>}
                {openAttempt.totalPoints != null && <Badge tone="neutral">of {openAttempt.totalPoints}</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Assessment</div>
                  <Link to={'/exams/assessments/' + encodeURIComponent(openAttempt.assessmentCode)} className="font-medium hover:text-brand-500">{openAttempt.assessmentTitle}</Link>
                  <div className="text-xs text-slate-500">{openAttempt.assessmentCategory}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Candidate</div>
                  {openAttempt.candidateCode ? (
                    <Link to={'/recruitment/candidates/' + encodeURIComponent(openAttempt.candidateCode)} className="font-medium hover:text-brand-500">{openAttempt.candidateName}</Link>
                  ) : <span className="text-slate-500">&mdash;</span>}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Started</div>
                  <div>{new Date(openAttempt.startedAt).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Submitted</div>
                  <div>{openAttempt.submittedAt ? new Date(openAttempt.submittedAt).toLocaleString('en-IN') : '\u2014'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
