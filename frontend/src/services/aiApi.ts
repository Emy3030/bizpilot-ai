import { api } from './apiClient';
import { ChatMessage, ChatReply } from '@/types/ai';

interface ItemResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export const aiApi = {
  async sendMessage(message: string): Promise<ChatReply> {
    const { data } = await api.post<ItemResponse<ChatReply>>('/ai/chat', { message });
    return data.data;
  },

  async getHistory(limit = 100): Promise<ChatMessage[]> {
    const { data } = await api.get<ItemResponse<ChatMessage[]>>('/ai/history', { params: { limit } });
    return data.data;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/ai/history');
  },
};
