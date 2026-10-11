import { useEffect, useState } from 'react';
import { X, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import { SkeletonTable } from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';
import { payrollService } from '../../services/payrollService';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

interface Props {
  employeeCode: string | null;
  employeeName: string | null;
  onClose: () => void;
}

interface HistoryRow {
  payrollCode: string;
  month: number;
  year: number;
  grossSalary: number;
  tax: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate: string | null;
  paymentMethod: string | null;
}

export default function EmployeePayrollModal({ employeeCode, employeeName, onClose }: Props) {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeCode) return;
    setLoading(true);
    setError(null);
    payrollService
      .employeeHistory(employeeCode, 24)
      .then((data: any) => {
        // Enforce latest-first ordering regardless of what API returns
        const sorted = [...data].sort((a: any, b: any) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setRows(sorted);
      })
      .catch((e: any) => setError(e?.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [employeeCode]);

  if (!employeeCode) return null;

  const chartData = [...rows].reverse().map((r) => ({
    label: MONTHS[r.month - 1] + " '" + String(r.year).slice(2),
    gross: r.grossSalary,
    net: r.netSalary,
  }));

  const latest = rows[0];
  const totalNet = rows.reduce((s, r) => s + r.netSalary, 0);
  const avgNet = rows.length ? totalNet / rows.length : 0;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 grid place-items-center shrink-0">
              <Wallet size={18} className="text-brand-500" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{employeeName || 'Employee'}</div>
              <div className="text-xs text-slate-500 font-mono">{employeeCode}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <SkeletonTable rows={6} />
          ) : error ? (
            <ErrorState message={error} />
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">No payroll history found.</div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500">Latest Net</div>
                  <div className="text-lg font-semibold mt-1">
                    {latest ? formatINR(latest.netSalary) : '\u2014'}
                  </div>
                  {latest && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {MONTHS[latest.month - 1]} {latest.year}
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500">Avg Net</div>
                  <div className="text-lg font-semibold mt-1">{formatINR(avgNet)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">over {rows.length} periods</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500">Total Net</div>
                  <div className="text-lg font-semibold mt-1">{formatINR(totalNet)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">24-month window</div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="text-xs text-slate-500">Paid</div>
                  <div className="text-lg font-semibold mt-1">
                    {rows.filter((r) => r.status === 'PAID').length} / {rows.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">payments cleared</div>
                </div>
              </div>

              {/* Trend */}
              {chartData.length > 1 && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">Net pay trend (oldest → latest)</div>
                  <div className="h-48">
                    <ResponsiveContainer>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#33415533" />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatINR} />
                        <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* History table — newest first */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Period</th>
                      <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Gross</th>
                      <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Tax</th>
                      <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Deductions</th>
                      <th className="text-right px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Net</th>
                      <th className="text-left px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {rows.map((r) => (
                      <tr key={r.payrollCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium">{MONTHS[r.month - 1]} {r.year}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-xs">{formatINR(r.grossSalary)}</td>
                        <td className="px-3 py-2 text-right text-xs text-rose-500">-{formatINR(r.tax)}</td>
                        <td className="px-3 py-2 text-right text-xs text-rose-500">-{formatINR(r.deductions)}</td>
                        <td className="px-3 py-2 text-right text-xs font-medium">{formatINR(r.netSalary)}</td>
                        <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}