/**
 * 채팅 도메인 타입
 */

export type RoomType = 'BUILDING' | 'TOPIC'

export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM'

export interface ChatRoom {
  id: number
  buildingId: number
  roomType: RoomType
  topicName?: string
  postId?: number
  lastMessage?: {
    content: string
    senderNickname: string
    createdAt: string
  } | null
  unreadCount: number
  createdAt: string
}

export interface ChatMessage {
  id: number
  roomId: number
  senderId?: number
  senderNickname: string
  content: string
  messageType: MessageType
  imageUrl?: string | null
  createdAt: string
}

export interface CreateChatRoomRequest {
  buildingId: number
  roomType: RoomType
  topicName?: string
  postId?: number
}

export interface SendMessageRequest {
  content: string
  messageType?: MessageType
  imageUrl?: string
}

export interface GetMessagesParams {
  before?: string  // ISO date string - 커서 기반 페이지네이션
  limit?: number
}

export interface GetMessagesResponse {
  messages: ChatMessage[]
  hasMore: boolean
}

export interface GetRoomsResponse {
  rooms: ChatRoom[]
}
