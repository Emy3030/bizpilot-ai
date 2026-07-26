import { Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { RecentTransaction } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';

const statusVariant: Record<RecentTransaction['paymentStatus'], 'success' | 'warning' | 'destructive'> = {
  PAID: 'success',
  PARTIAL: 'warning',
  UNPAID: 'destructive',
};

export function RecentTransactions({ items, currency }: { items: RecentTransaction[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent transactions</CardTitle>
        <CardDescription>Your latest sales activity</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No sales recorded yet"
            description="They'll show up here as soon as you make one."
            compact
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{t.customerName}</td>
                    <td className="max-w-[180px] truncate py-3 text-muted-foreground">{t.itemsSummary || '—'}</td>
                    <td className="py-3 font-semibold">{formatCurrency(t.totalAmount, currency)}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[t.paymentStatus]}>{t.paymentStatus}</Badge>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
