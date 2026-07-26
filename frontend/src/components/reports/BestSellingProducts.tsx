import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductThumbnail } from '@/components/ui/product-thumbnail';
import { BestSellingProduct } from '@/types/report';
import { formatCurrency } from '@/utils/formatCurrency';

export function BestSellingProducts({ products, currency }: { products: BestSellingProduct[]; currency: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          Best-selling products
        </CardTitle>
        <CardDescription>Top movers for this period, by quantity sold</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <EmptyState icon={Trophy} title="No sales in this period yet" compact />
        ) : (
          <ul className="space-y-3">
            {products.map((p, i) => (
              <li key={p.productId} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                  {i + 1}
                </span>
                <ProductThumbnail imageUrl={p.imageUrl} name={p.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.quantitySold} sold</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.revenue, currency)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
