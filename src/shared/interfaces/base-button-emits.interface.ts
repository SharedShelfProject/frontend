import { BaseButtonEvent } from '@/shared/enums/base-button-event.enum';

export interface BaseButtonEmits {
  (event: BaseButtonEvent.Click, mouseEvent: MouseEvent): void;
}
