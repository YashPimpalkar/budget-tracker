'use client';

import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAppSelector } from '@/store/hooks';
import { useBudgetAutoReset } from '@/hooks/useBudgetAutoReset';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  useBudgetAutoReset();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-background transition-colors duration-500">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}
      >
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
