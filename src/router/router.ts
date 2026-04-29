import { createRouter, createWebHistory } from 'vue-router';

import { HOME_ROUTE_PATH, LOGIN_ROUTE_PATH, REGISTER_ROUTE_PATH, ROOT_ROUTE_PATH } from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import HomeView from '@/modules/home/views/HomeView/HomeView.vue';
import LoginView from '@/modules/auth/views/LoginView/LoginView.vue';
import RegisterView from '@/modules/auth/views/RegisterView/RegisterView.vue';
import NotFoundView from '@/modules/not-found/views/NotFoundView/NotFoundView.vue';
import { authSessionService } from '@/services/auth-session.service';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: ROOT_ROUTE_PATH,
      redirect: HOME_ROUTE_PATH,
    },
    {
      path: LOGIN_ROUTE_PATH,
      name: RouteName.Login,
      component: LoginView,
      meta: {
        onlyGuest: true,
      },
    },
    {
      path: REGISTER_ROUTE_PATH,
      name: RouteName.Register,
      component: RegisterView,
      meta: {
        onlyGuest: true,
      },
    },
    {
      path: HOME_ROUTE_PATH,
      name: RouteName.Home,
      component: HomeView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFoundView,
    },
  ],
});

router.beforeEach((to) => {
  const hasAccessToken = authSessionService.hasAccessToken();

  if (to.meta.onlyGuest && hasAccessToken) {
    return HOME_ROUTE_PATH;
  }

  if (to.meta.requiresAuthorization && !hasAccessToken) {
    return LOGIN_ROUTE_PATH;
  }

  return true;
});
