import { apiClient } from './api';
import { Project, ProjectsResponse, ApiKey, ApiKeysResponse, UsageStats, QuotaStatus, ProjectMember } from '@/types/api';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await apiClient.get<ProjectsResponse>('/_api/projects');
    return response.projects;
  },

  async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/_api/projects/${id}`);
  },

  async createProject(data: { name: string; description?: string }): Promise<Project> {
    return apiClient.post<Project>('/_api/projects', data);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return apiClient.put<Project>(`/_api/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`/_api/projects/${id}`);
  },

  async getProjectKeys(projectId: string): Promise<ApiKey[]> {
    try {
      // Try to get response as wrapped object first
      const response = await apiClient.get<ApiKeysResponse>(`/_api/projects/${projectId}/keys`);
      // If response has keys property, extract it
      if (response && typeof response === 'object' && 'keys' in response) {
        return response.keys;
      }
      // Otherwise assume it's already an array
      return response as any as ApiKey[];
    } catch (error) {
      // If that fails, try as direct array
      return apiClient.get<ApiKey[]>(`/_api/projects/${projectId}/keys`);
    }
  },

  async addProjectKey(
    projectId: string,
    data: {provider: string; apiKey: string }
  ): Promise<ApiKey> {
    return apiClient.post<ApiKey>(`/_api/projects/${projectId}/keys`, data);
  },

  async updateProjectKey(
    projectId: string,
    keyId: string,
    data: { name?: string; status?: 'active' | 'inactive' }
  ): Promise<ApiKey> {
    return apiClient.put<ApiKey>(`/_api/projects/${projectId}/keys/${keyId}`, data);
  },

  async deleteProjectKey(projectId: string, keyId: string): Promise<void> {
    return apiClient.delete<void>(`/_api/projects/${projectId}/keys/${keyId}`);
  },

  async getProjectUsage(
    projectId: string,
    params?: { startDate?: string; endDate?: string; groupBy?: string }
  ): Promise<UsageStats> {
    return apiClient.get<UsageStats>(`/_api/projects/${projectId}/usage`, { params });
  },

  async getProjectQuota(projectId: string): Promise<QuotaStatus> {
    return apiClient.get<QuotaStatus>(`/_api/projects/${projectId}/quota`);
  },

  async addProjectMember(
    projectId: string,
    data: { email: string; role: 'owner' | 'admin' | 'member' }
  ): Promise<{member:ProjectMember}> {
    return apiClient.post<{ member: ProjectMember }>(`/_api/projects/${projectId}/members`, data);
  },

  async updateProjectMember(
    projectId: string,
    memberId: string,
    data: { role: 'owner' | 'admin' | 'member' }
  ): Promise<ProjectMember> {
    return apiClient.put<ProjectMember>(`/_api/projects/${projectId}/members/${memberId}`, data);
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(`/_api/projects/${projectId}/members/${memberId}`);
  },
};