import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Table, { Column } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { useDebounce } from '../../hooks/useDebounce';
import { financeService, InvoiceRow, ExpenseRow, FinanceSummary, RevenueExpensePoint, ExpenseCategoryRow } from '../../services/financeService';

const PIE_COLORS = ['#3358ff','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b','#eab308'];

function formatINR(v: number): string {
  if (Math.abs(v) >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (Math.abs(v) >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}
function formatDate(d: string | null): string {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

type Tab = 'invoices' | 'expenses';

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('invoices');
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [trend, setTrend] = useState<RevenueExpensePoint[]>([]);
  const [breakdown, setBreakdown] = useState<ExpenseCategoryRow[]>([]);

  const [invSearch, setInvSearch] = useState('');
  const [invStatus, setInvStatus] = useState('');
  const [invPage, setInvPage] = useState(1);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [invTotal, setInvTotal] = useState(0);
  const [invTotalPages, setInvTotalPages] = useState(1);

  const [expSearch, setExpSearch] = useState('');
  const [expCategory, setExpCategory] = useState('');
  const [expPage, setExpPage] = useState(1);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [expTotal, setExpTotal] = useState(0);
  const [expTotalPages, setExpTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invSearchDeb = useDebounce(invSearch, 350);
  const expSearchDeb = useDebounce(expSearch, 350);

  useEffect(() => {
    financeService.summary().then(setSummary).catch(() => {});
    financeService.revenueVsExpenses(12).then(setTrend).catch(() => {});
    financeService.expenseBreakdown().then(setBreakdown).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    financeService.invoices({ page: invPage, pageSize: 20, search: invSearchDeb || undefined, status: invStatus || undefined })
      .then((r) => { if (cancelled) return; setInvoices(r.items); setInvTotal(r.total); setInvTotalPages(r.totalPages); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load invoices'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [invPage, invSearchDeb, invStatus]);

  useEffect(() => {
    let cancelled = false;
    financeService.expenses({ page: expPage, pageSize: 20, search: expSearchDeb || undefined, category: expCategory || undefined })
      .then((r) => { if (cancelled) return; setExpenses(r.items); setExpTotal(r.total); setExpTotalPages(r.totalPages); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [expPage, expSearchDeb, expCategory]);

  useEffect(() => { setInvPage(1); }, [invSearchDeb, invStatus]);
  useEffect(() => { setExpPage(1); }, [expSearchDeb, expCategory]);

  const invCols: Column<InvoiceRow>[] = [
    { key: 'num', header: 'Invoice', render: (r) => <span className="font-mono text-[11px]">{r.invoiceNumber}</span> },
    { key: 'client', header: 'Client', render: (r) => (
      <div>
        <Link to={'/clients/' + r.clientCode} className="text-sm font-medium hover:text-brand-500">{r.clientName}</Link>
        <div className="text-[11px] text-slate-500">{r.clientCountry}</div>
      </div>
    ) },
    { key: 'project', header: 'Project', render: (r) => r.projectName ? <Link to={'/projects/' + r.projectCode} className="text-xs hover:text-brand-500">{r.projectName}</Link> : <span className="text-xs text-slate-500">&mdash;</span> },
    { key: 'issued', header: 'Issued', render: (r) => <span className="text-xs">{formatDate(r.issueDate)}</span> },
    { key: 'due', header: 'Due', render: (r) => <span className="text-xs">{formatDate(r.dueDate)}</span> },
    { key: 'total', header: 'Total', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {(r.total/100000).toFixed(2)}L</span> },
    { key: 'paid', header: 'Paid', className: 'text-right', render: (r) => <span className="text-xs">{r.currency} {(r.paidAmount/100000).toFixed(2)}L</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const expCols: Column<ExpenseRow>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.expenseCode}</span> },
    { key: 'desc', header: 'Description', render: (r) => <span className="text-sm">{r.description}</span> },
    { key: 'cat', header: 'Category', render: (r) => <span className="text-xs">{r.category}</span> },
    { key: 'amount', header: 'Amount', className: 'text-right', render: (r) => <span className="text-xs font-medium">{r.currency} {(r.amount/100000).toFixed(2)}L</span> },
    { key: 'date', header: 'Incurred', render: (r) => <span className="text-xs">{formatDate(r.incurredAt)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const ageing = summary?.ageing;
  const totalAgeing = ageing ? ageing.current + ageing.d30 + ageing.d60 + ageing.d90 + ageing.d90plus : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Invoices, expenses, P&amp;L and cash cycle &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Invoiced" value={formatINR(summary.totalInvoiced)} hint={summary.totalInvoiceCount + ' invoices'} />
          <StatCard label="Total Paid" value={formatINR(summary.totalPaid)} hint={formatINR(summary.outstanding) + ' outstanding'} />
          <StatCard label="Overdue" value={formatINR(summary.overdueAmount)} hint={summary.overdueCount + ' overdue invoices'} />
          <StatCard label="Project Profit" value={formatINR(summary.projectProfit)} hint={summary.profitMargin.toFixed(1) + '% margin'} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Revenue vs Expenses" subtitle="Last 12 months" />
          {trend.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatINR(v)} />
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4,4,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Expense Breakdown" subtitle="By category" />
          {breakdown.length === 0 ? <SkeletonTable rows={4} /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={breakdown} dataKey="total" nameKey="category" outerRadius={70} label={(e) => e.category} labelLine={false}>
                    {breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {ageing && (
        <Card>
          <CardHeader title="Invoice Ageing" subtitle="Outstanding receivables by age bucket" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Current', value: ageing.current, color: 'bg-emerald-500' },
              { label: '1-30 days', value: ageing.d30, color: 'bg-amber-500' },
              { label: '31-60 days', value: ageing.d60, color: 'bg-orange-500' },
              { label: '61-90 days', value: ageing.d90, color: 'bg-rose-500' },
              { label: '90+ days', value: ageing.d90plus, color: 'bg-red-700' },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className="text-xs text-slate-500 mb-2">{b.label}</div>
                <div className="text-lg font-semibold mb-2">{formatINR(b.value)}</div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className={b.color} style={{ width: (b.value / totalAgeing * 100) + '%', height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setTab('invoices')} className={'px-4 py-2 text-sm font-medium border-b-2 ' + (tab === 'invoices' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>Invoices</button>
        <button onClick={() => setTab('expenses')} className={'px-4 py-2 text-sm font-medium border-b-2 ' + (tab === 'expenses' ? 'border-brand-500 text-brand-500' : 'border-transparent text-slate-500')}>Expenses</button>
      </div>

      {tab === 'invoices' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={invSearch} onChange={(e) => setInvSearch(e.target.value)} placeholder="Search invoice or client" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={invStatus} onChange={(e) => setInvStatus(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </Card>
          {error ? <ErrorState message={error} onRetry={() => setInvPage((p) => p)} /> :
           loading ? <SkeletonTable rows={10} /> :
           <Card padded={false}><Table columns={invCols} data={invoices} rowKey={(r) => r.id} emptyMessage="No invoices" /></Card>}
          {invTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(invPage - 1) * 20 + 1}-{Math.min(invPage * 20, invTotal)} of {invTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={invPage <= 1} onClick={() => setInvPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {invPage} of {invTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={invPage >= invTotalPages} onClick={() => setInvPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'expenses' && (
        <>
          <Card padded={false} className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={expSearch} onChange={(e) => setExpSearch(e.target.value)} placeholder="Search expense code or description" className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" />
              </div>
              <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-2 text-sm">
                <option value="">All categories</option>
                {breakdown.map((b) => <option key={b.category} value={b.category}>{b.category}</option>)}
              </select>
            </div>
          </Card>
          <Card padded={false}><Table columns={expCols} data={expenses} rowKey={(r) => r.id} emptyMessage="No expenses" /></Card>
          {expTotal > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Showing {(expPage - 1) * 20 + 1}-{Math.min(expPage * 20, expTotal)} of {expTotal}</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled={expPage <= 1} onClick={() => setExpPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</Button>
                <span className="text-xs text-slate-500">Page {expPage} of {expTotalPages}</span>
                <Button variant="ghost" size="sm" disabled={expPage >= expTotalPages} onClick={() => setExpPage((p) => p + 1)}>Next <ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}