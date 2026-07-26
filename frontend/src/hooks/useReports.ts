import { useQuery } from '@tanstack/react-query';
import { reportApi, ReportParams } from '@/services/reportApi';

export function useReportSummary(params: ReportParams) {
  return useQuery({
    queryKey: ['report-summary', params],
    queryFn: () => reportApi.getSummary(params),
    placeholderData: (previousData) => previousData,
  });
}
