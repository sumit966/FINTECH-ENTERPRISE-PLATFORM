import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { leaveService, LeaveRow, LeaveSummary, LeaveDepartmentRow } from '../../services/leaveService';

export default function LeavePage() {
  const [summary, setSummary] = useState<LeaveSummary | null>(null);
  const [byDept, setByDept] = useState<LeaveDepartmentRow[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LeaveRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDeb = useDebounce(search, 350);

  useEffect(() => {
    leaveService.summary().then(setSummary).catch(() => {});
    leaveService.byDepartment().then(setByDept).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    leaveService.list({ page, pageSize: 20, search: searchDeb || undefined, status: status || undefined, leaveType: leaveType || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load leave'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, searchDeb, status, leaveType]);

  useEffect(() => { setPage(1); }, [searchDeb, status, leaveType]);

  const cols: Column<LeaveRow>[] = [
    { key: 'emp', header: 'Employee', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.employeeName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
      </div>
    ) },
    { key: 'dept', header: 'Department', render: (r) => <span className="text-xs">{r.departmentName}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone="brand">{r.leaveType}</Badge> },
    { key: 'from', header: 'From', render: (r) => <span className="text-xs">{new Date(r.startDate).toLocaleDateString('en-IN')}</span> },
    { key: 'to', header: 'To', render: (r) => <span className="text-xs">{new Date(r.endDate).toLocaleDateString('en-IN')}</span> },
    { key: 'days', header: 'Days', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.days}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-slate-500">{r.reason || '\u2014'}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leave Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Leave requests and balances &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Requests" value={summary.total} hint={'Approved days ' + summary.totalDaysApproved} />
          <StatCard label="Approved" value={summary.byStatus.find((s) => s.status === 'APPROVED')?.count || 0} hint="Historical + current" />
          <StatCard label="Pending" value={summary.byStatus.find((s) => s.status === 'PENDING')?.count || 0} hint="Awaiting manager" />
          <StatCard label="Rejected" value={summary.byStatus.find((s) => s.status === 'REJECTED')?.count || 0} hint="Not approved" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Leave by Type" subtitle="Request counts and days" />
          {!summary ? <SkeletonTable rows={4} /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={summary.byType}>
                  <XAxis dataKey="leaveType" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" name="Requests" fill="#3358ff" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle="Total days taken" />
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {byDept.slice(0, 15).map((d) => (
              <div key={d.departmentCode} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                <span className="text-xs font-medium">{d.days}d</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee or reason" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value="">All types</option>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="EARNED">Earned</option>
            <option value="OPTIONAL_HOLIDAY">Optional holiday</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No leave records" /></Card>}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}