<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import BaseError from '@/shared/components/BaseError/BaseError.vue';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { MY_LOANS_ROUTE_PATH } from '@/constants/routes.constants';
import { t } from '@/services/localization.service';
import { Notification } from '../../interfaces/notification.interface';
import { notificationsRepository } from '../../repositories/notifications.repository';
import {
  formatNotificationBody,
  formatNotificationDate,
  formatNotificationTitle,
} from '../../services/notification-display.service';
import './NotificationsView.css';

const notifications = ref<Notification[]>([]);
const isLoading = ref(false);
const isMarkingRead = ref(false);
const errorMessage = ref('');
const statusMessage = ref('');

const unreadCount = computed(() => notifications.value.filter((notification) => !notification.isRead).length);
const hasNotifications = computed(() => notifications.value.length > 0);

async function fetchNotifications() {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    notifications.value = await notificationsRepository.getMyNotifications();
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('notifications.loadError');
  } finally {
    isLoading.value = false;
  }
}

async function markAllAsRead() {
  if (!unreadCount.value) {
    return;
  }

  isMarkingRead.value = true;
  errorMessage.value = '';
  statusMessage.value = '';

  try {
    await notificationsRepository.markAllAsRead();
    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    window.dispatchEvent(new Event('shared-shelf:notifications-updated'));
    statusMessage.value = t('notifications.markedRead');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('notifications.markReadError');
  } finally {
    isMarkingRead.value = false;
  }
}

function getNotificationDate(notification: Notification) {
  return notification.sentAt ?? notification.createdAt;
}

onMounted(fetchNotifications);
</script>

<template>
  <main class="notifications-view">
    <section class="notifications-view__shell">
      <section class="notifications-view__header">
        <div>
          <p class="notifications-view__eyebrow">{{ t('notifications.eyebrow') }}</p>
          <h1>{{ t('notifications.title') }}</h1>
          <p>{{ t('notifications.subtitle') }}</p>
        </div>

        <div class="notifications-view__summary">
          <span>{{ t('notifications.unread') }}</span>
          <strong>{{ unreadCount }}</strong>
        </div>
      </section>

      <BaseError :message="errorMessage" />
      <p v-if="statusMessage" class="notifications-view__success" role="status">{{ statusMessage }}</p>

      <section class="notifications-view__toolbar" :aria-label="t('notifications.controlsLabel')">
        <BaseButton
          :label="t('notifications.refresh')"
          :disabled="isLoading"
          :variant="BaseButtonVariant.Secondary"
          @click="fetchNotifications"
        />
        <BaseButton
          :label="t('notifications.markAllRead')"
          :disabled="!unreadCount || isLoading"
          :is-loading="isMarkingRead"
          @click="markAllAsRead"
        />
      </section>

      <div v-if="isLoading" class="notifications-view__loading" aria-live="polite">
        <span class="notifications-view__spinner" aria-hidden="true"></span>
        <span>{{ t('notifications.loading') }}</span>
      </div>

      <section v-else-if="hasNotifications" class="notifications-view__list" :aria-label="t('notifications.listLabel')">
        <article
          v-for="notification in notifications"
          :key="notification.id"
          class="notifications-view__item"
          :class="{ 'notifications-view__item--unread': !notification.isRead }"
        >
          <div class="notifications-view__item-marker" aria-hidden="true">
            <span></span>
          </div>

          <div class="notifications-view__item-body">
            <div class="notifications-view__item-header">
              <div>
                <p class="notifications-view__type">{{ t(`notifications.typeName.${notification.type}` as Parameters<typeof t>[0]) }}</p>
                <h2>{{ formatNotificationTitle(notification) }}</h2>
              </div>
              <span class="notifications-view__read-state">
                {{ notification.isRead ? t('notifications.read') : t('notifications.unreadBadge') }}
              </span>
            </div>

            <p class="notifications-view__message">{{ formatNotificationBody(notification) }}</p>

            <div class="notifications-view__meta">
              <time :datetime="getNotificationDate(notification)">
                {{ formatNotificationDate(getNotificationDate(notification)) }}
              </time>
              <RouterLink v-if="notification.loanId" :to="MY_LOANS_ROUTE_PATH">
                {{ t('notifications.openLoan') }}
              </RouterLink>
            </div>
          </div>
        </article>
      </section>

      <section v-else class="notifications-view__empty" role="status">
        <h2>{{ t('notifications.emptyTitle') }}</h2>
        <p>{{ t('notifications.emptyText') }}</p>
      </section>
    </section>
  </main>
</template>
