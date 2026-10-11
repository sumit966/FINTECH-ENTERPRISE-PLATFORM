import { useEffect, useRef, useState } from 'react';

type Fn = () => void | Promise<void>;

export function usePolling(fn: Fn, intervalMs: number = 30000): { lastUpdated: Date | null; refresh: () => void } {
  const savedFn = useRef<Fn>(fn);
  savedFn.current = fn;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const runningRef = useRef(false);

  const runOnce = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      await savedFn.current();
      setLastUpdated(new Date());
    } finally {
      runningRef.current = false;
    }
  };

  useEffect(() => {
    runOnce();
    let interval: number | null = null;
    const start = () => {
      if (interval !== null) return;
      interval = window.setInterval(() => { if (!document.hidden) runOnce(); }, intervalMs);
    };
    const stop = () => {
      if (interval !== null) { window.clearInterval(interval); interval = null; }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else { runOnce(); start(); }
    };
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  return { lastUpdated, refresh: runOnce };
}

export function useRelativeTime(date: Date | null): string {
  const [, force] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => force((x) => x + 1), 5000);
    return () => window.clearInterval(t);
  }, []);
  if (!date) return 'never';
  const s = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (s < 5) return 'just now';
  if (s < 60) return s + 's ago';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm ago';
  return Math.floor(m / 60) + 'h ago';
}
