export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD' | 'CREDIT';
export type ChainStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export type CleanverseConnectionState = 'NOT_CONNECTED' | 'PENDING_CONFIGURATION' | 'CONNECTED';

export interface CleanverseTrustResult {
  state: CleanverseConnectionState;
  message: string;
  proofId?: string;
  proofUrl?: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  unitCost: string | number;
  subtotal: string | number;
  product: { name: string; imageUrl?: string | null };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string | null;
  documentHash: string;
  txHash: string | null;
  chainStatus: ChainStatus;
  cleanverseTrust?: CleanverseTrustResult | null;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  pdfUrl: string | null;
  qrCodeUrl: string | null;
  documentHash: string;
  txHash: string | null;
  chainStatus: ChainStatus;
  cleanverseTrust?: CleanverseTrustResult | null;
}

export interface Sale {
  id: string;
  customerId: string | null;
  customer: { id: string; name: string } | null;
  totalAmount: string | number;
  amountPaid: string | number;
  profit: string | number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: SaleItem[];
  // The list endpoint only returns {id, invoiceNumber}/{id, receiptNumber};
  // the detail endpoint (getById) returns the full Invoice/Receipt record.
  // Only rely on pdfUrl/documentHash/etc. when working with a single sale
  // fetched via useSale(id), not the list.
  invoice?: Invoice | null;
  receipt?: Receipt | null;
}

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  items: CreateSaleItemInput[];
}

export interface VerificationResult {
  valid: boolean;
  documentType: 'INVOICE' | 'RECEIPT';
  documentNumber: string;
  businessName: string;
  currency: string;
  totalAmount: number;
  issuedAt: string;
  documentHash: string;
  chainStatus: ChainStatus;
  txHash: string | null;
  cleanverseTrust: CleanverseTrustResult;
}
