import { apiClient } from './apiClient';

export const authService = {
  signUp: async (body: unknown) => {
    return apiClient.post<{ message: string; user?: { id: string; email: string } }>(
      '/api/auth/signup',
      body
    );
  },
};
