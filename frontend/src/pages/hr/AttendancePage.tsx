import { useEffect, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import { attendanceService, AttendanceRow, AttendanceSummary, AttendanceTrendPoint, AttendanceDepartmentRow } from '../../services/attendanceService';
import MyAttendanceCard from '../../components/hr/MyAttendanceCard';

// Company start: October 2024. Earliest date we allow in the range picker.
const COMPANY_START = '2024-10-01';
const STATUSES = ['PRESENT', 'WFH', 'LATE', 'ABSENT', 'HOLIDAY', 'OVERTIME'];
const WORK_MODES = ['OFFICE', 'WFH', 'HYBRID', 'FIELD'];

export default function AttendancePage() {
  const [params, setParams] = useSearchParams();

  const statusFromUrl = params.get('status') || '';
  const modeFromUrl = params.get('mode') || '';
  const fromFromUrl = params.get('from') || '';
  const toFromUrl = params.get('to') || '';
  const empFromUrl = params.get('employee') || '';
  const deptFromUrl = params.get('department') || '';
  const searchFromUrl = params.get('q') || '';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [trend, setTrend] = useState<AttendanceTrendPoint[]>([]);
  const [byDept, setByDept] = useState<AttendanceDepartmentRow[]>([]);
  const [data, setData] = useState<AttendanceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const clearFilters = () => {
    setSearch('');
    setParams(new URLSearchParams(), { replace: true });
  };

  // Sync debounced search into URL
  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    attendanceService.summary().then(setSummary).catch(() => {});
    attendanceService.trend(14).then(setTrend).catch(() => {});
    attendanceService.byDepartment().then(setByDept).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    attendanceService.list({
      page: pageFromUrl,
      pageSize: 20,
      status: statusFromUrl || undefined,
      workMode: modeFromUrl || undefined,
      employeeCode: empFromUrl || undefined,
      dateFrom: fromFromUrl || undefined,
      dateTo: toFromUrl || undefined,
      search: debounced || undefined,
    })
      .then((r) => { if (cancelled) return; setData(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load attendance'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [pageFromUrl, statusFromUrl, modeFromUrl, empFromUrl, fromFromUrl, toFromUrl, debounced]);

  const latest = summary?.latestDateBreakdown || [];
  const getLatest = (s: string) => latest.find((x) => x.status === s)?.count || 0;
  const activeFilterCount = [statusFromUrl, modeFromUrl, fromFromUrl, toFromUrl, empFromUrl, deptFromUrl, debounced].filter(Boolean).length;

  const cols: Column<AttendanceRow>[] = [
    { key: 'date', header: 'Date', render: (r) => <span className="text-xs">{new Date(r.date).toLocaleDateString('en-IN')}</span> },
    { key: 'emp', header: 'Employee', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.employeeName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
      </div>
    ) },
    { key: 'dept', header: 'Department', render: (r) => (
      <button
        onClick={() => setUrl({ department: r.departmentCode, page: null })}
        className="text-xs hover:text-brand-500 transition-colors"
      >
        {r.departmentName}
      </button>
    ) },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity}</span> },
    { key: 'in', header: 'Check In', render: (r) => <span className="text-xs">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '\u2014'}</span> },
    { key: 'out', header: 'Check Out', render: (r) => <span className="text-xs">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '\u2014'}</span> },
    { key: 'hrs', header: 'Hours', className: 'text-right', render: (r) => <span className="text-xs">{r.workingHours ?? '\u2014'}</span> },
    { key: 'mode', header: 'Mode', render: (r) => <span className="text-xs">{r.workMode}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const subtitle = summary?.latestDate && summary.total > 0
    ? summary.total.toLocaleString('en-IN') + ' records \u00B7 earliest logged ' + COMPANY_START + ' \u00B7 latest ' + new Date(summary.latestDate).toLocaleDateString('en-IN') + ' \u00B7 newest first'
    : 'Attendance records \u00B7 newest first';

  return (
    <div className="space-y-6">
      <MyAttendanceCard />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">Time & attendance</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
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
          <Kpi
            label="Present (Latest)"
            value={getLatest('PRESENT')}
            hint="Latest tracked day"
            accent="emerald"
            onClick={() => setUrl({ status: 'PRESENT', page: null })}
          />
          <Kpi
            label="WFH (Latest)"
            value={getLatest('WFH')}
            hint="Work from home"
            accent="brand"
            onClick={() => setUrl({ status: 'WFH', page: null })}
          />
          <Kpi
            label="Late (Latest)"
            value={getLatest('LATE')}
            hint="Late arrivals"
            accent="amber"
            onClick={() => setUrl({ status: 'LATE', page: null })}
          />
          <Kpi
            label="Total Records"
            value={summary.total}
            hint={'Latest ' + (summary.latestDate ? new Date(summary.latestDate).toLocaleDateString('en-IN') : '\u2014')}
            accent="violet"
            onClick={clearFilters}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Attendance Trend" subtitle="Last 14 days \u00B7 click a bar to filter by date" />
          {trend.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill="#10b981" cursor="pointer" onClick={(d: any) => { const dt = d?.payload?.date; if (dt) setUrl({ from: dt, to: dt, page: null }); }} />
                  <Bar dataKey="wfh" name="WFH" stackId="a" fill="#3358ff" cursor="pointer" onClick={(d: any) => { const dt = d?.payload?.date; if (dt) setUrl({ from: dt, to: dt, mode: 'WFH', page: null }); }} />
                  <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" cursor="pointer" onClick={(d: any) => { const dt = d?.payload?.date; if (dt) setUrl({ from: dt, to: dt, status: 'LATE', page: null }); }} />
                  <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" cursor="pointer" onClick={(d: any) => { const dt = d?.payload?.date; if (dt) setUrl({ from: dt, to: dt, status: 'ABSENT', page: null }); }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle="Total records \u00B7 click to filter" />
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {byDept.slice(0, 15).map((d) => (
              <button
                key={d.departmentCode}
                onClick={() => setUrl({ department: d.departmentCode, page: null })}
                className="w-full flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
              >
                <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                <span className="text-xs font-medium">{d.total.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Filters row */}
      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or code"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <select
            value={statusFromUrl}
            onChange={(e) => setUrl({ status: e.target.value || null, page: null })}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select
            value={modeFromUrl}
            onChange={(e) => setUrl({ mode: e.target.value || null, page: null })}
            className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm"
          >
            <option value="">All modes</option>
            {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              min={COMPANY_START}
              value={fromFromUrl}
              onChange={(e) => setUrl({ from: e.target.value || null, page: null })}
              className="w-full pl-7 pr-2 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              title="From date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              min={COMPANY_START}
              value={toFromUrl}
              onChange={(e) => setUrl({ to: e.target.value || null, page: null })}
              className="w-full pl-7 pr-2 py-2 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              title="To date"
            />
          </div>
        </div>
      </Card>

      {/* Active chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {statusFromUrl && <Badge tone="brand">Status: {statusFromUrl}</Badge>}
          {modeFromUrl && <Badge tone="brand">Mode: {modeFromUrl}</Badge>}
          {fromFromUrl && <Badge tone="brand">From: {fromFromUrl}</Badge>}
          {toFromUrl && <Badge tone="brand">To: {toFromUrl}</Badge>}
          {empFromUrl && <Badge tone="brand">Employee: {empFromUrl}</Badge>}
          {deptFromUrl && <Badge tone="brand">Dept: {deptFromUrl}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => setUrl({ page: null })} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No attendance records match your filters"
          description="Try widening the date range or clearing filters."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      ) : (
        <Card padded={false}>
          <Table columns={cols} data={data} rowKey={(r) => r.id} emptyMessage="No records" />
        </Card>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Showing {(pageFromUrl - 1) * 20 + 1}&ndash;{Math.min(pageFromUrl * 20, total)} of {total.toLocaleString('en-IN')} \u00B7 newest first
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
    </div>
  );
}
