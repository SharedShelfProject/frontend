<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { AUTH_EMAIL_MAX_LENGTH, AUTH_PASSWORD_MAX_LENGTH } from '@/modules/auth/constants/auth-limits.constants';
import { LoginFormEmits } from '@/modules/auth/interfaces/login-form-emits.interface';
import { useLoginForm } from '@/modules/auth/composables/useLoginForm';
import './LoginForm.css';

const emit = defineEmits<LoginFormEmits>();
const { formModel, isSubmitting, validationErrorMessage, serverErrorMessage, submitForm } = useLoginForm(emit);
</script>

<template>
  <form class="login-form" novalidate @submit.prevent="submitForm">
    <div class="login-form__header">
      <p class="login-form__eyebrow">Welcome back</p>
      <h1 class="login-form__title">Sign in to Shared Shelf</h1>
      <p class="login-form__description">Keep your books, loans, and reading groups in one calm place.</p>
    </div>

    <BaseError :message="validationErrorMessage || serverErrorMessage" />

    <div class="login-form__fields">
      <BaseInput
        v-model="formModel.email"
        autocomplete="email"
        label="Email"
        :max-length="AUTH_EMAIL_MAX_LENGTH"
        name="email"
        placeholder="you@example.com"
        type="text"
      />

      <BaseInput
        v-model="formModel.password"
        autocomplete="current-password"
        label="Password"
        :max-length="AUTH_PASSWORD_MAX_LENGTH"
        name="password"
        placeholder="Your password"
        type="password"
      />
    </div>

    <BaseButton label="Sign in" :type="BaseButtonHtmlType.Submit" :is-loading="isSubmitting" />

    <p class="login-form__switch">
      New to Shared Shelf?
      <RouterLink class="login-form__link" to="/register">Create an account</RouterLink>
    </p>
  </form>
</template>
