import { apiClient } from './apiClient';

export interface DashboardStatsParams {
  type: 'monthly' | 'yearly' | 'total';
  month: string;
  year: string;
  from?: string;
  to?: string;
}

export interface DashboardStatsResponse {
  stats: {
    income: number;
    expenses: number;
    balance: number;
  };
  recentTransactions: Array<{
    _id: string;
    category: string;
    date: string;
    type: 'income' | 'expense';
    amount: number;
  }>;
}

export const dashboardService = {
  getStats: async (params: DashboardStatsParams) => {
    const queryParams: Record<string, string> = {
      type: params.type,
      month: params.month,
      year: params.year,
    };
    
    if (params.from) queryParams.from = params.from;
    if (params.to) queryParams.to = params.to;

    const query = new URLSearchParams(queryParams);
    return apiClient.get<DashboardStatsResponse>(`/api/dashboard/stats?${query.toString()}`);
  },
};
