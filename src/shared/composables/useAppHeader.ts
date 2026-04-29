import { AppHeaderEvent } from '@/shared/enums/app-header-event.enum';
import { AppHeaderEmits } from '@/shared/interfaces/app-header-emits.interface';

export function useAppHeader(emit: AppHeaderEmits) {
  function handleLogout(): void {
    emit(AppHeaderEvent.Logout);
  }

  return {
    handleLogout,
  };
}
