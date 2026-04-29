import { BaseConfirmationModalEvent } from '@/shared/enums/base-confirmation-modal-event.enum';
import { BaseConfirmationModalEmits } from '@/shared/interfaces/base-confirmation-modal-emits.interface';

export function useBaseConfirmationModal(emit: BaseConfirmationModalEmits) {
  function handleConfirm(): void {
    emit(BaseConfirmationModalEvent.Confirm);
  }

  function handleCancel(): void {
    emit(BaseConfirmationModalEvent.Cancel);
  }

  return {
    handleConfirm,
    handleCancel,
  };
}
