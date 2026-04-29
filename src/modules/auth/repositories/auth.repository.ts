import { BaseRepository } from '@/api/base.repository';
import { AuthResponse } from '@/modules/auth/interfaces/auth-response.interface';
import { LoginFormState } from '@/modules/auth/interfaces/login-form-state.interface';
import { RegisterFormState } from '@/modules/auth/interfaces/register-form-state.interface';

class AuthRepository extends BaseRepository {
  login(loginFormState: LoginFormState): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', loginFormState, {
      useAuthorization: false,
    });
  }

  register(registerFormState: RegisterFormState): Promise<AuthResponse> {
    return this.post<AuthResponse>(
      '/auth/register',
      {
        email: registerFormState.email,
        password: registerFormState.password,
        firstName: registerFormState.firstName,
        lastName: registerFormState.lastName,
        username: registerFormState.username,
      },
      { useAuthorization: false },
    );
  }
}

export const authRepository = new AuthRepository();
