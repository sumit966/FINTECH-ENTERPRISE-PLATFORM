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
import { examService, QuestionRow, AssessmentRow, AttemptRow, ExamsSummary } from '../../services/examService';

type Tab = 'questions' | 'assessments' | 'attempts';

export default function ExamsPage() {
  const [tab, setTab] = useState<Tab>('questions');
  const [summary, setSummary] = useState<ExamsSummary | null>(null);

  const [qSearch, setQSearch] = useState('');
  const [qCategory, setQCategory] = useState('');
  const [qDifficulty, setQDifficulty] = useState('');
  const [qPage, setQPage] = useState(1);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [qTotal, setQTotal] = useState(0);
  const [qTotalPages, setQTotalPages] = useState(1);

  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);

  const [aSearch, setASearch] = useState('');
  const [aPage, setAPage] = useState(1);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [aTotal, setATotal] = useState(0);
  const [aTotalPages, setATotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qSearchDeb = useDebounce(qSearch, 350);
  const aSearchDeb = useDebounce(aSearch, 350);

  useEffect(() => { examService.summary().then(setSummary).catch(() => {}); }, []);
  useEffect(() => { examService.assessments().then(setAssessments).catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    examService.questions({ page: qPage, pageSize: 20, search: qSearchDeb || undefined, category: qCategory || undefined, difficulty: qDifficulty || undefined })
      .then((r) => { if (cancelled) return; setQuestions(r.items); setQTotal(r.total); setQTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load questions'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [qPage, qSearchDeb, qCategory, qDifficulty]);

  useEffect(() => {
    let cancelled = false;
    examService.attempts({ page: aPage, pageSize: 20, search: aSearchDeb || undefined })
      .then((r) => { if (cancelled) return; setAttempts(r.items); setATotal(r.total); setATotalPages(r.totalPages); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [aPage, aSearchDeb]);

  useEffect(() => { setQPage(1); }, [qSearchDeb, qCategory, qDifficulty]);
  useEffect(() => { setAPage(1); }, [aSearchDeb]);

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
      <Link to={'/recruitment/candidates/' + r.candidateCode} className="text-sm hover:text-brand-500">{r.candidateName}</Link>
    ) : <span className="text-xs text-slate-500">&mdash;</span> },
    { key: 'assessment', header: 'Assessment', render: (r) => <span className="text-sm">{r.assessmentTitle}</span> },
    { key: 'cat', header: 'Category', render: (r) => <span className="text-xs">{r.assessmentCategory}</span> },
    { key: 'started', header: 'Started', render: (r) => <span className="text-xs">{new Date(r.startedAt).toLocaleDateString('en-IN')}</span> },
    { key: 'score', header: 'Score', className: 'text-right', render: (r) => r.score != null ? <span className="text-xs font-medium">{r.score.toFixed(1)}</span> : '\u2014' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Exams &amp; Assessments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Question bank, assessments, and candidate attempts &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Questions" value={summary.totalQuestions} hint={summary.byCategory.length + ' categories'} />
          <StatCard label="Assessments" value={summary.totalAssessments} hint={summary.byType.length + ' question types'} />
          <StatCard label="Attempts" value={summary.totalAttempts} hint="Submissions on record" />
          <StatCard label="Average Score" value={summary.averageScore.toFixed(1)} hint="Across all attempts" />
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['questions','assessments','attempts'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={'px-4 py-2 text-sm font-medium border-b-2 capitalize ' + (tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={qSearch} onChange={(e) => setQSearch(e.target.value)} placeholder="Search question code or prompt" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={qCategory} onChange={(e) => setQCategory(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All categories</option>
                {summary?.byCategory.map((c) => <option key={c.category} value={c.category}>{c.category} ({c.count})</option>)}
              </select>
              <select value={qDifficulty} onChange={(e) => setQDifficulty(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </Card>
          {error ? <ErrorState message={error} onRetry={() => setQPage((p) => p)} /> :
           loading ? <SkeletonTable rows={10} /> :
           <Card padded={false}><Table columns={qCols} data={questions} rowKey={(r) => r.id} emptyMessage="No questions" /></Card>}
          {qTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(qPage - 1) * 20 + 1}-{Math.min(qPage * 20, qTotal)} of {qTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={qPage <= 1} onClick={() => setQPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {qPage} of {qTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={qPage >= qTotalPages} onClick={() => setQPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'assessments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments.map((a) => (
            <Link key={a.id} to={'/exams/assessments/' + a.assessmentCode} className="block">
              <Card className="hover:border-brand-500 transition h-full">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono text-slate-500">{a.assessmentCode}</div>
                    <div className="font-semibold mt-1">{a.title}</div>
                  </div>
                  <Badge tone="brand">{a.category}</Badge>
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

      {tab === 'attempts' && (
        <>
          <Card padded={false} className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={aSearch} onChange={(e) => setASearch(e.target.value)} placeholder="Search attempt code or candidate" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
            </div>
          </Card>
          <Card padded={false}><Table columns={attemptCols} data={attempts} rowKey={(r) => r.id} emptyMessage="No attempts" /></Card>
          {aTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(aPage - 1) * 20 + 1}-{Math.min(aPage * 20, aTotal)} of {aTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={aPage <= 1} onClick={() => setAPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {aPage} of {aTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={aPage >= aTotalPages} onClick={() => setAPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}