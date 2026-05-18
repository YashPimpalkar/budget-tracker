'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCcw, Search, ChevronLeft, ChevronRight, Mail, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  
  // Staging states (for input fields)
  const [emailInput, setEmailInput] = useState('');
  const [minAmountInput, setMinAmountInput] = useState('');
  const [maxAmountInput, setMaxAmountInput] = useState('');

  // Applied states (used for API query)
  const [appliedFilters, setAppliedFilters] = useState({
    email: '',
    minAmount: '',
    maxAmount: '',
  });

  const handleApplyFilters = () => {
    setAppliedFilters({
      email: emailInput,
      minAmount: minAmountInput,
      maxAmount: maxAmountInput,
    });
    setPage(1);
  };

  if (status === 'unauthenticated' || (session?.user as any)?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deleted-data', page, appliedFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '5',
        email: appliedFilters.email,
        minAmount: appliedFilters.minAmount || '0',
        maxAmount: appliedFilters.maxAmount || '1000000000',
      });
      const res = await fetch(`/api/admin/recover?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const recoverMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string, id: string }) => {
      const res = await fetch('/api/admin/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
      if (!res.ok) throw new Error('Failed to recover');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-data'] });
      toast.success('Data recovered successfully');
    },
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse dark:text-white">Loading data...</div>;

  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white dark:glow-text-white">Admin Recovery</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Restore soft-deleted transactions and budgets.</p>
      </div>

      {/* Filters */}
      <Card className="dark:glow-border-white bg-zinc-50/50 dark:bg-zinc-950/50">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium dark:text-zinc-400">User Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="search@email.com"
                  className="w-full pl-9 h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium dark:text-zinc-400">Min Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="number"
                  placeholder="0"
                  className="w-full pl-9 h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={minAmountInput}
                  onChange={(e) => setMinAmountInput(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium dark:text-zinc-400">Max Amount</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="number"
                  placeholder="100000"
                  className="w-full pl-9 h-10 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={maxAmountInput}
                  onChange={(e) => setMaxAmountInput(e.target.value)}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="dark:border-zinc-800 dark:text-white"
              onClick={handleApplyFilters}
            >
              <Search className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="dark:glow-border-white flex flex-col">
          <CardHeader>
            <CardTitle className="dark:text-white">Deleted Transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {data?.transactions?.length > 0 ? (
                data.transactions.map((tx: any) => (
                  <div key={tx._id} className="flex flex-col gap-2 p-4 border rounded-lg border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium dark:text-white">{tx.category} - ₹{tx.amount}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">User: {tx.userId?.email}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => recoverMutation.mutate({ type: 'transaction', id: tx._id })}
                        disabled={recoverMutation.isPending}
                        className="gap-2 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </Button>
                    </div>
                    <p className="text-[10px] text-zinc-400">Deleted: {new Date(tx.updatedAt).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-8 dark:text-zinc-500">No matching transactions.</p>
              )}
            </div>

            {/* Pagination for Transactions */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Page {pagination.page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 p-0 dark:border-zinc-800"
                  >
                    <ChevronLeft size={16} className="dark:text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="h-8 w-8 p-0 dark:border-zinc-800"
                  >
                    <ChevronRight size={16} className="dark:text-white" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dark:glow-border-white flex flex-col">
          <CardHeader>
            <CardTitle className="dark:text-white">Deleted Budgets</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              {data?.budgets?.length > 0 ? (
                data.budgets.map((b: any) => (
                  <div key={b._id} className="flex items-center justify-between p-4 border rounded-lg border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div>
                      <p className="font-medium dark:text-white">{b.category} - Limit: ₹{b.limit}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">User: {b.userId?.email} | Period: {b.month}/{b.year}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => recoverMutation.mutate({ type: 'budget', id: b._id })}
                      disabled={recoverMutation.isPending}
                      className="gap-2 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-500 py-8 dark:text-zinc-500">No deleted budgets found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
