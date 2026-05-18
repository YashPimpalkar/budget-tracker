'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { budgetService } from '@/services/budgetService';
import { cn } from '@/lib/utils';

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [newBudget, setNewBudget] = useState<{ id?: string; category: string; limit: string }>({ category: '', limit: '' });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getBudgets(),
  });

  const mutation = useMutation({
    mutationFn: (budget: typeof newBudget) =>
      budgetService.createOrUpdateBudget({ ...budget, limit: Number(budget.limit) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget updated');
      setNewBudget({ category: '', limit: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Budget deleted');
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight dark:text-white dark:glow-text-white">Budgets</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Set monthly spending limits for categories.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 dark:glow-border-white">
          <CardHeader>
            <CardTitle className="dark:text-white">Set Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(newBudget); }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-200">Category</label>
                <Input
                  placeholder="e.g. Food"
                  required
                  value={newBudget.category}
                  onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                  className="dark:bg-zinc-900/50 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-200">Monthly Limit</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  required
                  value={newBudget.limit}
                  onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  className="dark:bg-zinc-900/50 dark:border-zinc-800"
                />
              </div>
              <Button className="w-full dark:bg-white dark:text-black dark:hover:bg-zinc-200" type="submit" disabled={mutation.isPending}>
                Save Budget
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {budgets?.map((b: { _id: string; category: string; spent: number; limit: number }) => {
            const percent = Math.min((b.spent / b.limit) * 100, 100);
            return (
              <Card key={b._id} className="dark:glow-border-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold dark:text-white">{b.category}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        ₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNewBudget({ id: b._id, category: b.category, limit: b.limit.toString() })}
                        className="dark:border-zinc-800 dark:hover:bg-zinc-800"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { if (confirm('Are you sure you want to delete this budget?')) deleteMutation.mutate(b._id); }}
                        className="text-red-500 border-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        percent > 90 ? "bg-red-500" : "bg-black dark:bg-white"
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs mt-2 text-zinc-500 dark:text-zinc-500">
                    {percent >= 100 ? "Limit exceeded!" : `${(100 - percent).toFixed(0)}% remaining`}
                  </p>
                </CardContent>
              </Card>
            );
          })}
          {budgets?.length === 0 && (
            <p className="text-center text-zinc-500 py-12 dark:text-zinc-500">No budgets set for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
}
