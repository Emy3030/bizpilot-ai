import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saleApi, ListSalesParams } from '@/services/saleApi';
import { CreateSaleInput } from '@/types/sale';

function invalidateSaleRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['sales'] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
}

export function useSales(params: ListSalesParams) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleApi.getById(id as string),
    enabled: !!id,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSaleInput) => saleApi.create(payload),
    onSuccess: () => invalidateSaleRelatedQueries(queryClient),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => saleApi.recordPayment(id, amount),
    onSuccess: (_data, variables) => {
      invalidateSaleRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
    },
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => saleApi.generateInvoice(saleId),
    onSuccess: (_data, saleId) => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useGenerateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleId: string) => saleApi.generateReceipt(saleId),
    onSuccess: (_data, saleId) => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}
