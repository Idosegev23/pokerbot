'use client';

import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import SupabaseProvider from "@/components/providers/supabase-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      {children}
      <Toaster />
    </SupabaseProvider>
  );
} 