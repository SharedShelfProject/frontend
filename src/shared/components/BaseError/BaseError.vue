<script setup lang="ts">
import { BaseErrorProperties } from '@/shared/interfaces/base-error-properties.interface';
import './BaseError.css';

defineProps<BaseErrorProperties>();
</script>

<template>
  <p v-if="message" class="base-error" role="alert">{{ message }}</p>
</template>
