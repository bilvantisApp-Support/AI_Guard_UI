import { apiClient } from './api';
import {
  Team,
  TeamsResponse,
  TeamMember,
  TeamUsageResponse,
  TeamProject,
  TeamSettings,
} from '@/types/api';

export const teamService = {
  async getTeams(): Promise<Team[]> {
    const response = await apiClient.get<TeamsResponse>('/_api/teams');
    return response.teams;
  },

  async getTeam(id: string): Promise<Team> {
    return apiClient.get<Team>(`/_api/teams/${id}`);
  },

  async createTeam(data: { name: string; description?: string }): Promise<Team> {
    return apiClient.post<Team>('/_api/teams', data);
  },

  async updateTeam(id: string, data: { name?: string; settings?: TeamSettings }): Promise<Team> {
    return apiClient.put<Team>(`/_api/teams/${id}`, data);
  },

  async deleteTeam(id: string): Promise<void> {
    return apiClient.delete<void>(`/_api/teams/${id}`);
  },

  async addTeamMember(
    teamId: string,
    data: { email: string; role: 'admin' | 'member' }
  ): Promise<{ member: TeamMember }> {
    return apiClient.post<{ member: TeamMember }>(`/_api/teams/${teamId}/members`, data);
  },

  async updateTeamMember(
    teamId: string,
    memberId: string,
    data: { role: 'admin' | 'member' }
  ): Promise<TeamMember> {
    return apiClient.put<TeamMember>(`/_api/teams/${teamId}/members/${memberId}`, data);
  },

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    return apiClient.delete<void>(`/_api/teams/${teamId}/members/${memberId}`);
  },

  async assignTeamProject(
    teamId: string,
    data: { projectId: string }
  ): Promise<{ projectId: string; teamId: string }> {
    return apiClient.post<{ projectId: string; teamId: string }>(`/_api/teams/${teamId}/projects`, data);
  },

  async removeTeamProject(teamId: string, projectId: string): Promise<void> {
    return apiClient.delete<void>(`/_api/teams/${teamId}/projects/${projectId}`);
  },

  async getTeamUsage(
    teamId: string,
    params?: { startDate?: string; endDate?: string; groupBy?: string }
  ): Promise<TeamUsageResponse> {
    return apiClient.get<TeamUsageResponse>(`/_api/teams/${teamId}/usage`, { params });
  },
};
