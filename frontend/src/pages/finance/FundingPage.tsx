import { useEffect, useState } from 'react';
import ExportButton from '../../components/ui/ExportButton';
import { Link, useSearchParams } from 'react-router-dom';
import { TrendingUp, AlertCircle, CheckCircle2, Clock, IndianRupee, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { fundingService, FundingRecord, FundingSummary } from '../../services/fundingService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

const STATUSES = ['RECORDED', 'VERIFIED', 'APPROVED', 'DISBURSED', 'RECEIVED', 'REJECTED'];

export default function FundingPage() {
  const [params, setParams] = useSearchParams();
  const [records, setRecords] = useState<FundingRecord[]>([]);
  const [summary, setSummary] = useState<FundingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusFilter = params.get('status') || '';
  const typeFilter = params.get('type') || '';
  const countryFilter = params.get('country') || '';

  useEffect(() => {
    Promise.all([fundingService.list(), fundingService.summary()])
      .then(([r, s]) => { setRecords(r); setSummary(s); })
      .catch((e) => setError(e?.message || 'Failed to load funding'))
      .finally(() => setLoading(false));
  }, []);

  const setParam = (key: string, value: string) => {
    const np = new URLSearchParams(params);
    if (value) np.set(key, value); else np.delete(key);
    setParams(np, { replace: true });
  };

  const filtered = records.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (typeFilter && r.fundingType !== typeFilter) return false;
    if (countryFilter && r.country !== countryFilter) return false;
    return true;
  });

  const types = Array.from(new Set(records.map((r) => r.fundingType)));
  const countries = Array.from(new Set(records.map((r) => r.country)));

  const clearFilters = () => setParams(new URLSearchParams(), { replace: true });

  return (
    <div className="space-y-5">
      <PageHeader title="Funding Intelligence" subtitle="Recorded, verified, approved, disbursed, and received funding" />

      <Card className="border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <div>
            <strong>Prototype scope.</strong> Three funding records exist for demonstration. Nothing is marked
            <em> Verified</em> without supporting documentation on file. Government funding does not imply an awarded
            partnership. Funding is tracked separately from project revenue and available cash.
          </div>
        </div>
      </Card>

            <div className="flex justify-end mb-2"><ExportButton rows={records} filename={'export-' + new Date().toISOString().slice(0,10)} /></div>
{summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi
            label="Total Recorded"
            value={summary.total}
            format={formatINR}
            hint={summary.count + ' records'}
            icon={<IndianRupee size={18} />}
            accent="brand"
            onClick={() => clearFilters()}
          />
          <Kpi
            label="Received"
            value={summary.received}
            format={formatINR}
            hint="Cash in bank"
            icon={<CheckCircle2 size={18} />}
            accent="emerald"
            onClick={() => setParam('status', 'RECEIVED')}
          />
          <Kpi
            label="Pending"
            value={summary.pending}
            format={formatINR}
            hint="Not yet received"
            icon={<Clock size={18} />}
            accent="amber"
            onClick={() => setParam('status', 'RECORDED')}
          />
          <Kpi
            label="Sources"
            value={records.length}
            hint="Distinct records"
            icon={<TrendingUp size={18} />}
            accent="violet"
          />
        </div>
      )}

      {/* Status strip — clickable to filter */}
      {summary && (
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Pipeline status</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParam('status', '')}
              className={'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ' +
                (!statusFilter ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
            >
              All <span className="font-semibold">{records.length}</span>
            </button>
            {STATUSES.map((st) => {
              const entry = summary.byStatus.find((s) => s.status === st);
              const count = entry?.count || 0;
              const amount = entry?.amount || 0;
              return (
                <button
                  key={st}
                  onClick={() => setParam('status', statusFilter === st ? '' : st)}
                  className={'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ' +
                    (statusFilter === st ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400')}
                >
                  {st.replace(/_/g, ' ')}
                  <span className="font-semibold">{count}</span>
                  {count > 0 && <span className="text-slate-500">Â· {formatINR(amount)}</span>}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filter chips row */}
      {(statusFilter || typeFilter || countryFilter) && (
        <Card className="py-2">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500">Active filters:</span>
            {statusFilter && <Badge tone="brand">Status: {statusFilter.replace(/_/g, ' ')}</Badge>}
            {typeFilter && <Badge tone="brand">Type: {typeFilter}</Badge>}
            {countryFilter && <Badge tone="brand">Country: {countryFilter}</Badge>}
            <button onClick={clearFilters} className="text-brand-500 hover:underline ml-2 inline-flex items-center gap-1">
              <X size={11} /> Clear
            </button>
          </div>
        </Card>
      )}

      {/* Optional type / country selectors */}
      {(types.length > 1 || countries.length > 1) && (
        <Card padded={false} className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div />
            <select value={typeFilter} onChange={(e) => setParam('type', e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
              <option value="">All funding types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={countryFilter} onChange={(e) => setParam('country', e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
              <option value="">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Card>
      )}

      {error ? <ErrorState message={error} /> : loading ? <SkeletonTable rows={5} /> : (
        <>
          {filtered.length === 0 ? (
            <Card><div className="text-xs text-slate-500">No funding records match the current filters.</div></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <Link key={r.id} to={'/funding/' + r.fundingCode} className="group block">
                  <Card interactive className="h-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-slate-500">{r.fundingCode}</div>
                        <div className="font-medium text-sm mt-1 truncate group-hover:text-brand-500 transition-colors">{r.source}</div>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-semibold tracking-tight">{formatINR(r.amount)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.currency} &middot; {r.fundingType}</div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{r.country} &middot; {r.sourceType}</span>
                      <Badge tone="neutral">{r.status}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
