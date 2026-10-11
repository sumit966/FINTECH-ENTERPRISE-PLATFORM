import { useEffect, useMemo, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X, Wallet, TrendingUp, AlertCircle, Calendar, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { ComposedChart, Line } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Toolbar from '../../components/ui/Toolbar';
import Tabs from '../../components/ui/Tabs';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import EmployeePayrollModal from '../../components/hr/EmployeePayrollModal';
import { useDebounce } from '../../hooks/useDebounce';
import { payrollService, PayrollRow, PayrollSummary, PayrollTrendPoint, PayrollDepartmentRow } from '../../services/payrollService';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type SortField = 'period' | 'employee' | 'netSalary' | 'grossSalary' | 'paymentDate';
type SortDir = 'asc' | 'desc';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

function sortRows(rows: PayrollRow[], field: SortField, dir: SortDir): PayrollRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'period': {
        if (a.year !== b.year) cmp = a.year - b.year;
        else cmp = a.month - b.month;
        break;
      }
      case 'employee':
        cmp = a.employeeName.localeCompare(b.employeeName);
        break;
      case 'netSalary':
        cmp = a.netSalary - b.netSalary;
        break;
      case 'grossSalary':
        cmp = a.grossSalary - b.grossSalary;
        break;
      case 'paymentDate': {
        const ta = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const tb = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        cmp = ta - tb;
        break;
      }
    }
    if (dir === 'desc') cmp = -cmp;
    if (cmp === 0) cmp = a.employeeCode.localeCompare(b.employeeCode);
    return cmp;
  });
  return sorted;
}

