import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
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
  COMPANY: 'brand',
  ENGINEERING: 'info',
  PROJECT: 'success',
  FINANCE: 'warn',
  HR: 'neutral',
};

const TREND_ICON = {
  UP: <TrendingUp size={14} className="text-emerald-500" />,
  DOWN: <TrendingDown size={14} className="text-rose-500" />,
  FLAT: <Minus size={14} className="text-slate-400" />,
};

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
  useEffect(() => { load(); }, []);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const categories = Array.from(new Set(kpis.map((k) => k.category)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pulse Intelligence</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          40 live KPIs across company, engineering, projects, finance, and HR
        </p>
      </div>

      {/* Overall health score */}
      {health && (
        <Card>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-brand-500/10 grid place-items-center">
                <Activity size={28} className="text-brand-500" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">Overall Health Score</div>
                <div className="text-4xl font-semibold mt-1">
                  {health.overallScore != null ? health.overallScore.toFixed(1) : '\u2014'}
                  <span className="text-lg text-slate-400 ml-1">/ 100</span>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 min-w-full md:min-w-0">
              {health.categories.map((c) => (
                <div key={c.category} className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{c.category}</div>
                  <div className="text-lg font-semibold">{c.score != null ? c.score.toFixed(0) : '\u2014'}</div>
                  <Badge tone={CATEGORY_TONE[c.category] || 'neutral'}>{c.kpiCount} KPIs</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* KPIs by category */}
      {categories.map((cat) => {
        const catKpis = kpis.filter((k) => k.category === cat);
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
                const trendIcon = k.trend ? TREND_ICON[k.trend as keyof typeof TREND_ICON] : null;
                const sparkData = k.snapshots.slice(-14).map((s, i) => ({ i, value: s.value }));

                return (
                  <Card key={k.id}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] text-slate-500">{k.code}</div>
                        <div className="font-medium text-sm mt-0.5">{k.name}</div>
                      </div>
                      {trendIcon}
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <div className="text-2xl font-semibold tracking-tight">{formatValue(current, k.unit)}</div>
                        {target != null && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Target: {formatValue(target, k.unit)}
                          </div>
                        )}
                      </div>
                      {sparkData.length > 1 && (
                        <div className="h-10 w-24">
                          <ResponsiveContainer>
                            <LineChart data={sparkData}>
                              <Line type="monotone" dataKey="value" stroke="#3358ff" strokeWidth={2} dot={false} />
                              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 6, fontSize: 10 }} formatter={(v: number) => formatValue(v, k.unit)} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {pctOfTarget != null && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>Attainment</span>
                          <span>{pctOfTarget.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className={pctOfTarget >= 100 ? 'bg-emerald-500' : pctOfTarget >= 85 ? 'bg-brand-500' : pctOfTarget >= 70 ? 'bg-amber-500' : 'bg-rose-500'} style={{ width: Math.min(100, pctOfTarget) + '%', height: '100%' }} />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}