import HeroBackground from '../../components/layout/HeroBackground';
﻿import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Users, FolderKanban, DollarSign, ShieldAlert, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { execService, ExecutiveSnapshot, OrgTree, RevenuePoint, RiskRadar } from '../../services/execService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' });
}

export default function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<ExecutiveSnapshot | null>(null);
  const [orgTree, setOrgTree] = useState<OrgTree | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [radar, setRadar] = useState<RiskRadar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [s, o, r, k] = await Promise.all([
        execService.snapshot(),
        execService.orgTree(),
        execService.revenueTrend(12),
        execService.riskRadar(),
      ]);
      setSnapshot(s); setOrgTree(o); setRevenue(r); setRadar(k);
    } catch (e: any) {
      setError(e?.message || 'Failed to load executive dashboard');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="space-y-4"><div className="grid grid-cols-4 gap-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!snapshot || !radar || !orgTree) return <ErrorState message="No data" onRetry={load} />;

  const maxGrid = Math.max(1, ...orgTree.grid.map((g) => g.count));
  const topDepts = orgTree.departments.slice(0, 8);

  return (
    <div className="space-y-6">
      <HeroBackground height="220px" preset="glacier">
        <div className="absolute inset-0 flex items-end p-6">
          <div className="text-white">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Executive Dashboard</div>
            <h2 className="text-2xl font-light tracking-tight mt-1">Cross-module signal in real time</h2>
          </div>
        </div>
      </HeroBackground>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cross-module executive view &middot; live from PostgreSQL
        </p>
      </div>

      {/* Top-line stat cards — clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Headcount"
          value={snapshot.headcount}
          hint={snapshot.clients + ' active clients'}
          icon={<Users size={18} />}
          onClick={() => navigate('/employees')}
        />
        <StatCard
          label="Active Projects"
          value={snapshot.activeProjects + ' / ' + snapshot.totalProjects}
          hint={'Health ' + snapshot.avgProjectHealth.toFixed(2) + ' \u00B7 risk ' + snapshot.avgProjectRisk.toFixed(2)}
          icon={<FolderKanban size={18} />}
          accent="violet"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          label="Revenue Paid"
          value={formatINR(snapshot.revenuePaid)}
          hint={'Invoiced ' + formatINR(snapshot.revenueInvoiced)}
          icon={<TrendingUp size={18} />}
          accent="emerald"
          onClick={() => navigate('/finance')}
        />
        <StatCard
          label="Payroll YTD"
          value={formatINR(snapshot.payrollNetYtd)}
          hint={snapshot.attendanceThisMonth.toLocaleString('en-IN') + ' attendance records'}
          icon={<Calendar size={18} />}
          accent="teal"
          onClick={() => navigate('/payroll')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Open Invoices"
          value={snapshot.openInvoices}
          hint={snapshot.overdueInvoices + ' overdue \u00B7 ' + formatINR(snapshot.overdueAmount)}
          icon={<DollarSign size={18} />}
          accent="amber"
          onClick={() => navigate('/finance?filter=open')}
        />
        <StatCard
          label="Security Open"
          value={snapshot.openSecurity}
          hint={snapshot.criticalSecurity + ' critical'}
          icon={<ShieldAlert size={18} />}
          accent="rose"
          onClick={() => navigate('/security')}
        />
        <StatCard
          label="On Leave Today"
          value={snapshot.onLeaveToday}
          hint="Approved leaves"
          icon={<Calendar size={18} />}
          onClick={() => navigate('/leave?status=APPROVED')}
        />
        <StatCard
          label="Avg Project Risk"
          value={snapshot.avgProjectRisk.toFixed(2)}
          hint="Portfolio-wide"
          icon={<AlertTriangle size={18} />}
          accent="amber"
          onClick={() => navigate('/projects?sort=risk')}
        />
      </div>

      {/* Revenue vs payroll trend — clickable bars */}
      <Card>
        <CardHeader title="Revenue vs Payroll" subtitle="Click a bar to open matching transactions" />
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatINR(v)} />
              <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data: any) => {
                  const label = data?.payload?.label || data?.label;
                  if (label) navigate('/finance?period=' + encodeURIComponent(label));
                }}
              />
              <Bar
                dataKey="payroll"
                name="Payroll"
                fill="#3358ff"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data: any) => {
                  const label = data?.payload?.label || data?.label;
                  if (label) navigate('/payroll?period=' + encodeURIComponent(label));
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Org grid + recent audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Organisation Grid" subtitle="Click a cell or dept name to filter employees" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left px-2 py-2 font-medium uppercase tracking-wider text-slate-500">Dept</th>
                  {orgTree.locations.map((l) => (
                    <th key={l.code} className="text-center px-2 py-2 font-medium uppercase tracking-wider text-slate-500">{l.city}</th>
                  ))}
                  <th className="text-right px-2 py-2 font-medium uppercase tracking-wider text-slate-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {topDepts.map((d) => {
                  const total = orgTree.grid.filter((g) => g.departmentCode === d.code).reduce((s, x) => s + x.count, 0);
                  return (
                    <tr key={d.code}>
                      <td className="px-2 py-2 text-left font-medium">
                        <button
                          type="button"
                          className="hover:text-brand-500 underline-offset-2 hover:underline"
                          onClick={() => navigate('/employees?department=' + encodeURIComponent(d.code))}
                        >
                          {d.name}
                        </button>
                      </td>
                      {orgTree.locations.map((l) => {
                        const cell = orgTree.grid.find((g) => g.departmentCode === d.code && g.locationCode === l.code);
                        const count = cell?.count || 0;
                        const intensity = count / maxGrid;
                        return (
                          <td key={l.code} className="text-center px-2 py-2">
                            <button
                              type="button"
                              disabled={count === 0}
                              onClick={() =>
                                navigate(
                                  '/employees?department=' + encodeURIComponent(d.code) +
                                  '&location=' + encodeURIComponent(l.code)
                                )
                              }
                              className="inline-flex items-center justify-center rounded transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-default disabled:hover:scale-100"
                              style={{
                                backgroundColor: 'rgba(51,88,255,' + (intensity * 0.6 + 0.05) + ')',
                                width: 32,
                                height: 22,
                                color: intensity > 0.5 ? 'white' : 'inherit',
                                fontWeight: count > 0 ? 600 : 400,
                              }}
                            >
                              {count || ''}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-2 text-right font-medium">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Live Activity" subtitle="Recent audit events" />
          <div className="space-y-2">
            {snapshot.recentAudit.map((a) => (
              <Link
                key={a.id}
                to={'/audit?module=' + encodeURIComponent(a.module) + '&action=' + encodeURIComponent(a.action)}
                className="flex items-center gap-2 text-xs hover:text-brand-500"
              >
                <Badge tone="brand">{a.action}</Badge>
                <span className="text-slate-500 truncate flex-1">{a.userEmail || 'system'}</span>
                <span className="text-[10px] text-slate-400">{fmtDate(a.createdAt)}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Risk radar */}
      <Card>
        <CardHeader title="Risk Radar" subtitle="Cross-module items needing attention" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">High-Risk Projects</span>
              <Badge tone="warn">{radar.highRiskProjects.length}</Badge>
            </div>
            {radar.highRiskProjects.length === 0 ? <div className="text-xs text-slate-500">None</div> : (
              <div className="space-y-2">
                {radar.highRiskProjects.map((p) => (
                  <Link key={p.code} to={'/projects/' + encodeURIComponent(p.code)} className="block text-sm hover:text-brand-500">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{p.code}</span>
                      <Badge tone="danger">Risk {p.risk}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{p.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-rose-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overdue Invoices</span>
              <Badge tone="danger">{radar.overdueInvoices.length}</Badge>
            </div>
            {radar.overdueInvoices.length === 0 ? <div className="text-xs text-slate-500">None</div> : (
              <div className="space-y-2">
                {radar.overdueInvoices.map((i) => (
                  <Link
                    key={i.number}
                    to={'/finance?invoice=' + encodeURIComponent(i.number)}
                    className="block text-sm hover:text-brand-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{i.number}</span>
                      <span className="text-xs font-medium">{formatINR(i.total)}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{i.client}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={14} className="text-rose-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Critical Security</span>
              <Badge tone="danger">{radar.criticalSecurity.length}</Badge>
            </div>
            {radar.criticalSecurity.length === 0 ? <div className="text-xs text-slate-500">None</div> : (
              <div className="space-y-2">
                {radar.criticalSecurity.map((s) => (
                  <Link key={s.code} to={'/security?event=' + encodeURIComponent(s.code)} className="block text-sm hover:text-brand-500">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{s.code}</span>
                      <span className="text-[10px] text-slate-500">{fmtDate(s.createdAt)}</span>
                    </div>
                    <div className="text-xs text-slate-500 truncate">{s.title}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
