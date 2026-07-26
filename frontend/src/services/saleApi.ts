import { api } from './apiClient';
import { Sale, Invoice, Receipt, CreateSaleInput, PaymentStatus, VerificationResult } from '@/types/sale';
import { PaginationMeta } from '@/types/customer';

interface ListResponse {
  success: true;
  data: Sale[];
  meta: PaginationMeta;
}

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ListSalesParams {
  page?: number;
  limit?: number;
  customerId?: string;
  paymentStatus?: PaymentStatus;
}

export const saleApi = {
  async list(params: ListSalesParams = {}): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>('/sales', { params });
    return data;
  },

  async getById(id: string): Promise<Sale> {
    const { data } = await api.get<ItemResponse<Sale>>(`/sales/${id}`);
    return data.data;
  },

  async create(payload: CreateSaleInput): Promise<Sale> {
    const { data } = await api.post<ItemResponse<Sale>>('/sales', payload);
    return data.data;
  },

  async recordPayment(id: string, amount: number): Promise<Sale> {
    const { data } = await api.post<ItemResponse<Sale>>(`/sales/${id}/payments`, { amount });
    return data.data;
  },

  async generateInvoice(id: string): Promise<Invoice> {
    const { data } = await api.post<ItemResponse<Invoice>>(`/sales/${id}/invoice`);
    return data.data;
  },

  async generateReceipt(id: string): Promise<Receipt> {
    const { data } = await api.post<ItemResponse<Receipt>>(`/sales/${id}/receipt`);
    return data.data;
  },
};

export const verifyApi = {
  async verify(hash: string): Promise<VerificationResult> {
    const { data } = await api.get<ItemResponse<VerificationResult>>(`/verify/${hash}`);
    return data.data;
  },
};
