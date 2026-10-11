import { useState } from 'react';
import { AlertCircle, Activity, Cpu, HardDrive, Server, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Tabs from '../ui/Tabs';
import type { ProjectDetail } from '../../services/projectService';

interface Props { project: ProjectDetail; }

type TabKey = 'cpu' | 'memory' | 'gpu' | 'api';

// Deterministic simulated time series. Same seed → same values.
function makeSeries(seed: number, base: number, jitter: number, points = 30) {
  const out: { t: string; value: number }[] = [];
  for (let i = 0; i < points; i++) {
    const v = base + Math.sin((i + seed) * 0.4) * jitter + ((i * seed) % 7) * 0.5;
    out.push({ t: '-' + (points - i) + 'm', value: Math.max(0, Math.round(v)) });
  }
  return out;
}

function deriveSeed(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return h % 1000;
}

export default function ProjectMonitoringTab({ project }: Props) {
  const hasAI = project.techAI.length > 0;
  const seed = deriveSeed(project.projectCode);
  const [tab, setTab] = useState<TabKey>('cpu');

  // Simulated values — clearly labelled on screen
  const cpuUsage = 35 + (seed % 30);
  const cpuCores = 4 + (seed % 12);
  const memUsage = 45 + (seed % 25);
  const memTotal = 16 + (seed % 48);
  const gpuUsage = hasAI ? 55 + (seed % 35) : 0;
  const gpuMem = hasAI ? 40 + (seed % 40) : 0;
  const gpuTemp = hasAI ? 62 + (seed % 15) : 0;
  const gpuModel = hasAI ? (seed % 2 === 0 ? 'NVIDIA A100 40GB' : 'NVIDIA L4 24GB') : 'No GPU provisioned';

  const cpuSeries = makeSeries(seed, cpuUsage, 8);
  const memSeries = makeSeries(seed + 1, memUsage, 6);
  const gpuSeries = hasAI ? makeSeries(seed + 2, gpuUsage, 12) : [];
  const apiLatency = makeSeries(seed + 3, 120, 30);
  const throughput = makeSeries(seed + 4, 850, 120);

  const tabs = [
    { key: 'cpu' as TabKey,    label: 'CPU' },
    { key: 'memory' as TabKey, label: 'Memory' },
    ...(hasAI ? [{ key: 'gpu' as TabKey, label: 'GPU' }] : []),
    { key: 'api' as TabKey,    label: 'API & Infrastructure' },
  ];

  return (
    <div className="space-y-5">
      {/* Honest banner */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Simulated Monitoring Data.</strong> No monitoring agent is connected to this environment.
            Values below are deterministic simulations derived from the project code. To display real metrics,
            integrate one of: <em>Prometheus</em>, <em>Grafana</em>, <em>OpenTelemetry</em>, <em>AWS CloudWatch</em>,{' '}
            <em>Azure Monitor</em>, <em>Google Cloud Monitoring</em>, or <em>NVIDIA DCGM</em> for GPU telemetry.
            The integration architecture is described at the bottom of this tab.
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* CPU */}
      {tab === 'cpu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="CPU Utilisation" subtitle="Simulated · 30-minute window" />
            <div className="text-3xl font-semibold">{cpuUsage}%</div>
            <div className="text-xs text-slate-500 mt-1">{cpuCores} vCPU allocated</div>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title="CPU Over Time" subtitle="Last 30 minutes" />
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={cpuSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => v + '%'} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#3358ff" fill="#3358ff33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Memory */}
      {tab === 'memory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Memory Utilisation" subtitle="Simulated" />
            <div className="text-3xl font-semibold">{memUsage}%</div>
            <div className="text-xs text-slate-500 mt-1">{memTotal} GB provisioned</div>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title="Memory Over Time" subtitle="Last 30 minutes" />
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={memSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => v + '%'} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* GPU */}
      {tab === 'gpu' && hasAI && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card>
              <CardHeader title="GPU Utilisation" subtitle="Simulated" />
              <div className="text-2xl font-semibold">{gpuUsage}%</div>
            </Card>
            <Card>
              <CardHeader title="GPU Memory" subtitle="Simulated" />
              <div className="text-2xl font-semibold">{gpuMem}%</div>
            </Card>
            <Card>
              <CardHeader title="Temperature" subtitle="Simulated" />
              <div className="text-2xl font-semibold">{gpuTemp}\u00B0C</div>
            </Card>
            <Card>
              <CardHeader title="Model" subtitle="Assigned accelerator" />
              <div className="text-sm font-medium">{gpuModel}</div>
            </Card>
          </div>
          <Card>
            <CardHeader title="GPU Over Time" subtitle="Last 30 minutes" />
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={gpuSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => v + '%'} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* API */}
      {tab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="API Latency" subtitle="Simulated · milliseconds" />
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={apiLatency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v + 'ms'} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#f59e0b" fill="#f59e0b33" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="Request Throughput" subtitle="Simulated · requests per minute" />
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={throughput}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => v + ' rpm'} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="#14b8a633" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Integration Architecture — always visible */}
      <Card>
        <CardHeader title="Integration Architecture" subtitle="How to connect real telemetry" />
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p className="text-xs">
            To replace the simulated values above with real metrics, wire one or more of the following providers into the backend:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Prometheus', desc: 'Scrape /metrics endpoints; query via PromQL. Ideal for Kubernetes + container workloads.' },
              { name: 'Grafana', desc: 'Embed Grafana panels via iframe, or fetch dashboard JSON via Grafana HTTP API.' },
              { name: 'OpenTelemetry', desc: 'Emit OTLP traces + metrics from your services to a collector (Tempo, Jaeger, Datadog).' },
              { name: 'AWS CloudWatch', desc: 'Fetch CloudWatch Metrics with GetMetricData. Requires IAM role with CloudWatch read scope.' },
              { name: 'Azure Monitor', desc: 'Query Azure Monitor Metrics API. Requires AAD service principal with Monitoring Reader role.' },
              { name: 'Google Cloud Monitoring', desc: 'Use the Monitoring API v3 with a service account scoped to monitoring.viewer.' },
              { name: 'NVIDIA DCGM Exporter', desc: 'For GPU telemetry — exposes nvidia_gpu_* metrics compatible with Prometheus.' },
            ].map((p) => (
              <div key={p.name} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                <div className="font-medium text-sm flex items-center gap-2">
                  <Server size={14} className="text-brand-500" />
                  {p.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">{p.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            The backend would expose a <code className="font-mono">GET /api/projects/:code/metrics</code> route that aggregates from the chosen provider. Environment credentials are configured in <code className="font-mono">backend/.env</code> — the platform never ships with provider credentials pre-set.
          </p>
        </div>
      </Card>
    </div>
  );
}