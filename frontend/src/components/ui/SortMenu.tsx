import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

interface SortMenuProps {
  options: SortOption[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onChange: (by: string, dir: 'asc' | 'desc') => void;
}

export default function SortMenu({ options, sortBy, sortDir, onChange }: SortMenuProps) {
  const isAsc = sortDir === 'asc';

  return (
    <div className="flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <select
        value={sortBy}
        onChange={(e) => onChange(e.target.value, sortDir)}
        className="bg-transparent px-2 py-2 text-sm focus:outline-none"
        title="Sort field"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onChange(sortBy, isAsc ? 'desc' : 'asc')}
        className="px-2 py-2 border-l border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title={isAsc ? 'Ascending — click for descending' : 'Descending — click for ascending'}
      >
        {isAsc ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />}
      </button>
    </div>
  );
}