import { GroupVisibility } from './group-visibility.type';

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  visibility: GroupVisibility;
  inviteCode?: string | null;
  ownerId?: string;
  ownerUsername?: string;
  memberCount?: number;
  createdAt?: string;
}
