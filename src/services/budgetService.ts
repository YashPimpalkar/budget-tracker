import { apiClient } from './apiClient';

export interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface BudgetResponse {
  _id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
  isDeleted: boolean;
}

export const budgetService = {
  getBudgets: async () => {
    return apiClient.get<Budget[]>('/api/budgets');
  },
  
  createOrUpdateBudget: async (body: unknown) => {
    return apiClient.post<BudgetResponse>('/api/budgets', body);
  },
  
  deleteBudget: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/budgets?id=${id}`);
  },
  
  autoResetBudgets: async () => {
    return apiClient.post<{ message: string; copied: number }>('/api/budgets/auto-reset');
  },
};
