import { reactive, ref } from 'vue';

import { AuthFormEvent } from '@/modules/auth/enums/auth-form-event.enum';
import { RegisterFormEmits } from '@/modules/auth/interfaces/register-form-emits.interface';
import { RegisterFormState } from '@/modules/auth/interfaces/register-form-state.interface';
import { authRepository } from '@/modules/auth/repositories/auth.repository';
import { authSessionService } from '@/services/auth-session.service';

export function useRegisterForm(emit: RegisterFormEmits) {
  const formModel = reactive<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
  });

  const isSubmitting = ref(false);
  const validationErrorMessage = ref('');
  const serverErrorMessage = ref('');

  function isEmailValid(emailValue: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue);
  }

  function validateForm(): boolean {
    if (!formModel.firstName.trim()) {
      validationErrorMessage.value = 'First name field cannot be empty';
      return false;
    }

    if (!formModel.lastName.trim()) {
      validationErrorMessage.value = 'Last name field cannot be empty';
      return false;
    }

    if (!formModel.username.trim()) {
      validationErrorMessage.value = 'Username field cannot be empty';
      return false;
    }

    if (formModel.username.trim().length < 3) {
      validationErrorMessage.value = 'Username must be at least 3 characters';
      return false;
    }

    if (!formModel.email.trim()) {
      validationErrorMessage.value = 'Email field cannot be empty';
      return false;
    }

    if (!isEmailValid(formModel.email.trim())) {
      validationErrorMessage.value = 'Email must have format like name@domain.com';
      return false;
    }

    if (!formModel.password) {
      validationErrorMessage.value = 'Password field cannot be empty';
      return false;
    }

    if (formModel.password.length < 8) {
      validationErrorMessage.value = 'Password must be at least 8 characters';
      return false;
    }

    if (!formModel.confirmPassword) {
      validationErrorMessage.value = 'Repeat password field cannot be empty';
      return false;
    }

    if (formModel.confirmPassword !== formModel.password) {
      validationErrorMessage.value = 'Passwords do not match';
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
      const authResponse = await authRepository.register({
        email: formModel.email.trim(),
        password: formModel.password,
        confirmPassword: formModel.confirmPassword,
        firstName: formModel.firstName.trim(),
        lastName: formModel.lastName.trim(),
        username: formModel.username.trim(),
      });

      authSessionService.setAccessToken(authResponse.accessToken);
      emit(AuthFormEvent.Success);
    } catch (error) {
      serverErrorMessage.value = error instanceof Error ? error.message : 'Registration failed';
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
