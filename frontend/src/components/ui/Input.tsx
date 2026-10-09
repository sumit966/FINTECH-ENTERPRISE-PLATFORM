import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...rest },
  ref
) {
  const inputId = id || rest.name || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'w-full rounded-md border bg-white dark:bg-slate-900 px-3 py-2 text-sm',
          'border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2',
          error ? 'border-rose-500 focus:ring-rose-500/30' : 'focus:ring-brand-500/40',
          className
        )}
        {...rest}
      />
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
});

export default Input;