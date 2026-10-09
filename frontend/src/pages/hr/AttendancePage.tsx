import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { attendanceService, AttendanceRow, AttendanceSummary, AttendanceTrendPoint, AttendanceDepartmentRow } from '../../services/attendanceService';

export default function AttendancePage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [trend, setTrend] = useState<AttendanceTrendPoint[]>([]);
  const [byDept, setByDept] = useState<AttendanceDepartmentRow[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attendanceService.summary().then(setSummary).catch(() => {});
    attendanceService.trend(14).then(setTrend).catch(() => {});
    attendanceService.byDepartment().then(setByDept).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    attendanceService.list({ page, pageSize: 20, status: status || undefined })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load attendance'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, status]);

  useEffect(() => { setPage(1); }, [status]);

  const latest = summary?.latestDateBreakdown || [];
  const getLatest = (s: string) => latest.find((x) => x.status === s)?.count || 0;

  const cols: Column<AttendanceRow>[] = [
    { key: 'date', header: 'Date', render: (r) => <span className="text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</span> },
    { key: 'emp', header: 'Employee', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.employeeName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
      </div>
    ) },
    { key: 'dept', header: 'Department', render: (r) => <span className="text-xs">{r.departmentName}</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity}</span> },
    { key: 'in', header: 'Check In', render: (r) => <span className="text-xs">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '\u2014'}</span> },
    { key: 'out', header: 'Check Out', render: (r) => <span className="text-xs">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '\u2014'}</span> },
    { key: 'hrs', header: 'Hours', className: 'text-right', render: (r) => <span className="text-xs">{r.workingHours ?? '\u2014'}</span> },
    { key: 'mode', header: 'Mode', render: (r) => <span className="text-xs">{r.workMode}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          90 days of attendance across 500 employees &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Present (Latest)" value={getLatest('PRESENT')} hint="Latest tracked day" />
          <StatCard label="WFH (Latest)" value={getLatest('WFH')} hint="Work from home" />
          <StatCard label="Late (Latest)" value={getLatest('LATE')} hint="Late arrivals" />
          <StatCard label="Total Records" value={summary.total.toLocaleString('en-IN')} hint={'Latest ' + (summary.latestDate ? new Date(summary.latestDate).toLocaleDateString('en-IN') : '\u2014')} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Attendance Trend" subtitle="Last 14 days" />
          {trend.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" />
                  <Bar dataKey="wfh" name="WFH" stackId="a" fill="#3358ff" />
                  <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle="Total records" />
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {byDept.slice(0, 15).map((d) => (
              <div key={d.departmentCode} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                <span className="text-xs font-medium">{d.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm md:col-span-1">
            <option value="">All statuses</option>
            <option value="PRESENT">Present</option>
            <option value="WFH">WFH</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="HOLIDAY">Holiday</option>
            <option value="OVERTIME">Overtime</option>
          </select>
        </div>
      </Card>

      {error ? <ErrorState message={error} onRetry={() => setPage((p) => p)} /> :
       loading ? <SkeletonTable rows={10} /> :
       <Card padded={false}><Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No records" /></Card>}

      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total.toLocaleString('en-IN')}</div>
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