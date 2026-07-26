import { api } from './apiClient';
import { NewsResponse } from '@/types/news';

interface ItemResponse<T> {
  success: true;
  data: T;
}

export const newsApi = {
  async getBusinessHeadlines(): Promise<NewsResponse> {
    const { data } = await api.get<ItemResponse<NewsResponse>>('/news/business');
    return data.data;
  },
};
