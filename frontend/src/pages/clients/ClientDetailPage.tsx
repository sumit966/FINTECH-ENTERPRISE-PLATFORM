import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import Table, { Column } from '../../components/ui/Table';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { clientService, ClientDetail } from '../../services/clientService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ClientDetailPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [c, setC] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!code) return;
    setLoading(true); setError(null);
    try { setC(await clientService.detail(code)); }
    catch (e: any) { setError(e?.message || 'Failed to load client'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [code]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonTable rows={5} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!c) return <ErrorState message="Client not found" />;

  const projCols: Column<ClientDetail['projects'][0]>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.projectCode}</span> },
    { key: 'name', header: 'Project', render: (r) => <span className="text-sm font-medium">{r.name}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'progress', header: 'Progress', render: (r) => <span className="text-xs">{r.progressPercent}%</span> },
    { key: 'budget', header: 'Budget', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.budget)}</span> },
    { key: 'revenue', header: 'Revenue', className: 'text-right', render: (r) => <span className="text-xs font-medium">{formatINR(r.revenue)}</span> },
  ];

  const invCols: Column<ClientDetail['invoices'][0]>[] = [
    { key: 'num', header: 'Invoice', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'issue', header: 'Issued', render: (r) => <span className="text-xs">{formatDate(r.issueDate)}</span> },
    { key: 'due', header: 'Due', render: (r) => <span className="text-xs">{formatDate(r.dueDate)}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.total)}</span> },
    { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="text-xs">{formatINR(r.paidAmount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <Link to="/clients" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to clients
      </Link>

      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs font-mono text-slate-500 mb-1">{c.clientCode}</div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.companyName}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {c.country} &middot; {c.industry} &middot; {c.billingTerms}
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <StatusBadge status={c.status} />
              <StatusBadge status={c.slaTier} />
              {c.healthScore != null && <Badge tone={c.healthScore >= 4.3 ? 'success' : c.healthScore >= 4.0 ? 'warn' : 'danger'}>Health {c.healthScore.toFixed(2)}</Badge>}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Revenue"
          value={formatINR(c.revenue)}
          hint="Lifetime"
          onClick={() => navigate('/finance?client=' + encodeURIComponent(c.clientCode))}
        />
        <StatCard
          label="Contract Value"
          value={formatINR(c.contractValue)}
          hint={c.contracts.length + ' contracts'}
        />
        <StatCard
          label="Total Invoiced"
          value={formatINR(c.invoiceTotals.totalInvoiced)}
          hint={c.invoiceTotals.invoiceCount + ' invoices'}
          onClick={() => navigate('/finance')}
        />
        <StatCard
          label="Total Paid"
          value={formatINR(c.invoiceTotals.totalPaid)}
          hint={'Outstanding ' + formatINR(c.invoiceTotals.totalInvoiced - c.invoiceTotals.totalPaid)}
          onClick={() => navigate('/finance?status=PAID')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Primary Contacts" subtitle={c.contacts.length + ' contacts'} />
          <div className="space-y-3">
            {c.contacts.length === 0 ? <div className="text-xs text-slate-500">No contacts recorded</div> :
              c.contacts.map((k) => (
                <div key={k.id} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-500 text-white grid place-items-center text-sm font-medium shrink-0">
                    {k.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {k.fullName}
                      {k.isPrimary && <Badge tone="brand">Primary</Badge>}
                    </div>
                    <div className="text-xs text-slate-500">{k.title}</div>
                    <div className="text-xs text-slate-500">{k.email}{k.phone ? ' \u00B7 ' + k.phone : ''}</div>
                  </div>
                </div>
              ))}
          </div>
          {c.accountManager && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Account Manager</div>
              <Link to={'/employees/' + c.accountManager.id} className="text-sm hover:text-brand-500">
                {c.accountManager.fullName} <span className="text-xs text-slate-500">({c.accountManager.employeeCode})</span>
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Contracts" subtitle={c.contracts.length + ' active'} />
          <div className="space-y-3">
            {c.contracts.map((k) => (
              <div key={k.id} className="text-sm">
                <div className="font-mono text-xs text-slate-500">{k.contractCode}</div>
                <div className="font-medium">{k.title}</div>
                <div className="text-xs text-slate-500">
                  {formatDate(k.startDate)} &rarr; {formatDate(k.endDate)} &middot; {k.currency} {(k.value / 100000).toFixed(1)}L
                </div>
                <div className="mt-1"><StatusBadge status={k.status} /></div>
              </div>
            ))}
            {c.contracts.length === 0 && <div className="text-xs text-slate-500">No contracts</div>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Projects" subtitle={c.projects.length + ' projects delivered for this client'} />
        <Table
          columns={projCols}
          data={c.projects}
          rowKey={(r) => r.id}
          emptyMessage="No projects"
          onRowClick={(r) => navigate('/projects/' + encodeURIComponent(r.projectCode))}
        />
      </Card>

      <Card>
        <CardHeader title="Invoices" subtitle={c.invoices.length + ' recent invoices'} />
        <Table
          columns={invCols}
          data={c.invoices}
          rowKey={(r) => r.id}
          emptyMessage="No invoices"
          onRowClick={(r) => navigate('/finance?invoice=' + encodeURIComponent(r.invoiceNumber))}
        />
      </Card>
    </div>
  );
}
