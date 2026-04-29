import { BaseButtonEvent } from '@/shared/enums/base-button-event.enum';
import { BaseButtonEmits } from '@/shared/interfaces/base-button-emits.interface';

export function useBaseButton(emit: BaseButtonEmits) {
  function handleClick(mouseEvent: MouseEvent): void {
    emit(BaseButtonEvent.Click, mouseEvent);
  }

  return {
    handleClick,
  };
}
