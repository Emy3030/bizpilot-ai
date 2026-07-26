import { api } from './apiClient';
import { Customer, CustomerDetail, CustomerInput, PaginationMeta } from '@/types/customer';

interface ListResponse {
  success: true;
  data: Customer[];
  meta: PaginationMeta;
}

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const customerApi = {
  async list(params: ListCustomersParams = {}): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>('/customers', { params });
    return data;
  },

  async getById(id: string): Promise<CustomerDetail> {
    const { data } = await api.get<ItemResponse<CustomerDetail>>(`/customers/${id}`);
    return data.data;
  },

  async create(payload: CustomerInput): Promise<Customer> {
    const { data } = await api.post<ItemResponse<Customer>>('/customers', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<CustomerInput>): Promise<Customer> {
    const { data } = await api.put<ItemResponse<Customer>>(`/customers/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
