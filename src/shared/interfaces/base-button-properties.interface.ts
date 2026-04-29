import { BaseButtonHtmlType } from '@/shared/enums/base-button-html-type.enum';
import { BaseButtonVariant } from '@/shared/enums/base-button-variant.enum';

export interface BaseButtonProperties {
  label: string;
  type?: BaseButtonHtmlType;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: BaseButtonVariant;
}
