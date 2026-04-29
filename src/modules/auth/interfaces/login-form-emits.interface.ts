import { AuthFormEvent } from '@/modules/auth/enums/auth-form-event.enum';

export interface LoginFormEmits {
  (event: AuthFormEvent.Success): void;
}
