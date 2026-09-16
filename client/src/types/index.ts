// Shared Types & Interfaces

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  userId: string;
  createdAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description?: string;
  date: string;
  categoryId: string;
  category?: Category;
  userId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
