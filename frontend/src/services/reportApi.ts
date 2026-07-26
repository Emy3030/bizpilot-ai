import { api } from './apiClient';
import { ReportPeriod, ReportSummary } from '@/types/report';

interface ItemResponse<T> {
  success: true;
  data: T;
}

export interface ReportParams {
  period: ReportPeriod;
  date?: string;
}

export const reportApi = {
  async getSummary(params: ReportParams): Promise<ReportSummary> {
    const { data } = await api.get<ItemResponse<ReportSummary>>('/reports/summary', { params });
    return data.data;
  },
};
