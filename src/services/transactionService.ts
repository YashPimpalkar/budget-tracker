import { apiClient } from './apiClient';

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
}

export interface GetTransactionsResponse {
  transactions: Transaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const transactionService = {
  getTransactions: async (page: number, limit: number) => {
    return apiClient.get<GetTransactionsResponse>(`/api/transactions?page=${page}&limit=${limit}`);
  },
  
  createTransaction: async (body: unknown) => {
    return apiClient.post<Transaction>('/api/transactions', body);
  },
  
  deleteTransaction: async (id: string) => {
    return apiClient.delete<{ message: string }>(`/api/transactions/${id}`);
  },
};
