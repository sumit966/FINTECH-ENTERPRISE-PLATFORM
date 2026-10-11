import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import { Server, Database, Zap, Check, AlertCircle, Building, MapPin, User, FileText, X } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { settingsService, SystemOverview, Integration, About } from '../../services/settingsService';

type Tab = 'system' | 'integrations' | 'about' | 'appearance';

function formatUptime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}


function AppearancePanel() {
  const { theme, set, background, setBackground, intensity, setIntensity } = useTheme();

  const OptionCard = ({ active, onClick, icon, title, subtitle }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex items-start gap-3 rounded-xl border p-4 text-left transition w-full ' +
        (active
          ? 'border-brand-500 bg-brand-500/10'
          : 'border-slate-200/60 dark:border-slate-800/60 hover:border-brand-500/40')
      }
    >
      <div className="h-9 w-9 rounded-lg grid place-items-center bg-slate-100 dark:bg-slate-800 shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="font-medium text-sm">{title}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Theme" subtitle="Choose light, dark, or follow your system" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <OptionCard active={theme === 'light'} onClick={() => set('light')} icon={<Sun size={18} />} title="Light" subtitle="Bright surfaces" />
          <OptionCard active={theme === 'dark'} onClick={() => set('dark')} icon={<Moon size={18} />} title="Dark" subtitle="Recommended for long sessions" />
          <OptionCard active={theme === 'system'} onClick={() => set('system')} icon={<Monitor size={18} />} title="System" subtitle="Follow OS preference" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Background" subtitle="Animated aurora layer behind the entire platform" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <OptionCard active={background === 'aurora'} onClick={() => setBackground('aurora')} icon={<Sparkles size={18} />} title="Aurora" subtitle="Slow drifting indigo, violet, and teal" />
          <OptionCard active={background === 'off'} onClick={() => setBackground('off')} icon={<Monitor size={18} />} title="Off" subtitle="Static, minimal background" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Intensity" subtitle="How strongly the aurora shows through" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <OptionCard active={intensity === 'subtle'} onClick={() => setIntensity('subtle')} title="Subtle" subtitle="Best for dense tables" />
          <OptionCard active={intensity === 'normal'} onClick={() => setIntensity('normal')} title="Normal" subtitle="Recommended" />
          <OptionCard active={intensity === 'bold'}   onClick={() => setIntensity('bold')}   title="Bold" subtitle="Strongest presence" />
        </div>
      </Card>

      <Card className="border-slate-400/30 bg-slate-500/5">
        <div className="text-xs text-slate-600 dark:text-slate-300">
          Preferences are stored locally per browser. The aurora respects your operating system's reduced-motion setting — if you've enabled it, the drift animation stops and the background becomes static.
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const tab = ((params.get('tab') as Tab) || 'system') as Tab;
  const setTab = (t: Tab) => {
    const np = new URLSearchParams(params);
    if (t === 'system') np.delete('tab'); else np.set('tab', t);
    setParams(np, { replace: true });
  };

  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIntegration, setOpenIntegration] = useState<Integration | null>(null);

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

  const tabs = [
    { key: 'system', label: 'System' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'about', label: 'About' },
  ];

  const configuredCount = integrations.filter((i) => i.status === 'CONFIGURED').length;
  const requiredCount = integrations.length - configuredCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          System administration and platform information
        </p>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as Tab)} />

      {tab === 'system' && overview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Node Version</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{overview.runtime.nodeVersion}</div>
              <div className="text-[11px] text-slate-400 mt-1">{overview.runtime.platform}</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Uptime</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{formatUptime(overview.runtime.uptimeSeconds)}</div>
              <div className="text-[11px] text-slate-400 mt-1">{overview.runtime.environment}</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Memory</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{overview.runtime.memoryMb} MB</div>
              <div className="text-[11px] text-slate-400 mt-1">Resident set size</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total DB Rows</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{overview.database.totalRows.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-slate-400 mt-1">{overview.database.latencyMs} ms to count</div>
            </Card>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">{integrations.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Available integrations</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Configured</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-500">{configuredCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Ready to use</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Required</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-amber-500">{requiredCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Need configuration</div>
            </Card>
            <Card>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coverage</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {integrations.length > 0 ? Math.round((configuredCount / integrations.length) * 100) + '%' : '\u2014'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Configured ratio</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((i) => (
              <button
                key={i.code}
                onClick={() => setOpenIntegration(i)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft p-5 hover:border-brand-500 transition"
              >
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
              </button>
            ))}
          </div>

          {openIntegration && (
            <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenIntegration(null)}>
              <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold">{openIntegration.name}</div>
                  <button onClick={() => setOpenIntegration(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4 text-sm">
                  <Badge tone={openIntegration.status === 'CONFIGURED' ? 'success' : 'warn'}>
                    {openIntegration.status === 'CONFIGURED' ? 'Connected' : 'Integration Required'}
                  </Badge>
                  <p className="text-slate-600 dark:text-slate-300">{openIntegration.description}</p>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Configure with</div>
                    <div className="text-xs font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 rounded px-3 py-2 break-all">
                      {openIntegration.envVar}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Set this environment variable in <code className="font-mono">backend/.env</code> and restart the
                    backend. The integration will then activate and the status will change to <strong>Connected</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      
      {tab === 'appearance' && (
        <AppearancePanel />
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
                    <span className="font-medium ml-auto">PostgreSQL</span>
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
