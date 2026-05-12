import { createRouter, createWebHistory } from 'vue-router';

import {
  BOOK_DETAIL_ROUTE_PATH,
  EDIT_BOOK_ROUTE_PATH,
  GROUP_DETAIL_ROUTE_PATH,
  GROUPS_ROUTE_PATH,
  HOME_ROUTE_PATH,
  LOGIN_ROUTE_PATH,
  MY_BOOKS_ROUTE_PATH,
  NEW_BOOK_ROUTE_PATH,
  PROFILE_ROUTE_PATH,
  REGISTER_ROUTE_PATH,
  ROOT_ROUTE_PATH,
} from '@/constants/routes.constants';
import { RouteName } from '@/enums/route-name.enum';
import HomeView from '@/modules/home/views/HomeView/HomeView.vue';
import LoginView from '@/modules/auth/views/LoginView/LoginView.vue';
import RegisterView from '@/modules/auth/views/RegisterView/RegisterView.vue';
import NotFoundView from '@/modules/not-found/views/NotFoundView/NotFoundView.vue';
import { authSessionService } from '@/services/auth-session.service';
import ProfileView from '@/modules/profile/views/ProfileView.vue';
import MyBooksView from '@/modules/books/views/MyBooksView/MyBooksView.vue';
import BookDetailView from '@/modules/books/views/BookDetailView/BookDetailView.vue';
import BookEditorView from '@/modules/books/views/BookEditorView/BookEditorView.vue';
import GroupsView from '@/modules/groups/views/GroupsView/GroupsView.vue';
import GroupDetailView from '@/modules/groups/views/GroupDetailView/GroupDetailView.vue';

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
      path: PROFILE_ROUTE_PATH,
      name: RouteName.Profile,
      component: ProfileView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: MY_BOOKS_ROUTE_PATH,
      name: RouteName.MyBooks,
      component: MyBooksView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: NEW_BOOK_ROUTE_PATH,
      name: RouteName.NewBook,
      component: BookEditorView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: BOOK_DETAIL_ROUTE_PATH,
      name: RouteName.BookDetail,
      component: BookDetailView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: EDIT_BOOK_ROUTE_PATH,
      name: RouteName.EditBook,
      component: BookEditorView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: GROUPS_ROUTE_PATH,
      name: RouteName.Groups,
      component: GroupsView,
      meta: {
        requiresAuthorization: true,
      },
    },
    {
      path: GROUP_DETAIL_ROUTE_PATH,
      name: RouteName.GroupDetail,
      component: GroupDetailView,
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
