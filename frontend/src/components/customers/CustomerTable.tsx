import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Customer, PaginationMeta } from '@/types/customer';
import { formatCurrency } from '@/utils/formatCurrency';
import { useDeleteCustomer } from '@/hooks/useCustomers';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface Props {
  customers: Customer[];
  meta?: PaginationMeta;
  isLoading: boolean;
  currency: string;
  onEdit: (customer: Customer) => void;
  onPageChange: (page: number) => void;
}

export function CustomerTable({ customers, meta, isLoading, currency, onEdit, onPageChange }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer.mutateAsync(deleteTarget.id);
      toast.success('Customer deleted');
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
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers yet" description="Add your first one to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th className="px-6 py-3 font-medium">Sales</th>
                    <th className="px-6 py-3 font-medium">Outstanding debt</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const debt = Number(c.outstandingDebt);
                    return (
                      <tr key={c.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-4 font-medium">
                          <Link to={`/customers/${c.id}`} className="hover:text-primary hover:underline">
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {c.phone || c.email || '—'}
                        </td>
                        <td className="px-6 py-4">{c._count?.sales ?? 0}</td>
                        <td className="px-6 py-4">
                          {debt > 0 ? (
                            <Badge variant="warning">{formatCurrency(debt, currency)}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(c)} aria-label={`Edit ${c.name}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)} aria-label={`Delete ${c.name}`}>
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
                Page {meta.page} of {meta.totalPages} · {meta.total} customers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={meta.page <= 1}
                  onClick={() => onPageChange(meta.page - 1)}
                  aria-label="Previous page"
                >
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
        title="Delete customer?"
        description={`This will remove "${deleteTarget?.name}" from your customer list. Their past sales records are kept.`}
        confirmLabel="Delete"
        isLoading={deleteCustomer.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
