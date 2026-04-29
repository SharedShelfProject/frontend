import { useRouter } from 'vue-router';

import { HOME_ROUTE_PATH, LOGIN_ROUTE_PATH } from '@/constants/routes.constants';
import { authSessionService } from '@/services/auth-session.service';

export function useNotFoundView() {
  const router = useRouter();

  async function goToStartPage(): Promise<void> {
    const destinationRoutePath = authSessionService.hasAccessToken()
      ? HOME_ROUTE_PATH
      : LOGIN_ROUTE_PATH;

    await router.push(destinationRoutePath);
  }

  return {
    goToStartPage,
  };
}
