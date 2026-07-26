import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductThumbnail } from '@/components/ui/product-thumbnail';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { LowStockProduct } from '@/types/dashboard';

export function LowStockList({ items }: { items: LowStockProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Low stock alerts
        </CardTitle>
        <CardDescription>Products at or below their restock threshold</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No low stock items right now"
            description="Everything's sitting comfortably above its restock threshold."
            compact
          />
        ) : (
          <StaggerContainer className="space-y-3">
            {items.map((p) => (
              <StaggerItem key={p.id}>
                <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <ProductThumbnail imageUrl={p.imageUrl} name={p.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {p.lowStockThreshold} units
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {p.stockQuantity} left
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </CardContent>
    </Card>
  );
}
