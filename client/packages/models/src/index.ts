/**
 * 공통 타입 정의 (Frontend View Models)
 */

// Community Models
export * from './community'

// User Models
export interface User {
  id: string
  email: string
  nickname?: string
  buildingId?: string
  createdAt: string
}

export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
}

// Building Models
export interface Building {
  id: string
  name: string
  address: string
  addressDetail?: string
  buildingType: 'APARTMENT' | 'OFFICETEL' | 'VILLA'
  inviteCode: string
  memberCount: number
}

// Post Models
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorNickname: string
  buildingId: string
  boardType: 'FREE' | 'DELIVERY' | 'LIFESTYLE'
  imageUrls: string[]
  likeCount: number
  commentCount: number
  viewCount: number
  isHot: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorNickname: string
  content: string
  likeCount: number
  parentId?: string
  createdAt: string
}

// Chat Models
export interface ChatRoom {
  id: string
  buildingId: string
  roomType: 'BUILDING' | 'TOPIC'
  topicName?: string
  postId?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
}

export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  senderNickname: string
  content: string
  messageType: 'TEXT' | 'IMAGE'
  imageUrl?: string
  createdAt: string
}

// Notification Models
export interface Notification {
  id: string
  userId: string
  type: 'COMMENT' | 'REPLY' | 'MENTION' | 'HOT_POST' | 'CHAT_MENTION'
  title: string
  content: string
  isRead: boolean
  relatedPostId?: string
  relatedCommentId?: string
  relatedChatRoomId?: string
  createdAt: string
}
