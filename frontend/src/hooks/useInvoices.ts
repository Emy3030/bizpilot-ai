import { useQuery } from '@tanstack/react-query';
import { invoiceApi, ListInvoicesParams } from '@/services/invoiceApi';

export function useInvoices(params: ListInvoicesParams) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceApi.list(params),
    placeholderData: (previousData) => previousData,
  });
}
