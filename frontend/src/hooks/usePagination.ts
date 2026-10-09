import { useCallback, useMemo, useState } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
}

export function usePagination(initialPageSize: number = 20) {
  const [state, setState] = useState<PaginationState>({ page: 1, pageSize: initialPageSize });

  const goTo = useCallback((page: number) => {
    setState((s) => ({ ...s, page: Math.max(1, page) }));
  }, []);

  const next = useCallback(() => setState((s) => ({ ...s, page: s.page + 1 })), []);
  const prev = useCallback(() => setState((s) => ({ ...s, page: Math.max(1, s.page - 1) })), []);

  const setPageSize = useCallback((pageSize: number) => {
    setState({ page: 1, pageSize });
  }, []);

  const query = useMemo(() => ({ page: state.page, pageSize: state.pageSize }), [state]);

  return { ...state, goTo, next, prev, setPageSize, query };
}