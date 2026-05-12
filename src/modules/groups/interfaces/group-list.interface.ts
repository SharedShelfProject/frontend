import { Group } from './group.interface';

export interface GroupList {
  items: Group[];
  total: number;
  page: number;
  limit: number;
}
