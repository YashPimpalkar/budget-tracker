'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Silently fetches the current month's budgets and fires a toast alert
 * for every category that has met or exceeded its spending limit.
 * Uses sessionStorage to avoid re-alerting on every navigation within a session.
 */
export default function BudgetAlertChecker() {
  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      return res.json();
    },
    // Re-check every 5 minutes in case new transactions come in
    refetchInterval: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!Array.isArray(budgets)) return;

    const exceededBudgets = budgets.filter(
      (b: { category: string; spent: number; limit: number }) => b.spent >= b.limit
    );

    exceededBudgets.forEach((b: { category: string; spent: number; limit: number }) => {
      const alertKey = `budget-alert-${b.category}-${new Date().getMonth()}`;

      // Show each alert at most once per browser session per category per month
      if (sessionStorage.getItem(alertKey)) return;

      const isExceeded = b.spent > b.limit;
      const overage = b.spent - b.limit;

      toast(isExceeded ? '🚨 Budget Exceeded!' : '⚠️ Budget Limit Reached!', {
        description: isExceeded
          ? `${b.category}: over by ₹${overage.toLocaleString()} (₹${b.spent.toLocaleString()} / ₹${b.limit.toLocaleString()})`
          : `${b.category}: ₹${b.spent.toLocaleString()} — you've hit your ₹${b.limit.toLocaleString()} limit.`,
        duration: 8000,
        style: {
          border: '1px solid rgba(239, 68, 68, 0.6)',
          background: 'rgba(20, 0, 0, 0.9)',
          color: '#fca5a5',
        },
      });

      sessionStorage.setItem(alertKey, '1');
    });
  }, [budgets]);

  // Renders nothing — side-effects only
  return null;
}
