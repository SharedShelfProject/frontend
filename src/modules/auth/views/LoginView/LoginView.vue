<script setup lang="ts">
import LoginForm from '@/modules/auth/components/LoginForm/LoginForm.vue';
import { useLoginView } from '@/modules/auth/composables/useLoginView';
import './LoginView.css';

const { handleAuthSuccess } = useLoginView();
</script>

<template>
  <main class="login-view">
    <section class="login-view__image" aria-label="Books"></section>

    <section class="login-view__panel">
      <LoginForm @success="handleAuthSuccess" />
    </section>
  </main>
</template>
