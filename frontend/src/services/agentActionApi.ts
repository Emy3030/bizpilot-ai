import { api } from './apiClient';
import { AgentAction, AgentActionStatus } from '@/types/agentAction';

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export const agentActionApi = {
  async list(status?: AgentActionStatus): Promise<AgentAction[]> {
    const { data } = await api.get<ItemResponse<AgentAction[]>>('/agent-actions', {
      params: status ? { status } : undefined,
    });
    return data.data;
  },

  async approve(id: string): Promise<AgentAction> {
    const { data } = await api.post<ItemResponse<AgentAction>>(`/agent-actions/${id}/approve`);
    return data.data;
  },

  async reject(id: string): Promise<AgentAction> {
    const { data } = await api.post<ItemResponse<AgentAction>>(`/agent-actions/${id}/reject`);
    return data.data;
  },
};
