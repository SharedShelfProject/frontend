import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { CreateGroupPayload } from '../interfaces/create-group-payload.interface';
import { Group } from '../interfaces/group.interface';
import { GroupList } from '../interfaces/group-list.interface';
import { GroupsSearchParams } from '../interfaces/groups-search-params.interface';

function createSearchParams(params: GroupsSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set('query', params.query);
  }

  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

class GroupsRepository extends BaseRepository {
  create(payload: CreateGroupPayload): Promise<Group> {
    return this.request<Group>('/groups', HttpMethod.Post, payload);
  }

  searchOpen(params: GroupsSearchParams = {}): Promise<GroupList> {
    return this.request<GroupList>(`/groups${createSearchParams(params)}`, HttpMethod.Get);
  }

  getMyGroups(): Promise<GroupList> {
    return this.request<GroupList>('/groups/me', HttpMethod.Get);
  }

  getById(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}`, HttpMethod.Get);
  }

  joinOpen(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}/join`, HttpMethod.Post, {});
  }

  joinPrivate(inviteCode: string): Promise<Group> {
    return this.request<Group>('/groups/join/private', HttpMethod.Post, { inviteCode });
  }

  leave(groupId: string): Promise<void> {
    return this.request<void>(`/groups/${groupId}/leave`, HttpMethod.Delete);
  }
}

export const groupsRepository = new GroupsRepository();
