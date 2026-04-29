import { useRouter } from 'vue-router';

import { HOME_ROUTE_PATH } from '@/constants/routes.constants';

export function useLoginView() {
  const router = useRouter();

  async function handleAuthSuccess(): Promise<void> {
    await router.push(HOME_ROUTE_PATH);
  }

  return {
    handleAuthSuccess,
  };
}
