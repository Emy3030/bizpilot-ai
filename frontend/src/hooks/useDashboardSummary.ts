import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboardApi';

export function useMissionControl() {
  return useQuery({
    queryKey: ['dashboard-summary', 'mission-control'],
    queryFn: dashboardApi.getMissionControl,
    refetchInterval: 60_000,
  });
}
