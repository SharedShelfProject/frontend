<script setup lang="ts">
import { BaseButtonEmits } from '@/shared/interfaces/base-button-emits.interface';
import { BaseButtonProperties } from '@/shared/interfaces/base-button-properties.interface';
import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';
import { useBaseButton } from '@/shared/composables/useBaseButton';
import './BaseButton.css';

withDefaults(defineProps<BaseButtonProperties>(), {
  type: BaseButtonHtmlType.Button,
  disabled: false,
  isLoading: false,
  variant: BaseButtonVariant.Primary,
});

const emit = defineEmits<BaseButtonEmits>();
const { handleClick } = useBaseButton(emit);
</script>

<template>
  <button
    class="base-button"
    :class="`base-button--${variant}`"
    :disabled="disabled || isLoading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="isLoading" class="base-button__loader"></span>
    <span>{{ isLoading ? 'Loading...' : label }}</span>
  </button>
</template>
