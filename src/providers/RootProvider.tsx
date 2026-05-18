'use client';

import QueryProvider from './QueryProvider';
import ReduxProvider from './ReduxProvider';
import AuthProvider from './AuthProvider';
import ThemeProvider from './ThemeProvider';
import { Toaster } from 'sonner';

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReduxProvider>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </ThemeProvider>
      </ReduxProvider>
    </AuthProvider>
  );
}
