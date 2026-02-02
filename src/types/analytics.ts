export interface AnalyticsData {
  period: string;
  projectId?: string;
  requests: number;
  tokens: number;
  cost: number;
  latency: number;
  errors: number;
}

export interface ProviderData {
  provider: string;
  requests: number;
  cost: number;
  color: string;
}

export interface ModelData {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  avgLatency: number;
}

export interface ProjectData{
  id:string,
  name:string
}

export interface AnalyticsDataResponse {
  analytics: AnalyticsData[];
  providers: ProviderData[];
  models: ModelData[];
  projects:ProjectData[];
}
