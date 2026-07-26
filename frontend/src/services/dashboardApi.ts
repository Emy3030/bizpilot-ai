import { api } from './apiClient';
import { ApiSuccess } from '@/types/auth';
import { DashboardSummary } from '@/types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<ApiSuccess<DashboardSummary>>('/dashboard/summary');
    return data.data;
  },
};
