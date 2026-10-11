import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { useNotifications } from '../../context/NotificationContext';
import { examBuilderService, AvailableQuestion } from '../../services/examBuilderService';

export default function ExamBuilderPage() {
  const navigate = useNavigate();
  const { push } = useNotifications();

  const [questions, setQuestions] = useState<AvailableQuestion[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [assessmentCode, setAssessmentCode] = useState('ASM-' + Date.now().toString(36).toUpperCase());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMins, setDurationMins] = useState(60);
  const [category, setCategory] = useState<'TECHNICAL' | 'APTITUDE' | 'CODING'>('TECHNICAL');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    examBuilderService.questions()
      .then(setQuestions)
      .catch(() => {})
      .finally(() => setLoadingQ(false));
  }, []);

  const toggleQuestion = (code: string) => {
    setSelected((prev) => prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]);
  };

  const totalPoints = questions.filter((q) => selected.includes(q.questionCode)).reduce((s, q) => s + q.points, 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }
    if (selected.length === 0) { setError('Select at least one question'); return; }

    setSubmitting(true);
    try {
      const created = await examBuilderService.create({
        assessmentCode: assessmentCode.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        durationMins,
        category,
        questionCodes: selected,
      });
      push({ variant: 'success', title: 'Exam created', body: created.assessmentCode + ' — ' + created.title });
      navigate('/exams');
    } catch (err: any) {
      setError(err?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, AvailableQuestion[]>);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Create Exam"
        subtitle="Bundle questions from the bank into a new assessment"
        actions={<Button variant="ghost" size="sm" onClick={() => navigate('/exams')}><X size={14} /> Cancel</Button>}
      />

      <form onSubmit={submit} className="space-y-5">
        <Card>
          <CardHeader title="Exam Details" subtitle="Basic information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Exam Code *" value={assessmentCode} onChange={(e) => setAssessmentCode(e.target.value)} required />
            <Input label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer Screener 2026" required />
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" />
            </div>
            <Input label="Duration (minutes) *" type="number" value={durationMins} onChange={(e) => setDurationMins(Number(e.target.value))} min={5} max={600} required />
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                <option value="TECHNICAL">Technical</option>
                <option value="APTITUDE">Aptitude</option>
                <option value="CODING">Coding</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Select Questions"
            subtitle={selected.length + ' selected · ' + totalPoints + ' total points'}
          />
          {loadingQ ? <SkeletonTable rows={5} /> : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(grouped).sort().map(([cat, list]) => (
                <div key={cat}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">{cat} · {list.length} questions</div>
                  <div className="space-y-1.5">
                    {list.map((q) => {
                      const isSelected = selected.includes(q.questionCode);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => toggleQuestion(q.questionCode)}
                          className={'w-full text-left rounded-md border px-3 py-2 transition ' +
                            (isSelected
                              ? 'border-brand-500 bg-brand-500/5'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              {isSelected ? <CheckCircle2 size={14} className="text-brand-500 mt-0.5 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700 mt-0.5 shrink-0" />}
                              <div className="min-w-0">
                                <div className="text-xs font-mono text-slate-500">{q.questionCode}</div>
                                <div className="text-sm truncate">{q.prompt}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge tone="neutral">{q.difficulty}</Badge>
                              <Badge tone="brand">{q.points}pt</Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {error && (
          <Card className="border-rose-500/30 bg-rose-500/5">
            <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div>{error}</div>
            </div>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/exams')} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="gradient" loading={submitting}>
            <Save size={14} /> Create Exam
          </Button>
        </div>
      </form>
    </div>
  );
}