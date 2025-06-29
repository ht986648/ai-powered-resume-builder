"use client";

import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

type Props = {
  children: React.ReactNode;
};

// Create QueryClient instance outside the component to persist across renders
const queryClient = new QueryClient();

const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
