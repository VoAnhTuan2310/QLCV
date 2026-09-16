import apiClient from '../../../services/apiClient';
import { ApiResponse, Transaction } from '../../../types';

export const fetchTransactionsApi = async () => {
  const response = await apiClient.get<ApiResponse<Transaction[]>>('/finance/transactions');
  return response.data;
};

export const fetchFinanceSummaryApi = async () => {
  const response = await apiClient.get<ApiResponse<{ totalIncome: number; totalExpense: number; balance: number }>>('/finance/summary');
  return response.data;
};
