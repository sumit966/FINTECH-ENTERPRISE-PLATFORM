import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

interface UseApiOptions {
  immediate?: boolean;
  query?: Record<string, any>;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useApiGet<T>(path: string, options: UseApiOptions = {}): UseApiResult<T> {
  const { immediate = true, query } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get<T>(path, query);
      if (mounted.current) setData(result);
    } catch (e: any) {
      if (mounted.current) setError(e?.message || 'Request failed');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [path, JSON.stringify(query)]);

  useEffect(() => {
    mounted.current = true;
    if (immediate) load();
    return () => { mounted.current = false; };
  }, [load, immediate]);

  return { data, loading, error, reload: load };
}