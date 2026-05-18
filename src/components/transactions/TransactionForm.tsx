'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';

export default function TransactionForm() {
  const queryClient = useQueryClient();
  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      return res.json();
    },
  });

  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: async (newTx: typeof formData) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction added');
      setFormData({
        ...formData,
        amount: '',
        description: '',
      });
    },
    onError: () => {
      toast.error('Error adding transaction');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card className="dark:glow-border-white">
      <CardHeader>
        <CardTitle className="dark:text-white">Add Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-zinc-200">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-zinc-200">Amount (₹)</label>
              <Input
                type="number"
                placeholder="0.00"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="dark:bg-zinc-900/50 dark:border-zinc-800"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-zinc-200">Category</label>
            {formData.type === 'expense' ? (
              <select
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select category</option>
                {Array.from(
                  new Set((budgets as Array<{ category: string }> | undefined)?.map((b) => b.category) || [])
                ).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <select
                required
                className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select category</option>
                <option value="Salary">Salary</option>
                <option value="Bonus">Bonus</option>
                <option value="Investments">Investments</option>
                <option value="Other">Other</option>
              </select>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-zinc-200">Description</label>
            <Input
              placeholder="Optional notes"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="dark:bg-zinc-900/50 dark:border-zinc-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium dark:text-zinc-200">Date</label>
            <Input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="dark:bg-zinc-900/50 dark:border-zinc-800"
            />
          </div>
          <Button className="w-full dark:bg-white dark:text-black dark:hover:bg-zinc-200" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
