import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Power, CheckCircle2, XCircle, ListChecks, PowerOff, Activity, AlertCircle, X, Zap, Clock, Code } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { automationService, AutomationRule, AutomationRunLog } from '../../services/automationService';

function fmtDateTime(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function AutomationPage() {
  const { push } = useNotifications();
  const [params, setParams] = useSearchParams();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationRunLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [openRule, setOpenRule] = useState<AutomationRule | null>(null);

  const ruleFilterFromUrl = params.get('rule') || '';

  const load = () => {
    setLoading(true);
    Promise.all([automationService.rules(), automationService.logs(50)])
      .then(([r, l]) => { setRules(r); setLogs(l); })
      .catch((e) => setError(e?.message || 'Failed'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setUrl = (patch: Record<string, string | null>) => {
    const np = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') np.delete(k);
      else np.set(k, String(v));
    }
    setParams(np, { replace: true });
  };

  const toggle = async (id: string, current: boolean) => {
    setBusy(id);
    try {
      await automationService.toggle(id, !current);
      push({ variant: 'success', title: 'Rule updated' });
      load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed', body: e?.message });
    } finally { setBusy(null); }
  };

  const simulate = async (code: string) => {
    setBusy(code);
    try {
      await automationService.simulate(code);
      push({ variant: 'success', title: 'Simulated', body: code + ' \u2014 no side effects executed' });
      load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Failed', body: e?.message });
    } finally { setBusy(null); }
  };

  const enabled = rules.filter((r) => r.isEnabled).length;
  const disabled = rules.length - enabled;
  const successRuns = logs.filter((l) => l.status === 'SUCCESS').length;

  const filteredLogs = ruleFilterFromUrl ? logs.filter((l) => l.ruleCode === ruleFilterFromUrl) : logs;

  return (
    <div className="space-y-5">
      <PageHeader title="Automation" subtitle="Deterministic rules with run history \u2014 simulations do not execute side effects" />

      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Simulation only.</strong> Clicking <em>Simulate</em> writes a run log entry and marks the rule's last status. It does not
            send emails, trigger notifications, alter data, or execute any action listed in the rule. To enable real execution, wire each rule's
            action to a real executor endpoint with per-action authorization and audit trails.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total Rules" value={rules.length} hint={enabled + ' enabled \u00B7 ' + disabled + ' disabled'}
          icon={<ListChecks size={18} />} accent="brand"
          onClick={() => setUrl({ rule: null })} />
        <Kpi label="Enabled" value={enabled} hint="Currently active"
          icon={<Power size={18} />} accent="emerald" />
        <Kpi label="Disabled" value={disabled} hint="Turned off"
          icon={<PowerOff size={18} />} accent="amber" />
        <Kpi label="Recent Runs" value={logs.length} hint={successRuns + ' successful'}
          icon={<Activity size={18} />} accent="violet"
          onClick={() => setUrl({ rule: null })} />
      </div>

      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <SkeletonTable rows={6} /> : (
        <Card>
          <CardHeader title="Rules" subtitle={rules.length + ' defined \u00B7 click a rule for details'} />
          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-800 p-3 hover:border-brand-500/40 transition cursor-pointer"
                onClick={() => setOpenRule(r)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-slate-500">{r.code}</span>
                    <Badge tone={r.trigger === 'EVENT' ? 'info' : 'neutral'}>{r.trigger}</Badge>
                    <Badge tone={r.isEnabled ? 'success' : 'neutral'}>{r.isEnabled ? 'Enabled' : 'Disabled'}</Badge>
                    {r.lastStatus && <Badge tone={r.lastStatus === 'SUCCESS' ? 'success' : 'danger'}>Last: {r.lastStatus}</Badge>}
                  </div>
                  <div className="font-medium text-sm mt-1">{r.name}</div>
                  {r.description && <div className="text-xs text-slate-500 mt-0.5">{r.description}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => simulate(r.code)} loading={busy === r.code}>
                    <Play size={12} /> Simulate
                  </Button>
                  <Button size="sm" variant={r.isEnabled ? 'secondary' : 'gradient'} onClick={() => toggle(r.id, r.isEnabled)} loading={busy === r.id}>
                    <Power size={12} /> {r.isEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader
            title="Recent Runs"
            subtitle={filteredLogs.length + ' of ' + logs.length + ' shown'}
          />
          {ruleFilterFromUrl && (
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-slate-500">Filtered by rule:</span>
              <Badge tone="brand">{ruleFilterFromUrl}</Badge>
              <button onClick={() => setUrl({ rule: null })} className="text-brand-500 hover:underline ml-2">Clear</button>
            </div>
          )}
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filteredLogs.map((l) => (
              <button
                key={l.id}
                onClick={() => setUrl({ rule: l.ruleCode })}
                className="w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-left"
              >
                {l.status === 'SUCCESS' ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> : <XCircle size={12} className="text-rose-500 shrink-0" />}
                <span className="font-mono text-slate-500">{l.ruleCode}</span>
                <span className="text-slate-400">{new Date(l.startedAt).toLocaleString('en-IN')}</span>
                <span className="text-slate-500 ml-auto truncate max-w-md">{l.message}</span>
              </button>
            ))}
            {filteredLogs.length === 0 && <div className="text-xs text-slate-500">No runs for this rule yet.</div>}
          </div>
        </Card>
      )}

      {openRule && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenRule(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-brand-500" />
                <span className="font-mono text-sm">{openRule.code}</span>
                <Badge tone={openRule.isEnabled ? 'success' : 'neutral'}>{openRule.isEnabled ? 'Enabled' : 'Disabled'}</Badge>
              </div>
              <button onClick={() => setOpenRule(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="text-lg font-semibold">{openRule.name}</div>
              {openRule.description && <div className="text-slate-600 dark:text-slate-300">{openRule.description}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Trigger</div>
                  <Badge tone={openRule.trigger === 'EVENT' ? 'info' : 'neutral'}>{openRule.trigger}</Badge>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Action</div>
                  <Badge tone="brand">{openRule.action}</Badge>
                </div>
                {openRule.triggerExpr && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Trigger expression</div>
                    <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded">{openRule.triggerExpr}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Last run</div>
                  <div>{fmtDateTime(openRule.lastRunAt)}</div>
                </div>
                {openRule.lastStatus && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Last status</div>
                    <Badge tone={openRule.lastStatus === 'SUCCESS' ? 'success' : 'danger'}>{openRule.lastStatus}</Badge>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <Button size="sm" onClick={() => { simulate(openRule.code); }} loading={busy === openRule.code}>
                  <Play size={12} /> Simulate
                </Button>
                <Button size="sm" variant={openRule.isEnabled ? 'secondary' : 'gradient'} onClick={() => toggle(openRule.id, openRule.isEnabled)} loading={busy === openRule.id}>
                  <Power size={12} /> {openRule.isEnabled ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setOpenRule(null); setUrl({ rule: openRule.code }); }}>
                  <Clock size={12} /> View runs
                </Button>
              </div>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-500">
                <Code size={12} className="inline mr-1" />
                Simulation writes a log entry only. No emails, notifications, or side effects are executed.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
