import { useEffect, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
import { useAuthContext } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { leaveService, LeaveRow, LeaveDetail, LeaveSummary, LeaveDepartmentRow } from '../../services/leaveService';

const LEAVE_TYPES = ['CASUAL', 'SICK', 'EARNED', 'OPTIONAL_HOLIDAY', 'UNPAID'];
const SUPER_ROLES = new Set(['FOUNDER_CEO', 'DIRECTOR']);

function fmtDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LeavePage() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuthContext();
  const { push } = useNotifications();

  const statusFromUrl = params.get('status') || '';
  const typeFromUrl = params.get('leaveType') || '';
  const deptFromUrl = params.get('department') || '';
  const searchFromUrl = params.get('q') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [byDept, setByDept] = useState<LeaveDepartmentRow[]>([]);
  const [data, setData] = useState<LeaveRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeaveDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const canApprove =
    !!user && (user.roles.some((r: any) => SUPER_ROLES.has(typeof r === 'string' ? r : r.code)) || user.permissions.includes('leave.approve'));

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const clearFilters = () => { setSearch(''); setParams(new URLSearchParams(), { replace: true }); };
  const activeFilterCount = [statusFromUrl, typeFromUrl, deptFromUrl, debounced].filter(Boolean).length;

  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    leaveService.summary().then(setSummary).catch(() => {});
    leaveService.byDepartment().then(setByDept).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    leaveService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      status: statusFromUrl || undefined,
      leaveType: typeFromUrl || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load leave'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, debounced, statusFromUrl, typeFromUrl]);

  // Load detail when drawer opens
  useEffect(() => {
    if (!openId) { setDetail(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    leaveService.detail(openId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [openId]);

  const reloadCurrent = async () => {
    const r = await leaveService.list({
      page: pageFromUrl, pageSize: 20,
      search: debounced || undefined,
      status: statusFromUrl || undefined,
      leaveType: typeFromUrl || undefined,
    });
    setData(r.items); setTotal(r.total); setTotalPages(r.totalPages);
    const s = await leaveService.summary();
    setSummary(s);
    if (openId) {
      const d = await leaveService.detail(openId);
      setDetail(d);
    }
  };

  const doApprove = async () => {
    if (!openId) return;
    setBusy(true);
    try {
      await leaveService.approve(openId);
      push({ variant: 'success', title: 'Leave approved', body: 'Status updated and audit logged.' });
      await reloadCurrent();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed to approve', body: e?.message || 'Unknown error' });
    } finally { setBusy(false); }
  };

  const doReject = async () => {
    if (!openId) return;
    if (rejectReason.trim().length < 3) {
      push({ variant: 'error', title: 'Reason required', body: 'Enter at least 3 characters.' });
      return;
    }
    setBusy(true);
    try {
      await leaveService.reject(openId, rejectReason.trim());
      push({ variant: 'success', title: 'Leave rejected', body: 'Status updated and audit logged.' });
      setShowReject(false);
      setRejectReason('');
      await reloadCurrent();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed to reject', body: e?.message || 'Unknown error' });
    } finally { setBusy(false); }
  };

  const cols: Column<LeaveRow>[] = [
    { key: 'emp', header: 'Employee', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.employeeName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
      </div>
    ) },
    { key: 'dept', header: 'Department', render: (r) => (
      <button
        onClick={(e) => { e.stopPropagation(); setUrl({ department: r.departmentCode, page: null }); }}
        className="text-xs hover:text-brand-500 transition-colors"
      >
        {r.departmentName}
      </button>
    ) },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="brand">{r.leaveType}</Badge> },
    { key: 'from', header: 'From', render: (r) => <span className="text-xs">{fmtDate(r.startDate)}</span> },
    { key: 'to', header: 'To', render: (r) => <span className="text-xs">{fmtDate(r.endDate)}</span> },
    { key: 'days', header: 'Days', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.days}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-slate-500 truncate block max-w-[240px]">{r.reason || '\u2014'}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const pendingCount = summary?.byStatus.find((s) => s.status === 'PENDING')?.count || 0;
  const approvedCount = summary?.byStatus.find((s) => s.status === 'APPROVED')?.count || 0;
  const rejectedCount = summary?.byStatus.find((s) => s.status === 'REJECTED')?.count || 0;

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">People operations</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Leave Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total.toLocaleString('en-IN')} leave requests &middot; click a row to review and decide
          </p>
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={14} /> Clear filters
          </Button>
        )}
      </div>

            <div className="flex justify-end mb-2"><ExportButton rows={data} filename={'export-' + new Date().toISOString().slice(0,10)} /></div>
{summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Requests" value={summary.total} hint={'Approved days ' + summary.totalDaysApproved}
            icon={<Clock size={18} />} accent="brand" onClick={clearFilters} />
          <Kpi label="Approved" value={approvedCount} hint="Historical + current"
            icon={<CheckCircle2 size={18} />} accent="emerald"
            onClick={() => setUrl({ status: 'APPROVED', page: null })} />
          <Kpi label="Pending" value={pendingCount} hint="Awaiting decision"
            icon={<AlertCircle size={18} />} accent="amber"
            onClick={() => setUrl({ status: 'PENDING', page: null })} />
          <Kpi label="Rejected" value={rejectedCount} hint="Not approved"
            icon={<XCircle size={18} />} accent="rose"
            onClick={() => setUrl({ status: 'REJECTED', page: null })} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Leave by Type" subtitle="Click a bar to filter" />
          {!summary ? <SkeletonTable rows={4} /> : (
            <div className="space-y-3">
              {summary.byType.map((t) => {
                const max = Math.max(1, ...summary.byType.map((x) => x.count));
                const pct = (t.count / max) * 100;
                return (
                  <button
                    key={t.leaveType}
                    onClick={() => setUrl({ leaveType: t.leaveType, page: null })}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-brand-500 transition">
                        {t.leaveType.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{t.count}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">{t.days}d</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-violet-500 transition-all duration-500"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle="Total days \u00B7 click to filter" />
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {byDept.slice(0, 15).map((d) => (
              <button key={d.departmentCode}
                onClick={() => setUrl({ department: d.departmentCode, page: null })}
                className="w-full flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                <span className="text-xs font-medium">{d.days}d</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Tabs tabs={statusTabs} active={statusFromUrl || 'all'}
        onChange={(k) => setUrl({ status: k === 'all' ? null : k, page: null })} />

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee or reason"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={statusFromUrl} onChange={(e) => setUrl({ status: e.target.value || null, page: null })}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={typeFromUrl} onChange={(e) => setUrl({ leaveType: e.target.value || null, page: null })}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All types</option>
            {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {statusFromUrl && <Badge tone="brand">Status: {statusFromUrl}</Badge>}
          {typeFromUrl && <Badge tone="brand">Type: {typeFromUrl}</Badge>}
          {deptFromUrl && <Badge tone="brand">Dept: {deptFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => setUrl({ page: null })} />
      ) : loading ? <SkeletonTable rows={10} /> :
       data.length === 0 ? (
        <EmptyState title="No leave records match the filters" description="Try widening the search or clearing filters."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>} />
      ) : (
        <Card padded={false}>
          <Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No leave records"
            onRowClick={(r) => setOpenId(r.id)} />
        </Card>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing {(pageFromUrl - 1) * 20 + 1}&ndash;{Math.min(pageFromUrl * 20, total)} of {total.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={pageFromUrl <= 1} onClick={() => setUrl({ page: pageFromUrl - 1 })}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className="text-xs text-slate-500">Page {pageFromUrl} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={pageFromUrl >= totalPages} onClick={() => setUrl({ page: pageFromUrl + 1 })}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {openId && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => { setOpenId(null); setShowReject(false); }}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="font-medium text-sm">Leave request</div>
              <button onClick={() => { setOpenId(null); setShowReject(false); }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>

            {detailLoading || !detail ? (
              <div className="p-5"><SkeletonTable rows={6} /></div>
            ) : (
              <div className="p-5 space-y-4 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={detail.status} />
                  <Badge tone="brand">{detail.leaveType}</Badge>
                  <Badge tone="neutral">{detail.days} day{detail.days === 1 ? '' : 's'}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Employee</div>
                    <div className="font-medium">{detail.employeeName}</div>
                    <div className="text-xs text-slate-500 font-mono">{detail.employeeCode}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Department</div>
                    <div className="font-medium">{detail.departmentName}</div>
                    <div className="text-xs text-slate-500">{detail.locationCity}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">From</div>
                    <div>{fmtDate(detail.startDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">To</div>
                    <div>{fmtDate(detail.endDate)}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Reporting Manager</div>
                    <div>{detail.manager ? detail.manager.fullName + ' (' + detail.manager.employeeCode + ')' : '\u2014'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Reason</div>
                    <div className="text-slate-700 dark:text-slate-200">{detail.reason || '\u2014'}</div>
                  </div>
                  {detail.status === 'REJECTED' && detail.rejectionReason && (
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase tracking-wider text-rose-500">Rejection reason</div>
                      <div className="text-rose-600 dark:text-rose-400">{detail.rejectionReason}</div>
                    </div>
                  )}
                  {detail.approvedAt && (
                    <div className="col-span-2">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500">Decision at</div>
                      <div>{fmtDate(detail.approvedAt)}</div>
                    </div>
                  )}
                </div>

                {canApprove && detail.status === 'PENDING' && !showReject && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <Button onClick={doApprove} loading={busy}>
                      <CheckCircle2 size={14} /> Approve
                    </Button>
                    <Button variant="secondary" onClick={() => setShowReject(true)} disabled={busy}>
                      <XCircle size={14} /> Reject
                    </Button>
                  </div>
                )}

                {canApprove && detail.status === 'PENDING' && showReject && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs text-slate-500">Rejection reason (required)</div>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this request is being rejected"
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <div className="flex items-center gap-2">
                      <Button onClick={doReject} loading={busy} variant="secondary">
                        Confirm rejection
                      </Button>
                      <Button variant="ghost" onClick={() => { setShowReject(false); setRejectReason(''); }} disabled={busy}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {!canApprove && detail.status === 'PENDING' && (
                  <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-500">
                    You do not have permission to approve or reject leave requests.
                  </div>
                )}

                {detail.audit.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Audit trail</div>
                    <div className="space-y-2">
                      {detail.audit.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 text-xs">
                          <div className="mt-1 h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium">{a.action}</div>
                            <div className="text-slate-500">{fmtDate(a.at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
