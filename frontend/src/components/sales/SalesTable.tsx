import { ChevronLeft, ChevronRight, Eye, Receipt as ReceiptIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Sale } from '@/types/sale';
import { PaginationMeta } from '@/types/customer';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
  sales: Sale[];
  meta?: PaginationMeta;
  isLoading: boolean;
  currency: string;
  onView: (saleId: string) => void;
  onPageChange: (page: number) => void;
}

const statusVariant: Record<Sale['paymentStatus'], 'success' | 'warning' | 'destructive'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'destructive',
};

export function SalesTable({ sales, meta, isLoading, currency, onView, onPageChange }: Props) {
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
        {sales.length === 0 ? (
          <EmptyState
            icon={ReceiptIcon}
            title="No sales recorded yet"
            description='Click "New sale" to record your first one.'
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Items</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium">{s.customer?.name || 'Walk-in customer'}</td>
                    <td className="max-w-[220px] truncate px-6 py-3 text-muted-foreground">
                      {s.items.map((i) => i.product.name).join(', ')}
                    </td>
                    <td className="px-6 py-3 font-semibold">{formatCurrency(Number(s.totalAmount), currency)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[s.paymentStatus]}>{s.paymentStatus}</Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => onView(s.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
              Page {meta.page} of {meta.totalPages} · {meta.total} sales
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                disabled={meta.page >= meta.totalPages}
                onClick={() => onPageChange(meta.page + 1)}
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
