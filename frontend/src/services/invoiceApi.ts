import { api } from './apiClient';
import { Invoice } from '@/types/invoice';
import { PaginationMeta } from '@/types/customer';

interface ListResponse {
  success: true;
  data: Invoice[];
  meta: PaginationMeta;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
}

export const invoiceApi = {
  async list(params: ListInvoicesParams = {}): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>('/invoices', { params });
    return data;
  },
};
