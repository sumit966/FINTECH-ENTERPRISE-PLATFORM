import HeroBackground from '../../components/layout/HeroBackground';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FolderKanban, TrendingUp, ShieldAlert, ArrowRight, MapPin, Activity, DollarSign } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import {
  pulseService,
  PulseOverview,
  HeadcountByLocation,
  ProjectStatusCount,
  RecentProject,
  TopClient,
} from '../../services/pulseService';

const STATUS_TONE: Record<string, string> = {
  PLANNING:  'from-slate-400 to-slate-500',
  ACTIVE:    'from-emerald-400 to-emerald-600',
  ON_HOLD:   'from-amber-400 to-amber-600',
  QA:        'from-violet-400 to-violet-600',
  DEPLOYMENT:'from-cyan-400 to-cyan-600',
  DELIVERED: 'from-brand-400 to-brand-600',
  MAINTENANCE:'from-teal-400 to-teal-600',
  CLOSED:    'from-slate-500 to-slate-700',
  AT_RISK:   'from-rose-400 to-rose-600',
  PENDING:   'from-amber-400 to-amber-500',
};

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
    setLoading(true); setError(null);
    try {
      const [o, loc, st, rp, tc] = await Promise.all([
        pulseService.overview(),
        pulseService.headcountByLocation(),
        pulseService.projectsByStatus(),
        pulseService.recentProjects(6),
        pulseService.topClients(5),
      ]);
      setOverview(o); setByLocation(loc); setByStatus(st); setRecent(rp); setTopClients(tc);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  const totalHeadcount = overview?.headcount || 1;
  const totalProjectCount = byStatus.reduce((s, x) => s + x.count, 0) || 1;
  const maxClientRevenue = Math.max(1, ...topClients.map((c) => c.revenue));

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
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">
          Executive overview
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Founder Command Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Live view across people, projects, finance, and security
        </p>
      </div>

      {/* KPI grid */}
      {loading || !overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <FounderKpi
            label="Total Headcount"
            value={overview.headcount.toLocaleString('en-IN')}
            hint="Active employees"
            accent="brand"
            icon={<Users size={18} />}
            onClick={() => navigate('/employees')}
          />
          <FounderKpi
            label="Active Projects"
            value={`${overview.activeProjects} / ${overview.totalProjects}`}
            hint={`Avg health ${overview.avgProjectHealth.toFixed(2)} · ${overview.highRiskProjects} high-risk`}
            accent="violet"
            icon={<FolderKanban size={18} />}
            onClick={() => navigate('/projects')}
          />
          <FounderKpi
            label="Revenue YTD"
            value={formatINR(overview.revenueYtd)}
            hint={`${overview.activeClients} active clients`}
            accent="emerald"
            icon={<TrendingUp size={18} />}
            onClick={() => navigate('/finance')}
          />
          <FounderKpi
            label="Open Security Events"
            value={String(overview.openSecurityEvents)}
            hint={`${overview.overdueInvoices} overdue · ${overview.openInvoices} open`}
            accent="rose"
            icon={<ShieldAlert size={18} />}
            onClick={() => navigate('/security')}
          />
        </div>
      )}

      {/* Projects by status + Headcount by location */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Projects by Status"
            subtitle="Click a status to open matching projects"
            action={<Activity size={14} className="text-slate-400" />}
          />
          {loading ? <SkeletonCard /> : (
            <div className="space-y-3">
              {byStatus.map((s) => {
                const pct = (s.count / totalProjectCount) * 100;
                const tone = STATUS_TONE[s.status] || 'from-brand-400 to-brand-600';
                return (
                  <button
                    key={s.status}
                    onClick={() => navigate('/projects?status=' + encodeURIComponent(s.status))}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-brand-500 transition">
                        {s.status.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{s.count}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
              {byStatus.length === 0 && (
                <div className="text-xs text-slate-500 py-6 text-center">No projects on record</div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Headcount by Location"
            subtitle="Click a location to open its employees"
            action={<MapPin size={14} className="text-slate-400" />}
          />
          {loading ? <SkeletonCard /> : (
            <div className="space-y-4">
              {byLocation.map((l) => {
                const pct = (l.count / totalHeadcount) * 100;
                return (
                  <button
                    key={l.code}
                    onClick={() => navigate('/employees?location=' + encodeURIComponent(l.code))}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <div className="text-sm font-semibold group-hover:text-brand-500 transition">{l.city || l.code}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">{l.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold tabular-nums">{l.count}</div>
                        <div className="text-[10px] text-slate-400 tabular-nums">{pct.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-violet-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
              {byLocation.length === 0 && (
                <div className="text-xs text-slate-500 py-6 text-center">No locations on record</div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent projects */}
      <Card>
        <CardHeader
          title="Recent Projects"
          subtitle="Click any project to open its workspace"
          action={
            <button
              onClick={() => navigate('/projects')}
              className="text-[11px] text-brand-500 hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </button>
          }
        />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((p) => (
              <button
                key={p.projectCode}
                onClick={() => navigate('/projects/' + encodeURIComponent(p.projectCode))}
                className="text-left rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40 p-4 card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] text-slate-400">{p.projectCode}</div>
                    <div className="font-medium text-sm truncate mt-0.5">{p.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {p.clientName} · {p.clientCountry}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="tabular-nums font-medium">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">
                    Health <span className={(p.health >= 4.2 ? 'text-emerald-500' : p.health >= 3.5 ? 'text-amber-500' : 'text-rose-500') + ' font-medium'}>{p.health.toFixed(2)}</span>
                  </span>
                  <span className="text-slate-500">
                    Risk <span className={(p.risk >= 2.5 ? 'text-rose-500' : p.risk >= 1.8 ? 'text-amber-500' : 'text-emerald-500') + ' font-medium'}>{p.risk.toFixed(2)}</span>
                  </span>
                  <span className="text-slate-500">
                    {formatINR(p.revenue)}
                  </span>
                </div>
              </button>
            ))}
            {recent.length === 0 && (
              <div className="col-span-full text-xs text-slate-500 py-6 text-center">No recent projects</div>
            )}
          </div>
        )}
      </Card>

      {/* Top clients */}
      <Card>
        <CardHeader
          title="Top Clients by Revenue"
          subtitle="Click a client to open its workspace"
          action={<DollarSign size={14} className="text-slate-400" />}
        />
        {loading ? <SkeletonCard /> : (
          <div className="space-y-3">
            {topClients.map((c, i) => {
              const pct = (c.revenue / maxClientRevenue) * 100;
              return (
                <button
                  key={c.clientCode}
                  onClick={() => navigate('/clients/' + encodeURIComponent(c.clientCode))}
                  className="w-full text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md grid place-items-center text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate group-hover:text-brand-500 transition">{c.companyName}</div>
                          <div className="text-[11px] text-slate-500 truncate">{c.country} · {c.industry} · {c.projectCount} projects</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-medium text-sm tabular-nums">{formatINR(c.revenue)}</div>
                          <StatusBadge status={c.slaTier} />
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-brand-500 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {topClients.length === 0 && (
              <div className="text-xs text-slate-500 py-6 text-center">No clients on record</div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function FounderKpi({
  label, value, hint, icon, accent, onClick,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  accent: 'brand' | 'violet' | 'emerald' | 'rose' | 'amber' | 'teal';
  onClick: () => void;
}) {
  const ACCENT: Record<string, string> = {
    brand:   'from-brand-500/20 to-brand-500/0 text-brand-500',
    violet:  'from-violet-500/20 to-violet-500/0 text-violet-500',
    emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-500',
    rose:    'from-rose-500/20 to-rose-500/0 text-rose-500',
    amber:   'from-amber-500/20 to-amber-500/0 text-amber-500',
    teal:    'from-teal-500/20 to-teal-500/0 text-teal-500',
  };
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 p-5 card-hover w-full"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium">
            {label}
          </div>
          <div className="mt-2 text-2xl font-semibold tracking-tight truncate">{value}</div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">{hint}</div>
        </div>
        <div className={`h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br shrink-0 ${ACCENT[accent]}`}>
          {icon}
        </div>
      </div>
    </button>
  );
}
