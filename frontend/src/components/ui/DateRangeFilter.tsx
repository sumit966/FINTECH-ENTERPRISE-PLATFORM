import { X } from 'lucide-react';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  label?: string;
}

export default function DateRangeFilter({ from, to, onFromChange, onToChange, label }: DateRangeFilterProps) {
  const hasValue = from || to;
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>}
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        title="From date"
      />
      <span className="text-xs text-slate-400">→</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        title="To date"
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => { onFromChange(''); onToChange(''); }}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Clear date range"
        >
          <X size={14} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}