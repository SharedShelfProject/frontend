import { GroupVisibility } from './group-visibility.type';

export interface GroupFormState {
  name: string;
  description: string;
  visibility: GroupVisibility;
}
