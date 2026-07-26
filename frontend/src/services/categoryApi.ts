import { api } from './apiClient';
import { Category } from '@/types/inventory';

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export const categoryApi = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<ItemResponse<Category[]>>('/categories');
    return data.data;
  },

  async create(name: string): Promise<Category> {
    const { data } = await api.post<ItemResponse<Category>>('/categories', { name });
    return data.data;
  },

  async update(id: string, name: string): Promise<Category> {
    const { data } = await api.put<ItemResponse<Category>>(`/categories/${id}`, { name });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
