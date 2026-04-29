<script setup lang="ts">
import { AppHeaderEmits } from '@/shared/interfaces/app-header-emits.interface';
import { AppHeaderProperties } from '@/shared/interfaces/app-header-properties.interface';
import { useAppHeader } from '@/shared/composables/useAppHeader';
import './AppHeader.css';

defineProps<AppHeaderProperties>();

const emit = defineEmits<AppHeaderEmits>();
const { handleLogout } = useAppHeader(emit);
</script>

<template>
  <header class="app-header">
    <RouterLink class="app-header__brand" to="/shelf">Shared Shelf</RouterLink>

    <button v-if="isAuthorized" class="app-header__logout-button" aria-label="Log out" title="Log out" @click="handleLogout">
      <svg class="app-header__logout-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 17l1.4-1.4L8.8 13H21v-2H8.8l2.6-2.6L10 7l-5 5 5 5z"></path>
        <path d="M3 21h8v-2H5V5h6V3H3v18z"></path>
      </svg>
    </button>
  </header>
</template>
