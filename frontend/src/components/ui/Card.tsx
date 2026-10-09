import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm',
        padded && 'p-5',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta, hint,
}: { label: string; value: string | number; delta?: string; hint?: string }) {
  return (
    <Card>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      {delta && (
        <div className={clsx('text-xs mt-1', delta.startsWith('+') ? 'text-emerald-500' : delta.startsWith('-') ? 'text-rose-500' : 'text-slate-500')}>
          {delta}
        </div>
      )}
      {hint && <div className="text-[11px] text-slate-400 mt-0.5">{hint}</div>}
    </Card>
  );
}