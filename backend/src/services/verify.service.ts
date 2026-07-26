import prisma from '../config/prisma';
import { ApiError } from '../utils/ApiError';

export const verifyService = {
  async verifyByHash(documentHash: string) {
    const [invoice, receipt] = await Promise.all([
      prisma.invoice.findFirst({
        where: { documentHash },
        include: { user: { select: { businessName: true } }, sale: { select: { totalAmount: true, createdAt: true } } },
      }),
      prisma.receipt.findFirst({
        where: { documentHash },
        include: { user: { select: { businessName: true } }, sale: { select: { totalAmount: true, createdAt: true } } },
      }),
    ]);

    const record = invoice || receipt;
    if (!record) {
      throw ApiError.notFound('No record found for this hash. It may be invalid or tampered with.');
    }

    const documentType = invoice ? 'INVOICE' : 'RECEIPT';
    const documentNumber = invoice ? invoice.invoiceNumber : receipt!.receiptNumber;

    return {
      valid: true,
      documentType,
      documentNumber,
      businessName: record.user.businessName,
      totalAmount: Number(record.sale.totalAmount),
      issuedAt: record.sale.createdAt,
      documentHash: record.documentHash,
      chainStatus: record.chainStatus,
      txHash: record.txHash,
    };
  },
};
