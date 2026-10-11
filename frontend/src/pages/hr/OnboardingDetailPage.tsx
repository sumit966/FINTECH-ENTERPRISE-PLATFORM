import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useNotifications } from '../../context/NotificationContext';
import { onboardingService, OnboardingDetail } from '../../services/onboardingService';

export default function OnboardingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { push } = useNotifications();
  const [data, setData] = useState<OnboardingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTask, setBusyTask] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true); setError(null);
    try { setData(await onboardingService.detail(id)); }
    catch (e: any) { setError(e?.message || 'Failed to load'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const completeTask = async (taskId: string, title: string) => {
    setBusyTask(taskId);
    try {
      await onboardingService.completeTask(taskId);
      push({ variant: 'success', title: 'Task completed', body: title });
      load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed', body: e?.message || 'Unknown error' });
    } finally { setBusyTask(null); }
  };

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <ErrorState message="Onboarding record not found" />;

  const totalTasks = data.stages.reduce((s, st) => s + st.tasks.length, 0);
  const completedTasks = data.stages.reduce((s, st) => s + st.tasks.filter((t) => t.isComplete).length, 0);
  const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const stageIdx = data.stages.findIndex((s) => s.key === data.currentStage);

  return (
    <div className="space-y-6">
      <Link to="/onboarding" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to onboarding
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-xs font-mono text-slate-500">{data.employee.employeeCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">{data.employee.fullName}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {data.employee.email} · {data.employee.phone}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={data.status} />
              <Badge tone="brand">{data.stages[stageIdx]?.title || data.currentStage}</Badge>
              <Badge tone="neutral">{data.employee.departmentName} · {data.employee.locationCity}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Progress</div>
            <div className="text-3xl font-semibold mt-1">{progress}%</div>
            <div className="text-[11px] text-slate-500 mt-1">{completedTasks} / {totalTasks} tasks</div>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className={'h-full ' + (progress >= 100 ? 'bg-emerald-500' : progress >= 60 ? 'bg-brand-500' : 'bg-amber-500')} style={{ width: progress + '%' }} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Employee Details" subtitle="Collected during onboarding" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Department</div>
            <div className="font-medium mt-0.5">{data.employee.departmentName}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Team</div>
            <div className="font-medium mt-0.5">{data.employee.teamName || '\u2014'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Reporting Manager</div>
            <div className="font-medium mt-0.5">{data.employee.managerName || '\u2014'}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Location</div>
            <div className="font-medium mt-0.5">{data.employee.locationCity}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Joining Date</div>
            <div className="font-medium mt-0.5">{new Date(data.employee.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Started Onboarding</div>
            <div className="font-medium mt-0.5">{new Date(data.startedAt).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
      </Card>

      {/* Stage tracker */}
      <div className="space-y-3">
        {data.stages.map((stage, idx) => (
          <Card key={stage.key} className={stage.isCurrent ? 'border-brand-500/50 bg-brand-500/5' : ''}>
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {stage.isComplete ? (
                  <div className="h-10 w-10 rounded-full bg-emerald-500/15 grid place-items-center">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                ) : stage.isCurrent ? (
                  <div className="h-10 w-10 rounded-full bg-brand-500/15 grid place-items-center">
                    <Clock size={20} className="text-brand-500" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center">
                    <Circle size={20} className="text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500">Stage {idx + 1} of {data.stages.length}</span>
                  {stage.isCurrent && <Badge tone="brand">Current</Badge>}
                  {stage.isComplete && <Badge tone="success">Done</Badge>}
                </div>
                <div className="font-medium mt-1">{stage.title}</div>

                <div className="mt-3 space-y-2">
                  {stage.tasks.map((t) => (
                    <div key={t.id} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-800 p-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {t.isComplete ? (
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className={'text-sm ' + (t.isComplete ? 'text-slate-500 line-through' : 'font-medium')}>{t.title}</div>
                          {t.description && <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>}
                        </div>
                      </div>
                      {!t.isComplete && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => completeTask(t.id, t.title)}
                          loading={busyTask === t.id}
                        >
                          Mark done
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}