import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { examService, AssessmentDetail } from '../../services/examService';

export default function AssessmentDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [a, setA] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setA(await examService.assessmentDetail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load assessment'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!a) return <ErrorState message="Assessment not found" />;

  return (
    <div className="space-y-6">
      <Link to="/exams" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to exams
      </Link>

      <Card>
        <div className="text-xs font-mono text-slate-500 mb-1">{a.assessmentCode}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{a.title}</h1>
        {a.description && <p className="text-sm text-slate-500 mt-2">{a.description}</p>}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge tone="brand">{a.category}</Badge>
          <StatusBadge status={a.isActive ? 'ACTIVE' : 'CANCELLED'} />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Duration" value={a.durationMins + ' min'} hint="Total time limit" />
        <StatCard label="Questions" value={a.questions.length} hint={'Worth ' + a.totalPoints + ' points'} />
        <StatCard label="Attempts" value={a.attemptCount} hint="Candidate submissions" />
        <StatCard label="Categories" value={Array.from(new Set(a.questions.map((q) => q.category))).length} hint="Distinct topics" />
      </div>

      <Card>
        <CardHeader title="Questions" subtitle={a.questions.length + ' in this assessment'} />
        <div className="space-y-4">
          {a.questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-slate-500">#{q.order} · {q.questionCode}</span>
                  <Badge tone="brand">{q.category}</Badge>
                  <span className="text-xs text-slate-500">{q.type}</span>
                  <StatusBadge status={q.difficulty} />
                </div>
                <div className="text-xs text-slate-500">{q.points} pts · {q.timeLimitSec}s</div>
              </div>
              <div className="mt-3 text-sm">{q.prompt}</div>
              {q.options.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {q.options.map((opt, i) => {
                    const correct = opt === q.correctAnswer;
                    return (
                      <div key={i} className={'flex items-center gap-2 text-sm ' + (correct ? 'text-emerald-500 font-medium' : 'text-slate-600 dark:text-slate-300')}>
                        <span className="w-5 text-xs">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {correct && <CheckCircle2 size={14} />}
                      </div>
                    );
                  })}
                </div>
              )}
              {q.explanation && (
                <div className="mt-3 rounded-md bg-slate-50 dark:bg-slate-900/60 p-3 text-xs text-slate-500 italic">
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}