import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi, ListCustomersParams } from '@/services/customerApi';
import { CustomerInput } from '@/types/customer';

export function useCustomers(params: ListCustomersParams) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerInput) => customerApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CustomerInput> }) =>
      customerApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
