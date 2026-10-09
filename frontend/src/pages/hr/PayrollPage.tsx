import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { payrollService, PayrollRow, PayrollSummary, PayrollTrendPoint, PayrollDepartmentRow } from '../../services/payrollService';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function PayrollPage() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 350);
  const [year, setYear] = useState<number>(2024);
  const [month, setMonth] = useState<number>(0);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [trend, setTrend] = useState<PayrollTrendPoint[]>([]);
  const [byDept, setByDept] = useState<PayrollDepartmentRow[]>([]);

  useEffect(() => {
    payrollService.summary().then(setSummary).catch(() => {});
    payrollService.trend(12).then(setTrend).catch(() => {});
    payrollService.byDepartment(month || 12, year).then(setByDept).catch(() => {});
  }, [month, year]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    payrollService
      .list({
        page,
        pageSize,
        year,
        month: month || undefined,
        status: status || undefined,
        search: debounced || undefined,
      })
      .then((r) => {
        if (cancelled) return;
        setRows(r.items);
        setTotal(r.total);
        setTotalPages(r.totalPages);
      })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load payroll'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, year, month, status, debounced]);

  useEffect(() => { setPage(1); }, [debounced, year, month, status, pageSize]);

  const columns: Column<PayrollRow>[] = [
    { key: 'code', header: 'Payroll ID', render: (r) => <span className="font-mono text-[11px]">{r.payrollCode}</span> },
    { key: 'emp', header: 'Employee', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.employeeName}</div>
        <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
      </div>
    ) },
    { key: 'period', header: 'Period', render: (r) => <span className="text-xs">{MONTHS[r.month - 1]} {r.year}</span> },
    { key: 'dept', header: 'Department', render: (r) => <span className="text-xs">{r.departmentName}</span> },
    { key: 'loc', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity}</span> },
    { key: 'gross', header: 'Gross', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.grossSalary)}</span> },
    { key: 'tax', header: 'Tax', className: 'text-right', render: (r) => <span className="text-xs text-rose-500">-{formatINR(r.tax)}</span> },
    { key: 'net', header: 'Net', className: 'text-right', render: (r) => <span className="text-xs font-medium">{formatINR(r.netSalary)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          24 months of payroll history &middot; 12,000 records live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Net Paid YTD" value={formatINR(summary.totalNetPaidYtd)} hint={summary.paidRows.toLocaleString('en-IN') + ' paid records'} />
          <StatCard label="Gross Paid YTD" value={formatINR(summary.totalGrossPaidYtd)} hint={formatINR(summary.totalTaxYtd) + ' tax'} />
          <StatCard label="Latest Period" value={summary.latestPayrollPeriod || '\u2014'} hint={summary.activeEmployeeCount + ' active employees'} />
          <StatCard label="Total Rows" value={summary.totalRows.toLocaleString('en-IN')} hint={summary.pendingRows + ' pending \u00B7 ' + summary.failedRows + ' failed'} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Payroll Trend" subtitle="Gross and net per month, last 12 months" />
          {trend.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatINR(v)} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="gross" name="Gross" fill="#3358ff" radius={[4,4,0,0]} />
                  <Bar dataKey="net" name="Net" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle={MONTHS[(month || 12) - 1] + ' ' + year} />
          {byDept.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {byDept.slice(0, 15).map((d) => (
                <div key={d.departmentCode} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                  <span className="text-xs font-medium">{formatINR(d.totalNet)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card padded={false} className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by employee name or payroll ID"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value={0}>All months</option>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
        </div>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={() => setPage((p) => p)} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : (
        <Card padded={false}>
          <Table columns={columns} data={rows} rowKey={(r) => r.id} emptyMessage="No payroll records match your filters" />
        </Card>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total.toLocaleString('en-IN')}</div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs">
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
            <span className="text-xs text-slate-500 px-1">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
          </div>
        </div>
      )}
    </div>
  );
}