import { currentLocale, t, type LocalizationKey } from '@/services/localization.service';
import { Notification } from '../interfaces/notification.interface';

const TYPE_LABEL_KEYS: Record<Notification['type'], LocalizationKey> = {
  request_created: 'notifications.type.requestCreated',
  request_approved: 'notifications.type.requestApproved',
  request_rejected: 'notifications.type.requestRejected',
  loan_reminder: 'notifications.type.loanReminder',
  loan_overdue: 'notifications.type.loanOverdue',
  book_returned: 'notifications.type.bookReturned',
};

const GENERIC_BODY_KEYS: Record<Notification['type'], LocalizationKey> = {
  request_created: 'notifications.body.requestCreated',
  request_approved: 'notifications.body.requestApproved',
  request_rejected: 'notifications.body.requestRejected',
  loan_reminder: 'notifications.body.loanReminderGeneric',
  loan_overdue: 'notifications.body.loanOverdueGeneric',
  book_returned: 'notifications.body.bookReturned',
};

function parseQuotedTitle(value: string) {
  return value.match(/"([^"]+)"/)?.[1] ?? '';
}

function parseLeadingUsername(value: string, action: string) {
  return value.match(new RegExp(`^(.+?) ${action} `))?.[1] ?? '';
}

function parseIsoDate(value: string) {
  const match = value.match(/\d{4}-\d{2}-\d{2}T[^\s.]+(?:\.\d+)?Z?/);

  return match?.[0] ?? '';
}

export function formatNotificationTitle(notification: Notification) {
  return t(TYPE_LABEL_KEYS[notification.type]) || notification.title;
}

export function formatNotificationBody(notification: Notification) {
  const bookTitle = parseQuotedTitle(notification.body);
  const rawDate = parseIsoDate(notification.body);
  const formattedDate = rawDate ? formatNotificationDate(rawDate) : '';

  if (notification.type === 'request_created' && bookTitle) {
    const username = parseLeadingUsername(notification.body, 'requested');

    return t('notifications.body.requestCreatedWithBook')
      .replace('{username}', username || t('notifications.someone'))
      .replace('{title}', bookTitle);
  }

  if (notification.type === 'request_approved' && bookTitle) {
    return t('notifications.body.requestApprovedWithBook').replace('{title}', bookTitle);
  }

  if (notification.type === 'request_rejected' && bookTitle) {
    return t('notifications.body.requestRejectedWithBook').replace('{title}', bookTitle);
  }

  if (notification.type === 'loan_reminder' && bookTitle && formattedDate) {
    return t('notifications.body.loanReminder')
      .replace('{title}', bookTitle)
      .replace('{date}', formattedDate);
  }

  if (notification.type === 'loan_overdue' && bookTitle && formattedDate) {
    return t('notifications.body.loanOverdue')
      .replace('{title}', bookTitle)
      .replace('{date}', formattedDate);
  }

  if (notification.type === 'book_returned' && bookTitle) {
    const username = parseLeadingUsername(notification.body, 'returned');

    return t('notifications.body.bookReturnedWithBook')
      .replace('{username}', username || t('notifications.someone'))
      .replace('{title}', bookTitle);
  }

  return t(GENERIC_BODY_KEYS[notification.type]) || notification.body;
}

export function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat(currentLocale.value === 'uk' ? 'uk-UA' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
