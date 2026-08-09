import { api } from './apiClient';
import { Product, ProductFormInput, InventoryInsights } from '@/types/inventory';
import { PaginationMeta } from '@/types/customer';

interface ListResponse {
  success: true;
  data: Product[];
  meta: PaginationMeta;
}

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
}

function toFormData(input: Partial<ProductFormInput>): FormData {
  const formData = new FormData();
  if (input.name !== undefined) formData.append('name', input.name);
  if (input.description !== undefined) formData.append('description', input.description);
  if (input.sku !== undefined) formData.append('sku', input.sku);
  if (input.barcode !== undefined) formData.append('barcode', input.barcode);
  if (input.categoryId !== undefined) formData.append('categoryId', input.categoryId);
  if (input.costPrice !== undefined) formData.append('costPrice', String(input.costPrice));
  if (input.sellingPrice !== undefined) formData.append('sellingPrice', String(input.sellingPrice));
  if (input.stockQuantity !== undefined) formData.append('stockQuantity', String(input.stockQuantity));
  if (input.lowStockThreshold !== undefined) formData.append('lowStockThreshold', String(input.lowStockThreshold));
  if (input.image) formData.append('image', input.image);
  return formData;
}

export const productApi = {
  async list(params: ListProductsParams = {}): Promise<ListResponse> {
    const { data } = await api.get<ListResponse>('/products', { params });
    return data;
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<ItemResponse<Product>>(`/products/${id}`);
    return data.data;
  },

  async getInsights(): Promise<InventoryInsights> {
    const { data } = await api.get<ItemResponse<InventoryInsights>>('/products/insights');
    return data.data;
  },

  async create(input: ProductFormInput): Promise<Product> {
    const { data } = await api.post<ItemResponse<Product>>('/products', toFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async update(id: string, input: Partial<ProductFormInput>): Promise<Product> {
    const { data } = await api.put<ItemResponse<Product>>(`/products/${id}`, toFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
