import { api } from './apiClient';
import { ApiSuccess } from '@/types/auth';
import { DashboardSummary, MissionControlSummary } from '@/types/dashboard';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<ApiSuccess<DashboardSummary>>('/dashboard/summary');
    return data.data;
  },

  async getMissionControl(): Promise<MissionControlSummary> {
    const { data } = await api.get<ApiSuccess<MissionControlSummary>>('/dashboard/mission-control');
    return data.data;
  },
};
