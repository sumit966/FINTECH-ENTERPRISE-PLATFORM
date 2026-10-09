import { useEffect, useState } from 'react';
import { Server, Database, Zap, Check, AlertCircle, Building, MapPin, User, FileText } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { settingsService, SystemOverview, Integration, About } from '../../services/settingsService';

type Tab = 'system' | 'integrations' | 'about';

function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('system');
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [o, i, a] = await Promise.all([
        settingsService.overview(),
        settingsService.integrations(),
        settingsService.about(),
      ]);
      setOverview(o); setIntegrations(i); setAbout(a);
    } catch (e: any) {
      setError(e?.message || 'Failed to load settings');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          System administration and platform information
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['system','integrations','about'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={'px-4 py-2 text-sm font-medium border-b-2 capitalize ' + (tab === t ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'system' && overview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Node Version" value={overview.runtime.nodeVersion} hint={overview.runtime.platform} />
            <StatCard label="Uptime" value={formatUptime(overview.runtime.uptimeSeconds)} hint={overview.runtime.environment} />
            <StatCard label="Memory" value={overview.runtime.memoryMb + ' MB'} hint="Resident set size" />
            <StatCard label="Total DB Rows" value={overview.database.totalRows.toLocaleString('en-IN')} hint={overview.database.latencyMs + ' ms to count'} />
          </div>

          <Card>
            <CardHeader title="Database Tables" subtitle={overview.database.tables.length + ' tracked tables'} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {overview.database.tables.map((t) => (
                <div key={t.model} className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2">
                  <div>
                    <div className="text-sm">{t.label}</div>
                    <div className="text-[10px] font-mono text-slate-500">{t.model}</div>
                  </div>
                  <div className="text-sm font-semibold">{t.count.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'integrations' && (
        <>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <div>
                <strong>None of these integrations are connected in the prototype.</strong> Each card shows the environment
                variable(s) that would enable it. When an integration is configured, its status changes to
                <Badge tone="success">CONFIGURED</Badge> and it becomes active.
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((i) => (
              <Card key={i.code} className="h-full">
                <div className="flex items-start gap-3">
                  <div className={'h-10 w-10 rounded-lg grid place-items-center shrink-0 ' + (i.status === 'CONFIGURED' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/10 text-slate-500')}>
                    {i.status === 'CONFIGURED' ? <Check size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div>
                    <div className="font-semibold">{i.name}</div>
                    <Badge tone={i.status === 'CONFIGURED' ? 'success' : 'warn'}>
                      {i.status === 'CONFIGURED' ? 'Connected' : 'Integration Required'}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">{i.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Configure with</div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 rounded px-2 py-1">
                    {i.envVar}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === 'about' && about && (
        <>
          <Card>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-brand-500 grid place-items-center text-white text-2xl font-bold shrink-0">
                N
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{about.platform}</h2>
                <p className="text-sm text-slate-500 mt-1">{about.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge tone="brand">v{about.version}</Badge>
                  <Badge tone="neutral">{about.build}</Badge>
                  <Badge tone="neutral">{about.license}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Company" subtitle={about.company} />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-slate-500">Founder &amp; CEO</span>
                  <span className="font-medium ml-auto">{about.founder}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-slate-400" />
                  <span className="text-slate-500">Headquarters</span>
                  <span className="font-medium ml-auto">{about.headquarters}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  <span className="text-slate-500">Locations</span>
                  <span className="font-medium ml-auto text-right">{about.locations.join(', ')}</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="Platform" subtitle="Runtime environment" />
              {overview && (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-slate-400" />
                    <span className="text-slate-500">Node</span>
                    <span className="font-mono text-xs ml-auto">{overview.runtime.nodeVersion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-slate-400" />
                    <span className="text-slate-500">Database</span>
                    <span className="font-medium ml-auto">PostgreSQL 18</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-slate-400" />
                    <span className="text-slate-500">Environment</span>
                    <span className="font-medium ml-auto">{overview.runtime.environment}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" />
                    <span className="text-slate-500">Total rows</span>
                    <span className="font-medium ml-auto">{overview.database.totalRows.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card>
            <CardHeader title="Modules" subtitle="All enabled in this build" />
            <div className="flex flex-wrap gap-2">
              {['HRMS','Payroll','Attendance','Leave','Finance','Projects','Clients / CRM','Procurement','Assets','Licenses','Recruitment / ATS','Exams','Documents','Knowledge','Engineering','Cloud','Security','Calendar','Notifications','Pulse Intelligence','AI Command Center','Executive Dashboard','Organisation Chart'].map((m) => (
                <Badge key={m} tone="brand">{m}</Badge>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}