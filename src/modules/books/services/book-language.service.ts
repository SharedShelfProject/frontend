import { t, type LocalizationKey } from '@/services/localization.service';

const LANGUAGE_LABEL_KEYS: Partial<Record<string, LocalizationKey>> = {
  Ukrainian: 'language.ukrainian',
  English: 'language.english',
  German: 'language.german',
  French: 'language.french',
  Spanish: 'language.spanish',
  Italian: 'language.italian',
  Polish: 'language.polish',
  Czech: 'language.czech',
  Slovak: 'language.slovak',
  Romanian: 'language.romanian',
  Lithuanian: 'language.lithuanian',
  Latvian: 'language.latvian',
  Estonian: 'language.estonian',
  Portuguese: 'language.portuguese',
  Dutch: 'language.dutch',
  Swedish: 'language.swedish',
  Norwegian: 'language.norwegian',
  Danish: 'language.danish',
  Finnish: 'language.finnish',
  Greek: 'language.greek',
  Turkish: 'language.turkish',
  Arabic: 'language.arabic',
  Hebrew: 'language.hebrew',
  Chinese: 'language.chinese',
  Japanese: 'language.japanese',
  Korean: 'language.korean',
};

export function formatBookLanguage(language: string | null | undefined) {
  if (!language) {
    return '';
  }

  const labelKey = LANGUAGE_LABEL_KEYS[language];

  return labelKey ? t(labelKey) : language;
}
