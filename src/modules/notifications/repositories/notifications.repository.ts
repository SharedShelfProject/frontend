import { BaseRepository } from '@/api/base.repository';
import { HttpMethod } from '@/enums/http-method.enum';
import { Notification } from '../interfaces/notification.interface';
import { NotificationsCount } from '../interfaces/notifications-count.interface';

class NotificationsRepository extends BaseRepository {
  getMyNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications/my', HttpMethod.Get);
  }

  getUnreadCount(): Promise<NotificationsCount> {
    return this.request<NotificationsCount>('/notifications/my/unread-count', HttpMethod.Get);
  }

  markAllAsRead(): Promise<void> {
    return this.request<void>('/notifications/read-all', HttpMethod.Patch);
  }
}

export const notificationsRepository = new NotificationsRepository();
