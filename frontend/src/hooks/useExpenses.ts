import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseApi, ListExpensesParams } from '@/services/expenseApi';
import { ExpenseInput } from '@/types/expense';

function invalidateExpenseQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['expenses'] });
  queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
}

export function useExpenses(params: ListExpensesParams) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useExpenseSummary() {
  return useQuery({
    queryKey: ['expense-summary'],
    queryFn: expenseApi.getSummary,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseInput) => expenseApi.create(payload),
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExpenseInput> }) => expenseApi.update(id, payload),
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.remove(id),
    onSuccess: () => invalidateExpenseQueries(queryClient),
  });
}
