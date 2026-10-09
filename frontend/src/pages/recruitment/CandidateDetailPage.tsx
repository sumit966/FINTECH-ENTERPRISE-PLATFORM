import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { recruitmentService, CandidateDetail } from '../../services/recruitmentService';

function formatINR(v: number | null): string {
  if (v == null) return '\u2014';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(1) + 'L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CandidateDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [c, setC] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setC(await recruitmentService.candidateDetail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load candidate'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonTable rows={4} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!c) return <ErrorState message="Candidate not found" />;

  return (
    <div className="space-y-6">
      <Link to="/recruitment" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to recruitment
      </Link>

      <Card>
        <div className="flex items-start gap-5 flex-wrap">
          <div className="h-20 w-20 rounded-full bg-brand-500 text-white grid place-items-center text-2xl font-semibold">
            {c.fullName.split(' ').map((p) => p[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-mono text-slate-500 mb-1">{c.candidateCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.fullName}</h1>
            <div className="text-sm text-slate-500 mt-1">{c.email} &middot; {c.phone}</div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={c.stage} />
              {c.score != null && <Badge tone="brand">Score {c.score.toFixed(2)}</Badge>}
              <Badge tone="neutral">{c.source}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Applied For" value={c.job.title} hint={c.job.jobCode + ' \u00B7 ' + c.job.level} />
        <StatCard label="Current CTC" value={formatINR(c.currentCtc)} hint={c.currentCompany || '\u2014'} />
        <StatCard label="Expected CTC" value={formatINR(c.expectedCtc)} hint={'Notice ' + (c.noticePeriod ?? '\u2014') + ' days'} />
        <StatCard label="Interviews" value={c.interviews.length} hint={c.examAttempts.length + ' exam attempts'} />
      </div>

      {c.job.requiredSkills.length > 0 && (
        <Card>
          <CardHeader title="Required Skills" subtitle={c.job.requiredSkills.length + ' skills for this role'} />
          <div className="flex flex-wrap gap-2">
            {c.job.requiredSkills.map((s) => <Badge key={s} tone="brand">{s}</Badge>)}
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Interviews" subtitle={c.interviews.length + ' on record'} />
        {c.interviews.length === 0 ? <div className="text-xs text-slate-500">No interviews recorded</div> : (
          <div className="space-y-3">
            {c.interviews.map((i) => (
              <div key={i.id} className="rounded-md border border-slate-200 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">{i.round}</Badge>
                    <span className="text-sm font-medium">{formatDate(i.scheduledAt)}</span>
                    <span className="text-xs text-slate-500">&middot; {i.durationMins} min &middot; {i.mode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={i.status} />
                    {i.score != null && <Badge tone="brand">Score {i.score.toFixed(2)}</Badge>}
                    {i.recommendation && <Badge tone={i.recommendation === 'HIRE' ? 'success' : i.recommendation === 'NO_HIRE' ? 'danger' : 'warn'}>{i.recommendation}</Badge>}
                  </div>
                </div>
                {i.interviewer && (
                  <div className="text-xs text-slate-500 mt-2">
                    Interviewer: <Link to={'/employees/' + i.interviewer.id} className="hover:text-brand-500">{i.interviewer.fullName}</Link> ({i.interviewer.employeeCode})
                  </div>
                )}
                {i.feedback && <div className="text-xs text-slate-500 mt-2 italic">"{i.feedback}"</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Exam Attempts" subtitle={c.examAttempts.length + ' attempts'} />
        {c.examAttempts.length === 0 ? <div className="text-xs text-slate-500">No exams recorded</div> : (
          <div className="space-y-2">
            {c.examAttempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{a.assessmentTitle}</div>
                  <div className="text-xs text-slate-500">{a.assessmentCode} &middot; {a.assessmentCategory} &middot; {formatDate(a.startedAt)}</div>
                </div>
                <div className="text-right">
                  {a.score != null && <div className="text-sm font-medium">{a.score.toFixed(2)}</div>}
                  <StatusBadge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}