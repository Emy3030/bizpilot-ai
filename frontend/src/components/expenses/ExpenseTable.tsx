import { useState } from 'react';
import { Pencil, Trash2, Wallet, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Expense } from '@/types/expense';
import { PaginationMeta } from '@/types/customer';
import { formatCurrency } from '@/utils/formatCurrency';
import { useDeleteExpense } from '@/hooks/useExpenses';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface Props {
  expenses: Expense[];
  meta?: PaginationMeta;
  isLoading: boolean;
  currency: string;
  onEdit: (expense: Expense) => void;
  onPageChange: (page: number) => void;
}

export function ExpenseTable({ expenses, meta, isLoading, currency, onEdit, onPageChange }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const deleteExpense = useDeleteExpense();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense.mutateAsync(deleteTarget.id);
      toast.success('Expense deleted');
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
          {expenses.length === 0 ? (
            <EmptyState icon={Wallet} title="No expenses logged yet" description="Log your first expense to start tracking." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{e.title}</p>
                          {e.isUnusual && (
                            <span
                              className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                              title="More than double this category's usual spend"
                            >
                              <TrendingUp className="h-3 w-3" /> Unusual
                            </span>
                          )}
                        </div>
                        {e.note && <p className="truncate text-xs text-muted-foreground">{e.note}</p>}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="secondary">{e.category?.name || 'Uncategorized'}</Badge>
                      </td>
                      <td className="px-6 py-3 font-semibold">{formatCurrency(Number(e.amount), currency)}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(e)} aria-label={`Edit ${e.title}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(e)} aria-label={`Delete ${e.title}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
                Page {meta.page} of {meta.totalPages} · {meta.total} expenses
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
        title="Delete expense?"
        description={`This will permanently remove "${deleteTarget?.title}".`}
        confirmLabel="Delete"
        isLoading={deleteExpense.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
