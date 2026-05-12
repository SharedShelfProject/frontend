import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { GroupRole } from '../interfaces/group-role.type';
import { Membership } from '../interfaces/membership.interface';

class GroupMembersRepository extends BaseRepository {
  getMembers(groupId: string): Promise<Membership[]> {
    return this.request<Membership[]>(`/groups/${groupId}/members`, HttpMethod.Get);
  }

  updateRole(groupId: string, userId: string, role: Exclude<GroupRole, 'owner'>): Promise<Membership> {
    return this.request<Membership>(`/groups/${groupId}/members/${userId}/role`, HttpMethod.Patch, { role });
  }

  remove(groupId: string, userId: string): Promise<void> {
    return this.request<void>(`/groups/${groupId}/members/${userId}`, HttpMethod.Delete);
  }

  block(groupId: string, userId: string): Promise<Membership> {
    return this.request<Membership>(`/groups/${groupId}/members/${userId}/block`, HttpMethod.Post, {});
  }

  unblock(groupId: string, userId: string): Promise<Membership> {
    return this.request<Membership>(`/groups/${groupId}/members/${userId}/unblock`, HttpMethod.Post, {});
  }

  transferOwnership(groupId: string, newOwnerId: string): Promise<Membership[]> {
    return this.request<Membership[]>(`/groups/${groupId}/members/transfer-ownership`, HttpMethod.Post, { newOwnerId });
  }
}

export const groupMembersRepository = new GroupMembersRepository();
