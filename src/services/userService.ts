import { apiClient } from './apiClient';

export const userService = {
  resetUserData: async () => {
    return apiClient.post<{ message: string }>('/api/user/reset');
  },
};
