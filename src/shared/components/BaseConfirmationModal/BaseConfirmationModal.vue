<script setup lang="ts">
import BaseButton from '@/shared/components/BaseButton/BaseButton.vue';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { BaseConfirmationModalEmits } from '@/shared/interfaces/base-confirmation-modal-emits.interface';
import { BaseConfirmationModalProperties } from '@/shared/interfaces/base-confirmation-modal-properties.interface';
import { useBaseConfirmationModal } from '@/shared/composables/useBaseConfirmationModal';
import './BaseConfirmationModal.css';

defineProps<BaseConfirmationModalProperties>();

const emit = defineEmits<BaseConfirmationModalEmits>();
const { handleConfirm, handleCancel } = useBaseConfirmationModal(emit);
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="base-confirmation-modal" role="dialog" aria-modal="true">
      <button class="base-confirmation-modal__backdrop" aria-label="Close confirmation" @click="handleCancel"></button>
      <section class="base-confirmation-modal__panel">
        <h2 class="base-confirmation-modal__title">{{ title }}</h2>
        <p class="base-confirmation-modal__message">{{ message }}</p>

        <div class="base-confirmation-modal__actions">
          <BaseButton :label="cancelLabel" :variant="BaseButtonVariant.Secondary" @click="handleCancel" />
          <BaseButton :label="confirmLabel" @click="handleConfirm" />
        </div>
      </section>
    </div>
  </Teleport>
</template>
