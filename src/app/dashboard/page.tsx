'use client';

import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowUpCircle, ArrowDownCircle, Wallet, History, Calendar, LayoutGrid } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';

const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });

export default function DashboardPage() {
  const theme = useAppSelector((state) => state.ui.theme);
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly' | 'total'>('monthly');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [to, setTo] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', timeframe, month, year, from, to],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: timeframe,
        month: month.toString(),
        year: year.toString(),
        from,
        to
      });
      const res = await fetch(`/api/dashboard/stats?${params.toString()}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-20 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
        </div>
      </div>
    );
  }

  const currentStats = data?.stats || { income: 0, expenses: 0, balance: 0 };

  /** Two separate data points so each Bar can have its own CSS-variable fill */
  const chartData = [
    { name: 'Income',   value: currentStats.income },
    { name: 'Expenses', value: currentStats.expenses },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight dark:text-white dark:glow-text-white">Overview</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Track your financial health at a glance.</p>
        </div>

        <DashboardFilters
          type={timeframe}
          setType={setTimeframe}
          month={month}
          setMonth={setMonth}
          year={year}
          setYear={setYear}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={`${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Income`}
          value={`₹${currentStats.income?.toLocaleString()}`}
          icon={<ArrowUpCircle className="text-green-500" />}
          description={
            timeframe === 'monthly' 
              ? `For ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
              : timeframe === 'yearly' 
                ? `12 months ending ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
                : `Range: ${from} to ${to}`
          }
        />
        <StatsCard
          title={`${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Expenses`}
          value={`₹${currentStats.expenses?.toLocaleString()}`}
          icon={<ArrowDownCircle className="text-red-500" />}
          description={
            timeframe === 'monthly' 
              ? `For ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
              : timeframe === 'yearly' 
                ? `12 months ending ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
                : `Range: ${from} to ${to}`
          }
        />
        <StatsCard
          title={`${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Balance`}
          value={`₹${currentStats.balance?.toLocaleString()}`}
          icon={<Wallet className="dark:text-white" />}
          description={
            timeframe === 'monthly' 
              ? `For ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
              : timeframe === 'yearly' 
                ? `12 months ending ${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}` 
                : `Range: ${from} to ${to}`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-zinc-200">
          <CardHeader>
            <CardTitle className="dark:text-white">{timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Summary</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  key={timeframe}
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)' }}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                    }}
                  />
                  {/* Two separate Bars — one per category — each using its own CSS var */}
                  <Bar
                    dataKey={(d) => d.name === 'Income' ? d.value : 0}
                    name="Income"
                    fill="var(--chart-income)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                  <Bar
                    dataKey={(d) => d.name === 'Expenses' ? d.value : 0}
                    name="Expenses"
                    fill="var(--chart-expenses)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 dark:glow-border-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <History size={20} className="dark:text-white" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.recentTransactions?.length > 0 ? (
                data.recentTransactions.map((tx: any) => (
                  <div key={tx._id} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium dark:text-zinc-200">{tx.category}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <p className={cn(
                      "text-sm font-bold transition-all group-hover:scale-110",
                      tx.type === 'income' ? "text-green-500" : "text-black dark:text-white"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center py-8">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
