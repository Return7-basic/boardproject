import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분
      gcTime: 1000 * 60 * 5, // 5분 (이전 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

