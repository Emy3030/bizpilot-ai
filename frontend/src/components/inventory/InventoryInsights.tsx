import { TrendingUp, TrendingDown, PackageX, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductThumbnail } from '@/components/ui/product-thumbnail';
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer';
import { useInventoryInsights } from '@/hooks/useProducts';
import { InventoryInsightProduct } from '@/types/inventory';

function ProductRow({ product, metric }: { product: InventoryInsightProduct; metric: string }) {
  return (
    <div className="flex items-center gap-3">
      <ProductThumbnail imageUrl={product.imageUrl} name={product.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name}</p>
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">{metric}</span>
    </div>
  );
}

export function InventoryInsights() {
  const { data, isLoading } = useInventoryInsights();

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Inventory Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded-lg bg-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <StaggerItem>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-success" />
              Restock soon
            </CardTitle>
            <CardDescription>Based on the last 30 days of sales velocity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.restockRecommendations.length === 0 ? (
              <EmptyState icon={Sparkles} title="Nothing urgent" description="No products projected to run out soon." compact />
            ) : (
              data.restockRecommendations.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  metric={p.daysUntilStockout === 0 ? 'Out now' : `~${p.daysUntilStockout}d left`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Fast movers
            </CardTitle>
            <CardDescription>Best-selling products, last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.fastMoving.length === 0 ? (
              <EmptyState icon={PackageX} title="No sales yet" description="Fast movers will appear once you record sales." compact />
            ) : (
              data.fastMoving.map((p) => <ProductRow key={p.id} product={p} metric={`${p.unitsSold30d} sold`} />)
            )}
          </CardContent>
        </Card>
      </StaggerItem>

      <StaggerItem>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              Slow movers
            </CardTitle>
            <CardDescription>In stock, no sales in 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.slowMoving.length === 0 ? (
              <EmptyState icon={Sparkles} title="Nothing stale" description="Every product in stock has recent sales." compact />
            ) : (
              data.slowMoving.map((p) => <ProductRow key={p.id} product={p} metric={`${p.stockQuantity} in stock`} />)
            )}
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  );
}
