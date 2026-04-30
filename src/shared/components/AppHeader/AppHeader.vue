<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { API_BASE_PATH } from '@/constants/api.constants';
import { HOME_ROUTE_PATH, PROFILE_ROUTE_PATH } from '@/constants/routes.constants';
import { UserProfile } from '@/modules/profile/interfaces/user-profile.interface';
import { usersRepository } from '@/modules/profile/repositories/users.repository';
import { AppHeaderEmits } from '@/shared/interfaces/app-header-emits.interface';
import { AppHeaderProperties } from '@/shared/interfaces/app-header-properties.interface';
import { useAppHeader } from '@/shared/composables/useAppHeader';
import './AppHeader.css';

const props = defineProps<AppHeaderProperties>();

const emit = defineEmits<AppHeaderEmits>();
const { handleLogout } = useAppHeader(emit);

const user = ref<UserProfile | null>(null);
const avatarLoadFailed = ref(false);

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
  if (!user.value?.avatarUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(user.value.avatarUrl)) {
    return user.value.avatarUrl;
  }

  return `${API_BASE_PATH}${user.value.avatarUrl.startsWith('/') ? '' : '/'}${user.value.avatarUrl}`;
});

watch(
  () => props.isAuthorized,
  async (isAuthorized) => {
    if (!isAuthorized) {
      user.value = null;
      return;
    }

    try {
      user.value = await usersRepository.getMe();
      avatarLoadFailed.value = false;
    } catch {
      user.value = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-header__brand" :to="HOME_ROUTE_PATH">Shared Shelf</RouterLink>

    <nav v-if="isAuthorized" class="app-header__nav" aria-label="Account navigation">
      <RouterLink class="app-header__profile-link" :to="PROFILE_ROUTE_PATH" aria-label="Open profile">
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

      <button class="app-header__logout-button" aria-label="Log out" title="Log out" @click="handleLogout">
        <svg class="app-header__logout-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 17l1.4-1.4L8.8 13H21v-2H8.8l2.6-2.6L10 7l-5 5 5 5z"></path>
          <path d="M3 21h8v-2H5V5h6V3H3v18z"></path>
        </svg>
      </button>
    </nav>
  </header>
</template>
