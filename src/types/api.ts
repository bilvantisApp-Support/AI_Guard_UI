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
  role: 'owner' | 'admin' | 'member' | 'viewer';
  members?: ProjectMember[];
  settings?: ProjectSettings;
  usage?: UsageMetrics;
  createdAt: string;
  updatedAt: string;
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
  role: 'owner' | 'admin' | 'member' | 'viewer';
  addedAt: string;
}

export interface ProjectSettings {
  rateLimiting?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  quotas?: {
    daily?: number;
    monthly?: number;
  };
  allowedProviders?: string[];
}

export interface ApiKey {
  id: string;
  keyId: string;
  projectId: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  keyPrefix: string;
  status: 'active' | 'inactive';
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
  daily: Usage[];
  monthly: Usage[];
  total: {
    requests: number;
    tokens: number;
    cost: number;
  };
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