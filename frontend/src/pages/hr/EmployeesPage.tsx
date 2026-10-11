import { useEffect, useMemo, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, X, ChevronLeft, ChevronRight, UserPlus, LayoutGrid, List,
  ArrowUpDown, ArrowUp, ArrowDown, RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Toolbar from '../../components/ui/Toolbar';
import SortMenu, { SortOption } from '../../components/ui/SortMenu';
import DateRangeFilter from '../../components/ui/DateRangeFilter';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import EmployeeCard from '../../components/hr/EmployeeCard';
import AddEmployeeModal from '../../components/hr/AddEmployeeModal';
import { useDebounce } from '../../hooks/useDebounce';
import { employeeService, EmployeeListItem, EmployeeStats } from '../../services/employeeService';

type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

const SORT_OPTIONS: SortOption[] = [
  { value: 'employeeCode',     label: 'Employee ID' },
  { value: 'fullName',         label: 'Name' },
  { value: 'joiningDate',      label: 'Joining Date' },
  { value: 'basicSalary',      label: 'Basic Salary' },
  { value: 'performanceScore', label: 'Performance' },
];

const VIEW_KEY = 'nexus.employees.view';

function formatINR(v: number): string {
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function EmployeesPage() {
  const navigate = useNavigate();

  // Search + filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [locationCode, setLocationCode] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [status, setStatus] = useState('');
  const [joinFrom, setJoinFrom] = useState('');
  const [joinTo, setJoinTo] = useState('');

  // Sort
  const [sortBy, setSortBy] = useState('employeeCode');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // View
  const [view, setView] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(VIEW_KEY) as ViewMode | null;
      return stored === 'cards' || stored === 'table' ? stored : 'table';
    } catch { return 'table'; }
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Data
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Persist view preference
  useEffect(() => {
    try { localStorage.setItem(VIEW_KEY, view); } catch { /* ignore */ }
  }, [view]);

  // Load stats once
  useEffect(() => {
    employeeService.stats().then(setStats).catch(() => {});
  }, []);

  // Load employees — refetches on any filter/sort/page change
  const load = () => {
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
        sortBy,
        sortDir,
      })
      .then((res) => {
        if (cancelled) return;
        // Apply client-side joining-date filter (backend doesn't support it yet)
        let items = res.items;
        if (joinFrom) {
          const from = new Date(joinFrom).getTime();
          items = items.filter((e) => new Date(e.joiningDate).getTime() >= from);
        }
        if (joinTo) {
          const to = new Date(joinTo).getTime() + 86400000 - 1;
          items = items.filter((e) => new Date(e.joiningDate).getTime() <= to);
        }
        setData(items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Failed to load employees');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  };

  useEffect(load, [page, pageSize, debouncedSearch, locationCode, departmentCode, status, sortBy, sortDir, joinFrom, joinTo]);

  // Reset to page 1 whenever filters or sort change
  useEffect(() => { setPage(1); }, [debouncedSearch, locationCode, departmentCode, status, pageSize, joinFrom, joinTo, sortBy, sortDir]);

  const activeFilterCount = useMemo(
    () => [locationCode, departmentCode, status, joinFrom, joinTo].filter(Boolean).length,
    [locationCode, departmentCode, status, joinFrom, joinTo]
  );

  const clearAllFilters = () => {
    setLocationCode('');
    setDepartmentCode('');
    setStatus('');
    setJoinFrom('');
    setJoinTo('');
    setSearch('');
  };

  const handleSort = (by: string, dir: SortDir) => {
    setSortBy(by);
    setSortDir(dir);
  };

  const columns: Column<EmployeeListItem>[] = [
    {
      key: 'employeeCode',
      header: 'Employee ID',
      render: (r) => <span className="font-mono text-xs">{r.employeeCode}</span>,
    },
    {
      key: 'fullName',
      header: 'Employee',
      render: (r) => (
        <div>
          <div className="font-medium">{r.fullName}</div>
          <div className="text-[11px] text-slate-500">{r.email}</div>
        </div>
      ),
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (r) => (
        <div>
          <div className="text-sm">{r.departmentName}</div>
          <div className="text-[11px] text-slate-500">{r.teamName || '\u2014'}</div>
        </div>
      ),
    },
    {
      key: 'locationCity',
      header: 'Location',
      render: (r) => <span className="text-sm">{r.locationCity}</span>,
    },
    {
      key: 'designation',
      header: 'Grade',
      render: (r) => <Badge tone="brand">{r.designation}</Badge>,
    },
    {
      key: 'experienceYears',
      header: 'Exp',
      render: (r) => <span className="text-sm">{r.experienceYears}y</span>,
    },
    {
      key: 'joiningDate',
      header: 'Joined',
      render: (r) => (
        <span className="text-xs">
          {new Date(r.joiningDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      render: (r) => <StatusBadge status={r.employmentStatus} />,
    },
    {
      key: 'basicSalary',
      header: 'Basic',
      className: 'text-right',
      render: (r) => <span className="text-xs font-medium">{formatINR(r.basicSalary)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { e.stopPropagation(); navigate('/employees/' + r.id); }}
        >
          View
        </Button>
      ),
    },
  ];

  // Card view: same filters/sort, just rendered differently
  const cards = data.map((e) => <EmployeeCard key={e.id} employee={e} />);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        subtitle={stats ? stats.total.toLocaleString('en-IN') + ' employees across ' + stats.byLocation.length + ' locations' : 'Loading directory'}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPage(1)}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setView(view === 'table' ? 'cards' : 'table')}>
              {view === 'table' ? <><LayoutGrid size={14} /> Cards</> : <><List size={14} /> Table</>}
            </Button>
            <Button variant="gradient" size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus size={14} /> Add Employee
            </Button>
          </>
        }
      />

      {/* Stat row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card padded={false} className="p-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Total</div>
            <div className="text-xl font-semibold mt-1">{stats.total}</div>
          </Card>
          {stats.byLocation.slice(0, 3).map((l) => (
            <Card key={l.code} padded={false} className="p-4">
              <div className="text-xs text-slate-500 uppercase tracking-wider">{l.city}</div>
              <div className="text-xl font-semibold mt-1">{l.count}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Toolbar: search + sort + filters toggle + view toggle */}
      <Toolbar>
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee ID, email, phone"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>
        <div className="md:col-span-3">
          <SortMenu
            options={SORT_OPTIONS}
            sortBy={sortBy}
            sortDir={sortDir}
            onChange={handleSort}
          />
        </div>
        <div className="md:col-span-2">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowFilters((s) => !s)}>
            <Filter size={14} /> Filters {activeFilterCount > 0 ? '(' + activeFilterCount + ')' : ''}
          </Button>
        </div>
        <div className="md:col-span-2">
          <Button variant="secondary" size="sm" className="w-full" onClick={() => setView(view === 'table' ? 'cards' : 'table')}>
            {view === 'table' ? <><LayoutGrid size={14} /> Cards</> : <><List size={14} /> Table</>}
          </Button>
        </div>
      </Toolbar>

      {/* Filter panel */}
      {showFilters && stats && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Location</label>
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
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Department</label>
              <select
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">All departments</option>
                {stats.byDepartment.filter((d) => d.count > 0).map((d) => (
                  <option key={d.code} value={d.code}>{d.name} ({d.count})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Status</label>
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
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Joining date</label>
              <DateRangeFilter from={joinFrom} to={joinTo} onFromChange={setJoinFrom} onToChange={setJoinTo} />
            </div>
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {locationCode && <Badge tone="brand">Location: {locationCode}</Badge>}
                {departmentCode && <Badge tone="brand">Dept: {departmentCode}</Badge>}
                {status && <Badge tone="brand">Status: {status}</Badge>}
                {(joinFrom || joinTo) && <Badge tone="brand">Joined: {joinFrom || '…'} → {joinTo || '…'}</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X size={14} /> Clear all
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Loading / error / empty */}
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonTable rows={10} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No employees match your filters"
          description="Try clearing some filters or adjusting your search."
          action={<Button variant="secondary" onClick={clearAllFilters}>Clear filters</Button>}
        />
      ) : view === 'table' ? (
        <Card padded={false}>
          <Table columns={columns} data={data} rowKey={(r) => r.id} emptyMessage="No employees match your filters" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-slate-500">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total.toLocaleString('en-IN')}
            <span className="ml-2 text-slate-400">· sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label} ({sortDir})</span>
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
            <span className="text-xs text-slate-500 px-1">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <AddEmployeeModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={() => { setPage(1); load(); }}
        stats={stats}
      />
    </div>
  );
}