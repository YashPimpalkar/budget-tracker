'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { transactionService } from '@/services/transactionService';

export default function TransactionList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => transactionService.getTransactions(page, limit),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction deleted');
    },
  });

  if (isLoading) return <div className="space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />)}
  </div>;

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <Card className="dark:glow-border-white h-full flex flex-col">
      <CardHeader>
        <CardTitle className="dark:text-white">History</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="space-y-4 flex-1">
          {transactions.length > 0 ? (
            transactions.map((tx: { _id: string; type: 'income' | 'expense'; category: string; date: string; amount: number }) => (
              <div key={tx._id} className="group flex items-center justify-between p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    tx.type === 'income' ? "bg-green-500" : "bg-black dark:bg-white"
                  )} />
                  <div>
                    <p className="text-sm font-medium dark:text-zinc-200">{tx.category}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={cn(
                    "text-sm font-bold",
                    tx.type === 'income' ? "text-green-500" : "text-black dark:text-white"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <button
                    onClick={() => deleteMutation.mutate(tx._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500 py-4 text-center dark:text-zinc-500">No transactions yet</p>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <ChevronLeft size={16} className="dark:text-white" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="h-8 w-8 p-0 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <ChevronRight size={16} className="dark:text-white" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
