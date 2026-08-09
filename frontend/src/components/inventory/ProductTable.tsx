import { useState } from 'react';
import { Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductThumbnail } from '@/components/ui/product-thumbnail';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Product } from '@/types/inventory';
import { PaginationMeta } from '@/types/customer';
import { formatCurrency } from '@/utils/formatCurrency';
import { useDeleteProduct } from '@/hooks/useProducts';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface Props {
  products: Product[];
  meta?: PaginationMeta;
  isLoading: boolean;
  currency: string;
  onEdit: (product: Product) => void;
  onPageChange: (page: number) => void;
}

export function ProductTable({ products, meta, isLoading, currency, onEdit, onPageChange }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const deleteProduct = useDeleteProduct();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <EmptyState icon={Package} title="No products yet" description="Add your first one to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Barcode</th>
                    <th className="px-6 py-3 font-medium">Price</th>
                    <th className="px-6 py-3 font-medium">Stock</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isLow = p.stockQuantity <= p.lowStockThreshold;
                    return (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <ProductThumbnail imageUrl={p.imageUrl} name={p.name} />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{p.name}</p>
                              {p.sku && <p className="truncate text-xs text-muted-foreground">SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{p.category?.name || 'Uncategorized'}</td>
                        <td className="px-6 py-3 text-muted-foreground">{p.barcode || '—'}</td>
                        <td className="px-6 py-3 font-medium">{formatCurrency(Number(p.sellingPrice), currency)}</td>
                        <td className="px-6 py-3">
                          {isLow ? (
                            <Badge variant="warning">{p.stockQuantity} left</Badge>
                          ) : (
                            <span>{p.stockQuantity}</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(p)} aria-label={`Edit ${p.name}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p)} aria-label={`Delete ${p.name}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} products
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete product?"
        description={`This will permanently remove "${deleteTarget?.name}" from your inventory. Products with sales history can't be deleted — set stock to 0 instead.`}
        confirmLabel="Delete"
        isLoading={deleteProduct.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
