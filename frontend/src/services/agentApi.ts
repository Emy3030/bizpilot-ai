import { api } from './apiClient';
import { AgentSummary } from '@/types/agent';

interface ItemResponse<T> {
  success: true;
  data: T;
}

export const agentApi = {
  async list(): Promise<AgentSummary[]> {
    const { data } = await api.get<ItemResponse<AgentSummary[]>>('/agents');
    return data.data;
  },
};
