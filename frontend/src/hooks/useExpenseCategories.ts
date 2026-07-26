import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseCategoryApi } from '@/services/expenseCategoryApi';

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: expenseCategoryApi.list,
  });
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => expenseCategoryApi.create(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] }),
  });
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => expenseCategoryApi.update(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] }),
  });
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseCategoryApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
