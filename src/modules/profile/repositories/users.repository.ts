import { apiClient } from '@/api/api-client';
import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { UserProfile } from '../interfaces/user-profile.interface';
import { UpdateProfilePayload } from '../interfaces/update-profile.interface';

class UsersRepository extends BaseRepository {
  getMe(): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', HttpMethod.Get);
  }

  updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
    return this.request<UserProfile>('/users/me', HttpMethod.Patch, payload);
  }

  uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();

    formData.append('file', file);

    return apiClient<UserProfile>('/users/me/avatar', {
      method: HttpMethod.Post,
      body: formData,
    });
  }
}

export const usersRepository = new UsersRepository();