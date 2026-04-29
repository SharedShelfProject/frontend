<script setup lang="ts">
import RegisterForm from '@/modules/auth/components/RegisterForm/RegisterForm.vue';
import { useRegisterView } from '@/modules/auth/composables/useRegisterView';
import './RegisterView.css';

const { handleAuthSuccess } = useRegisterView();
</script>

<template>
  <main class="register-view">
    <section class="register-view__image" aria-label="Books"></section>

    <section class="register-view__panel">
      <RegisterForm @success="handleAuthSuccess" />
    </section>
  </main>
</template>
