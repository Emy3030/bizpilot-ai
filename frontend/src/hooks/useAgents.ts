import { useQuery } from '@tanstack/react-query';
import { agentApi } from '@/services/agentApi';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentApi.list(),
    refetchInterval: 30_000,
  });
}
