'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,       // Never refetch automatically
        gcTime: 30 * 60 * 1000,    // 30 minutes — garbage collect to prevent memory leaks
        refetchOnWindowFocus: false,
        refetchOnMount: false,     // Don't refetch if data already exists in cache
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
