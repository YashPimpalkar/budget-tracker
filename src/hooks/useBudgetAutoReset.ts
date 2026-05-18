'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Silently triggers the monthly budget auto-reset on the first dashboard
 * visit of each calendar month. Uses localStorage to avoid redundant calls.
 */
export function useBudgetAutoReset() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const now = new Date();
    // Key unique to this user's browser per calendar month
    const resetKey = `budget-auto-reset-${now.getFullYear()}-${now.getMonth() + 1}`;

    if (localStorage.getItem(resetKey)) return; // Already ran this month

    fetch('/api/budgets/auto-reset', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.copied > 0) {
          // Invalidate so the Budgets page / bell reflects the new entries
          queryClient.invalidateQueries({ queryKey: ['budgets'] });
          console.info(`[BudgetAutoReset] Copied ${data.copied} categories to this month.`);
        }
        // Mark done for this month regardless
        localStorage.setItem(resetKey, '1');
      })
      .catch(() => {
        // Fail silently — will retry on next page load
      });
  }, [queryClient]);
}
