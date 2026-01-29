export interface User {
  uid: string;
  email: string;
  name?: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface APIUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface PersonalAccessToken {
  id: string;
  name: string;
  token?: string; // Only present during creation, not in list responses
  scopes: string[];
  llmProvider?: 'openai' | 'anthropic' | 'gemini';
  projectId?: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isRevoked: boolean;
  createdAt: string;
}

export interface TokensResponse {
  tokens: PersonalAccessToken[];
  total: number;
}

export interface CreateTokenRequest {
  name: string;
  scopes: string[];
  llmProvider?: 'openai' | 'anthropic' | 'gemini';
  projectId?: string;
  userId?: string;
  expiresInDays?: number;
}

export const TOKEN_SCOPES = [
  'api:read',
  'api:write',
  'projects:read',
  'projects:write',
  'users:read',
  'users:write',
  'admin'
] as const;

export type TokenScope = typeof TOKEN_SCOPES[number];