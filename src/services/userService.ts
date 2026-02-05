import { apiClient } from './api';
import { User, PersonalAccessToken, TokensResponse, CreateTokenRequest, APIUser } from '@/types/user';

export const userService = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/_api/users/profile');
  },

  async getActiveUsers(): Promise<APIUser[]> {
    const { users } = await apiClient.get<{
      users: APIUser[];
      total: number;
    }>('/_api/users');

    return users;
  },

  async updateProfile(data: { name?: string }): Promise<User> {
    return apiClient.put<User>('/_api/users/profile', data);
  },

  async createProfile(data: { name?: string }): Promise<User> {
    return apiClient.post<User>('/_api/users/profile', data);
  },

  async getTokens(): Promise<PersonalAccessToken[]> {
    try {
      // Try to get response as wrapped object first
      const response = await apiClient.get<TokensResponse>('/_api/users/tokens');
      // If response has tokens property, extract it
      if (response && typeof response === 'object' && 'tokens' in response) {
        return response.tokens;
      }
      // Otherwise assume it's already an array
      return response as any as PersonalAccessToken[];
    } catch (error) {
      // If that fails, try as direct array
      return apiClient.get<PersonalAccessToken[]>('/_api/users/tokens');
    }
  },

  async createToken(data: CreateTokenRequest): Promise<PersonalAccessToken> {
    return apiClient.post<PersonalAccessToken>('/_api/users/tokens', data);
  },

  async rotateToken(tokenId: string): Promise<PersonalAccessToken> {
    return apiClient.post<PersonalAccessToken>(`/_api/users/tokens/${tokenId}/rotate`);
  },

  async deleteToken(tokenId: string): Promise<void> {
    return apiClient.delete<void>(`/_api/users/tokens/${tokenId}`);
  },
};