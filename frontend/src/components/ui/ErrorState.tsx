import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 p-6 text-center">
      <div className="mx-auto h-10 w-10 grid place-items-center rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
        <AlertTriangle size={18} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-200">{title}</h3>
      <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  );
}