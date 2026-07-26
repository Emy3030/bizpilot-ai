import { api } from './apiClient';
import { ExpenseCategory } from '@/types/expense';

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export const expenseCategoryApi = {
  async list(): Promise<ExpenseCategory[]> {
    const { data } = await api.get<ItemResponse<ExpenseCategory[]>>('/expense-categories');
    return data.data;
  },

  async create(name: string): Promise<ExpenseCategory> {
    const { data } = await api.post<ItemResponse<ExpenseCategory>>('/expense-categories', { name });
    return data.data;
  },

  async update(id: string, name: string): Promise<ExpenseCategory> {
    const { data } = await api.put<ItemResponse<ExpenseCategory>>(`/expense-categories/${id}`, { name });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/expense-categories/${id}`);
  },
};
