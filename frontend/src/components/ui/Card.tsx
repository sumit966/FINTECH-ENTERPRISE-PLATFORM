import { ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'default' | 'glass' | 'gradient-border' | 'elevated';

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  variant?: Variant;
  interactive?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  default:
    'glass border border-slate-200/60 dark:border-slate-800/60 shadow-glass',
  glass:
    'glass-strong border border-slate-200/60 dark:border-slate-800/60 shadow-glass',
  'gradient-border':
    'relative glass border border-transparent shadow-glass ' +
    'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] ' +
    'before:bg-gradient-brand before:opacity-[0.14] before:-z-10',
  elevated:
    'glass-strong border border-slate-200/60 dark:border-slate-800/60 shadow-premium',
};

export function Card({ children, className, padded = true, variant = 'default', interactive = false }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-200',
        VARIANT_CLASS[variant],
        padded && 'p-5',
        interactive && 'hover:shadow-glow-soft hover:-translate-y-0.5 cursor-pointer',
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
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label, value, delta, hint, icon, accent = 'brand', onClick,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal';
  onClick?: () => void;
}) {
  const ACCENT: Record<string, string> = {
    brand:   'from-brand-500/15 to-brand-500/0 text-brand-600 dark:text-brand-300',
    emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300',
    amber:   'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300',
    rose:    'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-300',
    violet:  'from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-300',
    teal:    'from-teal-500/15 to-teal-500/0 text-teal-600 dark:text-teal-300',
  };

  const clickableProps = onClick
    ? {
        onClick,
        interactive: true,
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
        },
      }
    : {};

  return (
    <Card {...(clickableProps as any)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight truncate">{value}</div>
          {delta && (
            <div
              className={clsx(
                'text-xs mt-1 font-medium',
                delta.startsWith('+') ? 'text-emerald-500' : delta.startsWith('-') ? 'text-rose-500' : 'text-slate-500'
              )}
            >
              {delta}
            </div>
          )}
          {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
        </div>
        {icon && (
          <div className={clsx('h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br shrink-0', ACCENT[accent])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
