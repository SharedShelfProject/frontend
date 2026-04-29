import { BaseConfirmationModalEvent } from '@/shared/enums/base-confirmation-modal-event.enum';

export interface BaseConfirmationModalEmits {
  (event: BaseConfirmationModalEvent.Confirm): void;
  (event: BaseConfirmationModalEvent.Cancel): void;
}
