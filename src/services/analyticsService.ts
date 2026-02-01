import { apiClient } from './api';
import { AnalyticsDataResponse } from '@/types/analytics';

export const analyticsService = {
  async getAnalyticsData({ timeRange, project }: { timeRange: string; project: string }): Promise<AnalyticsDataResponse> {
    return apiClient.get<AnalyticsDataResponse>('/_api/analytics', { params: { timeRange, project } });
  },
};
