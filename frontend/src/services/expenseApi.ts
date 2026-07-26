import { api } from './apiClient';
import { Expense, ExpenseInput, ExpenseSummary } from '@/types/expense';
import { PaginationMeta } from '@/types/customer';

interface ListResponse {
  success: true;
  data: Expense[];
  meta: PaginationMeta;
  totalAmount: number;
}

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ListExpensesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  from?: string;
  to?: string;
}

export const expenseApi = {
  async list(params: ListExpensesParams = {}): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>('/expenses', { params });
    return data;
  },

  async create(payload: ExpenseInput): Promise<Expense> {
    const { data } = await api.post<ItemResponse<Expense>>('/expenses', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<ExpenseInput>): Promise<Expense> {
    const { data } = await api.put<ItemResponse<Expense>>(`/expenses/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getSummary(): Promise<ExpenseSummary> {
    const { data } = await api.get<ItemResponse<ExpenseSummary>>('/expenses/summary');
    return data.data;
  },
};
