'use client';

import { Menu, Bell, User as UserIcon, Sun, Moon, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar, toggleTheme } from '@/store/slices/uiSlice';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { budgetService } from '@/services/budgetService';

export default function Navbar() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  /** Fetch current-month budgets to detect exceeded ones */
  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getBudgets(),
    refetchInterval: 5 * 60 * 1000,
  });

  const alerts: Array<{ category: string; spent: number; limit: number }> =
    Array.isArray(budgets)
      ? budgets.filter((b: { spent: number; limit: number }) => b.spent >= b.limit)
      : [];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-background/80">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          onClick={() => dispatch(toggleSidebar())}
        >
          <Menu size={20} className="dark:text-white" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest lg:hidden dark:text-zinc-400">
          Budget
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-white" />}
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Budget Alerts"
          >
            <Bell size={18} className="dark:text-white" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />

              {/* Dropdown panel */}
              <div className="absolute right-0 mt-2 w-80 z-20 origin-top-right rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <p className="text-sm font-semibold dark:text-white">Budget Alerts</p>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">This month</span>
                </div>

                {alerts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    ✅ All budgets are within limits
                  </div>
                ) : (
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-72 overflow-y-auto">
                    {alerts.map((b) => {
                      const overage = b.spent - b.limit;
                      const isExceeded = b.spent > b.limit;
                      const percent = Math.round((b.spent / b.limit) * 100);
                      return (
                        <li key={b.category} className="px-4 py-3 flex items-start gap-3">
                          <span className="mt-0.5 text-lg">{isExceeded ? '🚨' : '⚠️'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold dark:text-white truncate">{b.category}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()} ({percent}%)
                            </p>
                            {isExceeded && (
                              <p className="text-xs text-red-500 font-medium mt-0.5">
                                Over by ₹{overage.toLocaleString()}
                              </p>
                            )}
                            {!isExceeded && (
                              <p className="text-xs text-amber-500 font-medium mt-0.5">
                                Limit reached
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {/* Profile menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-sm">
              <UserIcon size={16} />
            </div>
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 z-20 origin-top-right rounded-lg border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-black">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-2">
                  <p className="text-sm font-semibold dark:text-white">{session?.user?.name}</p>
                  <p className="text-xs text-zinc-500 truncate dark:text-zinc-400">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
