import { Link } from 'react-router-dom';
import { Users, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { TopDebtor } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatCurrency';

export function CustomerRisks({ items, currency }: { items: TopDebtor[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Customer Risks
        </CardTitle>
        <CardDescription>Largest outstanding balances</CardDescription>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <EmptyState icon={ShieldCheck} title="No outstanding debt" description="Every customer is paid up." compact />
        ) : (
          <div className="space-y-3">
            {items.map((debtor) => (
              <Link
                key={debtor.id}
                to="/customers"
                className="flex items-center justify-between gap-2 rounded-lg px-1 py-1 text-sm transition-colors hover:bg-secondary"
              >
                <span className="truncate">{debtor.name}</span>
                <span className="shrink-0 font-medium text-destructive">
                  {formatCurrency(debtor.outstandingDebt, currency)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
