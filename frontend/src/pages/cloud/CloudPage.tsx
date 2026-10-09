import { useEffect, useState } from 'react';
import { AlertTriangle, Cloud as CloudIcon, Server, Database, Box, DollarSign } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { cloudService, CloudOverview } from '../../services/cloudService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

const PROVIDER_TONE: Record<string, 'brand' | 'info' | 'success'> = {
  AWS: 'brand', Azure: 'info', GCP: 'success',
};

export default function CloudPage() {
  const [data, setData] = useState<CloudOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setData(await cloudService.overview()); }
    catch (e: any) { setError(e?.message || 'Failed to load cloud overview'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <ErrorState message="No cloud data" />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cloud Infrastructure</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prototype view of AWS, Azure, and GCP footprint
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle size={14} />
          Prototype Data &mdash; Simulation
        </div>
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="text-xs text-amber-700 dark:text-amber-300">
          <strong>Not connected to live cloud APIs.</strong> The values below are deterministic simulations consistent with a
          500-person enterprise running ~60 projects. No AWS/Azure/GCP credentials are configured, and no live metrics are
          being fetched. This page exists to demonstrate the cloud dashboard layout.
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Monthly Cloud Spend" value={formatINR(data.totals.monthlyCloudSpend)} hint="Simulated across 3 providers" />
        <StatCard label="Compute Hours" value={(data.totals.computeHoursMonth / 1000).toFixed(1) + 'k'} hint="This month (simulated)" />
        <StatCard label="Active Deployments" value={data.totals.activeDeployments} hint="Real data from deployments table" />
        <StatCard label="Projects on Cloud" value={data.totals.activeProjectsUsingCloud} hint="Real data from projects table" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.providers.map((p) => (
          <Card key={p.provider} className="h-full">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-500/10 grid place-items-center">
                  <CloudIcon size={20} className="text-brand-500" />
                </div>
                <div>
                  <div className="font-semibold">{p.provider}</div>
                  <div className="text-xs text-slate-500">{p.region}</div>
                </div>
              </div>
              <Badge tone={PROVIDER_TONE[p.provider] || 'neutral'}>{p.environment}</Badge>
            </div>

            <div className="space-y-2 mb-4">
              {p.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {s.name.includes('RDS') || s.name.includes('SQL') || s.name.includes('BigQuery') ? <Database size={14} className="text-slate-400" /> :
                     s.name.includes('EKS') || s.name.includes('AKS') || s.name.includes('GKE') ? <Box size={14} className="text-slate-400" /> :
                     <Server size={14} className="text-slate-400" />}
                    <span className="text-slate-700 dark:text-slate-200">{s.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {s.instances != null && s.instances + ' inst'}
                    {s.clusters != null && s.clusters + ' clust'}
                    {s.nodes != null && ' \u00B7 ' + s.nodes + ' nodes'}
                    {s.buckets != null && s.buckets + ' buckets'}
                    {s.databases != null && s.databases + ' db'}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-500 flex items-center gap-1"><DollarSign size={12} /> Monthly</span>
              <span className="font-semibold">{formatINR(p.monthlyCost)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}