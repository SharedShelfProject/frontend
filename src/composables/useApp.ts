import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_ROUTE_PATH } from '@/constants/routes.constants';
import { authSessionService } from '@/services/auth-session.service';

export function useApp() {
  const router = useRouter();
  const isLogoutConfirmationOpen = ref(false);
  const isAuthorized = computed(() => authSessionService.hasAccessToken());

  function openLogoutConfirmation(): void {
    isLogoutConfirmationOpen.value = true;
  }

  function closeLogoutConfirmation(): void {
    isLogoutConfirmationOpen.value = false;
  }

  async function confirmLogout(): Promise<void> {
    authSessionService.logout();
    isLogoutConfirmationOpen.value = false;
    await router.push(LOGIN_ROUTE_PATH);
  }

  return {
    isAuthorized,
    isLogoutConfirmationOpen,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout,
  };
}
