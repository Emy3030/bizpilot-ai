import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  amount: z.coerce.number({ invalid_type_error: 'Enter a valid amount' }).gt(0, 'Amount must be greater than zero'),
  categoryId: z.string().optional().or(z.literal('')),
  note: z.string().trim().optional().or(z.literal('')),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
