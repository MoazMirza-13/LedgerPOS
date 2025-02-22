'use client';
import React, { useState } from 'react';
import ThemeProvider from './ThemeToggle/theme-provider';
import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query';
import { queryClientConfig } from '@/lib/tanStack-action';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  return (
    <>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
