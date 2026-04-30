<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { API_BASE_PATH } from '@/constants/api.constants';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { useProfileView } from '../composables/useProfileView';
import { useEditProfile } from '../composables/useEditProfile';
import './ProfileView.css';

const MAX_AVATAR_SIZE_IN_BYTES = 5 * 1024 * 1024;

const { user, isLoading, fetchProfile } = useProfileView();
const { updateProfile, uploadAvatar, isSaving, isUploadingAvatar } = useEditProfile();

const form = ref({
  firstName: '',
  lastName: '',
  bio: '',
});

const statusMessage = ref('');
const errorMessage = ref('');
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

const joinedAt = computed(() => {
  if (!user.value?.createdAt) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.value.createdAt));
});

const isFormChanged = computed(() => {
  if (!user.value) {
    return false;
  }

  return (
    form.value.firstName !== user.value.firstName ||
    form.value.lastName !== user.value.lastName ||
    form.value.bio !== (user.value.bio ?? '')
  );
});

watch(
  user,
  (value) => {
    if (value) {
      avatarLoadFailed.value = false;
      form.value.firstName = value.firstName;
      form.value.lastName = value.lastName;
      form.value.bio = value.bio ?? '';
    }
  },
  { immediate: true },
);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

async function handleSubmit() {
  statusMessage.value = '';
  errorMessage.value = '';

  try {
    await updateProfile({
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      bio: form.value.bio.trim(),
    });
    await fetchProfile();
    statusMessage.value = 'Profile updated successfully.';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  }
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  statusMessage.value = '';
  errorMessage.value = '';

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please choose an image file.';
    input.value = '';
    return;
  }

  if (file.size > MAX_AVATAR_SIZE_IN_BYTES) {
    errorMessage.value = 'Avatar must be 5 MB or smaller.';
    input.value = '';
    return;
  }

  try {
    await uploadAvatar(file);
    await fetchProfile();
    statusMessage.value = 'Avatar updated successfully.';
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    input.value = '';
  }
}
</script>

<template>
  <main class="profile-view">
    <section class="profile-view__shell">
      <div class="profile-view__header">
        <div>
          <p class="profile-view__eyebrow">Account settings</p>
          <h1 class="profile-view__title">Profile</h1>
        </div>
      </div>

      <div v-if="isLoading" class="profile-view__loading" aria-live="polite">
        <span class="profile-view__spinner" aria-hidden="true"></span>
        <span>Loading profile...</span>
      </div>

      <div v-else-if="user" class="profile-view__content">
        <aside class="profile-view__summary" aria-label="Profile summary">
          <div class="profile-view__avatar-wrap">
            <img
              v-if="resolvedAvatarUrl && !avatarLoadFailed"
              class="profile-view__avatar"
              :src="resolvedAvatarUrl"
              :alt="`${displayName} avatar`"
              @error="avatarLoadFailed = true"
            />
            <div v-else class="profile-view__avatar profile-view__avatar--fallback" aria-hidden="true">
              {{ initials }}
            </div>
          </div>

          <div class="profile-view__identity">
            <h2 class="profile-view__name">{{ displayName }}</h2>
            <p class="profile-view__username">@{{ user.username }}</p>
          </div>

          <label class="profile-view__upload">
            <input
              class="profile-view__upload-input"
              type="file"
              accept="image/*"
              :disabled="isUploadingAvatar"
              @change="handleFileChange"
            />
            <span>{{ isUploadingAvatar ? 'Uploading...' : 'Change avatar' }}</span>
          </label>

          <p v-if="isUploadingAvatar" class="profile-view__upload-note" aria-live="polite">
            Uploading avatar...
          </p>

          <dl class="profile-view__stats">
            <div>
              <dt>Reputation</dt>
              <dd>{{ user.reputationScore }}</dd>
            </div>
            <div>
              <dt>Member since</dt>
              <dd>{{ joinedAt }}</dd>
            </div>
          </dl>
        </aside>

        <section class="profile-view__details" aria-label="Profile details">
          <BaseError :message="errorMessage" />

          <p v-if="statusMessage" class="profile-view__success" role="status">{{ statusMessage }}</p>

          <dl class="profile-view__meta">
            <div>
              <dt>Email</dt>
              <dd>{{ user.email }}</dd>
            </div>
          </dl>

          <form class="profile-view__form" novalidate @submit.prevent="handleSubmit">
            <div class="profile-view__form-grid">
              <BaseInput
                v-model="form.firstName"
                autocomplete="given-name"
                label="First name"
                name="firstName"
                placeholder="Jane"
              />

              <BaseInput
                v-model="form.lastName"
                autocomplete="family-name"
                label="Last name"
                name="lastName"
                placeholder="Austen"
              />
            </div>

            <label class="profile-view__textarea-field">
              <span>Bio</span>
              <textarea
                v-model="form.bio"
                class="profile-view__textarea"
                maxlength="500"
                name="bio"
                placeholder="A short note about your reading taste, exchange preferences, or favorite shelves."
                rows="7"
              ></textarea>
            </label>

            <div class="profile-view__actions">
              <BaseButton
                label="Save profile"
                :disabled="!isFormChanged"
                :is-loading="isSaving"
                :type="BaseButtonHtmlType.Submit"
              />
              <BaseButton
                label="Reset changes"
                :disabled="!isFormChanged || isSaving"
                :variant="BaseButtonVariant.Secondary"
                @click="user && (form = { firstName: user.firstName, lastName: user.lastName, bio: user.bio ?? '' })"
              />
            </div>
          </form>
        </section>
      </div>

      <div v-else class="profile-view__empty" role="status">
        <h2>Profile is unavailable</h2>
        <p>We could not load account data right now. Please refresh the page.</p>
      </div>
    </section>
  </main>
</template>
