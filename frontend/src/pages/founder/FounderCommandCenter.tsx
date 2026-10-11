import HeroBackground from '../../components/layout/HeroBackground';
﻿import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, TrendingUp, ShieldAlert, Landmark, Briefcase } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import {
  pulseService,
  PulseOverview,
  HeadcountByLocation,
  ProjectStatusCount,
  RecentProject,
  TopClient,
} from '../../services/pulseService';

const CHART_COLORS = ['#3358ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b', '#eab308', '#ec4899'];

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(1) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

export default function FounderCommandCenter() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<PulseOverview | null>(null);
  const [byLocation, setByLocation] = useState<HeadcountByLocation[]>([]);
  const [byStatus, setByStatus] = useState<ProjectStatusCount[]>([]);
  const [recent, setRecent] = useState<RecentProject[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, loc, st, rp, tc] = await Promise.all([
        pulseService.overview(),
        pulseService.headcountByLocation(),
        pulseService.projectsByStatus(),
        pulseService.recentProjects(8),
        pulseService.topClients(5),
      ]);
      setOverview(o);
      setByLocation(loc);
      setByStatus(st);
      setRecent(rp);
      setTopClients(tc);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const locChartData = byLocation.map((l) => ({ name: l.code, label: l.name, value: l.count }));
  const statusChartData = byStatus.map((s) => ({ status: s.status, display: s.status.replace(/_/g, ' '), count: s.count }));

  const projectCols: Column<RecentProject>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.projectCode}</span> },
    { key: 'name', header: 'Project', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'client', header: 'Client', render: (r) => (
      <span className="text-xs text-slate-500">
        {r.clientName} <span className="opacity-60">{'\u00B7'} {r.clientCountry}</span>
      </span>
    ) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'progress', header: 'Progress', render: (r) => (
      <div className="flex items-center gap-2 w-32">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: r.progress + '%' }} />
        </div>
        <span className="text-xs text-slate-500 w-9 text-right">{r.progress}%</span>
      </div>
    ) },
    { key: 'health', header: 'Health', render: (r) => (
      <span className={'text-xs font-medium ' + (r.health >= 4.2 ? 'text-emerald-500' : r.health >= 3.5 ? 'text-amber-500' : 'text-rose-500')}>
        {r.health.toFixed(2)}
      </span>
    ) },
    { key: 'risk', header: 'Risk', render: (r) => (
      <span className={'text-xs font-medium ' + (r.risk >= 2.5 ? 'text-rose-500' : r.risk >= 1.8 ? 'text-amber-500' : 'text-emerald-500')}>
        {r.risk.toFixed(2)}
      </span>
    ) },
    { key: 'revenue', header: 'Revenue', className: 'text-right', render: (r) => (
      <span className="text-xs font-medium">{formatINR(r.revenue)}</span>
    ) },
  ];

  const clientCols: Column<TopClient>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.clientCode}</span> },
    { key: 'company', header: 'Client', render: (r) => (
      <div>
        <div className="font-medium text-sm">{r.companyName}</div>
        <div className="text-[11px] text-slate-500">{r.country} {'\u00B7'} {r.industry}</div>
      </div>
    ) },
    { key: 'tier', header: 'SLA', render: (r) => <StatusBadge status={r.slaTier} /> },
    { key: 'projects', header: 'Projects', className: 'text-right', render: (r) => <span className="text-xs">{r.projectCount}</span> },
    { key: 'revenue', header: 'Revenue', className: 'text-right', render: (r) => <span className="text-xs font-medium">{formatINR(r.revenue)}</span> },
  ];

  return (
    <div className="space-y-6">
      <HeroBackground height="220px" preset="crimson">
        <div className="absolute inset-0 flex items-end p-6">
          <div className="text-white">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Founder Command</div>
            <h2 className="text-2xl font-light tracking-tight mt-1">Move to drift &middot; hold to feed it</h2>
          </div>
        </div>
      </HeroBackground>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Founder Command Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Executive overview of the entire enterprise {'\u00B7'} live from PostgreSQL
        </p>
      </div>

      {/* Stat cards — clickable */}
      {loading || !overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Headcount"
            value={overview.headcount}
            hint="Active employees across all locations"
            icon={<Users size={18} />}
            onClick={() => navigate('/employees')}
          />
          <StatCard
            label="Active Projects"
            value={overview.activeProjects + ' / ' + overview.totalProjects}
            hint={'Avg health ' + overview.avgProjectHealth.toFixed(2) + ' ' + '\u00B7' + ' High risk: ' + overview.highRiskProjects}
            icon={<FolderKanban size={18} />}
            accent="violet"
            onClick={() => navigate('/projects')}
          />
          <StatCard
            label="Revenue YTD"
            value={formatINR(overview.revenueYtd)}
            hint={overview.activeClients + ' active clients'}
            icon={<TrendingUp size={18} />}
            accent="emerald"
            onClick={() => navigate('/finance')}
          />
          <StatCard
            label="Open Security Events"
            value={overview.openSecurityEvents}
            hint={overview.overdueInvoices + ' overdue invoices ' + '\u00B7' + ' ' + overview.openInvoices + ' open'}
            icon={<ShieldAlert size={18} />}
            accent="rose"
            onClick={() => navigate('/security')}
          />
        </div>
      )}

      {/* Charts row — clickable bars / pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Projects by Status" subtitle="Click a bar to view matching projects" />
          {loading ? <SkeletonTable rows={4} /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="display" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Bar
                    dataKey="count"
                    fill="#3358ff"
                    radius={[4, 4, 0, 0]}
                    cursor="pointer"
                    onClick={(data: any) => {
                      const raw = data?.payload?.status || data?.status;
                      if (raw) navigate('/projects?status=' + encodeURIComponent(raw));
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card>
          <CardHeader title="Headcount by Location" subtitle="Click a slice to view that location" />
          {loading ? <SkeletonTable rows={3} /> : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={70}
                    label={({ name, value }) => name + ': ' + value}
                    labelLine={false}
                    cursor="pointer"
                    onClick={(data: any) => {
                      const code = data?.name || data?.payload?.name;
                      if (code) navigate('/employees?location=' + encodeURIComponent(code));
                    }}
                  >
                    {locChartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Recent projects — clickable rows */}
      <Card>
        <CardHeader title="Recent Projects" subtitle="Click a row to open the project workspace" />
        {loading ? <SkeletonTable rows={6} /> : (
          <Table
            columns={projectCols}
            data={recent}
            rowKey={(r) => r.projectCode}
            emptyMessage="No projects yet"
            onRowClick={(r) => navigate('/projects/' + encodeURIComponent(r.projectCode))}
          />
        )}
      </Card>

      {/* Top clients — clickable rows */}
      <Card>
        <CardHeader title="Top Clients by Revenue" subtitle="Click a row to open the client workspace" />
        {loading ? <SkeletonTable rows={5} /> : (
          <Table
            columns={clientCols}
            data={topClients}
            rowKey={(r) => r.clientCode}
            emptyMessage="No clients yet"
            onRowClick={(r) => navigate('/clients/' + encodeURIComponent(r.clientCode))}
          />
        )}
      </Card>
    </div>
  );
}
