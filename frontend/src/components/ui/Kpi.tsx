import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import { Card } from './Card';

interface KpiProps {
  onClick?: () => void;
label: string;
  value: number;
  format?: (n: number) => string;
  hint?: string;
  delta?: string;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal';
  animate?: boolean;
}

const ACCENT_BG: Record<string, string> = {
  brand:   'from-brand-500/15 to-brand-500/0 text-brand-600 dark:text-brand-300',
  emerald: 'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-300',
  amber:   'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-300',
  rose:    'from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-300',
  violet:  'from-violet-500/15 to-violet-500/0 text-violet-600 dark:text-violet-300',
  teal:    'from-teal-500/15 to-teal-500/0 text-teal-600 dark:text-teal-300',
};

// Gentle ease-out count-up animation. Respects prefers-reduced-motion.
function useCountUp(target: number, durationMs = 800, enabled = true): number {
  const [value, setValue] = useState(enabled ? 0 : target);
  const startRef = useRef<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!enabled || reduced) { setValue(target); return; }
    let raf = 0;
    startRef.current = null;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled, reduced]);

  return value;
}

export default function Kpi({label, value, format, hint, delta, icon, accent = 'brand', animate = true, onClick }: KpiProps) {
  const displayed = useCountUp(value, 800, animate);
  const text = format ? format(displayed) : Math.round(displayed).toLocaleString('en-IN');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card {...(onClick ? { onClick, interactive: true, role: "button", tabIndex: 0, onKeyDown: (e: any) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } } : {})}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight truncate">{text}</div>
            {delta && (
              <div className={clsx(
                'text-xs mt-1 font-medium',
                delta.startsWith('+') ? 'text-emerald-500' : delta.startsWith('-') ? 'text-rose-500' : 'text-slate-500'
              )}>
                {delta}
              </div>
            )}
            {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
          </div>
          {icon && (
            <div className={clsx('h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br shrink-0', ACCENT_BG[accent])}>
              {icon}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}