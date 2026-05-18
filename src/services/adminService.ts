import { apiClient } from './apiClient';

export interface DeletedTransaction {
  _id: string;
  category: string;
  amount: number;
  userId?: {
    email: string;
  };
  updatedAt: string;
}

export interface DeletedBudget {
  _id: string;
  category: string;
  limit: number;
  userId?: {
    email: string;
  };
  month: number;
  year: number;
}

export interface GetDeletedItemsParams {
  email?: string;
  minAmount?: string;
  maxAmount?: string;
  page?: number;
}

export interface GetDeletedItemsResponse {
  transactions: DeletedTransaction[];
  budgets: DeletedBudget[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const adminService = {
  getDeletedItems: async (params: GetDeletedItemsParams) => {
    const queryParams: Record<string, string> = {};
    if (params.email) queryParams.email = params.email;
    if (params.minAmount) queryParams.minAmount = params.minAmount;
    if (params.maxAmount) queryParams.maxAmount = params.maxAmount;
    if (params.page) queryParams.page = params.page.toString();

    const query = new URLSearchParams(queryParams);
    return apiClient.get<GetDeletedItemsResponse>(`/api/admin/recover?${query.toString()}`);
  },
  
  recoverItem: async (type: 'transaction' | 'budget', id: string) => {
    return apiClient.post<{ message: string }>('/api/admin/recover', { type, id });
  },
};
