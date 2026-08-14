import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { agentActionApi } from '@/services/agentActionApi';

const PENDING_ACTIONS_KEY = ['agent-actions', 'PENDING'];

function invalidateActionRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: PENDING_ACTIONS_KEY });
  queryClient.invalidateQueries({ queryKey: ['sales'] });
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['customers'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
}

export function usePendingAgentActions() {
  return useQuery({
    queryKey: PENDING_ACTIONS_KEY,
    queryFn: () => agentActionApi.list('PENDING'),
    // Approvals can be created by an agent conversation happening anywhere
    // in the app, not just on this screen — poll so a pending item shows up
    // without a manual refresh.
    refetchInterval: 15_000,
  });
}

export function useAgentActionHistory() {
  return useQuery({
    queryKey: ['agent-actions', 'all'],
    queryFn: () => agentActionApi.list(),
    refetchInterval: 20_000,
  });
}

export function useRecentAgentActivity(limit = 5) {
  return useQuery({
    queryKey: ['agent-actions', 'recent'],
    queryFn: async () => {
      const all = await agentActionApi.list();
      return all.filter((a) => a.status !== 'PENDING').slice(0, limit);
    },
    refetchInterval: 20_000,
  });
}

export function useApproveAgentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentActionApi.approve(id),
    onSuccess: () => invalidateActionRelatedQueries(queryClient),
  });
}

export function useRejectAgentAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentActionApi.reject(id),
    onSuccess: () => invalidateActionRelatedQueries(queryClient),
  });
}
