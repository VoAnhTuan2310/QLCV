import apiClient from '../../../services/apiClient';
import { ApiResponse, User } from '../../../types';

export const loginApi = async (credentials: { email: string; password: string }) => {
  const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
  return response.data;
};

export const registerApi = async (data: { email: string; password: string; fullName: string }) => {
  const response = await apiClient.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
  return response.data;
};
