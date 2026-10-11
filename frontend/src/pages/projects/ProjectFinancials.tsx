import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Wallet, Receipt, Target } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard, SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { financialService, ProjectFinancials as ProjectFinancialsData } from '../../services/financialService';

const COST_COLORS = ['#3358ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function formatINR(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (abs >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

interface Props {
  projectCode: string;
}

export default function ProjectFinancials({ projectCode }: Props) {
  const [data, setData] = useState<ProjectFinancialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      setData(await financialService.getProjectFinancials(projectCode));
    } catch (e: any) {
      setError(e?.message || 'Failed to load financials');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectCode]);

  if (loading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /><SkeletonTable rows={5} /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <ErrorState message="Financials unavailable" />;

  const costBreakdown = [
    { name: 'Employee', value: data.employeeCost },
    { name: 'Cloud', value: data.cloudCost },
    { name: 'Licenses', value: data.licenseCost },
    { name: 'Vendors', value: data.vendorCost },
    { name: 'Other', value: data.otherCost },
  ];

  const budgetVsActual = [
    { label: 'Budget', value: data.approvedBudget },
    { label: 'Actual', value: data.actualExpenditure },
    { label: 'Forecast', value: data.forecastCost },
  ];

  const revenueVsCost = [
    { label: 'Contract Value', value: data.contractValue },
    { label: 'Recognized Revenue', value: data.recognizedRevenue },
    { label: 'Invoiced', value: data.invoicedRevenue },
    { label: 'Collected', value: data.collected },
    { label: 'Total Cost', value: data.totalProjectCost },
    { label: 'Contribution', value: data.projectContribution },
  ];

  const marginColor = data.contributionMargin >= 25 ? 'text-emerald-500'
    : data.contributionMargin >= 10 ? 'text-amber-500' : 'text-rose-500';

  const varianceColor = data.budgetVariance > 0 ? 'text-rose-500' : 'text-emerald-500';

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Contract Value" value={formatINR(data.contractValue)} hint={'Budget ' + formatINR(data.approvedBudget)} />
        <StatCard
          label="Collected Revenue"
          value={formatINR(data.collected)}
          hint={'Invoiced ' + formatINR(data.invoicedRevenue)}
          delta={data.outstanding > 0 ? '-' + formatINR(data.outstanding) + ' outstanding' : undefined}
        />
        <StatCard
          label="Total Cost"
          value={formatINR(data.totalProjectCost)}
          hint={'Forecast ' + formatINR(data.forecastCost)}
          delta={data.budgetVariance > 0 ? '+' + formatINR(data.budgetVariance) + ' over budget' : formatINR(-data.budgetVariance) + ' under budget'}
        />
        <StatCard
          label="Contribution Margin"
          value={data.contributionMargin.toFixed(1) + '%'}
          hint={'Contribution ' + formatINR(data.projectContribution)}
        />
      </div>

      {/* Budget vs Actual + Cost breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Budget vs Actual vs Forecast" subtitle="Where the money went" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  <Cell fill="#3358ff" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Cost Breakdown" subtitle="Where the cost comes from" />
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" outerRadius={80} label={(e: any) => e.name} labelLine={false}>
                  {costBreakdown.map((_, i) => <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Revenue vs Cost + Monthly spend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue vs Cost" subtitle="Full financial ladder" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={revenueVsCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3358ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Monthly Spend" subtitle="Cost run-rate" />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={data.monthlySpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Invoice collection */}
      {data.invoiceCollection.length > 0 && (
        <Card>
          <CardHeader title="Invoice Collection" subtitle="Invoiced vs collected by month" />
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={data.invoiceCollection}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="invoiced" name="Invoiced" stroke="#3358ff" strokeWidth={2} />
                <Line type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Detailed P&L table */}
      <Card>
        <CardHeader title="Profit and Loss" subtitle="Every line computed from stored records" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Line</th>
                <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">% of contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                { label: 'Contract Value', value: data.contractValue, bold: true },
                { label: 'Approved Budget', value: data.approvedBudget },
                { label: 'Recognized Revenue', value: data.recognizedRevenue },
                { label: 'Invoiced Revenue', value: data.invoicedRevenue },
                { label: 'Collected', value: data.collected },
                { label: 'Outstanding Receivables', value: data.outstanding, negative: true },
                { label: '\u2014 Employee Cost', value: -data.employeeCost, sub: true },
                { label: '\u2014 Cloud Cost', value: -data.cloudCost, sub: true },
                { label: '\u2014 License Cost', value: -data.licenseCost, sub: true },
                { label: '\u2014 Vendor Cost', value: -data.vendorCost, sub: true },
                { label: '\u2014 Other Cost', value: -data.otherCost, sub: true },
                { label: 'Total Project Cost', value: -data.totalProjectCost, bold: true },
                { label: 'Project Contribution', value: data.projectContribution, bold: true },
                { label: 'Forecast Cost', value: data.forecastCost },
                { label: 'Estimate to Complete', value: data.estimateToComplete },
                { label: 'Budget Variance', value: data.budgetVariance, warn: true },
              ].map((row, i) => (
                <tr key={i} className={row.bold ? 'bg-slate-50 dark:bg-slate-900/40 font-semibold' : ''}>
                  <td className={'px-3 py-2 ' + (row.sub ? 'pl-8 text-slate-500 text-xs' : '')}>{row.label}</td>
                  <td className={'px-3 py-2 text-right ' + (row.value < 0 ? 'text-rose-500' : row.warn && row.value > 0 ? 'text-rose-500' : row.value > 0 ? 'text-emerald-500' : '')}>
                    {formatINR(Math.abs(row.value))}
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-slate-500">
                    {data.contractValue > 0 ? ((Math.abs(row.value) / data.contractValue) * 100).toFixed(1) + '%' : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Financial health */}
      <Card className={data.contributionMargin >= 20 ? 'border-emerald-500/40 bg-emerald-500/5' : data.contributionMargin >= 5 ? 'border-amber-500/40 bg-amber-500/5' : 'border-rose-500/40 bg-rose-500/5'}>
        <div className="flex items-start gap-3">
          {data.contributionMargin >= 20 ? <TrendingUp size={20} className="text-emerald-500 mt-0.5" />
            : data.contributionMargin >= 5 ? <Target size={20} className="text-amber-500 mt-0.5" />
            : <TrendingDown size={20} className="text-rose-500 mt-0.5" />}
          <div>
            <div className="font-semibold">
              {data.contributionMargin >= 20 ? 'Healthy financial position'
                : data.contributionMargin >= 5 ? 'Marginally profitable'
                : 'Margin under pressure'}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Contribution margin is <strong>{data.contributionMargin.toFixed(1)}%</strong>.
              {data.budgetVariance > 0
                ? ' Project is ' + formatINR(data.budgetVariance) + ' over approved budget.'
                : ' Project is ' + formatINR(-data.budgetVariance) + ' under approved budget.'}
              {' '}Collected {formatINR(data.collected)} of {formatINR(data.invoicedRevenue)} invoiced.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}