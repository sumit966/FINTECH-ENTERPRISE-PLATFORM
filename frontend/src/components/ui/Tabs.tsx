interface TabDef<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
}

export default function Tabs<T extends string>({ tabs, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={'flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto ' + (className || '')}>
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={
              'px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ' +
              (isActive
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200')
            }
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-2 text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}