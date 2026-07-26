import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 60_000,
  });
}
