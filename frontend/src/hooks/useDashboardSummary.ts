import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 60_000,
  });
}

export function useMissionControl() {
  return useQuery({
    queryKey: ['dashboard-summary', 'mission-control'],
    queryFn: dashboardApi.getMissionControl,
    refetchInterval: 60_000,
  });
}
