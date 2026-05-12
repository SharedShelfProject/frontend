import { GroupRole } from './group-role.type';
import { MembershipStatus } from './membership-status.type';

export interface Membership {
  id?: string;
  groupId?: string;
  userId: string;
  username: string;
  role: GroupRole;
  status: MembershipStatus;
  joinedAt?: string;
  createdAt?: string;
}