export default function PayrollPage() {
  const [params, setParams] = useSearchParams();

  const searchFromUrl = params.get('q') || '';
  const yearFromUrl = params.get('year') ? Number(params.get('year')) : 2026;
  const monthFromUrl = params.get('month') ? Number(params.get('month')) : 0;
  const statusFromUrl = params.get('status') || '';
  const sortFieldFromUrl = (params.get('sort') as SortField) || 'period';
  const sortDirFromUrl = (params.get('dir') as SortDir) || 'desc';
  const pageFromUrl = params.get('page') ? Number(params.get('page')) : 1;

  const [search, setSearch] = useState(searchFromUrl);
  const debounced = useDebounce(search, 350);
  const [year, setYear] = useState<number>(yearFromUrl);
  const [month, setMonth] = useState<number>(monthFromUrl);
  const [status, setStatus] = useState(statusFromUrl);
  const [sortField, setSortField] = useState<SortField>(sortFieldFromUrl);
  const [sortDir, setSortDir] = useState<SortDir>(sortDirFromUrl);
  const [page, setPage] = useState(pageFromUrl);
  const [pageSize, setPageSize] = useState(20);

  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [trend, setTrend] = useState<PayrollTrendPoint[]>([]);
  const [byDept, setByDept] = useState<PayrollDepartmentRow[]>([]);

  const [drillEmployee, setDrillEmployee] = useState<{ code: string; name: string } | null>(null);

  // keep local state in sync with URL when it changes externally
  useEffect(() => { setYear(yearFromUrl); }, [yearFromUrl]);
  useEffect(() => { setMonth(monthFromUrl); }, [monthFromUrl]);
  useEffect(() => { setStatus(statusFromUrl); }, [statusFromUrl]);
  useEffect(() => { setSortField(sortFieldFromUrl); }, [sortFieldFromUrl]);
  useEffect(() => { setSortDir(sortDirFromUrl); }, [sortDirFromUrl]);
  useEffect(() => { setPage(pageFromUrl); }, [pageFromUrl]);

  const setUrl = (patch: Record<string, string | number | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || (typeof v === 'number' && v === 0)) np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

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
      .list({ page, pageSize, year, month: month || undefined, status: status || undefined, search: debounced || undefined })
      .then((r) => { if (cancelled) return; setRows(r.items); setTotal(r.total); setTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load payroll'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, year, month, status, debounced]);

  // URL sync for search + page reset on filter change
  useEffect(() => {
    const np = new URLSearchParams(params);
    if (debounced && debounced !== (np.get('q') || '')) { np.set('q', debounced); np.delete('page'); setParams(np, { replace: true }); }
    else if (!debounced && np.has('q')) { np.delete('q'); np.delete('page'); setParams(np, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => { setUrl({ page: null }); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [year, month, status, pageSize]);

  const sortedRows = useMemo(() => sortRows(rows, sortField, sortDir), [rows, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    const nextDir: SortDir = sortField === field
      ? (sortDir === 'desc' ? 'asc' : 'desc')
      : (field === 'employee' ? 'asc' : 'desc');
    setSortField(field);
    setSortDir(nextDir);
    setUrl({ sort: field, dir: nextDir, page: null });
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowDownAZ size={12} className="opacity-30" />;
    return sortDir === 'desc' ? <ArrowDownAZ size={12} className="text-brand-500" /> : <ArrowUpAZ size={12} className="text-brand-500" />;
  };

  const resetLatestFirst = () => {
    setSortField('period'); setSortDir('desc');
    setUrl({ sort: 'period', dir: 'desc', page: null });
  };

  const clearFilters = () => {
    setSearch('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const activeFilterCount = [debounced, status, month || null].filter(Boolean).length;

  const columns: Column<PayrollRow>[] = [
    { key: 'period',
      header: (<button onClick={() => handleSort('period')} className="inline-flex items-center gap-1 hover:text-brand-500">Period {sortIcon('period')}</button>) as any,
      render: (r) => <span className="text-xs font-medium">{MONTHS[r.month - 1]} {r.year}</span> },
    { key: 'employeeName',
      header: (<button onClick={() => handleSort('employee')} className="inline-flex items-center gap-1 hover:text-brand-500">Employee {sortIcon('employee')}</button>) as any,
      render: (r) => (
        <button onClick={() => setDrillEmployee({ code: r.employeeCode, name: r.employeeName })} className="text-left hover:text-brand-500 transition-colors">
          <div className="font-medium text-sm">{r.employeeName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{r.employeeCode}</div>
        </button>
      ) },
    { key: 'departmentName', header: 'Department', render: (r) => <span className="text-xs">{r.departmentName}</span> },
    { key: 'locationCity', header: 'Location', render: (r) => <span className="text-xs">{r.locationCity}</span> },
    { key: 'grossSalary',
      header: (<button onClick={() => handleSort('grossSalary')} className="inline-flex items-center gap-1 hover:text-brand-500">Gross {sortIcon('grossSalary')}</button>) as any,
      className: 'text-right',
      render: (r) => <span className="text-xs">{formatINR(r.grossSalary)}</span> },
    { key: 'tax', header: 'Tax', className: 'text-right', render: (r) => <span className="text-xs text-rose-500">-{formatINR(r.tax)}</span> },
    { key: 'netSalary',
      header: (<button onClick={() => handleSort('netSalary')} className="inline-flex items-center gap-1 hover:text-brand-500">Net {sortIcon('netSalary')}</button>) as any,
      className: 'text-right',
      render: (r) => <span className="text-xs font-medium">{formatINR(r.netSalary)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'PAID', label: 'Paid' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'FAILED', label: 'Failed' },
  ];

  return (
    <div className="space-y-5">
      
      <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium mb-2">Financial operations</div>
      <PageHeader
        title="Payroll"
        subtitle={summary?.periodLabel
          ? '24 months of payroll ' + summary.periodLabel + ' \u00B7 newest period shown first \u00B7 founder excluded from totals'
          : '24 months of payroll records \u2014 newest period shown first'}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={resetLatestFirst}>
              <Calendar size={14} /> Latest First
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={14} /> Clear filters
              </Button>
            )}
          </>
        }
      />

      <Card className="mb-4 border-slate-400/30 bg-slate-500/5">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <strong>Synthetic demonstration data.</strong> These figures reflect a synthetic 500-employee dataset spanning
          Oct 2024 to the latest recorded period. They do not represent the intended financial scale of a real
          operating business and are not suitable for planning, investment, or compliance purposes. See the master data
          note in the platform documentation for details.
        </div>
      </Card>

            <div className="flex justify-end mb-2"><ExportButton rows={sortedRows} filename={'export-' + new Date().toISOString().slice(0,10)} /></div>
{summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="Net Paid (lifetime)"
            value={summary.totalNetPaidLifetime ?? summary.totalNetPaidYtd}
            format={(n) => formatINR(n)}
            hint={summary.paidRows.toLocaleString('en-IN') + ' paid records \u00B7 founder excluded'}
            icon={<Wallet size={18} />}
            accent="brand"
            onClick={clearFilters}
          />
          <Kpi
            label="Gross Paid (lifetime)"
            value={summary.totalGrossPaidLifetime ?? summary.totalGrossPaidYtd}
            format={(n) => formatINR(n)}
            hint={(summary.totalTaxLifetime ?? summary.totalTaxYtd ? formatINR(summary.totalTaxLifetime ?? summary.totalTaxYtd) : '') + ' tax'}
            icon={<TrendingUp size={18} />}
            accent="emerald"
            onClick={clearFilters}
          />
          <Kpi
            label="Total Rows"
            value={summary.totalRows}
            hint={'Latest: ' + (summary.latestPayrollPeriod || '\u2014') + ' \u00B7 Earliest: ' + (summary.earliestPayrollPeriod || '\u2014')}
            icon={<Calendar size={18} />}
            accent="violet"
            onClick={clearFilters}
          />
          <Kpi
            label="Pending / Failed"
            value={summary.pendingRows + summary.failedRows}
            hint={summary.pendingRows + ' pending \u00B7 ' + summary.failedRows + ' failed'}
            icon={<AlertCircle size={18} />}
            accent={summary.failedRows > 0 ? 'rose' : 'amber'}
            onClick={() => setUrl({ status: 'PENDING', page: null })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Payroll Trend" subtitle="Gross and net per month \u00B7 click a bar to filter" />
          {trend.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <ComposedChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatINR(v)} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar
                    dataKey="gross" name="Gross" fill="#3358ff" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(d: any) => {
                      const pt = d?.payload;
                      if (pt?.year && pt?.month) setUrl({ year: pt.year, month: pt.month, page: null });
                    }}
                  />
                  <Bar
                    dataKey="net" name="Net" fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer"
                    onClick={(d: any) => {
                      const pt = d?.payload;
                      if (pt?.year && pt?.month) setUrl({ year: pt.year, month: pt.month, page: null });
                    }}
                  />
                <Line type="monotone" dataKey="net" name="Net" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="By Department" subtitle={MONTHS[(month || 12) - 1] + ' ' + year + ' \u00B7 click to filter'} />
          {byDept.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {byDept.slice(0, 15).map((d) => (
                <button
                  key={d.departmentCode}
                  onClick={() => setUrl({ departmentCode: d.departmentCode, page: null })}
                  className="w-full flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <span className="font-mono text-xs text-slate-500">{d.departmentCode}</span>
                  <span className="text-xs font-medium">{formatINR(d.totalNet)}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Tabs
        tabs={statusTabs}
        active={status === '' ? 'all' : status}
        onChange={(k) => setUrl({ status: k === 'all' ? null : k, page: null })}
      />

      <Toolbar>
        <div className="md:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee name or payroll ID"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="md:col-span-2">
          <select value={year} onChange={(e) => setUrl({ year: Number(e.target.value), page: null })} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <select value={month} onChange={(e) => setUrl({ month: Number(e.target.value), page: null })} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
            <option value={0}>All months</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <button
            onClick={resetLatestFirst}
            className={'w-full rounded-md border px-3 py-2 text-sm transition ' +
              (sortField === 'period' && sortDir === 'desc'
                ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 font-medium'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
          >
            Latest first {sortField === 'period' && sortDir === 'desc' ? '\u2713' : ''}
          </button>
        </div>
        <div className="md:col-span-2">
          <Badge tone="neutral">{sortedRows.length} on page</Badge>
        </div>
      </Toolbar>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500">Active:</span>
          {year !== 2026 && <Badge tone="brand">Year: {year}</Badge>}
          {month !== 0 && <Badge tone="brand">Month: {MONTHS[month - 1]}</Badge>}
          {status && <Badge tone="brand">Status: {status}</Badge>}
          {debounced && <Badge tone="brand">Search: &quot;{debounced}&quot;</Badge>}
          {sortField !== 'period' && <Badge tone="brand">Sorted by {sortField} ({sortDir})</Badge>}
          {(sortField === 'period' && sortDir === 'desc') && <Badge tone="success">Latest first \u2713</Badge>}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={() => setUrl({ page: null })} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : sortedRows.length === 0 ? (
        <EmptyState
          title="No payroll records match your filters"
          description="Try resetting the year, month, or status filters."
          action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
        />
      ) : (
        <Card padded={false}>
          <Table columns={columns} data={sortedRows} rowKey={(r) => r.id} emptyMessage="No payroll records" />
        </Card>
      )}

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}&ndash;{Math.min(page * pageSize, total)} of {total.toLocaleString('en-IN')}
            <span className="ml-2 text-slate-400">
              \u00B7 {sortField === 'period' && sortDir === 'desc' ? 'Latest first' : 'Sorted by ' + sortField + ' (' + sortDir + ')'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs">
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setUrl({ page: page - 1 })}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className="text-xs text-slate-500 px-1">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setUrl({ page: page + 1 })}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <EmployeePayrollModal
        employeeCode={drillEmployee?.code || null}
        employeeName={drillEmployee?.name || null}
        onClose={() => setDrillEmployee(null)}
      />
    </div>
  );
}
