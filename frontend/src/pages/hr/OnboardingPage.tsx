import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, UserPlus, Plus, X } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import PageHeader from '../../components/ui/PageHeader';
import Toolbar from '../../components/ui/Toolbar';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { useDebounce } from '../../hooks/useDebounce';
import { onboardingService, OnboardingListItem } from '../../services/onboardingService';

const STAGE_LABEL: Record<string, string> = {
  OFFER_ACCEPTED: 'Offer Accepted',
  PERSONAL_DETAILS: 'Personal Details',
  DOCUMENTS: 'Documents',
  DEPT_ASSIGNMENT: 'Department',
  MANAGER_ASSIGNMENT: 'Manager',
  ACCOUNT_SETUP: 'Account Setup',
  ASSET_ASSIGNMENT: 'Assets',
  POLICY_ACK: 'Policy Ack',
  ORIENTATION: 'Orientation',
  COMPLETE: 'Complete',
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { push } = useNotifications();

  const statusFromUrl = params.get('status') || '';
  const searchFromUrl = params.get('q') || '';

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);
  const status = statusFromUrl;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<OnboardingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats fetched from all records regardless of pagination
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, avgProgress: 0 });

  const [showStart, setShowStart] = useState(false);
  const [startCode, setStartCode] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    onboardingService.list({ page, pageSize, status: status || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load onboarding'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, status]);

  // Fetch full stats independently of pagination
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [all, inProg, comp] = await Promise.all([
          onboardingService.list({ page: 1, pageSize: 1 }),
          onboardingService.list({ page: 1, pageSize: 1, status: 'IN_PROGRESS' }),
          onboardingService.list({ page: 1, pageSize: 1, status: 'COMPLETED' }),
        ]);
        if (cancelled) return;
        setStats({
          total: all.total,
          inProgress: inProg.total,
          completed: comp.total,
          avgProgress: 0,
        });
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setPage(1); }, [status, pageSize]);

  // URL sync for search
  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const setStatus = (next: string) => {
    const np = new URLSearchParams(params);
    if (next) np.set('status', next); else np.delete('status');
    setParams(np, { replace: true });
  };

  const clearFilters = () => setParams(new URLSearchParams(), { replace: true });

  const filtered = debounced
    ? data.filter((d) =>
        d.employeeName.toLowerCase().includes(debounced.toLowerCase()) ||
        d.employeeCode.toLowerCase().includes(debounced.toLowerCase()))
    : data;

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'ON_HOLD', label: 'On Hold' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const handleStart = async () => {
    if (!startCode.trim()) { push({ variant: 'error', title: 'Employee code required' }); return; }
    setStarting(true);
    try {
      const r = await onboardingService.start(startCode.trim());
      push({ variant: 'success', title: 'Onboarding started', body: 'Employee ' + startCode.trim() });
      setShowStart(false);
      setStartCode('');
      if (r?.id) navigate('/onboarding/' + r.id);
      else window.location.reload();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed to start onboarding', body: e?.message || 'Unknown error' });
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <PageHeader
          title="Employee Onboarding"
          subtitle="Track new hires through the 10-stage onboarding workflow"
        />
        <Button onClick={() => setShowStart(true)}>
          <Plus size={14} /> Start onboarding
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Total Records"
          value={stats.total}
          hint="Onboarding in-flight"
          icon={<UserPlus size={18} />}
          accent="brand"
          onClick={clearFilters}
        />
        <Kpi
          label="In Progress"
          value={stats.inProgress}
          hint="Active"
          accent="amber"
          onClick={() => setStatus('IN_PROGRESS')}
        />
        <Kpi
          label="Completed"
          value={stats.completed}
          hint="Onboarded"
          accent="emerald"
          onClick={() => setStatus('COMPLETED')}
        />
        <Kpi
          label="Avg Progress"
          value={stats.avgProgress}
          format={(n) => Math.round(n) + '%'}
          hint="Across all records"
          accent="violet"
        />
      </div>

      <Tabs
        tabs={statusTabs}
        active={status === '' ? 'all' : status}
        onChange={(k) => setStatus(k === 'all' ? '' : k)}
      />

      <Toolbar>
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or code"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      </Toolbar>

      {error ? (
        <ErrorState message={error} onRetry={() => setPage((p) => p)} />
      ) : loading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No onboarding records" description="Once you start onboarding for an employee, records appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Link key={r.id} to={'/onboarding/' + r.id} className="group block">
              <Card interactive className="h-full">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate group-hover:text-brand-500 transition-colors">{r.employeeName}</div>
                    <div className="text-[11px] font-mono text-slate-500">{r.employeeCode}</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  {r.departmentName} &middot; {r.locationCity}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Joined {new Date(r.joiningDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">Current stage</span>
                    <Badge tone="brand">{STAGE_LABEL[r.currentStage] || r.currentStage}</Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-500">{r.completedTasks} / {r.totalTasks} tasks</span>
                      <span className="font-medium">{r.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div className={'h-full ' + (r.progress >= 100 ? 'bg-emerald-500' : r.progress >= 60 ? 'bg-brand-500' : 'bg-amber-500')} style={{ width: r.progress + '%' }} />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500 px-1">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}

      {/* Start onboarding modal */}
      {showStart && (
        <div className="fixed inset-0 z-40 bg-black/40 grid place-items-center p-4" onClick={() => setShowStart(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Start onboarding</div>
              <button onClick={() => setShowStart(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="text-xs text-slate-500 mb-3">
              Enter an existing employee code (for example, an employee who has been created but has not yet been onboarded).
              This creates a new onboarding record and starts the 10-stage workflow.
            </div>
            <input
              value={startCode}
              onChange={(e) => setStartCode(e.target.value)}
              placeholder="e.g. FITS-0512"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowStart(false)}>Cancel</Button>
              <Button onClick={handleStart} loading={starting}>Start onboarding</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
