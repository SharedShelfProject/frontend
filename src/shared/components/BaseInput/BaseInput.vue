<script setup lang="ts">
import { BaseInputEmits } from '@/shared/interfaces/base-input-emits.interface';
import { BaseInputProperties } from '@/shared/interfaces/base-input-properties.interface';
import { useBaseInput } from '@/shared/composables/useBaseInput';
import './BaseInput.css';

defineProps<BaseInputProperties>();

const emit = defineEmits<BaseInputEmits>();
const { handleInput } = useBaseInput(emit);
</script>

<template>
  <label class="base-input">
    <span class="base-input__label">{{ label }}</span>
    <input
      class="base-input__field"
      :class="{ 'base-input__field--invalid': errorMessage }"
      :autocomplete="autocomplete"
      :maxlength="maxLength"
      :name="name"
      :placeholder="placeholder"
      :type="type ?? 'text'"
      :value="modelValue"
      @input="handleInput"
    />
    <span v-if="errorMessage" class="base-input__error">{{ errorMessage }}</span>
  </label>
</template>
