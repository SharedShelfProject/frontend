<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_NAME_MAX_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_USERNAME_MAX_LENGTH,
} from '@/modules/auth/constants/auth-limits.constants';
import { RegisterFormEmits } from '@/modules/auth/interfaces/register-form-emits.interface';
import { useRegisterForm } from '@/modules/auth/composables/useRegisterForm';
import './RegisterForm.css';

const emit = defineEmits<RegisterFormEmits>();
const { formModel, isSubmitting, validationErrorMessage, serverErrorMessage, submitForm } = useRegisterForm(emit);
</script>

<template>
  <form class="register-form" novalidate @submit.prevent="submitForm">
    <div class="register-form__header">
      <p class="register-form__eyebrow">Start sharing</p>
      <h1 class="register-form__title">Create your Shared Shelf account</h1>
      <p class="register-form__description">Build a personal shelf and make borrowing between friends easier.</p>
    </div>

    <BaseError :message="validationErrorMessage || serverErrorMessage" />

    <div class="register-form__fields">
      <BaseInput
        v-model="formModel.firstName"
        autocomplete="given-name"
        label="First name"
        :max-length="AUTH_NAME_MAX_LENGTH"
        name="firstName"
        placeholder="John"
      />

      <BaseInput
        v-model="formModel.lastName"
        autocomplete="family-name"
        label="Last name"
        :max-length="AUTH_NAME_MAX_LENGTH"
        name="lastName"
        placeholder="Doe"
      />

      <BaseInput
        v-model="formModel.username"
        autocomplete="username"
        label="Username"
        :max-length="AUTH_USERNAME_MAX_LENGTH"
        name="username"
        placeholder="johndoe"
      />

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
        autocomplete="new-password"
        label="Password"
        :max-length="AUTH_PASSWORD_MAX_LENGTH"
        name="password"
        placeholder="At least 8 characters"
        type="password"
      />

      <BaseInput
        v-model="formModel.confirmPassword"
        autocomplete="new-password"
        label="Repeat password"
        :max-length="AUTH_PASSWORD_MAX_LENGTH"
        name="confirmPassword"
        placeholder="Repeat your password"
        type="password"
      />
    </div>

    <BaseButton label="Create account" :type="BaseButtonHtmlType.Submit" :is-loading="isSubmitting" />

    <p class="register-form__switch">
      Already have an account?
      <RouterLink class="register-form__link" to="/login">Sign in</RouterLink>
    </p>
  </form>
</template>
