<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import BaseInput from '@/shared/components/BaseInput/BaseInput.vue';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { currentLocale, t } from '@/services/localization.service';
import { useProfileView } from '../composables/useProfileView';
import { useEditProfile } from '../composables/useEditProfile';
import { resolveAvatarUrl } from '../services/avatar-url.service';
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
const avatarRefreshKey = ref(Date.now());
const sensitiveBioPattern = /(password|passcode|secret|token|api[_\s-]?key|private\s?key|123456|qwerty|парол|пароль|токен)/i;

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
  return resolveAvatarUrl(user.value?.avatarUrl, avatarRefreshKey.value);
});

const joinedAt = computed(() => {
  if (!user.value?.createdAt) {
    return t('profile.notAvailable');
  }

  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
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

const bioSecurityWarning = computed(() => {
  if (!form.value.bio.trim()) {
    return '';
  }

  if (sensitiveBioPattern.test(form.value.bio)) {
    return t('profile.bioWarning');
  }

  return '';
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
  return error instanceof Error ? error.message : t('profile.genericError');
}

async function handleSubmit() {
  statusMessage.value = '';
  errorMessage.value = '';

  if (bioSecurityWarning.value) {
    errorMessage.value = bioSecurityWarning.value;
    return;
  }

  try {
    await updateProfile({
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      bio: form.value.bio.trim(),
    });
    await fetchProfile();
    window.dispatchEvent(new CustomEvent('shared-shelf:user-updated'));
    statusMessage.value = t('profile.updated');
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
    errorMessage.value = t('profile.avatarTypeError');
    input.value = '';
    return;
  }

  if (file.size > MAX_AVATAR_SIZE_IN_BYTES) {
    errorMessage.value = t('profile.avatarSizeError');
    input.value = '';
    return;
  }

  try {
    await uploadAvatar(file);
    await fetchProfile();
    avatarRefreshKey.value = Date.now();
    avatarLoadFailed.value = false;
    window.dispatchEvent(new CustomEvent('shared-shelf:user-updated'));
    statusMessage.value = t('profile.avatarUpdated');
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
          <p class="profile-view__eyebrow">{{ t('profile.account') }}</p>
          <h1 class="profile-view__title">{{ t('profile.title') }}</h1>
        </div>
      </div>

      <div v-if="isLoading" class="profile-view__loading" aria-live="polite">
        <span class="profile-view__spinner" aria-hidden="true"></span>
        <span>{{ t('profile.loading') }}</span>
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

          <label class="profile-view__upload" :class="{ 'profile-view__upload--disabled': isUploadingAvatar }">
            <input
              class="profile-view__upload-input"
              type="file"
              accept="image/*"
              :disabled="isUploadingAvatar"
              @change="handleFileChange"
            />
            <span>{{ isUploadingAvatar ? t('profile.uploading') : t('profile.changeAvatar') }}</span>
          </label>

          <p v-if="isUploadingAvatar" class="profile-view__upload-note" aria-live="polite">
            {{ t('profile.uploadingAvatar') }}
          </p>

          <dl class="profile-view__stats">
            <div>
              <dt>{{ t('profile.reputation') }}</dt>
              <dd>{{ user.reputationScore }}</dd>
            </div>
            <div>
              <dt>{{ t('profile.memberSince') }}</dt>
              <dd>{{ joinedAt }}</dd>
            </div>
          </dl>
        </aside>

        <section class="profile-view__details" aria-label="Profile details">
          <BaseError :message="errorMessage" />

          <p v-if="statusMessage" class="profile-view__success" role="status">{{ statusMessage }}</p>

          <dl class="profile-view__meta">
            <div>
              <dt>{{ t('profile.email') }}</dt>
              <dd>{{ user.email }}</dd>
            </div>
          </dl>

          <form class="profile-view__form" novalidate @submit.prevent="handleSubmit">
            <div class="profile-view__form-grid">
              <BaseInput
                v-model="form.firstName"
                autocomplete="given-name"
                :label="t('profile.firstName')"
                name="firstName"
                placeholder="Jane"
              />

              <BaseInput
                v-model="form.lastName"
                autocomplete="family-name"
                :label="t('profile.lastName')"
                name="lastName"
                placeholder="Austen"
              />
            </div>

            <label class="profile-view__textarea-field">
              <span>{{ t('profile.bio') }}</span>
              <textarea
                v-model="form.bio"
                class="profile-view__textarea"
                :class="{ 'profile-view__textarea--warning': bioSecurityWarning }"
                :aria-invalid="Boolean(bioSecurityWarning)"
                aria-describedby="profile-bio-help"
                maxlength="500"
                name="bio"
                :placeholder="t('profile.bioPlaceholder')"
                rows="7"
              ></textarea>
              <small id="profile-bio-help" :class="{ 'profile-view__bio-warning': bioSecurityWarning }">
                {{ bioSecurityWarning || t('profile.bioHelp') }}
              </small>
            </label>

            <div class="profile-view__actions">
              <BaseButton
                :label="t('profile.save')"
                :disabled="!isFormChanged || Boolean(bioSecurityWarning)"
                :is-loading="isSaving"
                :type="BaseButtonHtmlType.Submit"
              />
              <BaseButton
                :label="t('profile.reset')"
                :disabled="!isFormChanged || isSaving"
                :variant="BaseButtonVariant.Secondary"
                @click="user && (form = { firstName: user.firstName, lastName: user.lastName, bio: user.bio ?? '' })"
              />
            </div>
          </form>
        </section>
      </div>

      <div v-else class="profile-view__empty" role="status">
        <h2>{{ t('profile.unavailable') }}</h2>
        <p>{{ t('profile.unavailableText') }}</p>
      </div>
    </section>
  </main>
</template>
