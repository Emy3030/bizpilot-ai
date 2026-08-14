export interface Invoice {
  id: string;
  invoiceNumber: string;
  pdfUrl: string | null;
  chainStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  totalAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  customer: { id: string; name: string } | null;
}
