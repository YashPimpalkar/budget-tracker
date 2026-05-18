'use client';

import { Calendar, ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  type: 'monthly' | 'yearly' | 'total';
  setType: (type: 'monthly' | 'yearly' | 'total') => void;
  month: number;
  setMonth: (month: number) => void;
  year: number;
  setYear: (year: number) => void;
  from: string;
  setFrom: (from: string) => void;
  to: string;
  setTo: (to: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

export function DashboardFilters({
  type, setType,
  month, setMonth,
  year, setYear,
  from, setTo, setFrom, to
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-4">
        {/* Mode Switcher */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
          {[
            { id: 'monthly', label: 'Monthly', icon: Calendar },
            { id: 'yearly', label: 'Yearly', icon: Calendar },
            { id: 'total', label: 'Range', icon: LayoutGrid },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setType(tf.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                type === tf.id
                  ? "bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm glow-border-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              <tf.icon size={14} />
              {tf.label}
            </button>
          ))}
        </div>

        {/* Month & Year Selectors (Visible for monthly/yearly) */}
        {type !== 'total' && (
          <div className="flex items-center gap-3">
            <div className="relative group">
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-1.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-all dark:text-white"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
            </div>

            <div className="relative group">
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="appearance-none bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-1.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-all dark:text-white"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors" />
            </div>
          </div>
        )}

        {/* Date Range Selectors (Visible for range) */}
        {type === 'total' && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-all dark:text-white dark:color-scheme-dark"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-500/20 transition-all dark:text-white dark:color-scheme-dark"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
