import type { ApiClient } from './client'
import type {
  Notification,
  GetNotificationsParams,
  GetNotificationsResponse,
} from './types/notification.types'

export class NotificationApi {
  constructor(private client: ApiClient) {}

  // 알림 목록 조회
  async getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    if (params.isRead !== undefined) query.set('isRead', String(params.isRead))
    const qs = query.toString()
    return this.client.get(`/api/notifications${qs ? `?${qs}` : ''}`)
  }

  // 단건 읽음 처리
  async markAsRead(notificationId: number): Promise<Notification> {
    return this.client.put(`/api/notifications/${notificationId}/read`)
  }

  // 전체 읽음 처리
  async markAllAsRead(): Promise<{ updated: number }> {
    return this.client.put('/api/notifications/read-all')
  }
}
