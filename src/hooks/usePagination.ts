import { useMemo, useState } from 'react';

export function usePagination<T>(
  items: T[],
  options: { initialPageSize?: number; resetKey?: unknown } = {},
) {
  const { initialPageSize = 10, resetKey = '' } = options;
  const [pageState, setPageState] = useState<{
    page: number;
    resetKey: unknown;
  }>({ page: 1, resetKey });
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const requestedPage =
    pageState.resetKey === resetKey ? pageState.page : 1;
  const currentPage = Math.min(requestedPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  function setPage(value: number) {
    const nextPage = Math.max(1, Math.min(value, totalPages));
    setPageState({ page: nextPage, resetKey });
  }

  function setPageSize(value: number) {
    setPageSizeState(value);
    setPageState({ page: 1, resetKey });
  }

  return {
    pageItems,
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
  };
}
