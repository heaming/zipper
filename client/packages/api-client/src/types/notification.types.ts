/**
 * 알림 도메인 타입
 */

export type NotificationType =
  | 'COMMENT'
  | 'REPLY'
  | 'MENTION'
  | 'HOT_POST'
  | 'CHAT_MENTION'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  relatedPostId?: number | null
  relatedCommentId?: number | null
  relatedChatRoomId?: number | null
  createdAt: string
}

export interface GetNotificationsParams {
  page?: number
  limit?: number
  isRead?: boolean
}

export interface GetNotificationsResponse {
  notifications: Notification[]
  total: number
  unreadCount: number
}
