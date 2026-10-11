import { useEffect, useState } from 'react';
import { usePolling, useRelativeTime } from '../../hooks/usePolling';
import { TrendingUp, TrendingDown, Minus, Activity, Target } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { Card, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { intelService, Kpi, OverallHealth } from '../../services/intelService';

function formatValue(v: number | null, unit: string): string {
  if (v == null) return '\u2014';
  if (unit === 'PERCENT') return v.toFixed(1) + '%';
  if (unit === 'CURRENCY_INR') {
    if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
    if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
    return '\u20B9' + v.toLocaleString('en-IN');
  }
  if (unit === 'HOURS') return v.toFixed(1) + 'h';
  if (unit === 'RATIO') return v.toFixed(2);
  return v.toLocaleString('en-IN');
}

const CATEGORY_TONE: Record<string, 'brand' | 'success' | 'info' | 'warn' | 'neutral'> = {
  COMPANY: 'brand', ENGINEERING: 'info', PROJECT: 'success', FINANCE: 'warn', HR: 'neutral',
};

const CATEGORY_ACCENT: Record<string, 'brand' | 'violet' | 'emerald' | 'amber' | 'teal'> = {
  COMPANY: 'brand', ENGINEERING: 'violet', PROJECT: 'emerald', FINANCE: 'amber', HR: 'teal',
};

function trendIcon(trend: string | null) {
  if (trend === 'UP') return <TrendingUp size={14} className="text-emerald-500" />;
  if (trend === 'DOWN') return <TrendingDown size={14} className="text-rose-500" />;
  return <Minus size={14} className="text-slate-400" />;
}

export default function PulseIntelligence() {
  const [health, setHealth] = useState<OverallHealth | null>(null);
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [h, k] = await Promise.all([intelService.health(), intelService.kpis()]);
      setHealth(h); setKpis(k);
    } catch (e: any) {
      setError(e?.message || 'Failed to load Pulse Intelligence');
    } finally { setLoading(false); }
  };
  const { lastUpdated } = usePolling(load, 30000);
  const freshness = useRelativeTime(lastUpdated);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const categories = Array.from(new Set(kpis.map((k) => k.category)));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-500 dark:text-brand-300 font-medium">
          Company intelligence
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 heading-gradient">Pulse Intelligence</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {kpis.length} live KPIs across company, engineering, projects, finance, and HR
        </p>
        <div className="text-[11px] text-slate-400 mt-1">Updated {freshness} · refresh every 30s</div>
      </div>

      {health && (
        <Card>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 grid place-items-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" strokeWidth="6" className="stroke-slate-200 dark:stroke-slate-800" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" strokeWidth="6"
                    strokeLinecap="round"
                    stroke="url(#healthGradient)"
                    strokeDasharray={`${Math.max(0, Math.min(100, health.overallScore ?? 0)) * 2.64} 264`}
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3358ff" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
                <Activity size={22} className="text-brand-500" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Overall Health Score</div>
                <div className="text-4xl font-semibold mt-1 tabular-nums">
                  {health.overallScore != null ? health.overallScore.toFixed(1) : '\u2014'}
                  <span className="text-lg text-slate-400 ml-1">/ 100</span>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 min-w-full md:min-w-0">
              {health.categories.map((c) => (
                <div key={c.category} className="text-center rounded-lg border border-slate-200/60 dark:border-slate-800/60 p-2">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{c.category}</div>
                  <div className="text-lg font-semibold tabular-nums">{c.score != null ? c.score.toFixed(0) : '\u2014'}</div>
                  <Badge tone={CATEGORY_TONE[c.category] || 'neutral'}>{c.kpiCount} KPIs</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {categories.map((cat) => {
        const catKpis = kpis.filter((k) => k.category === cat);
        const accent = CATEGORY_ACCENT[cat] || 'brand';
        return (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold">{cat}</h2>
              <Badge tone={CATEGORY_TONE[cat] || 'neutral'}>{catKpis.length} KPIs</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {catKpis.map((k) => {
                const current = k.currentValue;
                const target = k.targetValue;
                const pctOfTarget = current != null && target != null && target !== 0 ? Math.min(120, (current / target) * 100) : null;
                const sparkData = k.snapshots.slice(-14).map((s, i) => ({ i, value: s.value }));
                const accentClass: Record<string, string> = {
                  brand:   'from-brand-500/20 to-brand-500/0',
                  violet:  'from-violet-500/20 to-violet-500/0',
                  emerald: 'from-emerald-500/20 to-emerald-500/0',
                  amber:   'from-amber-500/20 to-amber-500/0',
                  teal:    'from-teal-500/20 to-teal-500/0',
                };
                const barClass = pctOfTarget == null ? '' :
                  pctOfTarget >= 100 ? 'bg-emerald-500' :
                  pctOfTarget >= 85 ? 'bg-brand-500' :
                  pctOfTarget >= 70 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div
                    key={k.id}
                    className="relative rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 p-5 card-hover"
                  >
                    <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br opacity-60 ${accentClass[accent]}`} />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-[10px] text-slate-500 truncate">{k.code}</div>
                          <div className="font-medium text-sm mt-0.5 truncate">{k.name}</div>
                        </div>
                        {trendIcon(k.trend)}
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-2xl font-semibold tracking-tight tabular-nums">{formatValue(current, k.unit)}</div>
                          {target != null && (
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Target size={10} /> Target {formatValue(target, k.unit)}
                            </div>
                          )}
                        </div>
                        {sparkData.length > 1 && (
                          <div className="h-12 w-24">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={sparkData}>
                                <defs>
                                  <linearGradient id={`spark-${k.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3358ff" stopOpacity={0.5} />
                                    <stop offset="100%" stopColor="#3358ff" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <YAxis hide domain={['dataMin', 'dataMax']} />
                                <Tooltip
                                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 6, fontSize: 10 }}
                                  formatter={(v: number) => formatValue(v, k.unit)}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#3358ff"
                                  strokeWidth={2}
                                  fill={`url(#spark-${k.id})`}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {pctOfTarget != null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Attainment</span>
                            <span className="tabular-nums">{pctOfTarget.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className={barClass} style={{ width: Math.min(100, pctOfTarget) + '%', height: '100%' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
