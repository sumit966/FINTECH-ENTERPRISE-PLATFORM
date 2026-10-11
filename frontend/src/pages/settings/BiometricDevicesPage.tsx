import { useEffect, useState } from 'react';
import { AlertCircle, Plus, CheckCircle2, XCircle, Cpu } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { biometricService, BiometricDevice, BiometricSummary } from '../../services/biometricService';

export default function BiometricDevicesPage() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [summary, setSummary] = useState<BiometricSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ deviceCode: '', name: '', vendor: '', model: '', locationCode: 'PUNE', ipAddress: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([biometricService.list(), biometricService.summary()])
      .then(([d, s]) => { setDevices(d); setSummary(s); })
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await biometricService.create(form);
      setForm({ deviceCode: '', name: '', vendor: '', model: '', locationCode: 'PUNE', ipAddress: '' });
      setShowForm(false);
      load();
    } catch (e) { /* ignore */ } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Biometric Devices"
        subtitle="Device registry and integration readiness"
        actions={<Button size="sm" variant="gradient" onClick={() => setShowForm((s) => !s)}><Plus size={14} /> Register Device</Button>}
      />

      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Integration Required.</strong> No biometric device is physically connected. This page registers devices
            and displays their configuration state. No raw biometric data (fingerprint, face) is stored. To activate a device,
            configure the vendor API credentials in <code className="font-mono">backend/.env</code> and set the device status to CONNECTED.
          </div>
        </div>
      </Card>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Devices" value={summary.total} icon={<Cpu size={18} />} accent="brand" />
          <Kpi label="Connected" value={summary.connected} icon={<CheckCircle2 size={18} />} accent="emerald" />
          <Kpi label="Integration Required" value={summary.integrationRequired} icon={<AlertCircle size={18} />} accent="amber" />
          <Kpi label="Error" value={summary.error} icon={<XCircle size={18} />} accent="rose" />
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader title="Register Device" subtitle="Metadata only — no biometric data stored" />
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input label="Device Code *" value={form.deviceCode} onChange={(e) => setForm({ ...form, deviceCode: e.target.value })} placeholder="BIO-PUNE-01" required />
            <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Reception Scanner" required />
            <Input label="Vendor *" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} placeholder="ZKTeco" required />
            <Input label="Model *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="SpeedFace-V5L" required />
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Location *</label>
              <select value={form.locationCode} onChange={(e) => setForm({ ...form, locationCode: e.target.value })} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                <option value="PUNE">Pune</option>
                <option value="BLR">Bangalore</option>
                <option value="NOIDA">Noida</option>
              </select>
            </div>
            <Input label="IP Address" value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} placeholder="192.168.1.100" />
            <div className="md:col-span-3 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" loading={submitting}>Register</Button>
            </div>
          </form>
        </Card>
      )}

      {error ? <ErrorState message={error} onRetry={load} /> : loading ? <SkeletonTable rows={4} /> : devices.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-sm text-slate-500">
            No biometric devices registered. Click <strong>Register Device</strong> to add one.
          </div>
        </Card>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">Code</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">Device</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">Location</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">IP</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">Status</th>
                  <th className="text-left px-3 py-2 text-xs uppercase tracking-wider text-slate-500">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-mono text-xs">{d.deviceCode}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-sm">{d.name}</div>
                      <div className="text-[11px] text-slate-500">{d.vendor} · {d.model}</div>
                    </td>
                    <td className="px-3 py-2 text-xs">{d.locationCode}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.ipAddress || '\u2014'}</td>
                    <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                    <td className="px-3 py-2 text-xs">{d.lastSyncAt ? new Date(d.lastSyncAt).toLocaleString('en-IN') : '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}