import { reactive, ref } from 'vue';

import { AuthFormEvent } from '@/modules/auth/enums/auth-form-event.enum';
import { LoginFormEmits } from '@/modules/auth/interfaces/login-form-emits.interface';
import { LoginFormState } from '@/modules/auth/interfaces/login-form-state.interface';
import { authRepository } from '@/modules/auth/repositories/auth.repository';
import { authSessionService } from '@/services/auth-session.service';

export function useLoginForm(emit: LoginFormEmits) {
  const formModel = reactive<LoginFormState>({
    email: '',
    password: '',
  });

  const isSubmitting = ref(false);
  const validationErrorMessage = ref('');
  const serverErrorMessage = ref('');

  function isEmailValid(emailValue: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue);
  }

  function validateForm(): boolean {
    const normalizedEmail = formModel.email.trim();

    if (!normalizedEmail) {
      validationErrorMessage.value = 'Email field cannot be empty';
      return false;
    }

    if (!isEmailValid(normalizedEmail)) {
      validationErrorMessage.value = 'Email must have format like name@domain.com';
      return false;
    }

    if (!formModel.password) {
      validationErrorMessage.value = 'Password field cannot be empty';
      return false;
    }

    validationErrorMessage.value = '';
    return true;
  }

  async function submitForm(): Promise<void> {
    serverErrorMessage.value = '';

    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const authResponse = await authRepository.login({
        email: formModel.email.trim(),
        password: formModel.password,
      });

      authSessionService.setAccessToken(authResponse.accessToken);
      emit(AuthFormEvent.Success);
    } catch (error) {
      serverErrorMessage.value = error instanceof Error ? error.message : 'Login failed';
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    formModel,
    isSubmitting,
    validationErrorMessage,
    serverErrorMessage,
    submitForm,
  };
}
