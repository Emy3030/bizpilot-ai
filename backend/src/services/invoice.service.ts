import prisma from '../config/prisma';

interface ListParams {
  page: number;
  limit: number;
}

// Invoices are generated as a side-effect of recording a sale (see
// sale.service.ts) — there's no standalone "create invoice" flow, so this
// service is read-only. Payment status lives on the Sale, not the Invoice.
export const invoiceService = {
  async list(userId: string, { page, limit }: ListParams) {
    const where = { userId };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sale: {
            select: {
              totalAmount: true,
              paymentStatus: true,
              customer: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        pdfUrl: inv.pdfUrl,
        chainStatus: inv.chainStatus,
        createdAt: inv.createdAt,
        totalAmount: Number(inv.sale.totalAmount),
        paymentStatus: inv.sale.paymentStatus,
        customer: inv.sale.customer,
      })),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },
};
