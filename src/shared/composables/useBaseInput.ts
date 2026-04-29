import { BaseInputEvent } from '@/shared/enums/base-input-event.enum';
import { BaseInputEmits } from '@/shared/interfaces/base-input-emits.interface';

export function useBaseInput(emit: BaseInputEmits) {
  function handleInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    emit(BaseInputEvent.UpdateModelValue, inputElement.value);
  }

  return {
    handleInput,
  };
}
