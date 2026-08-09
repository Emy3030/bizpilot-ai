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

export interface CustomerSaleInvoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string | null;
  chainStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

export interface CustomerSaleReceipt {
  id: string;
  receiptNumber: string;
  pdfUrl: string | null;
  qrCodeUrl: string | null;
  chainStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  documentHash: string;
}

export interface CustomerSale {
  id: string;
  totalAmount: string | number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  createdAt: string;
  items: CustomerSaleItem[];
  invoice: CustomerSaleInvoice | null;
  receipt: CustomerSaleReceipt | null;
}

export type CustomerRiskLevel = 'Low' | 'Medium' | 'High';

export interface CustomerDetail extends Customer {
  sales: CustomerSale[];
  lifetimeValue: number;
  totalOrders: number;
  daysSinceLastPurchase: number | null;
  riskScore: number;
  riskLevel: CustomerRiskLevel;
  recommendations: string[];
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
