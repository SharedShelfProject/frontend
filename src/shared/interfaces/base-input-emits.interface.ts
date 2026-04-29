import { BaseInputEvent } from '@/shared/enums/base-input-event.enum';

export interface BaseInputEmits {
  (event: BaseInputEvent.UpdateModelValue, value: string): void;
}
