<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import { useNotFoundView } from '@/modules/not-found/composables/useNotFoundView';
import './NotFoundView.css';

const { goToStartPage } = useNotFoundView();
</script>

<template>
  <main class="not-found-view">
    <section class="not-found-view__content">
      <p class="not-found-view__code">404</p>
      <h1 class="not-found-view__title">Page not found</h1>
      <p class="not-found-view__description">The address you entered does not exist in Shared Shelf.</p>
      <div class="not-found-view__action">
        <BaseButton label="Go back" @click="goToStartPage" />
      </div>
    </section>
  </main>
</template>
