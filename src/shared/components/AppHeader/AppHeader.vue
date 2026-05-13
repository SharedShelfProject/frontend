<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GROUPS_ROUTE_PATH, HOME_ROUTE_PATH, MY_BOOKS_ROUTE_PATH, MY_LOANS_ROUTE_PATH, PROFILE_ROUTE_PATH } from '@/constants/routes.constants';
import { UserProfile } from '@/modules/profile/interfaces/user-profile.interface';
import { usersRepository } from '@/modules/profile/repositories/users.repository';
import { resolveAvatarUrl } from '@/modules/profile/services/avatar-url.service';
import { AppHeaderEmits } from '@/shared/interfaces/app-header-emits.interface';
import { AppHeaderProperties } from '@/shared/interfaces/app-header-properties.interface';
import { useAppHeader } from '@/shared/composables/useAppHeader';
import { localeLabel, t, toggleLocale } from '@/services/localization.service';
import './AppHeader.css';

const props = defineProps<AppHeaderProperties>();

const emit = defineEmits<AppHeaderEmits>();
const { handleLogout } = useAppHeader(emit);

const user = ref<UserProfile | null>(null);
const avatarLoadFailed = ref(false);
const avatarRefreshKey = ref(Date.now());

const displayName = computed(() => {
  if (!user.value) {
    return '';
  }

  const fullName = `${user.value.firstName} ${user.value.lastName}`.trim();

  return fullName || user.value.username;
});

const initials = computed(() => {
  const source = displayName.value || user.value?.email || '?';

  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase())
    .join('');
});

const resolvedAvatarUrl = computed(() => {
  return resolveAvatarUrl(user.value?.avatarUrl, avatarRefreshKey.value);
});

async function fetchHeaderUser() {
  if (!props.isAuthorized) {
    user.value = null;
    return;
  }

  try {
    user.value = await usersRepository.getMe();
    avatarLoadFailed.value = false;
    avatarRefreshKey.value = Date.now();
  } catch {
    user.value = null;
  }
}

watch(
  () => props.isAuthorized,
  fetchHeaderUser,
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('shared-shelf:user-updated', fetchHeaderUser);
});

onBeforeUnmount(() => {
  window.removeEventListener('shared-shelf:user-updated', fetchHeaderUser);
});
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-header__brand" :to="HOME_ROUTE_PATH">
      <span class="app-header__brand-full">Shared Shelf</span>
      <span class="app-header__brand-short">Shelf</span>
    </RouterLink>

    <nav v-if="isAuthorized" class="app-header__nav" aria-label="Account navigation">
      <RouterLink class="app-header__nav-link" :to="HOME_ROUTE_PATH">{{ t('nav.home') }}</RouterLink>
      <RouterLink class="app-header__nav-link" :to="MY_BOOKS_ROUTE_PATH">{{ t('nav.books') }}</RouterLink>
      <RouterLink class="app-header__nav-link" :to="GROUPS_ROUTE_PATH">{{ t('nav.groups') }}</RouterLink>
      <RouterLink class="app-header__nav-link" :to="MY_LOANS_ROUTE_PATH">{{ t('nav.loans') }}</RouterLink>

      <div class="app-header__controls" aria-label="Display preferences">
        <button class="app-header__control-button" type="button" :aria-label="t('nav.switchLanguage')" @click="toggleLocale">
          {{ localeLabel }}
        </button>
      </div>

      <RouterLink class="app-header__profile-link" :to="PROFILE_ROUTE_PATH" :aria-label="t('nav.openProfile')">
        <span class="app-header__avatar">
          <img
            v-if="resolvedAvatarUrl && !avatarLoadFailed"
            :src="resolvedAvatarUrl"
            :alt="`${displayName} avatar`"
            @error="avatarLoadFailed = true"
          />
          <span v-else aria-hidden="true">{{ initials }}</span>
        </span>
        <span v-if="displayName" class="app-header__profile-name">{{ displayName }}</span>
      </RouterLink>

      <button class="app-header__logout-button" :aria-label="t('nav.logout')" :title="t('nav.logout')" @click="handleLogout">
        <svg class="app-header__logout-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 17l1.4-1.4L8.8 13H21v-2H8.8l2.6-2.6L10 7l-5 5 5 5z"></path>
          <path d="M3 21h8v-2H5V5h6V3H3v18z"></path>
        </svg>
      </button>
    </nav>
  </header>
</template>
