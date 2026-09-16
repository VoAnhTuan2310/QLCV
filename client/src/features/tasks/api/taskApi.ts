import apiClient from '../../../services/apiClient';
import { ApiResponse, Task } from '../../../types';

export const fetchTasksApi = async () => {
  const response = await apiClient.get<ApiResponse<Task[]>>('/tasks');
  return response.data;
};

export const createTaskApi = async (taskData: Partial<Task>) => {
  const response = await apiClient.post<ApiResponse<Task>>('/tasks', taskData);
  return response.data;
};
