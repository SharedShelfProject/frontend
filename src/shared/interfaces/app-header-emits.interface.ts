import { AppHeaderEvent } from '@/shared/enums/app-header-event.enum';

export interface AppHeaderEmits {
  (event: AppHeaderEvent.Logout): void;
}
