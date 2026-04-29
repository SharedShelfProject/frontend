import { AuthFormEvent } from '@/modules/auth/enums/auth-form-event.enum';

export interface RegisterFormEmits {
  (event: AuthFormEvent.Success): void;
}
