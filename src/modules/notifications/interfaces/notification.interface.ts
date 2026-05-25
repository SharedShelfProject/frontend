import { NotificationType } from './notification-type.type';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  loanId: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}
