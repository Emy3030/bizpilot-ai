import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { RecentInvoice } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const CHAIN_BADGE: Record<RecentInvoice['chainStatus'], 'success' | 'warning' | 'destructive'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
};

export function RecentInvoices({ invoices, currency }: { invoices: RecentInvoice[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          Recent Invoices
        </CardTitle>
        <CardDescription>Latest generated, with on-chain trust status</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices yet" description="Generated invoices will show up here." compact />
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{inv.invoiceNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inv.customerName} · {formatRelativeTime(inv.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-sm font-semibold">{formatCurrency(inv.totalAmount, currency)}</p>
                  <Badge variant={CHAIN_BADGE[inv.chainStatus]} className="text-[10px]">
                    {inv.chainStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
