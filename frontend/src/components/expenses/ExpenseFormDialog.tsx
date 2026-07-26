import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { expenseSchema, ExpenseFormValues } from '@/utils/expenseSchemas';
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { Expense } from '@/types/expense';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseFormDialog({ open, onOpenChange, expense }: Props) {
  const isEditing = !!expense;
  const { data: categories } = useExpenseCategories();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { title: '', amount: 0, categoryId: '', note: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: expense?.title || '',
        amount: expense ? Number(expense.amount) : 0,
        categoryId: expense?.categoryId || '',
        note: expense?.note || '',
      });
    }
  }, [open, expense, reset]);

  const onSubmit = async (values: ExpenseFormValues) => {
    const payload = {
      title: values.title,
      amount: values.amount,
      categoryId: values.categoryId || undefined,
      note: values.note || undefined,
    };

    try {
      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense.id, payload });
        toast.success('Expense updated');
      } else {
        await createExpense.mutateAsync(payload);
        toast.success('Expense recorded');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit expense' : 'Log expense'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this expense entry.' : 'Record a new business expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. Shop rent, delivery fuel" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('categoryId')}
              >
                <option value="">Uncategorized</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" placeholder="optional" {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save changes' : 'Log expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
