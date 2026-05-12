import { GroupVisibility } from './group-visibility.type';

export interface CreateGroupPayload {
  name: string;
  description?: string;
  visibility?: GroupVisibility;
}
