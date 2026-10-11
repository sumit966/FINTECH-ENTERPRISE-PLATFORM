import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Clock, FileText, XCircle, DollarSign } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { fundingService, FundingDetail } from '../../services/fundingService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function FundingDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<FundingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fundingService.detail(code)
      .then(setData)
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="Not found" />;

  const stages = ['RECORDED', 'VERIFIED', 'APPROVED', 'DISBURSED', 'RECEIVED'];
  const currentIdx = stages.indexOf(data.status);
  const isRejected = data.status === 'REJECTED';

  // Timeline entries only for events we actually have timestamps for
  const timeline: { label: string; at: string | null; done: boolean }[] = [
    { label: 'Recorded', at: data.recordedAt, done: true },
    { label: 'Verified', at: data.verifiedAt, done: !!data.verifiedAt },
    { label: 'Approved', at: data.approvedAt, done: !!data.approvedAt },
    { label: 'First disbursement', at: data.disbursements.find((d) => d.receivedAt)?.receivedAt || null, done: data.disbursements.some((d) => d.receivedAt) },
  ];

  return (
    <div className="space-y-5">
      <Link to="/funding" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to funding
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="text-xs font-mono text-slate-500">{data.fundingCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">{data.source}</h1>
            <div className="text-sm text-slate-500 mt-1">{data.country} &middot; {data.sourceType} &middot; {data.fundingType}</div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={data.status} />
              <Badge tone="neutral">Recorded {formatDate(data.recordedAt)}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Amount</div>
            <div className="text-3xl font-semibold mt-1">{formatINR(data.amount)}</div>
            <div className="text-xs text-slate-500">{data.currency}</div>
          </div>
        </div>
        {data.notes && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic">
            {data.notes}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total Amount" value={data.amount} format={formatINR} accent="brand" />
        <Kpi label="Planned" value={data.totalPlanned} format={formatINR} hint={data.disbursements.length + ' tranches'} accent="violet" />
        <Kpi label="Received" value={data.totalDisbursed} format={formatINR} accent="emerald" />
        <Kpi label="Pending" value={data.pending} format={formatINR} accent="amber" />
      </div>

      {/* Status pipeline */}
      <Card>
        <CardHeader title="Status Pipeline" subtitle="Recorded &rarr; Verified &rarr; Approved &rarr; Disbursed &rarr; Received" />
        <div className="flex items-center gap-2 flex-wrap">
          {stages.map((st, i) => {
            const done = i <= currentIdx && currentIdx >= 0 && !isRejected;
            return (
              <div key={st} className="flex items-center gap-2">
                <div className={'flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ' + (done ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'border-slate-200 dark:border-slate-800 text-slate-400')}>
                  {done ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {st}
                </div>
                {i < stages.length - 1 && <span className="text-slate-300 dark:text-slate-700">&rarr;</span>}
              </div>
            );
          })}
        </div>
        {isRejected && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <XCircle size={14} /> This record was rejected and did not advance through the pipeline.
          </div>
        )}
        <div className="mt-3 text-[11px] text-slate-500">
          Only stages with recorded timestamps are shown as complete. Funding is not treated as revenue or available cash.
        </div>
      </Card>

      {/* Audit timeline */}
      <Card>
        <CardHeader title="Audit Timeline" subtitle="Timestamped events for this record" />
        <div className="space-y-3">
          {timeline.map((t) => (
            <div key={t.label} className="flex items-start gap-3">
              <div className={'mt-1 h-2.5 w-2.5 rounded-full shrink-0 ' + (t.done ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700')} />
              <div className="flex-1 flex items-center justify-between gap-3">
                <span className={'text-sm ' + (t.done ? 'font-medium' : 'text-slate-400')}>{t.label}</span>
                <span className={'text-xs ' + (t.done ? 'text-slate-500' : 'text-slate-400')}>{t.done ? formatDate(t.at) : 'Not yet'}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Disbursements */}
      <Card>
        <CardHeader title="Disbursement Schedule" subtitle={data.disbursements.length + ' tranches'} />
        {data.disbursements.length === 0 ? (
          <div className="text-xs text-slate-500">No disbursement schedule recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {data.disbursements.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium">{formatINR(d.amount)}</div>
                    <div className="text-xs text-slate-500">
                      Expected {formatDate(d.expectedDate)}
                      {d.receivedAt && ' \u00B7 Received ' + formatDate(d.receivedAt)}
                      {d.reference && ' \u00B7 Ref ' + d.reference}
                    </div>
                  </div>
                </div>
                {d.receivedAt ? <Badge tone="success">Received</Badge> : <Badge tone="warn">Pending</Badge>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Utilization ledger — honest "not yet implemented" state since API has no utilization endpoint */}
      <Card>
        <CardHeader title="Utilization Ledger" subtitle="Where the funds were allocated and spent" />
        <div className="flex items-start gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-600 dark:text-slate-300">
          <DollarSign size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <div>
            <strong>Utilization ledger not yet configured.</strong> No allocation or expense records have been linked to
            this funding record. To display utilization, add a <code className="font-mono">FundingAllocation</code>
            model and a <code className="font-mono">GET /api/funding/:code/utilization</code> route, then re-render this section.
            Until then, the total amount, planned tranches, received amount, and pending amount are the authoritative figures.
          </div>
        </div>
      </Card>

      {/* Supporting documents */}
      <Card>
        <CardHeader title="Supporting Documents" subtitle={data.documents.length + ' on file'} />
        {data.documents.length === 0 ? (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <div>
              <strong>No supporting documentation on file.</strong> This record remains in <strong>RECORDED</strong> status.
              It will not advance to VERIFIED until evidence is uploaded and reviewed.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {data.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm">
                <FileText size={14} className="text-slate-400" />
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline truncate flex-1">
                  {d.title}
                </a>
                <Badge tone="neutral">{d.category}</Badge>
                {d.verifiedAt && <Badge tone="success">Verified {formatDate(d.verifiedAt)}</Badge>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
