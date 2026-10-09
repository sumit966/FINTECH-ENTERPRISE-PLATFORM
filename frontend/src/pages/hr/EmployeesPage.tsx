import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import {
  employeeService,
  EmployeeListItem,
  EmployeeStats,
} from '../../services/employeeService';

function formatINR(v: number): string {
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function EmployeesPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [locationCode, setLocationCode] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Load stats once
  useEffect(() => {
    employeeService.stats().then(setStats).catch(() => {});
  }, []);

  // Load employees whenever filters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    employeeService
      .list({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        locationCode: locationCode || undefined,
        departmentCode: departmentCode || undefined,
        status: status || undefined,
      })
      .then((res) => {
        if (cancelled) return;
        setData(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load employees');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, pageSize, debouncedSearch, locationCode, departmentCode, status]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, locationCode, departmentCode, status, pageSize]);

  const activeFilters = useMemo(
    () => [locationCode, departmentCode, status].filter(Boolean).length,
    [locationCode, departmentCode, status]
  );

  const clearFilters = () => {
    setLocationCode('');
    setDepartmentCode('');
    setStatus('');
  };

  const columns: Column<EmployeeListItem>[] = [
    {
      key: 'code',
      header: 'Code',
      render: (r) => <span className="font-mono text-xs">{r.employeeCode}</span>,
    },
    {
      key: 'name',
      header: 'Employee',
      render: (r) => (
        <div>
          <div className="font-medium">{r.fullName}</div>
          <div className="text-[11px] text-slate-500">{r.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (r) => (
        <div>
          <div className="text-sm">{r.departmentName}</div>
          <div className="text-[11px] text-slate-500">{r.teamName || '—'}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (r) => <span className="text-sm">{r.locationCity}</span>,
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (r) => <Badge tone="brand">{r.designation}</Badge>,
    },
    {
      key: 'experience',
      header: 'Exp',
      render: (r) => <span className="text-sm">{r.experienceYears}y</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.employmentStatus} />,
    },
    {
      key: 'salary',
      header: 'Net Salary',
      className: 'text-right',
      render: (r) => <span className="text-xs font-medium">{formatINR(r.netSalary)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/employees/' + r.id);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {total > 0 ? total.toLocaleString('en-IN') + ' employees' : 'Loading directory'} &middot; full organisation visible
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowFilters((s) => !s)}>
            <Filter size={14} /> Filters {activeFilters > 0 ? '(' + activeFilters + ')' : ''}
          </Button>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card padded={false} className="p-4">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-xl font-semibold mt-1">{stats.total}</div>
          </Card>
          <Card padded={false} className="p-4">
            <div className="text-xs text-slate-500">Pune</div>
            <div className="text-xl font-semibold mt-1">
              {stats.byLocation.find((l) => l.code === 'PUNE')?.count ?? 0}
            </div>
          </Card>
          <Card padded={false} className="p-4">
            <div className="text-xs text-slate-500">Bangalore</div>
            <div className="text-xl font-semibold mt-1">
              {stats.byLocation.find((l) => l.code === 'BLR')?.count ?? 0}
            </div>
          </Card>
          <Card padded={false} className="p-4">
            <div className="text-xs text-slate-500">Noida</div>
            <div className="text-xl font-semibold mt-1">
              {stats.byLocation.find((l) => l.code === 'NOIDA')?.count ?? 0}
            </div>
          </Card>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && stats && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Location
              </label>
              <select
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All locations</option>
                {stats.byLocation.map((l) => (
                  <option key={l.code} value={l.code}>{l.city} ({l.count})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Department
              </label>
              <select
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All departments</option>
                {stats.byDepartment
                  .filter((d) => d.count > 0)
                  .map((d) => (
                    <option key={d.code} value={d.code}>{d.name} ({d.count})</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {stats.byStatus.map((s) => (
                  <option key={s.status} value={s.status}>{s.status} ({s.count})</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Search bar */}
      <Card padded={false} className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, email, or phone"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
      </Card>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={() => setPage((p) => p)} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : (
        <Card padded={false}>
          <Table
            columns={columns}
            data={data}
            rowKey={(r) => r.id}
            emptyMessage="No employees match your filters"
          />
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className="text-xs text-slate-500 px-1">
              Page {page} of {totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}