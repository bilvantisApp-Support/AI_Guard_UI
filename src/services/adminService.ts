import { APIUser, UpdateUserRequest, UsersResponse } from '@/types/user';
import { apiClient } from './api';

export const adminService = {
 async listUsers(page = 1, limit = 20) : Promise<UsersResponse>{
    return apiClient.get<UsersResponse>('/_api/admin/users',{
        params:{page,limit}
    })
 },

  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<APIUser> {
    return apiClient.put<APIUser>(
      `/_api/admin/users/${userId}`,
      data
    );
  }, 
};