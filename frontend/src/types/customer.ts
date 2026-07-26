export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  outstandingDebt: string | number;
  createdAt: string;
  updatedAt: string;
  _count?: { sales: number };
}

export interface CustomerSaleItem {
  product: { name: string };
}

export interface CustomerSale {
  id: string;
  totalAmount: string | number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  createdAt: string;
  items: CustomerSaleItem[];
}

export interface CustomerDetail extends Customer {
  sales: CustomerSale[];
}

export interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
