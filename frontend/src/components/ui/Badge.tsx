import { ReactNode } from 'react';
import clsx from 'clsx';

type Tone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger' | 'info';

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  brand:   'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300',
  warn:    'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  danger:  'bg-rose-500/10 text-rose-600 dark:text-rose-300',
  info:    'bg-sky-500/10 text-sky-600 dark:text-sky-300',
};

export default function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', TONE_CLASS[tone])}>
      {children}
    </span>
  );
}