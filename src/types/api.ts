export interface ApiError {
  error: {
    type: string;
    message: string;
    statusCode: number;
    timestamp: string;
    suggestions?: string[];
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  apiKeyCount: number;
  role: 'owner' | 'admin' | 'member';
  members?: ProjectMember[];
  settings?: ProjectSettings;
  usage?: UsageMetrics;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProject{
  name?: string;
  settings?:ProjectSettings;
}

export interface UsageMetrics {
  total?: {
    cost: number;
    requests: number;
    tokens: number;
  };
  currentMonth?: {
    requests: number;
    tokens: number;
    cost: number;
  };
  currentDay?: {
    requests: number;
    tokens: number;
    cost: number;
  };
  lastUpdated?: string;
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  addedAt: string;
}

export interface ProjectSettings {
  plan?: 'free' | 'pro' | 'enterprise' | 'custom',
  rateLimitOverride?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  quotaOverride?: {
    dailyLimit?: number;
    monthlyLimit?: number;
  };
  allowedProviders?: string[];
}

export interface ApiKey {
  id: string;
  keyId: string;
  projectId: string;
  name: string;
  maskedKey: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  isActive: true | false;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Usage {
  date: string;
  provider: string;
  model: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface UsageStats {
    requests: number;
    tokens: number;
    cost: number;
};

export interface ProjectUsageResponse {
  projectId: string;
  period: {
    start: string;
    end: string;
  };
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, UsageStats>;
  byModel: Record<string, UsageStats>;
  byUser: Record<string, UsageStats>;
}


export interface QuotaStatus {
  daily: {
    used: number;
    limit: number;
    percentage: number;
  };
  monthly: {
    used: number;
    limit: number;
    percentage: number;
  };
}

export interface ApiKeysResponse {
  keys: ApiKey[];
  total: number;
}