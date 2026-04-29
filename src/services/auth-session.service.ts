import { reactive } from 'vue';

import { ACCESS_TOKEN_STORAGE_KEY } from '@/constants/storage.constants';
import { AuthSessionState } from '@/interfaces/auth-session-state.interface';

const authSessionState = reactive<AuthSessionState>({
  accessToken: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
});

export const authSessionService = {
  state: authSessionState,

  getAccessToken(): string | null {
    return authSessionState.accessToken;
  },

  hasAccessToken(): boolean {
    return Boolean(authSessionState.accessToken);
  },

  setAccessToken(accessToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
    authSessionState.accessToken = accessToken;
  },

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    authSessionState.accessToken = null;
  },
};
