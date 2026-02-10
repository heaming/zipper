// Notifier Port 인터페이스 (Nest 의존성 ❌)
export enum NotificationType {
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  MENTION = 'MENTION',
  HOT_POST = 'HOT_POST',
  CHAT_MENTION = 'CHAT_MENTION',
}

export interface NotificationPayload {
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  relatedPostId?: number;
  relatedCommentId?: number;
  relatedChatRoomId?: string;
}

export interface Notifier {
  /**
   * 알림을 전송합니다 (FCM, APNs 등)
   */
  send(payload: NotificationPayload): Promise<void>;
  
  /**
   * 여러 사용자에게 알림을 전송합니다
   */
  sendBatch(payloads: NotificationPayload[]): Promise<void>;
}

export const NOTIFIER = Symbol('NOTIFIER');
