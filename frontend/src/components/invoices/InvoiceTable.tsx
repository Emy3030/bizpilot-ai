import { ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Invoice } from '@/types/invoice';
import { PaginationMeta } from '@/types/customer';
import { formatCurrency } from '@/utils/formatCurrency';
import { getAssetUrl } from '@/utils/getAssetUrl';

interface Props {
  invoices: Invoice[];
  meta?: PaginationMeta;
  isLoading: boolean;
  currency: string;
  onPageChange: (page: number) => void;
}

const PAYMENT_BADGE: Record<Invoice['paymentStatus'], 'success' | 'warning' | 'destructive'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'destructive',
};

const CHAIN_BADGE: Record<Invoice['chainStatus'], 'success' | 'warning' | 'destructive'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
};

export function InvoiceTable({ invoices, meta, isLoading, currency, onPageChange }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Invoices are generated automatically when you record a sale."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Payment</th>
                  <th className="px-6 py-3 font-medium">Trust status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Document</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-6 py-3 text-muted-foreground">{inv.customer?.name || 'Walk-in customer'}</td>
                    <td className="px-6 py-3 font-semibold">{formatCurrency(inv.totalAmount, currency)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={PAYMENT_BADGE[inv.paymentStatus]}>{inv.paymentStatus}</Badge>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={CHAIN_BADGE[inv.chainStatus]}>{inv.chainStatus}</Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {inv.pdfUrl ? (
                        <a href={getAssetUrl(inv.pdfUrl) || '#'} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" aria-label={`Download ${inv.invoiceNumber}`}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} invoices
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={meta.page >= meta.totalPages}
                onClick={() => onPageChange(meta.page + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
