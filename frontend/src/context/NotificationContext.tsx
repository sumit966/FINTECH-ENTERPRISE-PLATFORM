import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Toast {
  id: string;
  title: string;
  body?: string;
  variant: 'info' | 'success' | 'warn' | 'error';
}

interface NotificationContextValue {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    setToasts((list) => [...list, { ...t, id }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  return (
    <NotificationContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2 w-[320px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'rounded-lg border p-3 shadow-lg backdrop-blur ' +
              (t.variant === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100'
                : t.variant === 'error'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-900 dark:text-rose-100'
                : t.variant === 'warn'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100'
                : 'border-brand-500/40 bg-brand-500/10 text-brand-900 dark:text-brand-100')
            }
            onClick={() => dismiss(t.id)}
            role="status"
          >
            <div className="text-sm font-semibold">{t.title}</div>
            {t.body && <div className="text-xs opacity-80 mt-0.5">{t.body}</div>}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}