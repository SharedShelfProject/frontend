<script setup lang="ts">
import BaseConfirmationModal from '@/shared/components/BaseConfirmationModal/BaseConfirmationModal.vue';
import AppHeader from '@/shared/components/AppHeader/AppHeader.vue';
import { useApp } from '@/composables/useApp';

const { isAuthorized, isLogoutConfirmationOpen, openLogoutConfirmation, closeLogoutConfirmation, confirmLogout } = useApp();
</script>

<template>
  <AppHeader :is-authorized="isAuthorized" @logout="openLogoutConfirmation" />
  <RouterView />
  <BaseConfirmationModal
    cancel-label="Cancel"
    confirm-label="Log out"
    :is-open="isLogoutConfirmationOpen"
    message="You will need to sign in again to manage your shared shelf."
    title="Log out?"
    @cancel="closeLogoutConfirmation"
    @confirm="confirmLogout"
  />
</template>
